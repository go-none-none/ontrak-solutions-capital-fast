import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, instanceUrl } = await req.json();

    // Query Salesforce for Commission record types
    const query = `SELECT Id, Name, DeveloperName FROM RecordType WHERE SObjectType = 'csbs__Commission__c' AND IsActive = true ORDER BY Name`;
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
      const error = await response.json();
      return Response.json({ error: 'Failed to fetch record types', details: error }, { status: response.status });
    }

    const data = await response.json();
    console.log('Record types found:', data.records?.length || 0);
    return Response.json({ recordTypes: data.records || [] });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});