import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, objectType, updates, data, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const objectName = objectType || recordType;
    const updateData = data || updates;

    if (!objectName || !updateData) {
      return Response.json({ error: 'Missing object type or update data' }, { status: 400 });
    }

    // Update the record
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/${objectName}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Salesforce update error:', errorText);
      console.error('Update data:', JSON.stringify(updateData, null, 2));
      console.error('Object type:', objectName);
      console.error('Record ID:', recordId);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = errorText;
      }
      
      return Response.json({ 
        error: 'Salesforce update failed', 
        details: errorDetails,
        updateData,
        objectType: objectName 
      }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});