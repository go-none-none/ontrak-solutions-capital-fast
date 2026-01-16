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

    // Fetch messages from Twilio API with pagination
    let allMessages = [];
    let nextPageUri = null;
    const maxPages = 20; // Fetch up to 20 pages (1000 messages)
    let pageCount = 0;

    do {
      const url = nextPageUri 
        ? `https://api.twilio.com${nextPageUri}`
        : `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json?PageSize=50`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
        }
      });

      if (!response.ok) {
        console.error('Twilio API error:', response.status, response.statusText);
        break;
      }

      const data = await response.json();
      
      // Filter messages for this phone number before adding
      const filteredMessages = (data.messages || [])
        .filter(msg => msg.to === formattedPhone || msg.from === formattedPhone);
      
      allMessages = allMessages.concat(filteredMessages);
      
      nextPageUri = data.next_page_uri;
      pageCount++;
      
      // Stop if we have enough messages for this contact or hit max pages
      if (filteredMessages.length === 0 || pageCount >= maxPages) {
        break;
      }
    } while (nextPageUri);
    
    // Get Twilio phone number
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    // Format messages
    const messages = allMessages
      .sort((a, b) => new Date(a.date_sent) - new Date(b.date_sent))
      .map(msg => {
        // Determine direction:
        // Outbound: FROM Twilio number (msg.direction === 'outbound-api')
        // Inbound: TO Twilio number (msg.direction === 'inbound')
        const isOutbound = msg.direction === 'outbound-api';
        return {
          body: msg.body,
          direction: isOutbound ? 'outbound' : 'inbound',
          date: msg.date_sent,
          status: msg.status, // outbound: queued, failed, sent, delivered, undelivered | inbound: received
          from: msg.from,
          to: msg.to,
          sid: msg.sid
        };
      });

    return Response.json({ messages });
  } catch (error) {
    console.error('Get SMS history error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});