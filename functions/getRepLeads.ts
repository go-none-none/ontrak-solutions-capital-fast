import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query all leads with priority ordering - using standard fields only
    const query = `SELECT Id, Name, Company, Phone, MobilePhone, Email, Status, LeadSource, CreatedDate, LastModifiedDate, Industry, AnnualRevenue, NumberOfEmployees, Website, Description, Street, City, State, PostalCode, Country, Title, Rating, OwnerId, Owner.Name, Owner.Email, Owner.Phone, Ownership__c, Birthdate__c, Social_Security_Number__c, Credit_Score__c, Home_Address_Street__c, Owner_2_First_Name__c, Owner_2_Last_Name__c, Owner_2_Ownership__c, Owner_2_Mobile__c, Owner_2_Email__c, Federal_Tax_ID__c, Entity_Type__c, Business_Start_Date__c, State_of_Incorporation__c, Amount_Requested__c, Use_of_Proceeds__c, Estimated_Monthly_Revenue__c, Annual_Revenue__c, Business_Trade_Reference_1__c, Business_Trade_Reference_2__c, Business_Trade_Reference_3__c, Lender_Name_1__c, Lender_Name_2__c, Lender_Name_3__c, Bank_Statement_Month_1__c, Bank_Statement_Month_2__c, Bank_Statement_Month_3__c, Bank_Statement_Month_4__c FROM Lead WHERE OwnerId = '${userId}' AND IsConverted = false ORDER BY LastModifiedDate DESC`;
    
    let response = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to fetch leads', details: error }, { status: 500 });
    }

    let data = await response.json();
    let allLeads = data.records || [];
    
    // Handle pagination to get all records
    while (data.nextRecordsUrl) {
      response = await fetch(
        `${instanceUrl}${data.nextRecordsUrl}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) break;
      
      data = await response.json();
      allLeads = allLeads.concat(data.records || []);
    }
    
    console.log('Fetched leads count:', allLeads.length);
    
    // Sort to prioritize specific statuses
    const priorityStatuses = ['Contacted', 'Application Out', 'Application Missing Info'];
    allLeads.sort((a, b) => {
      const aPriority = priorityStatuses.includes(a.Status) ? 0 : 1;
      const bPriority = priorityStatuses.includes(b.Status) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.LastModifiedDate) - new Date(a.LastModifiedDate);
    });

    return Response.json({ leads: allLeads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});