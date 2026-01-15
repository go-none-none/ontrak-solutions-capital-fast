Deno.serve(async (req) => {
  try {
    const body = await req.json();
    
    const { fileName, fileData, recordId, token, instanceUrl } = body;

    if (!token || !instanceUrl || !recordId || !fileName || !fileData) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const base64Data = fileData;

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
          Title: fileName,
          PathOnClient: fileName,
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