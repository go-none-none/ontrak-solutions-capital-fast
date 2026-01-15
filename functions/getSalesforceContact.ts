Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { contactId, token, instanceUrl } = body;

    if (!contactId) {
      return Response.json({ error: 'Missing contactId' }, { status: 400 });
    }

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing authentication' }, { status: 401 });
    }

    const query = `SELECT Id, Name, FirstName, LastName, Title, Department, Email, Phone, MobilePhone, HomePhone, OtherPhone, Fax, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Account.Name, LeadSource, csbs__Ownership__c, csbs__Credit_Score__c FROM Contact WHERE Id = '${contactId}' LIMIT 1`;

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
      const errorText = await response.text();
      console.error('Salesforce error:', errorText);
      return Response.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    const contact = data.records?.[0];
    
    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    return Response.json({ contact });
  } catch (error) {
    console.error('Function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});