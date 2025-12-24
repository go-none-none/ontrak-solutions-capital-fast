import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log('Received body:', body);
    const { token, instanceUrl } = body;

    if (!token || !instanceUrl) {
      console.error('Missing fields - token:', !!token, 'instanceUrl:', !!instanceUrl);
      return Response.json({ 
        error: 'Missing required fields: token, instanceUrl',
        received: Object.keys(body)
      }, { status: 400 });
    }

    // Fetch active human Salesforce users (exclude system/automated users)
    const query = `SELECT Id, Name, Email FROM User WHERE IsActive = true AND UserType = 'Standard' AND Name NOT LIKE '%Integration%' AND Name NOT LIKE '%API%' AND Name NOT LIKE '%System%' ORDER BY Name`;
    const url = `${instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce API error:', error);
      console.error('Query was:', query);
      return Response.json({ error, query }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ users: data.records || [] });

  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});