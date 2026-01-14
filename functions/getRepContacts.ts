Deno.serve(async (req) => {
  try {
    console.log('getRepContacts - Function called');
    const body = await req.json();
    console.log('getRepContacts - Full body:', JSON.stringify(body));
    const { userId, token, instanceUrl } = body;
    console.log('getRepContacts - Destructured. userId:', userId, 'token present:', !!token, 'instanceUrl:', instanceUrl);

    if (!userId || !token || !instanceUrl) {
      console.error('getRepContacts - Missing params. userId:', userId, 'token:', !!token, 'instanceUrl:', instanceUrl);
      return Response.json({ 
        error: 'Missing required parameters', 
        received: { userId: !!userId, token: !!token, instanceUrl: !!instanceUrl }
      }, { status: 400 });
    }

    // Query to get all contacts from opportunities assigned to this user
    const query = `SELECT Id, Name, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, Account.Name, Description, MailingCity, MailingState, MailingCountry, CreatedDate, csbs__Credit_Score__c, csbs__Ownership__c, LeadSource, HomePhone, Fax, OtherPhone, DoNotCall, HasOptedOutOfEmail FROM Contact WHERE Id IN (SELECT ContactId FROM OpportunityContactRole WHERE Opportunity.OwnerId = '${userId}') ORDER BY Name ASC`;

    console.log('getRepContacts - Query:', query);

    let response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('getRepContacts - Salesforce error for userId:', userId, 'Error:', errorText);
      return Response.json({ error: errorText }, { status: response.status });
    }

    let data = await response.json();
    console.log('getRepContacts - Initial response record count:', data.records?.length || 0);
    let allContacts = data.records || [];
    
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
      allContacts = allContacts.concat(data.records || []);
    }
    
    console.log('Fetched contacts count for userId', userId, ':', allContacts.length);
    
    return Response.json({ contacts: allContacts });
  } catch (error) {
    console.error('getRepContacts - Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});