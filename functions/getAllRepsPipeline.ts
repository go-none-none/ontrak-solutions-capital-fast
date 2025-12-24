import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing token or instanceUrl' }, { status: 400 });
    }

    // Fetch all leads
    const leadsResponse = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
        "SELECT Id, Name, Company, Email, Phone, Status, OwnerId, Owner.Name, Owner.Email FROM Lead WHERE IsConverted = false"
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Fetch all opportunities (excluding closed won)
    const oppsResponse = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
        "SELECT Id, Name, StageName, Amount, OwnerId, Owner.Name, Owner.Email, Account.Name FROM Opportunity WHERE (IsClosed = false OR StageName LIKE '%Declined%')"
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!leadsResponse.ok || !oppsResponse.ok) {
      const leadsError = !leadsResponse.ok ? await leadsResponse.json() : null;
      const oppsError = !oppsResponse.ok ? await oppsResponse.json() : null;
      return Response.json({ 
        error: 'Failed to fetch data', 
        leadsError, 
        oppsError 
      }, { status: 400 });
    }

    const leadsData = await leadsResponse.json();
    const oppsData = await oppsResponse.json();

    // Group by owner
    const repMap = {};

    (leadsData.records || []).forEach(lead => {
      if (!repMap[lead.OwnerId]) {
        repMap[lead.OwnerId] = {
          userId: lead.OwnerId,
          name: lead.Owner?.Name || 'Unknown',
          email: lead.Owner?.Email || '',
          leads: [],
          opportunities: []
        };
      }
      repMap[lead.OwnerId].leads.push(lead);
    });

    (oppsData.records || []).forEach(opp => {
      if (!repMap[opp.OwnerId]) {
        repMap[opp.OwnerId] = {
          userId: opp.OwnerId,
          name: opp.Owner?.Name || 'Unknown',
          email: opp.Owner?.Email || '',
          leads: [],
          opportunities: []
        };
      }
      repMap[opp.OwnerId].opportunities.push(opp);
    });

    const reps = Object.values(repMap);

    return Response.json({ reps });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});