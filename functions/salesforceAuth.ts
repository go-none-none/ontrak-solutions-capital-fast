import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, code, codeChallenge, codeVerifier } = await req.json();

    const clientId = Deno.env.get("SALESFORCE_CLIENT_ID");
    const clientSecret = Deno.env.get("SALESFORCE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Salesforce credentials not configured' }, { status: 500 });
    }

    if (action === 'getLoginUrl') {
      const redirectUri = 'https://ontrakfunding.base44.dev/rep-portal';

      return Response.json({
        loginUrl: `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256`
      });
    }

    if (action === 'exchangeCode') {
      const redirectUri = 'https://ontrakfunding.base44.dev/rep-portal';

      // Exchange code for token
      const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        })
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return Response.json({ error: `Token exchange failed: ${error}` }, { status: 401 });
      }
      
      const tokenData = await tokenResponse.json();
      
      // Get user info
      const userInfoResponse = await fetch(`${tokenData.instance_url}/services/oauth2/userinfo`, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      
      if (!userInfoResponse.ok) {
        return Response.json({ error: 'Failed to get user info' }, { status: 401 });
      }
      
      const userInfo = await userInfoResponse.json();
      const subParts = userInfo.sub.split('/');
      const userId = subParts[subParts.length - 1];
      
      return Response.json({
        userId: userId,
        email: userInfo.email,
        name: userInfo.name,
        instanceUrl: tokenData.instance_url,
        token: tokenData.access_token
      });
    }
    
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});