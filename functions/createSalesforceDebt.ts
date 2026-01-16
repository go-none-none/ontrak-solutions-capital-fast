import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, debtData, token, instanceUrl } = await req.json();

    if (!opportunityId || !debtData || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const sfData = {
      csbs__Opportunity__c: opportunityId,
      csbs__Lender__c: debtData.lender,
      csbs__Creditor__c: debtData.creditorId,
      csbs__Type__c: debtData.type,
      csbs__Balance__c: debtData.balance,
      csbs__Payment__c: debtData.payment,
      csbs__Frequency__c: debtData.frequency,
      csbs__Estimated_Monthly_MCA_Amount__c: debtData.estimatedMonthlyMCA,
      csbs__Open_Position__c: debtData.openPosition || false,
      csbs__Notes__c: debtData.notes
    };

    // Remove undefined/null values
    Object.keys(sfData).forEach(key => {
      if (sfData[key] === undefined || sfData[key] === null || sfData[key] === '') {
        delete sfData[key];
      }
    });

    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/csbs__Debt__c`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sfData)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error, details: error }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create debt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});