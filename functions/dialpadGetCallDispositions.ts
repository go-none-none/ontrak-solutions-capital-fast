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
        if (item.dispositions) {
          // Parse the nested disposition structure
          for (const [parentKey, parentValue] of Object.entries(item.dispositions)) {
            // Skip special keys that start with ~
            if (parentKey.startsWith('~')) continue;
            
            // Add parent disposition
            dispositions.push(parentKey);
            
            // Add child dispositions
            if (typeof parentValue === 'object') {
              for (const [childKey, childValue] of Object.entries(parentValue)) {
                if (childKey.startsWith('~')) continue;
                dispositions.push(`${parentKey} - ${childKey}`);
              }
            }
          }
        }
      }
    }

    return Response.json({ 
      dispositions: dispositions.length > 0 ? [...new Set(dispositions)] : ['Connected', 'Voicemail', 'No Answer', 'Busy', 'Wrong Number', 'Callback Requested', 'Not Interested'],
      raw: data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});