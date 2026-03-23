import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { recordId } = await req.json();

    if (!recordId) {
      return Response.json({ error: 'Missing recordId' }, { status: 400 });
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

    const query = `SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.ContentSize, ContentDocument.CreatedDate FROM ContentDocumentLink WHERE LinkedEntityId = '${recordId}'`;
    const filesResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!filesResponse.ok) {
      return Response.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    const filesData = await filesResponse.json();
    return Response.json({ files: filesData.records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});