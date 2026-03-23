import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { objectType, fieldName, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing Salesforce credentials' }, { status: 401 });
    }

    // Get field metadata to fetch picklist values
    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/${objectType}/describe`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce describe error:', error);
      return Response.json({ error }, { status: response.status });
    }

    const metadata = await response.json();
    const field = metadata.fields.find(f => f.name === fieldName);

    if (!field || !field.picklistValues) {
      return Response.json({ error: 'Field not found or not a picklist' }, { status: 404 });
    }

    // Extract active picklist values
    const values = field.picklistValues
      .filter(v => v.active)
      .map(v => v.value);

    return Response.json({ values });
  } catch (error) {
    console.error('Get picklist values error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});