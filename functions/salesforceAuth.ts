import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, token } = await req.json();
    
    if (action === 'getLoginUrl') {
      const appToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
      
      // Get instance URL from app's Salesforce connection
      const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { 'Authorization': `Bearer ${appToken}` }
      });
      const userInfo = await userInfoResponse.json();
      const instanceUrl = userInfo.sub.split('/id/')[0];
      
      // Get OAuth config
      const tokenResponse = await fetch(`${instanceUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=dummy&client_id=get_config`
      });
      
      const url = new URL(req.url);
      const redirectUri = `${url.origin}/rep-portal`;
      
      // Return Salesforce OAuth URL - this will prompt user to login
      return Response.json({
        loginUrl: `${instanceUrl}/services/oauth2/authorize?response_type=token&client_id=3MVG9pRzvMkjMb6lZlt3YjDQwe.hH5JbE6YqwqOy9OCKgj_Uh_8NsW7BUfTpmCvi_VaJv8A_P4xiFQd4PBhFh&redirect_uri=${encodeURIComponent(redirectUri)}&scope=api%20id%20profile%20email`,
        instanceUrl
      });
    }
    
    if (action === 'verifyToken') {
      // Verify the user's token
      const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userInfoResponse.ok) {
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      const userInfo = await userInfoResponse.json();
      const subParts = userInfo.sub.split('/');
      const userId = subParts[subParts.length - 1];
      
      return Response.json({
        userId: userId,
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