import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query all opportunities with standard fields only to avoid errors
    const query = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name, Account.BillingStreet, Account.BillingCity, Account.BillingState, Account.BillingPostalCode, Account.BillingCountry, Account.Phone, CreatedDate, LastModifiedDate, IsClosed, Owner.Name, Owner.Email, Owner.Phone, Type, LeadSource FROM Opportunity WHERE OwnerId = '${userId}' ORDER BY LastModifiedDate DESC`;
    
    console.log('getRepOpportunities - Query:', query);
    console.log('getRepOpportunities - userId:', userId);
    
    let response = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce error for userId:', userId, 'Status:', response.status, 'Error:', errorText);
      return Response.json({ error: 'Failed to fetch opportunities', details: errorText }, { status: 500 });
    }

    let data = await response.json();
    let allOpportunities = data.records || [];
    
    // Handle pagination to get all records
    while (data.nextRecordsUrl) {
      response = await fetch(
        `${instanceUrl}${data.nextRecordsUrl}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) break;
      
      data = await response.json();
      allOpportunities = allOpportunities.concat(data.records || []);
    }
    
    console.log('Fetched opportunities count for userId', userId, ':', allOpportunities.length);
    console.log('Query used:', query);

    return Response.json({ opportunities: allOpportunities });
  } catch (error) {
    console.error('getRepOpportunities - Catch error:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});