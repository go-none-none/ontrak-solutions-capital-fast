Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { userId, token, instanceUrl } = body;

    console.log('getRepContacts - Raw body:', JSON.stringify(body).substring(0, 200));
    console.log('getRepContacts - Parsed:', { 
      userId, 
      tokenType: typeof token,
      tokenExists: !!token,
      tokenValue: token?.substring?.(0, 20),
      instanceUrl
    });
    
    if (!token || !instanceUrl) {
      console.log('getRepContacts - Missing token or instanceUrl, returning empty');
      return Response.json({ contacts: [] }, { status: 200 });
    }

    // Query to get contacts owned by the user from Salesforce
    const query = `SELECT Id, Name, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, Account.Name, AccountName, MailingCity, MailingState, MailingCountry, csbs__Ownership__c, csbs__Credit_Score__c FROM Contact WHERE OwnerId = '${userId}' ORDER BY Name ASC LIMIT 2000`;

    console.log('getRepContacts - Querying Salesforce with token:', token.substring(0, 30) + '...');
    
    let response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('getRepContacts - Salesforce response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('getRepContacts - Salesforce error:', errorText);
      return Response.json({ contacts: [] }, { status: 200 });
    }

    let data = await response.json();
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
    console.log('Sample contact:', allContacts[0]);
    
    return Response.json({ contacts: allContacts });
  } catch (error) {
    console.error('getRepContacts - Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});