import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token, instanceUrl } = body;

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing token or instanceUrl' }, { status: 400 });
    }

    // Get RecordType metadata for Account
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/Account/describe`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: 'Failed to fetch record types', details: error }, { status: response.status });
    }

    const data = await response.json();
    const recordTypes = data.recordTypeInfos
      .filter(rt => rt.available && !rt.master)
      .map(rt => ({
        id: rt.recordTypeId,
        name: rt.name,
        developerName: rt.developerName
      }));

    return Response.json({ recordTypes });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});