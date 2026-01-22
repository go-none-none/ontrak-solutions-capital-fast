import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { searchTerm, userId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !searchTerm) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const searchLower = searchTerm.toLowerCase();

    // Build SOSL query for faster searching across multiple objects
    const soslQuery = `FIND {${searchTerm}*} IN NAME FIELDS RETURNING 
      Lead(Id, Name, Company WHERE OwnerId = '${userId}'),
      Opportunity(Id, Name, Account.Name WHERE OwnerId = '${userId}'),
      Contact(Id, Name, Title WHERE OwnerId = '${userId}'),
      Account(Id, Name, RecordType.Name, csbs__Active_Lender__c)`;

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/search?q=${encodeURIComponent(soslQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce search error:', error);
      return Response.json({ error: 'Search failed', details: error }, { status: response.status });
    }

    const data = await response.json();

    // Extract results from SOSL response
    const leads = data.searchRecords?.filter(r => r.attributes.type === 'Lead') || [];
    const opportunities = data.searchRecords?.filter(r => r.attributes.type === 'Opportunity') || [];
    const contacts = data.searchRecords?.filter(r => r.attributes.type === 'Contact') || [];
    const accounts = data.searchRecords?.filter(r => r.attributes.type === 'Account') || [];

    return Response.json({
      leads,
      opportunities,
      contacts,
      accounts
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});