Deno.serve(async (req) => {
  try {
    const { userId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !userId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Query to get all contacts from opportunities assigned to this user
    const query = `
      SELECT DISTINCT 
        c.Id, c.Name, c.FirstName, c.LastName, c.Email, c.Phone, c.MobilePhone, 
        c.Title, c.Department, c.Account.Name as AccountName, c.Description,
        c.MailingCity, c.MailingState, c.MailingCountry, c.CreatedDate,
        c.csbs__Credit_Score__c, c.csbs__Ownership__c, c.LeadSource, c.HomePhone,
        c.Fax, c.OtherPhone, c.DoNotCall, c.HasOptedOutOfEmail
      FROM Contact c
      WHERE c.Id IN (
        SELECT ContactId FROM OpportunityContactRole 
        WHERE Opportunity.OwnerId = '${userId}'
      )
      ORDER BY c.Name ASC
    `;

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
    const contacts = data.records || [];
    
    return Response.json({ contacts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});