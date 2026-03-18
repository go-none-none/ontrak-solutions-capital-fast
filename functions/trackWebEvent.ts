import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const apiKey = req.headers.get('x-api-key');
    const secretKey = Deno.env.get('WEB_TRACKING_SECRET');
    
    if (!secretKey) {
      return Response.json({ error: 'WEB_TRACKING_SECRET not configured' }, { status: 500 });
    }
    
    if (!apiKey || apiKey !== secretKey) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, event_type, page, metadata_json } = body;

    if (!email || !event_type) {
      return Response.json({ error: 'email and event_type are required' }, { status: 400 });
    }

    // For now, just log the tracking event
    console.log(`Tracked: ${event_type} for ${email} on ${page}`);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});