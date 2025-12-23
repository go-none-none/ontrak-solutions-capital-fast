import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !recordType) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get all fields for the record
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/${recordType}/${recordId}`,
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
    return Response.json({ record: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});