import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    
    const clientId = Deno.env.get('DIALPAD_CLIENT_ID');
    const redirectUri = `${url.origin}/api/functions/dialpadOAuthCallback`;
    
    // Generate a random state parameter for security
    const state = crypto.randomUUID();
    
    const authUrl = new URL('https://dialpad.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    
    // Request appropriate scopes for calling
    authUrl.searchParams.set('scope', 'call');

    return Response.json({
      authUrl: authUrl.toString(),
      state: state
    });

  } catch (error) {
    console.error('OAuth initiate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});