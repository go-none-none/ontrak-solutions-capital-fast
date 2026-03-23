import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!opportunityId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `
      SELECT Id, Name, csbs__Creditor__r.Name, csbs__Lender__c, csbs__Type__c,
             csbs__Balance__c, csbs__Payment__c, csbs__Frequency__c,
             csbs__Estimated_Monthly_MCA_Amount__c, csbs__Open_Position__c,
             csbs__Notes__c, CreatedDate, LastModifiedDate
      FROM csbs__Debt__c
      WHERE csbs__Opportunity__c = '${opportunityId}'
      ORDER BY CreatedDate DESC
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
    return Response.json({ debt: data.records || [] });
  } catch (error) {
    console.error('Get debt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});