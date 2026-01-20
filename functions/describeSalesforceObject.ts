import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { objectName, token, instanceUrl } = await req.json();

    if (!objectName || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/${objectName}/describe`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error, details: error }, { status: response.status });
    }

    const data = await response.json();
    
    // Return just the field names and types for easier review
    const fields = data.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: f.custom,
      updateable: f.updateable
    }));

    return Response.json({ 
      objectName: data.name,
      label: data.label,
      fields: fields
    });
  } catch (error) {
    console.error('Describe object error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});