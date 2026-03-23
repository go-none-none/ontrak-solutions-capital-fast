import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, token, instanceUrl } = await req.json();

    if (!recordId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/Account/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'Record not found' }, { status: response.status });
    }

    const record = await response.json();
    return Response.json({ record });
  } catch (error) {
    console.error('Error fetching lender:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});