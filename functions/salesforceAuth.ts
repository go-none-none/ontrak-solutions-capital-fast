import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, token } = await req.json();
    
    if (action === 'getLoginUrl') {
      const clientId = Deno.env.get("SALESFORCE_CLIENT_ID");
      if (!clientId) {
        return Response.json({ error: 'SALESFORCE_CLIENT_ID not configured' }, { status: 500 });
      }
      
      const url = new URL(req.url);
      const redirectUri = `${url.origin}/rep-portal`;
      
      // Return Salesforce OAuth URL - this will prompt user to login with their credentials
      return Response.json({
        loginUrl: `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=full%20refresh_token%20api%20id%20profile%20email`
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