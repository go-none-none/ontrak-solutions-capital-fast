Deno.serve(async (req) => {
  try {
    console.log('getContactRelatedOpportunities - Function called');
    const { contactId, token, instanceUrl } = await req.json();
    console.log('getContactRelatedOpportunities - Received params. contactId:', contactId, 'token present:', !!token, 'instanceUrl:', instanceUrl);

    if (!contactId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    const query = `SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity WHERE Id IN (SELECT OpportunityId FROM OpportunityContactRole WHERE ContactId = '${contactId}') ORDER BY CreatedDate DESC`;

    console.log('getContactRelatedOpportunities - Query:', query);

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
      console.error('getContactRelatedOpportunities - Salesforce error for contactId:', contactId, 'Error:', error);
      return Response.json({ error: 'Failed to fetch opportunities', details: error }, { status: 500 });
    }

    let data = await response.json();
    console.log('getContactRelatedOpportunities - Initial response record count:', data.records?.length || 0);
    let allOpportunities = data.records || [];
    
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
      allOpportunities = allOpportunities.concat(data.records || []);
    }
    
    console.log('Fetched opportunities count for contactId', contactId, ':', allOpportunities.length);
    
    return Response.json({ opportunities: allOpportunities });
  } catch (error) {
    console.error('getContactRelatedOpportunities - Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});