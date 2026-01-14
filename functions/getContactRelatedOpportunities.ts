Deno.serve(async (req) => {
  try {
    const { contactId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contactId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const query = `
      SELECT o.Id, o.Name, o.StageName, o.Amount, o.CloseDate, o.Account.Name as AccountName
      FROM Opportunity o
      WHERE o.Id IN (
        SELECT OpportunityId FROM OpportunityContactRole 
        WHERE ContactId = '${contactId}'
      )
      ORDER BY o.CreatedDate DESC
    `;

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
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
    const opportunities = data.records || [];
    
    return Response.json({ opportunities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});