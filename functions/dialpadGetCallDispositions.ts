import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber } = await req.json();

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Fetch disposition lists from Dialpad
    const response = await fetch(
      'https://dialpad.com/api/v2/calldispositionlists',
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
        error: 'Failed to fetch dispositions',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Find "Sales Dispositions" list or use the first list
    const salesList = data.items?.find(list => list.name === 'Sales Dispositions') || data.items?.[0];
    
    // Extract disposition names from the list
    const dispositions = salesList?.dispositions?.map(disp => disp.name) || [];

    return Response.json({ 
      dispositions: dispositions,
      raw: data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});