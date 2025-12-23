import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query opportunities owned by this rep
    const query = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name, CreatedDate, LastModifiedDate FROM Opportunity WHERE OwnerId = '${userId}' AND IsClosed = false ORDER BY LastModifiedDate DESC LIMIT 200`;
    
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ opportunities: data.records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});