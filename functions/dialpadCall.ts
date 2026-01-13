Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { phone_number } = body;
    
    if (!phone_number) {
      return new Response(JSON.stringify({ error: 'Phone number is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanNumber = phone_number.replace(/[^\d+]/g, '');
    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DIALPAD_API_KEY not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch('https://dialpad.com/api/v2/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_number: cleanNumber
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ 
        error: 'Failed to initiate call',
        details: error 
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      call_id: data.call_id,
      status: data.status 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});