import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query leads by specific statuses - 100 latest updated for each
    const statuses = ['Contacted', 'Application Out', 'Application Missing Info'];
    const allLeads = [];
    
    for (const status of statuses) {
      const query = `SELECT Id, Name, Company, Phone, MobilePhone, Email, Status, LeadSource, CreatedDate, LastModifiedDate, Owner.Name, Owner.Email, Owner.Phone, Owner.MobilePhone, Owner.Title, Owner.Department, Owner.Division, Owner.CompanyName, Owner.UserRole.Name, Owner.Manager.Name, Owner.Manager.Email, Industry, AnnualRevenue, NumberOfEmployees, Website, Description, Street, City, State, PostalCode, Country, Title, Rating, OwnerId, Birthdate__c, Social_Security_Number__c, Ownership__c, Credit_Score__c, Application_Federal_Tax_Id__c, Application_SSN__c, Application_Owner_2_SSN__c, Home_Address_Street__c, Home_Address_City__c, Home_Address_State__c, Home_Address_Zip_Code__c, Home_Address_Country__c, Owner_2_First_Name__c, Owner_2_Last_Name__c, Owner_2_Title__c, Owner_2_Birthday__c, Owner_2_Social_Security_Number__c, Owner_2_Ownership__c, Owner_2_Credit_Score__c, Owner_2_Mobile__c, Owner_2_Email__c, Owner_2_Home_Address_Street__c, Owner_2_Home_Address_City__c, Owner_2_Home_Address_State__c, Owner_2_Home_Address_Zip_Code__c, Owner_2_Home_Address_Country__c FROM Lead WHERE OwnerId = '${userId}' AND Status = '${status}' AND IsConverted = false ORDER BY LastModifiedDate DESC LIMIT 100`;
      
      const response = await fetch(
        `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        allLeads.push(...data.records);
      }
    }

    return Response.json({ leads: allLeads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});