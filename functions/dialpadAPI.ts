import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.dialpad_access_token) {
      return Response.json({ error: 'Dialpad not connected' }, { status: 400 });
    }

    const { action, phoneNumber, message } = await req.json();

    const headers = {
      'Authorization': `Bearer ${user.dialpad_access_token}`,
      'Content-Type': 'application/json'
    };

    // Get SMS messages
    if (action === 'getMessages') {
      if (!phoneNumber) {
        return Response.json({ error: 'Phone number required' }, { status: 400 });
      }

      const response = await fetch(
        `https://dialpad.com/api/v2/sms?target=${encodeURIComponent(phoneNumber)}&limit=50`,
        { headers }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch messages' }, { status: response.status });
      }

      const data = await response.json();
      return Response.json({ messages: data.items || [] });
    }

    // Send SMS
    if (action === 'sendMessage') {
      if (!phoneNumber || !message) {
        return Response.json({ error: 'Phone number and message required' }, { status: 400 });
      }

      const response = await fetch('https://dialpad.com/api/v2/sms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to_numbers: [phoneNumber],
          text: message,
          infer_country_code: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send SMS failed:', errorText);
        return Response.json({ error: 'Failed to send message' }, { status: response.status });
      }

      const data = await response.json();
      return Response.json({ success: true, messageId: data.id });
    }

    // Get call history
    if (action === 'getCalls') {
      const response = await fetch(
        'https://dialpad.com/api/v2/calls?limit=50&order=desc',
        { headers }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch calls' }, { status: response.status });
      }

      const data = await response.json();
      
      // Filter by phone number if provided
      let calls = data.items || [];
      if (phoneNumber) {
        calls = calls.filter(call => 
          call.external_number === phoneNumber || 
          call.target?.number === phoneNumber
        );
      }

      return Response.json({ calls });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Dialpad API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});