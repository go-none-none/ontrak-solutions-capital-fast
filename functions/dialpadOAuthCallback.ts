import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/RepPortal?error=' + encodeURIComponent(error)
        }
      });
    }

    if (!code) {
      return Response.json({ error: 'No authorization code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const clientId = Deno.env.get('DIALPAD_CLIENT_ID');
    const clientSecret = Deno.env.get('DIALPAD_CLIENT_SECRET');
    const redirectUri = `${url.origin}/api/functions/dialpadOAuthCallback`;

    const tokenResponse = await fetch('https://dialpad.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return Response.json({ error: 'Failed to exchange code for token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Store the access token and refresh token in session or user data
    // For now, storing in sessionStorage via redirect
    const sessionData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };

    // Redirect back to RepPortal with token data
    return new Response(
      `<html><body><script>
        sessionStorage.setItem('dialpadToken', JSON.stringify(${JSON.stringify(sessionData)}));
        window.location.href = '/RepPortal';
      </script></body></html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});