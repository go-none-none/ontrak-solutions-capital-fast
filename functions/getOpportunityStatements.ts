import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!opportunityId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `
      SELECT Id, Name, csbs__Account_No__c, csbs__Ending_Date__c, csbs__Starting_Balance__c,
             csbs__Ending_Balance__c, csbs__Average_Daily_Balance__c, csbs__Deposit_Amount__c,
             csbs__Deposit_Count__c, csbs__NSFs__c, csbs__Negative_Days__c, csbs__Notes__c,
             CreatedDate, LastModifiedDate
      FROM csbs__Statement__c
      WHERE csbs__Opportunity__c = '${opportunityId}'
      ORDER BY csbs__Ending_Date__c DESC
    `;

    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error, details: error }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ statements: data.records || [] });
  } catch (error) {
    console.error('Get statements error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});