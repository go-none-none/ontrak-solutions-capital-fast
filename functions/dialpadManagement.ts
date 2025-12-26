import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CLIENT_ID = 'a2bFGaaCr3j7UW9Sty8ETv5sz';
const CLIENT_SECRET = Deno.env.get('DIALPAD_CLIENT_SECRET');

// Store tokens in a simple in-memory map (in production, use a database)
const tokenStore = new Map();

Deno.serve(async (req) => {
  try {
    const { action, sfUserId, code, phoneNumber, message } = await req.json();

    if (!sfUserId) {
      return Response.json({ error: 'Missing Salesforce user ID' }, { status: 400 });
    }

    const userKey = `sf_${sfUserId}`;

    if (action === 'checkConnection') {
      const token = tokenStore.get(userKey);
      return Response.json({ connected: !!token });
    }

    if (action === 'connect') {
      const redirectUri = `${Deno.env.get('BASE44_APP_URL') || 'https://base44.app'}/dialpad/callback`;
      
      const authUrl = `https://dialpad.com/oauth2/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `state=${userKey}`;

      return Response.json({ authUrl });
    }

    if (action === 'exchangeToken') {
      if (!code) {
        return Response.json({ error: 'Missing authorization code' }, { status: 400 });
      }

      const redirectUri = `${Deno.env.get('BASE44_APP_URL') || 'https://base44.app'}/dialpad/callback`;
      
      const tokenResponse = await fetch('https://dialpad.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        return Response.json({ error: 'Token exchange failed' }, { status: tokenResponse.status });
      }

      const tokenData = await tokenResponse.json();
      tokenStore.set(userKey, tokenData.access_token);

      return Response.json({ success: true });
    }

    // All other actions require a token
    const token = tokenStore.get(userKey);
    if (!token) {
      return Response.json({ error: 'Not connected to Dialpad' }, { status: 401 });
    }

    if (action === 'getMessages') {
      if (!phoneNumber) {
        return Response.json({ error: 'Phone number required' }, { status: 400 });
      }

      const response = await fetch(
        `https://dialpad.com/api/v2/sms?target=${encodeURIComponent(phoneNumber)}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch messages' }, { status: response.status });
      }

      const data = await response.json();
      return Response.json({ messages: data.items || [] });
    }

    if (action === 'sendMessage') {
      if (!phoneNumber || !message) {
        return Response.json({ error: 'Phone number and message required' }, { status: 400 });
      }

      const response = await fetch('https://dialpad.com/api/v2/sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_number: phoneNumber,
          text: message
        })
      });

      if (!response.ok) {
        return Response.json({ error: 'Failed to send message' }, { status: response.status });
      }

      return Response.json({ success: true });
    }

    if (action === 'getCalls') {
      const response = await fetch(
        'https://dialpad.com/api/v2/calls?limit=50&order=desc',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch calls' }, { status: response.status });
      }

      const data = await response.json();
      
      // Filter by phone number if provided
      let calls = data.items || [];
      if (phoneNumber) {
        calls = calls.filter(call => 
          call.to_number === phoneNumber || call.from_number === phoneNumber
        );
      }
      
      return Response.json({ calls });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});