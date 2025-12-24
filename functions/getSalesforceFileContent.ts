import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contentDocumentId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contentDocumentId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Step 1: Get the latest ContentVersion ID for this ContentDocument
    const versionQuery = `SELECT Id, FileExtension, ContentSize FROM ContentVersion WHERE ContentDocumentId = '${contentDocumentId}' AND IsLatest = true LIMIT 1`;
    const versionResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(versionQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!versionResponse.ok) {
      const error = await versionResponse.text();
      return Response.json({ error: `Failed to get version: ${error}` }, { status: versionResponse.status });
    }

    const versionData = await versionResponse.json();
    if (!versionData.records || versionData.records.length === 0) {
      return Response.json({ error: 'No content version found' }, { status: 404 });
    }

    const contentVersionId = versionData.records[0].Id;
    const fileExtension = versionData.records[0].FileExtension;

    // Step 2: Fetch the binary data using VersionData
    const binaryResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${contentVersionId}/VersionData`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!binaryResponse.ok) {
      const error = await binaryResponse.text();
      return Response.json({ error: `Failed to fetch file: ${error}` }, { status: binaryResponse.status });
    }

    // Determine content type based on file extension
    const contentTypeMap = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    const contentType = contentTypeMap[fileExtension?.toLowerCase()] || 'application/octet-stream';

    // Convert to base64 for transmission
    const arrayBuffer = await binaryResponse.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return Response.json({ 
      content: base64,
      contentType: contentType
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});