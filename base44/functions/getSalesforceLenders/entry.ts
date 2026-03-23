Deno.serve(async (req) => {
  try {
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Query for Lender accounts - using RecordType or Type field
    const query = `SELECT Id, Name FROM Account WHERE RecordType.Name = 'Lender' OR Type = 'Lender' ORDER BY Name ASC`;
    
    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error, details: error }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ lenders: data.records || [] });
  } catch (error) {
    console.error('Get lenders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});