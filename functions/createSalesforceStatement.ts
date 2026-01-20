import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, statementData, token, instanceUrl } = await req.json();

    if (!opportunityId || !statementData || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Upload temp file to Salesforce if present
    let sourceFileId = statementData.csbs__Source_File_ID__c;
    if (statementData.tempFileUrl) {
      try {
        // Fetch the file from temp URL
        const fileResponse = await fetch(statementData.tempFileUrl);
        const fileBlob = await fileResponse.blob();
        const arrayBuffer = await fileBlob.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Create ContentVersion
        const cvResponse = await fetch(
          `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Title: 'Bank Statement',
              PathOnClient: 'statement.pdf',
              VersionData: base64Data
            })
          }
        );

        if (cvResponse.ok) {
          const cvResult = await cvResponse.json();

          // Get ContentDocumentId
          const cdQuery = `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${cvResult.id}'`;
          const cdResponse = await fetch(
            `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(cdQuery)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          const cdData = await cdResponse.json();
          sourceFileId = cdData.records[0].ContentDocumentId;

          // Link to opportunity
          await fetch(
            `${instanceUrl}/services/data/v59.0/sobjects/ContentDocumentLink`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ContentDocumentId: sourceFileId,
                LinkedEntityId: opportunityId,
                ShareType: 'V'
              })
            }
          );
        }
      } catch (uploadError) {
        console.error('Failed to upload temp file to Salesforce:', uploadError);
      }
    }

    // Prepare statement data for Salesforce
    const sfData = {
      csbs__Opportunity__c: opportunityId,
      csbs__Account_No__c: statementData.accountNo,
      csbs__Account_Title__c: statementData.accountTitle,
      csbs__Company__c: statementData.company,
      csbs__Bank_Name__c: statementData.bankName,
      csbs__Starting_Date__c: statementData.startingDate,
      csbs__Starting_Balance__c: statementData.startingBalance,
      csbs__Ending_Date__c: statementData.endingDate,
      csbs__Ending_Balance__c: statementData.endingBalance,
      csbs__Reconciled__c: statementData.reconciled || false,
      csbs__Unreconciled_End_Balance__c: statementData.unreconciledEndBalance,
      csbs__Fraud_Score__c: statementData.fraudScore,
      csbs__Average_Daily_Balance__c: statementData.avgDailyBalance,
      csbs__Deposit_Count__c: statementData.depositCount,
      csbs__Deposit_Amount__c: statementData.depositAmount,
      csbs__Withdrawals_Count__c: statementData.withdrawalsCount,
      csbs__Total_Withdrawals__c: statementData.totalWithdrawals,
      csbs__Transactions_Count__c: statementData.transactionsCount,
      csbs__Min_Resolution__c: statementData.minResolution,
      csbs__Max_Resolution__c: statementData.maxResolution,
      csbs__NSFs__c: statementData.nsfs,
      csbs__Negative_Days__c: statementData.negativeDays,
      csbs__Fraud_Reasons__c: statementData.fraudReasons,
      csbs__Notes__c: statementData.notes
    };

    // Remove undefined/null values
    Object.keys(sfData).forEach(key => {
      if (sfData[key] === undefined || sfData[key] === null || sfData[key] === '') {
        delete sfData[key];
      }
    });

    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/csbs__Statement__c`,
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
    
    // Clean up temp file from localStorage if it was used
    if (statementData.tempFileUrl) {
      // This will be cleaned up on frontend after success
    }
    
    return Response.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create statement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});