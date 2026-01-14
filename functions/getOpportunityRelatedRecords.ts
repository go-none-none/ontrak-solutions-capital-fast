import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !opportunityId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Query for Submissions
    const submissionsQuery = `SELECT Id, Name, csbs__API_Lender_Status__c, csbs__Status__c, csbs__Type__c, csbs__Lender__c, csbs__Min_Term__c, csbs__Max_Term__c, csbs__Email__c, csbs__Notes__c, csbs__Status_Detail__c, csbs__URL__c, CreatedDate FROM csbs__Submission__c WHERE csbs__Opportunity__c = '${opportunityId}' ORDER BY CreatedDate DESC`;

    // Query for Offers
    const offersQuery = `SELECT Id, Name, csbs__Accepted_with_Lender__c, csbs__Accepted_with_Lender_Date_Time__c, csbs__Buy_Rate__c, csbs__Commission_Amount__c, csbs__Commission_Percentage__c, csbs__Draw_Fee_Amount__c, csbs__Draw_Fee_Percent__c, csbs__Factor_Rate__c, csbs__Funded__c, csbs__Holdback_Percentage__c, csbs__Lender__c, csbs__Net_Funded__c, csbs__Notes__c, csbs__Origination_Fee_Amount__c, csbs__Origination_Fee_Percentage__c, csbs__Payback__c, csbs__Payment_Amount__c, csbs__Payment_Frequency__c, csbs__Payment_Method__c, csbs__Payoff__c, csbs__Product__c, csbs__Selected__c, csbs__Term__c, csbs__URL__c, CreatedDate FROM csbs__Offer__c WHERE csbs__Opportunity__c = '${opportunityId}' ORDER BY CreatedDate DESC`;

    // Query for Statements
    const statementsQuery = `SELECT Id, Name, csbs__Account_No__c, csbs__Account_Title__c, csbs__Average_Daily_Balance__c, csbs__Bank_Name__c, csbs__Company__c, csbs__Deposit_Amount__c, csbs__Deposit_Count__c, csbs__Ending_Balance__c, csbs__Ending_Date__c, csbs__Fraud_Score__c, csbs__Negative_Days__c, csbs__NSFs__c, csbs__Starting_Balance__c, csbs__Starting_Date__c, csbs__Total_Withdrawals__c, csbs__Transactions_Count__c, csbs__Withdrawals_Count__c, CreatedDate FROM csbs__Statement__c WHERE csbs__Opportunity__c = '${opportunityId}' ORDER BY csbs__Starting_Date__c DESC`;

    // Query for Debt
    const debtQuery = `SELECT Id, Name, csbs__Balance__c, csbs__Creditor__c, csbs__Estimated_Monthly_MCA_Amount__c, csbs__Frequency__c, csbs__Lender__c, csbs__Notes__c, csbs__Open_Position__c, csbs__Payment__c, csbs__Type__c, CreatedDate FROM csbs__Debt__c WHERE csbs__Opportunity__c = '${opportunityId}' ORDER BY CreatedDate DESC`;

    // Query for Commissions
    const commissionsQuery = `SELECT Id, Name, csbs__Account__c, csbs__Amount__c, csbs__Date_Due__c, csbs__Date_Paid__c, csbs__Status__c, csbs__Type__c, CreatedDate FROM csbs__Commission__c WHERE csbs__Opportunity__c = '${opportunityId}' ORDER BY CreatedDate DESC`;

    const [submissionsRes, offersRes, statementsRes, debtRes, commissionsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(submissionsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(offersQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(statementsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(debtQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(commissionsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const submissions = submissionsRes.ok ? (await submissionsRes.json()).records : [];
    const offers = offersRes.ok ? (await offersRes.json()).records : [];
    const statements = statementsRes.ok ? (await statementsRes.json()).records : [];
    const debt = debtRes.ok ? (await debtRes.json()).records : [];
    const commissions = commissionsRes.ok ? (await commissionsRes.json()).records : [];

    return Response.json({
      submissions,
      offers,
      statements,
      debt,
      commissions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});