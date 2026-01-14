Deno.serve(async (req) => {
  try {
    const { contactId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contactId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const query = `SELECT Id, Name, FirstName, LastName, Title, Department, Email, Phone, MobilePhone, HomePhone, OtherPhone, Fax, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry, AccountId, Account.Name, Description, Birthdate, DoNotCall, HasOptedOutOfEmail, HasOptedOutOfFax, LeadSource, csbs__Ownership__c, csbs__Credit_Score__c, csbs__Home_Address_Street__c, csbs__Home_Address_City__c, csbs__Home_Address_State__c, csbs__Home_Address_Zip_Code__c, csbs__Home_Address_Country__c, ReportsToId, ReportsTo.Name, OwnerId, Owner.Name FROM Contact WHERE Id = '${contactId}' LIMIT 1`;

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
    const contact = data.records && data.records[0] ? data.records[0] : null;
    
    if (!contact) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    return Response.json({ contact });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});