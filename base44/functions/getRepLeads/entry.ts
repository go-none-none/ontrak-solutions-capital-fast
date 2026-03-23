import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
        try {
          console.log('getRepLeads - Function called');
          const base44 = createClientFromRequest(req);
          const { userId, token, instanceUrl } = await req.json();
          console.log('getRepLeads - Received params. userId:', userId, 'token present:', !!token, 'instanceUrl:', instanceUrl);

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query all leads with priority ordering - using standard fields only
    const query = `SELECT Id, Name, Company, Phone, MobilePhone, Email, Status, LeadSource, CreatedDate, LastModifiedDate, Industry, Website, Street, City, State, PostalCode, Country, Title, Rating, OwnerId, Owner.Name, Owner.Email, Owner.Phone, Call_Disposition__c, AnnualRevenue, Description FROM Lead WHERE OwnerId = '${userId}' AND IsConverted = false ORDER BY LastModifiedDate DESC`;

    console.log('getRepLeads - Looking for leads with OwnerId:', userId);
    console.log('getRepLeads - Query:', query);

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
      console.error('getRepLeads - Salesforce error for userId:', userId, 'Error:', error);
      return Response.json({ error: 'Failed to fetch leads', details: error }, { status: 500 });
    }

    let data = await response.json();
    console.log('getRepLeads - Initial response record count:', data.records?.length || 0);
    console.log('getRepLeads - Has more records?', !!data.nextRecordsUrl);
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
    
    console.log('Fetched leads count for userId', userId, ':', allLeads.length);
    console.log('Query used:', query);
    
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