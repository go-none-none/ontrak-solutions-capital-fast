import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !recordType) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Build query based on record type
    let query;
    if (recordType === 'Lead') {
      query = `SELECT FIELDS(ALL), Owner.Name, Owner.Id FROM ${recordType} WHERE Id = '${recordId}' LIMIT 1`;
    } else {
      query = `SELECT FIELDS(ALL), Owner.Name, Owner.Id, Account.Name FROM ${recordType} WHERE Id = '${recordId}' LIMIT 1`;
    }
    
    // Helper function to resolve user name from ID
    const resolveUserName = async (userId) => {
      if (!userId) return null;
      try {
        const userRes = await fetch(
          `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(`SELECT Id, Name FROM User WHERE Id = '${userId}' LIMIT 1`)}`,
          {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          return userData.records?.[0]?.Name || null;
        }
      } catch (e) {
        console.error('Error resolving user:', e);
      }
      return null;
    };
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
    const record = data.records && data.records[0] ? data.records[0] : null;
    
    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }
    
    // Resolve Owner and Owner 2 custom fields to user names
    if (record.csbs__Owner__c) {
      record.csbs__Owner_Name__c = await resolveUserName(record.csbs__Owner__c);
    }
    if (record.csbs__Owner_2__c) {
      record.csbs__Owner_2_Name__c = await resolveUserName(record.csbs__Owner_2__c);
    }
    
    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});