import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use existing Salesforce connector token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
    
    // Get Salesforce user info
    const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!userInfoResponse.ok) {
      return Response.json({ error: 'Failed to get Salesforce user info' }, { status: 401 });
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Return session info
    return Response.json({
      userId: userInfo.user_id,
      email: userInfo.email,
      name: userInfo.name,
      instanceUrl: userInfo.sub.split('/id/')[0],
      token: accessToken
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});