import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const { action } = await req.json();

    // Get Salesforce OAuth URL
    if (action === 'getLoginUrl') {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
      
      // Get Salesforce instance URL from a test API call
      const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const userInfo = await userInfoResponse.json();
      
      return Response.json({
        loginUrl: `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${Deno.env.get('SALESFORCE_CLIENT_ID')}&redirect_uri=${encodeURIComponent(url.origin + '/rep-portal')}&scope=openid%20api%20refresh_token%20id%20email%20profile`,
        instanceUrl: userInfo.sub.split('/id/')[0]
      });
    }

    // Verify token and get user info
    if (action === 'verifyToken') {
      const { token } = await req.json();
      
      const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userInfoResponse.ok) {
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      const userInfo = await userInfoResponse.json();
      
      // Store session info
      return Response.json({
        userId: userInfo.user_id,
        email: userInfo.email,
        name: userInfo.name,
        instanceUrl: userInfo.sub.split('/id/')[0],
        token: token
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});