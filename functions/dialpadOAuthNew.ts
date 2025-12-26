import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CLIENT_ID = 'a2bFGaaCr3j7UW9Sty8ETv5sz';
const CLIENT_SECRET = Deno.env.get('DIALPAD_CLIENT_SECRET');
const REDIRECT_URI = 'https://ontrak.co/DialpadCallback';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code } = await req.json();

    // Step 1: Generate authorization URL
    if (action === 'getAuthUrl') {
      const state = user.id; // Use user ID as state
      const authUrl = `https://dialpad.com/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `state=${state}`;
      
      return Response.json({ authUrl });
    }

    // Step 3: Exchange code for access token
    if (action === 'exchangeCode') {
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
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return Response.json({ error: 'Failed to exchange code for token' }, { status: 400 });
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info from Dialpad
      const userInfoResponse = await fetch('https://dialpad.com/api/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      let dialpadUserId = null;
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        dialpadUserId = userInfo.id;
      }

      // Store token in user profile
      await base44.asServiceRole.entities.User.update(user.id, {
        dialpad_access_token: tokenData.access_token,
        dialpad_refresh_token: tokenData.refresh_token,
        dialpad_user_id: dialpadUserId,
        dialpad_connected: true
      });

      return Response.json({ success: true });
    }

    // Check if user is connected
    if (action === 'checkConnection') {
      return Response.json({ 
        connected: user.dialpad_connected || false 
      });
    }

    // Disconnect
    if (action === 'disconnect') {
      if (user.dialpad_access_token) {
        try {
          await fetch('https://dialpad.com/oauth2/deauthorize', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.dialpad_access_token}`
            }
          });
        } catch (error) {
          console.error('Deauthorize error:', error);
        }
      }

      await base44.asServiceRole.entities.User.update(user.id, {
        dialpad_access_token: null,
        dialpad_refresh_token: null,
        dialpad_user_id: null,
        dialpad_connected: false
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Dialpad OAuth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});