import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId } = await req.json();

    if (!recordId) {
      return Response.json({ error: 'Missing recordId' }, { status: 400 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
    const instanceUrl = Deno.env.get('SALESFORCE_INSTANCE_URL');

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/Account/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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