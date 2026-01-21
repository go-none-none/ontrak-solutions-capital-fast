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

    const query = `SELECT Id, Name, Phone, Fax, Website, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry, Industry, NumberOfEmployees, Description, AccountNumber, Site, AnnualRevenue, RecordTypeId, RecordType.Name, CreatedBy.Name, Owner.Name, LastModifiedBy.Name, Parent.Name, csbs__Additional_Phone__c, csbs__Email__c, csbs__DBA__c, AccountSource, csbs__Type_of_Business__c, csbs__Product_Service_Sold__c, Sic, csbs__Tier__c, csbs__Tier_Position__c, csbs__Emails_to_CC__c, csbs__Emails_to_BCC__c, csbs__Minimum_Credit_Score__c, csbs__Maximum_Negative_Days__c, csbs__Minimum_Monthly_Deposit_Count__c, csbs__Maximum_NSFs__c, csbs__Minimum_Monthly_Deposit_Amount__c, csbs__Minimum_Average_Daily_Balance__c, csbs__Minimum_Months_in_Business__c, csbs__Maximum_Offer_Amount__c, csbs__Net_Offer_Percentage__c, csbs__Restricted_States__c, csbs__Restricted_Industries__c FROM Account WHERE Id = '${accountId}'`;

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