import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ 
        error: 'Missing required fields: token, instanceUrl' 
      }, { status: 400 });
    }

    // Fetch active human Salesforce users (exclude system/automated users)
    const query = `SELECT Id, Name, Email FROM User WHERE IsActive = true AND UserType = 'Standard' ORDER BY Name`;
    const url = `${instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ users: data.records || [] });

  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});