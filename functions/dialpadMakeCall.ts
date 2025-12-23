import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber, callerId } = await req.json();

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Initiate call via Dialpad API
    // Note: Dialpad may require specific OAuth or click-to-call setup
    const response = await fetch('https://dialpad.com/api/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_number: phoneNumber,
        phone_number: phoneNumber
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialpad API error:', errorText);
      return Response.json({ 
        error: `Dialpad API error: ${errorText}. You may need to set up OAuth or use Dialpad's desktop/mobile app.`,
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ callId: data.id || data.call_id, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});