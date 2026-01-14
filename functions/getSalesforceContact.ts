Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { contactId, token, instanceUrl } = body;

    console.log('getSalesforceContact - Params:', { contactId, tokenExists: !!token, instanceUrl });

    if (!token || !instanceUrl || !contactId) {
      return Response.json({ error: 'Missing required parameters: contactId, token, instanceUrl' }, { status: 400 });
    }

    const query = `SELECT Id, Name, FirstName, LastName, Title, Department, Email, Phone, MobilePhone, HomePhone, OtherPhone, Fax, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, Account.Name, Description, LeadSource, csbs__Ownership__c, csbs__Credit_Score__c FROM Contact WHERE Id = '${contactId}' LIMIT 1`;

    console.log('getSalesforceContact - Query:', query.substring(0, 100));

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('getSalesforceContact - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce error details:', errorText);
      return Response.json({ error: errorText, status: response.status }, { status: 400 });
    }

    const data = await response.json();
    const contact = data.records && data.records[0] ? data.records[0] : null;
    
    if (!contact) {
      console.error('Contact not found with ID:', contactId);
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    return Response.json({ contact });
  } catch (error) {
    console.error('Function error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});