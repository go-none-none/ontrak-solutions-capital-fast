import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunityId, recordTypeId, commissionData, token, instanceUrl } = await req.json();

    // Create commission record
    const createData = {
      csbs__Opportunity__c: opportunityId,
      RecordTypeId: recordTypeId,
      ...commissionData
    };

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/csbs__Commission__c`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ error: 'Failed to create commission', details: error }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, id: result.id });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});