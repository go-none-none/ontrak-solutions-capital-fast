import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can change ownership
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { recordId, newOwnerId, recordType, token, instanceUrl } = await req.json();

    if (!recordId || !newOwnerId || !recordType || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate recordType
    const validTypes = ['Lead', 'Opportunity', 'Contact'];
    if (!validTypes.includes(recordType)) {
      return Response.json({ error: 'Invalid record type' }, { status: 400 });
    }

    // Update the owner in Salesforce
    const updateResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/${recordType}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          OwnerId: newOwnerId
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Salesforce update failed:', errorText);
      return Response.json({ error: 'Failed to update owner' }, { status: updateResponse.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Change owner error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});