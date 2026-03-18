// v2 - CORS enabled
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  // Verify shared secret
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== Deno.env.get('WEB_TRACKING_SECRET')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const base44 = createClientFromRequest(req, { forceServiceRole: true });

  const { email, event_type, metadata } = await req.json();

  if (!email || !event_type) {
    return Response.json({ error: 'email and event_type are required' }, { status: 400, headers: corsHeaders });
  }

  const normalizedEmail = email.toLowerCase();

  await base44.asServiceRole.entities.EmailEvent.create({
    contact_email: normalizedEmail,
    event_type: 'clicked',
    timestamp: new Date().toISOString(),
    metadata: { source: 'web', event_type, ...metadata },
  });

  const contacts = await base44.asServiceRole.entities.Contact.filter({ email: normalizedEmail });
  if (contacts.length > 0) {
    const contact = contacts[0];
    const updates = { last_activity: new Date().toISOString() };
    if (event_type === 'clicked') {
      updates.total_clicks = (contact.total_clicks || 0) + 1;
    }
    await base44.asServiceRole.entities.Contact.update(contact.id, updates);
  }

  return Response.json({ success: true }, { headers: corsHeaders });
});