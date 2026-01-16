Deno.serve(async (req) => {
  try {
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
    
    // Transform the response to include proper file data
    const files = (data.records || [])
      .filter(record => record && record.ContentDocument) // Filter out records without ContentDocument
      .map(record => ({
        Id: record.ContentDocumentId,
        Title: (record.ContentDocument && record.ContentDocument.Title) || 'Unknown',
        FileExtension: (record.ContentDocument && record.ContentDocument.FileExtension) || '',
        ContentSize: (record.ContentDocument && record.ContentDocument.ContentSize) || 0,
        CreatedDate: record.ContentDocument && record.ContentDocument.CreatedDate,
        LastModifiedDate: record.ContentDocument && record.ContentDocument.LastModifiedDate
      }));
    
    return Response.json({ files });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});