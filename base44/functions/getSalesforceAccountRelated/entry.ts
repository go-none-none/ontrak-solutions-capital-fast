import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accountId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !accountId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch related leads
    const leadsQuery = `SELECT Id, Name, Status, Email, Phone FROM Lead WHERE Company = (SELECT Name FROM Account WHERE Id = '${accountId}') LIMIT 10`;
    
    // Fetch related opportunities
    const oppsQuery = `SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity WHERE AccountId = '${accountId}' LIMIT 10`;
    
    // Fetch related contacts
    const contactsQuery = `SELECT Id, Name, Email, Phone, Title FROM Contact WHERE AccountId = '${accountId}' LIMIT 10`;

    const [leadsRes, oppsRes, contactsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(leadsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(oppsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(contactsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    ]);

    const [leadsData, oppsData, contactsData] = await Promise.all([
      leadsRes.json(),
      oppsRes.json(),
      contactsRes.json()
    ]);

    return Response.json({
      leads: leadsData.records || [],
      opportunities: oppsData.records || [],
      contacts: contactsData.records || []
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});