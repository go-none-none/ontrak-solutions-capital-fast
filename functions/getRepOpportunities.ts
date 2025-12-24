import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query all opportunities with all necessary fields
    const query = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, Account.Name, Account.BillingStreet, Account.BillingCity, Account.BillingState, Account.BillingPostalCode, Account.BillingCountry, Account.Phone, CreatedDate, LastModifiedDate, IsClosed, Owner.Name, Owner.Email, Owner.Phone, Owner_2__r.Name, Owner_2__r.Email, Owner_2__r.Phone, Amount_Requested__c, Estimated_Monthly_Revenue__c, Months_In_Business__c, Use_of_Proceeds__c, Type, LeadSource FROM Opportunity WHERE OwnerId = '${userId}' ORDER BY LastModifiedDate DESC`;
    
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
      const error = await response.json();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to fetch opportunities', details: error }, { status: 500 });
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
    
    console.log('Fetched opportunities count:', allOpportunities.length);

    return Response.json({ opportunities: allOpportunities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});