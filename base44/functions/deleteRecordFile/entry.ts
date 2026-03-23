import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { contentDocumentId } = await req.json();

    if (!contentDocumentId) {
      return Response.json({ error: 'Missing contentDocumentId' }, { status: 400 });
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

    const deleteResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentDocument/${contentDocumentId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!deleteResponse.ok) {
      return Response.json({ error: 'Delete failed' }, { status: deleteResponse.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});