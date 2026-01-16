import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, instanceUrl } = body;

    console.log('getSubmissionLenders - Received:', { token: !!token, instanceUrl: !!instanceUrl });

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    const query = `SELECT Id, Name, csbs__Tier_Position__c, csbs__Minimum_Credit_Score__c, csbs__Minimum_Monthly_Deposit_Count__c, csbs__Minimum_Monthly_Deposit_Amount__c, csbs__Maximum_Negative_Days__c, csbs__Maximum_NSFs__c, csbs__Minimum_Average_Daily_Balance__c, csbs__Minimum_Months_in_Business__c, csbs__Restricted_Industries__c, csbs__Restricted_States__c, csbs__Maximum_Offer_Amount__c FROM Account WHERE csbs__Active_Lender__c = true ORDER BY csbs__Tier_Position__c ASC, Name ASC LIMIT 200`;

    console.log('getSubmissionLenders - Query:', query);

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('getSubmissionLenders - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('getSubmissionLenders - Salesforce error:', errorData);
      return Response.json({ error: 'Query failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log('getSubmissionLenders - Records found:', data.records?.length || 0);
    return Response.json({ lenders: data.records || [] });
  } catch (error) {
    console.error('getSubmissionLenders - Error:', error.message, error.stack);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});