import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { recordId, fileName, fileData } = await req.json();

    if (!recordId || !fileName || !fileData) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');

    const tokenInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!tokenInfoResponse.ok) {
      return Response.json({ error: 'Failed to get Salesforce info' }, { status: 500 });
    }

    const tokenInfo = await tokenInfoResponse.json();
    const instanceUrl = tokenInfo.urls?.custom_domain || tokenInfo.urls?.profile?.split('/')[0] + '//' + tokenInfo.urls?.profile?.split('/')[2];

    // Create ContentVersion
    const cvResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Title: fileName,
          PathOnClient: fileName,
          VersionData: fileData
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
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    const cdData = await cdResponse.json();
    const contentDocumentId = cdData.records[0].ContentDocumentId;

    // Link to record
    await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentDocumentLink`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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