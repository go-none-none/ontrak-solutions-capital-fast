import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, updates, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !recordType || !updates) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Update the record
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/${recordType}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});