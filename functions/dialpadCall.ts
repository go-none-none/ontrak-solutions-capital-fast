Deno.serve(async (req) => {
  try {
    const { phone_number } = await req.json();
    
    if (!phone_number) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Clean phone number - remove spaces, dashes, parentheses
    const cleanNumber = phone_number.replace(/[\s\-\(\)]/g, '');

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    
    if (!apiKey) {
      return Response.json({ error: 'DIALPAD_API_KEY not configured' }, { status: 500 });
    }
    
    // Initiate call via Dialpad API
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
      return Response.json({ 
        error: 'Failed to initiate call',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({ 
      success: true,
      call_id: data.call_id,
      status: data.status 
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});