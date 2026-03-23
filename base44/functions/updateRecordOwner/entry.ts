import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { recordId, objectType, ownerId, token, instanceUrl } = await req.json();

    if (!recordId || !objectType || !ownerId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update record owner
    const response = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/${objectType}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        OwnerId: ownerId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update owner error:', errorText);
      return Response.json({ error: 'Failed to update owner' }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Update owner error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});