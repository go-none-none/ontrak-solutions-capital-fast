import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, code } = await req.json();

    const clientId = Deno.env.get("SALESFORCE_CLIENT_ID");
    const clientSecret = Deno.env.get("SALESFORCE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Salesforce credentials not configured' }, { status: 500 });
    }

    if (action === 'getLoginUrl') {
      const redirectUri = 'https://ontrak.co/repportal';
      const state = crypto.randomUUID();

      return Response.json({
        loginUrl: `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
        state
      });
    }

    if (action === 'exchangeCode') {
      const redirectUri = 'https://ontrak.co/repportal';

      const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange error:', error);
        return Response.json({ error: `Token exchange failed: ${error}` }, { status: 401 });
      }
      
      const tokenData = await tokenResponse.json();
      console.log('Token exchange response:', { access_token: tokenData.access_token, instance_url: tokenData.instance_url });
      
      if (!tokenData.access_token) {
        console.error('No access_token in response:', tokenData);
        return Response.json({ error: 'No access token received from Salesforce' }, { status: 401 });
      }
      
      const userInfoResponse = await fetch(`${tokenData.instance_url}/services/oauth2/userinfo`, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      
      if (!userInfoResponse.ok) {
        const error = await userInfoResponse.text();
        return Response.json({ error: `Failed to get user info: ${error}` }, { status: 401 });
      }
      
      const userInfo = await userInfoResponse.json();
      const subParts = userInfo.sub.split('/');
      const userId = subParts[subParts.length - 1];
      console.log('Auth Debug - Raw sub:', userInfo.sub);
      console.log('Auth Debug - Extracted userId:', userId);
      console.log('Auth Debug - User email:', userInfo.email);
      
      // Check if user is admin by querying their profile
      const profileResponse = await fetch(
        `${tokenData.instance_url}/services/data/v58.0/query?q=${encodeURIComponent(
          `SELECT Profile.Name FROM User WHERE Id = '${userId}'`
        )}`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let isAdmin = false;
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const profileName = profileData.records?.[0]?.Profile?.Name || '';
        isAdmin = profileName.toLowerCase().includes('system administrator') || 
                  profileName.toLowerCase().includes('admin');
      }
      
      return Response.json({
        userId: userId,
        email: userInfo.email,
        name: userInfo.name,
        instanceUrl: tokenData.instance_url,
        token: tokenData.access_token,
        isAdmin
      });
    }
    
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Salesforce auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});