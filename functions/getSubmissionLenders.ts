import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, instanceUrl } = await req.json();

    // Query lenders from csbs__Lender__c custom object
    const query = `
      SELECT Id, Name, 
             csbs__Minimum_Credit_Score__c,
             csbs__Minimum_Monthly_Deposit_Count__c,
             csbs__Minimum_Monthly_Deposit_Amount__c,
             csbs__Maximum_Negative_Days__c,
             csbs__Maximum_NSFs__c,
             csbs__Minimum_Average_Daily_Balance__c,
             csbs__Minimum_Months_in_Business__c,
             csbs__Restricted_Industries__c,
             csbs__Restricted_States__c,
             csbs__Maximum_Offer_Amount__c
      FROM csbs__Lender__c
      ORDER BY Name ASC
      LIMIT 200
    `;

    const response = await fetch(
      `${instanceUrl}/services/data/v62.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Salesforce query error:', errorData);
      return Response.json({ error: errorData, query }, { status: response.status });
    }

    const data = await response.json();
    console.log('Found lenders:', data.records?.length || 0);
    return Response.json({ lenders: data.records || [] });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});