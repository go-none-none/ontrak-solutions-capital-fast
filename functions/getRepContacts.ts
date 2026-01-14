Deno.serve(async (req) => {
  try {
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ 
        error: 'Missing required parameters: userId, token, instanceUrl' 
      }, { status: 400 });
    }

    // Query to get all contacts from Salesforce
    const query = `SELECT Id, Name, FirstName, LastName, Email, Phone, MobilePhone, Title, Department, Account.Name, Description, MailingCity, MailingState, MailingCountry FROM Contact ORDER BY Name ASC LIMIT 2000`;

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
      return Response.json({ error: errorText }, { status: response.status });
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
    
    return Response.json({ contacts: allContacts });
  } catch (error) {
    console.error('getRepContacts - Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});