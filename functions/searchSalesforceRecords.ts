import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, token, instanceUrl } = await req.json();

    if (!query || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const searchTerm = query.trim().replace(/'/g, "\\'");

    // Search Leads - match by Name or Company
    const leadsQuery = `SELECT Id, Name, Company, Email, Phone, Status FROM Lead WHERE (Name LIKE '%${searchTerm}%' OR Company LIKE '%${searchTerm}%') ORDER BY Name LIMIT 10`;
    
    // Search Opportunities - match by Name
    const oppsQuery = `SELECT Id, Name, Amount, StageName, Account.Name FROM Opportunity WHERE Name LIKE '%${searchTerm}%' ORDER BY Name LIMIT 10`;

    const [leadsRes, oppsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(leadsQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(oppsQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    const leadsData = await leadsRes.json();
    const oppsData = await oppsRes.json();

    if (!leadsRes.ok) {
      console.error('Leads query error:', leadsData);
    }
    if (!oppsRes.ok) {
      console.error('Opportunities query error:', oppsData);
    }

    return Response.json({
      leads: leadsData.records || [],
      opportunities: oppsData.records || []
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});