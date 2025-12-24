import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contentDocumentId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contentDocumentId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get the file content from Salesforce
    const response = await fetch(
      `${instanceUrl}/sfc/servlet.shepherd/document/download/${contentDocumentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return Response.json({ 
      content: base64,
      contentType: contentType
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});