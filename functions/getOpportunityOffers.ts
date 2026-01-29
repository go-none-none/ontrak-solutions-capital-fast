import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!opportunityId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const query = `
      SELECT Id, Name, csbs__Lender__c, csbs__Product__c, csbs__Funded__c, 
             csbs__Factor_Rate__c, csbs__Buy_Rate__c, csbs__Term__c, csbs__Payback__c,
             csbs__Payment_Amount__c, csbs__Payment_Frequency__c, csbs__Payment_Method__c,
             csbs__Holdback_Percentage__c, csbs__Commission_Amount__c, csbs__Commission_Percentage__c,
             csbs__Origination_Fee_Amount__c, csbs__Origination_Fee_Percentage__c, csbs__Net_Funded__c,
             csbs__Selected__c, csbs__Accepted_with_Lender__c, csbs__Notes__c, csbs__URL__c,
             CreatedDate, LastModifiedDate
      FROM csbs__Offer__c
      WHERE csbs__Opportunity__c = '${opportunityId}' AND csbs__Selected__c = true
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
    return Response.json({ offers: data.records || [] });
  } catch (error) {
    console.error('Get offers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});