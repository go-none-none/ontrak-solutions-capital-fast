import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code } = await req.json();
    
    const clientId = Deno.env.get('DIALPAD_CLIENT_ID');
    const clientSecret = Deno.env.get('DIALPAD_CLIENT_SECRET');
    const redirectUri = `${req.headers.get('origin')}/dialpad-callback`;

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Dialpad credentials not configured' }, { status: 500 });
    }

    // Get auth URL
    if (action === 'getAuthUrl') {
      const authUrl = `https://dialpad.com/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code`;
      
      return Response.json({ authUrl });
    }

    // Exchange code for token
    if (action === 'exchangeCode') {
      if (!code) {
        return Response.json({ error: 'Code required' }, { status: 400 });
      }

      const tokenResponse = await fetch('https://dialpad.com/oauth2/token', {
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
        console.error('Token exchange failed:', error);
        return Response.json({ error: 'Failed to exchange code' }, { status: tokenResponse.status });
      }

      const tokenData = await tokenResponse.json();

      // Store token on user object
      await base44.auth.updateMe({
        dialpad_access_token: tokenData.access_token,
        dialpad_refresh_token: tokenData.refresh_token,
        dialpad_token_expires: Date.now() + (tokenData.expires_in * 1000)
      });

      return Response.json({ success: true, connected: true });
    }

    // Check connection
    if (action === 'checkConnection') {
      const connected = !!(user.dialpad_access_token);
      return Response.json({ connected });
    }

    // Disconnect
    if (action === 'disconnect') {
      await base44.auth.updateMe({
        dialpad_access_token: null,
        dialpad_refresh_token: null,
        dialpad_token_expires: null
      });
      return Response.json({ success: true, connected: false });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Dialpad OAuth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});