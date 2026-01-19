Deno.serve(async (req) => {
  try {
    const { contentDocumentId, newTitle, token, instanceUrl } = await req.json();

    if (!contentDocumentId || !newTitle || !token || !instanceUrl) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // First, get the ContentVersion associated with this ContentDocument
    const versionQuery = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=SELECT+Id+FROM+ContentVersion+WHERE+ContentDocumentId='${contentDocumentId}'+ORDER+BY+CreatedDate+DESC+LIMIT+1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!versionQuery.ok) {
      const error = await versionQuery.json();
      return Response.json(
        { error: error.message || 'Failed to find content version' },
        { status: versionQuery.status }
      );
    }

    const versionData = await versionQuery.json();
    if (!versionData.records || versionData.records.length === 0) {
      return Response.json(
        { error: 'No content version found for this document' },
        { status: 404 }
      );
    }

    const contentVersionId = versionData.records[0].Id;

    // Update the ContentVersion with new title
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${contentVersionId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Title: newTitle })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Salesforce error:', error);
      return Response.json(
        { error: error[0]?.message || error.message || 'Failed to rename file. You may not have permission to modify this file.' },
        { status: response.status }
      );
    }

    return Response.json({ success: true, message: 'File renamed successfully' });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});