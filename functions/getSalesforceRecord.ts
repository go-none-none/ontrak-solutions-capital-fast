import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !recordType) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Build explicit field list for Opportunity
    let fields = 'Id, Name, OwnerId, Owner.Name, Owner.Id, AccountId, Account.Name, Amount, CloseDate, StageName, Probability, Type, LeadSource, Description';
    
    if (recordType === 'Opportunity') {
      // Add all custom fields explicitly
      fields += ', ISO__c, Stage_Detail__c, Line_of_Credit__c';
      fields += ', Amount_Requested__c, Months_In_Business__c, Use_of_Proceeds__c, Estimated_Monthly_Revenue__c';
      fields += ', Number_of_Terminals__c, Open_Balances__c, Current_Credit_Card_Processor__c';
      fields += ', Open_Bankruptcies__c, Number_of_Open_Positions__c, Judgements_Liens__c, Estimated_Monthly_MCA_Amount__c';
      fields += ', Owner__c, Owner_2__c';
      fields += ', Avg_Gross_Monthly_Sales__c, Avg_Bank_Deposits__c, Avg_Bank_Deposits_Count__c';
      fields += ', Avg_Credit_Card_Volume__c, Avg_Daily_Balance__c, Avg_Credit_Card_Batches__c';
      fields += ', Avg_NSFs__c, Avg_Credit_Card_Transaction_Amount__c, Avg_Negative_Days__c';
      fields += ', Lender_Name_1__c, LFC__c, Open_Balance_Amount_1__c';
      fields += ', Lender_Name_2__c, Open_Balance_Amount_2__c';
      fields += ', Lender_Name_3__c, Open_Balance_Amount_3__c';
      fields += ', Funded_Date__c, Selected_Offer__c, Lender__c, Buy_Rate__c';
      fields += ', Funded__c, Factor_Rate__c, Payoff__c, Product__c';
      fields += ', Net_Funded__c, Payment_Amount__c, Term__c, Payment_Frequency__c';
      fields += ', Payback__c, Payment_Method__c, Holdback__c';
      fields += ', Commission__c, Commission_Percentage__c';
      fields += ', Origination_Fee__c, Origination_Fee_Percentage__c';
      fields += ', Estimated_Paid_In_Percentage__c, X20_Paid_In__c, X40_Paid_In__c';
      fields += ', X60_Paid_In__c, X80_Paid_In__c, X100_Paid_In__c';
      fields += ', Renewal_Status__c, Previous_Funding__c, Renewal_Status_Notes__c';
      fields += ', Next_Funding__c, Originating_Opportunity__c, Current_Renewal__c';
    } else if (recordType === 'Lead') {
      fields += ', Company, Email, Phone, Status, Rating, Industry';
      fields += ', LeadSource, Call_Disposition__c, Monthly_Revenue__c';
      fields += ', Funding_Amount_Requested__c, Time_in_Business__c';
      fields += ', Use_of_Funds__c, Street, City, State, PostalCode, Country';
    }
    
    const query = `SELECT ${fields} FROM ${recordType} WHERE Id = '${recordId}' LIMIT 1`;
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const record = data.records && data.records[0] ? data.records[0] : null;
    
    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }
    
    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});