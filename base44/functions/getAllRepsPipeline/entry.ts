import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing token or instanceUrl' }, { status: 400 });
    }

    // Helper function to fetch all records with pagination
    const fetchAllRecords = async (query) => {
      let allRecords = [];
      let nextRecordsUrl = null;
      let url = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`;

      while (url) {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Query failed: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records || []);

        // Check if there are more records
        if (data.nextRecordsUrl) {
          url = `${instanceUrl}${data.nextRecordsUrl}`;
        } else {
          url = null;
        }
      }

      return allRecords;
    };

    // Fetch all leads (with pagination)
    const leads = await fetchAllRecords(
      "SELECT Id, Name, Company, Email, Phone, Status, OwnerId, Owner.Name, Owner.Email FROM Lead WHERE IsConverted = false"
    );

    // Fetch all opportunities (with pagination, excluding only truly closed/lost but keeping funded and declined)
    const opportunities = await fetchAllRecords(
      "SELECT Id, Name, StageName, Amount, OwnerId, Owner.Name, Owner.Email, Account.Name FROM Opportunity WHERE (IsClosed = false OR StageName = 'Closed - Funded' OR StageName LIKE '%Declined%')"
    );

    // Group by owner
    const repMap = {};

    leads.forEach(lead => {
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

    opportunities.forEach(opp => {
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

    const reps = Object.values(repMap).sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ reps });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});