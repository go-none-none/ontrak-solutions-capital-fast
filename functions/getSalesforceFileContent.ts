import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { contentDocumentId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contentDocumentId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Step 1: Get the latest ContentVersion ID
    const versionQuery = `SELECT Id, FileExtension FROM ContentVersion WHERE ContentDocumentId = '${contentDocumentId}' AND IsLatest = true LIMIT 1`;
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
      return Response.json({ error: 'Failed to get version' }, { status: versionResponse.status });
    }

    const versionData = await versionResponse.json();
    if (!versionData.records || versionData.records.length === 0) {
      return Response.json({ error: 'No content version found' }, { status: 404 });
    }

    const contentVersionId = versionData.records[0].Id;
    const fileExtension = versionData.records[0].FileExtension;

    // Step 2: Fetch binary data using VersionData endpoint
    const binaryResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${contentVersionId}/VersionData`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!binaryResponse.ok) {
      return Response.json({ error: 'Failed to fetch file' }, { status: binaryResponse.status });
    }

    // Convert binary to base64
    const arrayBuffer = await binaryResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode.apply(null, uint8Array));

    // Determine MIME type
    const mimeTypes = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp'
    };
    const mimeType = mimeTypes[fileExtension?.toLowerCase()] || 'application/octet-stream';

    return Response.json({ 
      file: base64,
      mimeType: mimeType
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});