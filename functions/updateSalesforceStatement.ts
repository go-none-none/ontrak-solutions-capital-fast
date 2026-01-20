import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { statementId, statementData, token, instanceUrl } = await req.json();

    if (!statementId || !statementData || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const sfData = {
      Name: statementData.accountTitle || statementData.accountNo,
      csbs__Account_No__c: statementData.accountNo,
      csbs__Starting_Date__c: statementData.startingDate,
      csbs__Ending_Date__c: statementData.endingDate,
      csbs__Starting_Balance__c: statementData.startingBalance,
      csbs__Ending_Balance__c: statementData.endingBalance,
      csbs__Average_Daily_Balance__c: statementData.avgDailyBalance,
      csbs__Deposit_Amount__c: statementData.depositAmount,
      csbs__Deposit_Count__c: statementData.depositCount,
      csbs__Total_Withdrawals__c: statementData.totalWithdrawals,
      csbs__Withdrawals_Count__c: statementData.withdrawalsCount,
      csbs__NSFs__c: statementData.nsfs,
      csbs__Negative_Days__c: statementData.negativeDays,
      csbs__Reconciled__c: statementData.reconciled || false,
      csbs__Notes__c: statementData.notes
    };

    // Remove undefined/null values
    Object.keys(sfData).forEach(key => {
      if (sfData[key] === undefined || sfData[key] === null || sfData[key] === '') {
        delete sfData[key];
      }
    });

    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/csbs__Statement__c/${statementId}`,
      {
        method: 'PATCH',
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

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update statement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});