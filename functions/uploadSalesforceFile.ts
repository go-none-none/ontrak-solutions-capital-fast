import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();
    
    const file = formData.get('file');
    const recordId = formData.get('recordId');
    const token = formData.get('token');
    const instanceUrl = formData.get('instanceUrl');

    if (!token || !instanceUrl || !recordId || !file) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Create ContentVersion
    const cvResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Title: file.name,
          PathOnClient: file.name,
          VersionData: base64Data
        })
      }
    );

    if (!cvResponse.ok) {
      const error = await cvResponse.text();
      return Response.json({ error }, { status: cvResponse.status });
    }

    const cvResult = await cvResponse.json();

    // Get ContentDocumentId
    const cdQuery = `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${cvResult.id}'`;
    const cdResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(cdQuery)}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const cdData = await cdResponse.json();
    const contentDocumentId = cdData.records[0].ContentDocumentId;

    // Link to record
    await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentDocumentLink`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ContentDocumentId: contentDocumentId,
          LinkedEntityId: recordId,
          ShareType: 'V'
        })
      }
    );

    return Response.json({ success: true, documentId: contentDocumentId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});