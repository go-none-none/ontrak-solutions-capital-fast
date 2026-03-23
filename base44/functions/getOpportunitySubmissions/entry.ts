import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!opportunityId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `
      SELECT Id, Name, csbs__Lender__r.Name, csbs__Opportunity__r.Name, csbs__Status__c, csbs__Status_Detail__c,
             csbs__Type__c, csbs__API_Lender_Status__c, csbs__Notes__c, csbs__URL__c,
             csbs__Min_Term__c, csbs__Max_Term__c, csbs__Email__c, csbs__Email_to_CC__c, csbs__Email_to_BCC__c,
             CreatedDate, LastModifiedDate
      FROM csbs__Submission__c
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
    return Response.json({ submissions: data.records || [] });
  } catch (error) {
    console.error('Get submissions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});