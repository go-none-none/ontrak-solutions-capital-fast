import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CLIENT_ID = 'a2bFGaaCr3j7UW9Sty8ETv5sz';
const CLIENT_SECRET = Deno.env.get('DIALPAD_CLIENT_SECRET');
const REDIRECT_URI = `${Deno.env.get('BASE44_APP_URL')}/api/dialpad/callback`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code, state } = await req.json();

    if (action === 'getAuthUrl') {
      const authState = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      const scopes = ['messages.read', 'messages.write', 'calls.read', 'users.read', 'dispositions.read'];
      
      const authUrl = `https://dialpad.com/oauth2/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${scopes.join(' ')}&` +
        `state=${authState}`;

      return Response.json({ authUrl });
    }

    if (action === 'exchangeToken') {
      if (!code) {
        return Response.json({ error: 'Missing authorization code' }, { status: 400 });
      }

      const tokenResponse = await fetch('https://dialpad.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return Response.json({ error: 'Token exchange failed' }, { status: tokenResponse.status });
      }

      const tokenData = await tokenResponse.json();

      // Get Dialpad user info
      const userResponse = await fetch('https://dialpad.com/api/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      const dialpadUser = await userResponse.json();

      // Store tokens in user entity
      await base44.asServiceRole.auth.updateMe({
        dialpad_access_token: tokenData.access_token,
        dialpad_refresh_token: tokenData.refresh_token,
        dialpad_user_id: dialpadUser.id,
        dialpad_connected: true
      });

      return Response.json({ 
        success: true, 
        dialpadUserId: dialpadUser.id 
      });
    }

    if (action === 'refreshToken') {
      const refreshToken = user.dialpad_refresh_token;
      
      if (!refreshToken) {
        return Response.json({ error: 'No refresh token found' }, { status: 400 });
      }

      const tokenResponse = await fetch('https://dialpad.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        return Response.json({ error: 'Token refresh failed' }, { status: tokenResponse.status });
      }

      const tokenData = await tokenResponse.json();

      await base44.asServiceRole.auth.updateMe({
        dialpad_access_token: tokenData.access_token,
        dialpad_refresh_token: tokenData.refresh_token || refreshToken
      });

      return Response.json({ success: true });
    }

    if (action === 'disconnect') {
      await base44.asServiceRole.auth.updateMe({
        dialpad_access_token: null,
        dialpad_refresh_token: null,
        dialpad_user_id: null,
        dialpad_connected: false
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});