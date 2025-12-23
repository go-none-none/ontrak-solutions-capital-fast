import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Get SMS conversations
    const response = await fetch(`https://dialpad.com/api/v2/sms?target=${phoneNumber.replace(/\D/g, '')}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialpad API error:', errorText);
      return Response.json({ 
        error: 'Failed to fetch SMS',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ messages: data.items || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});