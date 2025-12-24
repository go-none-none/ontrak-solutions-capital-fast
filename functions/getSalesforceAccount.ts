import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accountId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !accountId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `
      SELECT Id, Name, Phone, BillingStreet, BillingCity, BillingState, 
             BillingPostalCode, BillingCountry, Type, Industry, Website,
             Description, CreatedDate, LastModifiedDate
      FROM Account 
      WHERE Id = '${accountId}'
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
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to fetch account' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
      return Response.json({ error: 'Account not found' }, { status: 404 });
    }

    return Response.json({ account: data.records[0] });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});