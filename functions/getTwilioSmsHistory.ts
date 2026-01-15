import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    // Fetch messages from Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json?To=%2B1${phoneNumber}&Limit=50`,
      {
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
        }
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch messages' }, { status: 400 });
    }

    const data = await response.json();
    
    // Format messages for display
    const messages = (data.messages || [])
      .sort((a, b) => new Date(a.date_sent) - new Date(b.date_sent))
      .map(msg => ({
        body: msg.body,
        direction: msg.direction,
        date: msg.date_sent,
        status: msg.status
      }));

    return Response.json({ messages });
  } catch (error) {
    console.error('Get SMS history error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});