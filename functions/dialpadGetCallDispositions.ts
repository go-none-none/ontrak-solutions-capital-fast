import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber } = await req.json();

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Fetch all disposition lists from Dialpad
    const response = await fetch(
      'https://dialpad.com/api/v2/dispositions',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialpad API error:', errorText);
      return Response.json({ 
        error: 'Failed to fetch dispositions',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract all disposition names from all lists
    const dispositions = [];
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        if (item.formatted_dispositions) {
          for (const disp of item.formatted_dispositions) {
            dispositions.push(disp.name);
            // Also add sub-dispositions if they exist
            if (disp.dispositions) {
              for (const sub of disp.dispositions) {
                dispositions.push(`${disp.name} - ${sub.name}`);
              }
            }
          }
        }
      }
    }

    return Response.json({ 
      dispositions: [...new Set(dispositions)], // Remove duplicates
      raw: data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});