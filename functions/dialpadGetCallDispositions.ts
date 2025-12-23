import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber } = await req.json();

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Get recent calls to this number to find disposition options
    const response = await fetch(
      `https://dialpad.com/api/v2/stats/calls?target=${phoneNumber?.replace(/\D/g, '') || ''}&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialpad API error:', errorText);
      return Response.json({ 
        error: 'Failed to fetch call data',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract unique dispositions from call history
    const dispositions = new Set();
    if (data.items) {
      data.items.forEach(call => {
        if (call.disposition) {
          dispositions.add(call.disposition);
        }
      });
    }

    return Response.json({ 
      dispositions: Array.from(dispositions),
      calls: data.items || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});