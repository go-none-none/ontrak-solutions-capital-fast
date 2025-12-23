import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Query ContentDocumentLinks to get files attached to this record
    const query = `SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileExtension, ContentDocument.ContentSize, ContentDocument.CreatedDate, ContentDocument.LastModifiedDate FROM ContentDocumentLink WHERE LinkedEntityId = '${recordId}' ORDER BY ContentDocument.CreatedDate DESC`;
    
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
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
    return Response.json({ files: data.records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});