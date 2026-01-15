import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return Response.json({ messages: [] });
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return Response.json({ messages: [] });
    }

    // Format phone number for Twilio (ensure +1 prefix for US)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    // Fetch messages from Twilio API
    // Query both To and From to capture full conversation
    const params = new URLSearchParams({
      PageSize: '50'
    });

    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
      }
    });

    if (!response.ok) {
      console.error('Twilio API error:', response.status, response.statusText);
      return Response.json({ messages: [] });
    }

    const data = await response.json();
    
    // Get Twilio phone number
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    // Filter and format messages for this phone number
    const messages = (data.messages || [])
      .filter(msg => msg.to === formattedPhone || msg.from === formattedPhone)
      .sort((a, b) => new Date(a.date_sent) - new Date(b.date_sent))
      .map(msg => {
        // Determine direction: outbound if FROM Twilio number, inbound if TO Twilio number
        const isOutbound = msg.from === twilioPhoneNumber;
        return {
          body: msg.body,
          direction: isOutbound ? 'outbound' : 'inbound',
          date: msg.date_sent,
          status: msg.status,
          from: msg.from,
          to: msg.to
        };
      });

    return Response.json({ messages });
  } catch (error) {
    console.error('Get SMS history error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});