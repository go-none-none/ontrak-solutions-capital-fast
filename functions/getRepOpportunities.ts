import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query opportunities by stage - 100 latest updated for each
    const stages = ['Application In', 'Underwriting', 'Approved', 'Contracts Out', 'Contracts In', 'Closed - Funded'];
    const allOpportunities = [];
    
    for (const stage of stages) {
      const query = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name, CreatedDate, LastModifiedDate FROM Opportunity WHERE OwnerId = '${userId}' AND StageName = '${stage}' ORDER BY LastModifiedDate DESC LIMIT 100`;
      
      const response = await fetch(
        `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        allOpportunities.push(...data.records);
      }
    }

    return Response.json({ opportunities: allOpportunities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});