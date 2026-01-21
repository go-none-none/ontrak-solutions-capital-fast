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

    const query = `SELECT Id, Name, Phone, Email__c, Fax, Phone_Additional__c, Website, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, Type, Industry, NumberOfEmployees, Description, CreatedDate, LastModifiedDate, RecordTypeId, RecordType.Name, csbs__Active__c, csbs__Trading_Center__c, csbs__Leads_from_API__c, csbs__Leads_to_API__c, csbs__Application_Industry__c, csbs__Minimum_Credit_Score__c, csbs__Maximum_Negative_Days__c, csbs__Minimum_Monthly_Deposit_Count__c, csbs__Maximum_NSFs__c, csbs__Minimum_Monthly_Deposit_Amount__c, csbs__Minimum_Average_Daily_Balance__c, csbs__Minimum_Months_in_Business__c, csbs__Maximum_Offer_Amount__c, csbs__Net_Offer_Percentage__c, csbs__Restricted_States__c, csbs__Restricted_Industries__c, csbs__Entity_Type__c, Business_Start_Date__c, Franchise__c FROM Account WHERE Id = '${accountId}'`;

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