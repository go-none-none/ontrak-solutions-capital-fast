import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.dialpad_access_token) {
      return Response.json({ error: 'Dialpad not connected' }, { status: 401 });
    }

    const { action, phoneNumber, message, messageId } = await req.json();

    if (action === 'getMessages') {
      if (!phoneNumber) {
        return Response.json({ error: 'Phone number required' }, { status: 400 });
      }

      const response = await fetch(
        `https://dialpad.com/api/v2/sms?target=${encodeURIComponent(phoneNumber)}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${user.dialpad_access_token}`
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
          'Authorization': `Bearer ${user.dialpad_access_token}`,
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

      const data = await response.json();
      return Response.json({ success: true, messageId: data.id });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});