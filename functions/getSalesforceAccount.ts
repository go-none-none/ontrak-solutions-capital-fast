import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { accountId, token, instanceUrl } = body;

    console.log('Received request:', JSON.stringify(body, null, 2));

    if (!token || !instanceUrl || !accountId) {
      console.error('Missing parameters:', { hasToken: !!token, hasInstanceUrl: !!instanceUrl, hasAccountId: !!accountId });
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `SELECT Id, Name, Phone, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, Type, Industry, Website, Description, CreatedDate, LastModifiedDate FROM Account WHERE Id = '${accountId}'`;

    console.log('Querying Salesforce:', query);

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Salesforce response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to fetch account', details: error }, { status: response.status });
    }

    const data = await response.json();
    console.log('Salesforce data:', JSON.stringify(data, null, 2));
    
    if (!data.records || data.records.length === 0) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    return Response.json({ account: data.records[0] });
  } catch (error) {
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});