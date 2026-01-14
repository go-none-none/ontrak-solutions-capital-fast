Deno.serve(async (req) => {
  try {
    const { userId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !userId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const query = `SELECT Id, Name, Email, Phone, Title, Department, IsActive, LastLoginDate, CreatedDate, LastModifiedDate FROM User WHERE Id = '${userId}' LIMIT 1`;

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
    const user = data.records && data.records[0] ? data.records[0] : null;
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});