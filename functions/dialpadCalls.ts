import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.dialpad_access_token) {
      return Response.json({ error: 'Dialpad not connected' }, { status: 401 });
    }

    const { action, callId, dispositionId } = await req.json();

    if (action === 'getCallHistory') {
      const response = await fetch(
        'https://dialpad.com/api/v2/calls?limit=50&order=desc',
        {
          headers: {
            'Authorization': `Bearer ${user.dialpad_access_token}`
          }
        }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch calls' }, { status: response.status });
      }

      const data = await response.json();
      return Response.json({ calls: data.items || [] });
    }

    if (action === 'getDispositions') {
      const response = await fetch('https://dialpad.com/api/v2/dispositions', {
        headers: {
          'Authorization': `Bearer ${user.dialpad_access_token}`
        }
      });

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch dispositions' }, { status: response.status });
      }

      const data = await response.json();
      return Response.json({ dispositions: data.items || [] });
    }

    if (action === 'setDisposition') {
      if (!callId || !dispositionId) {
        return Response.json({ error: 'Call ID and disposition ID required' }, { status: 400 });
      }

      const response = await fetch(`https://dialpad.com/api/v2/calls/${callId}/disposition`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.dialpad_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disposition_id: dispositionId })
      });

      if (!response.ok) {
        return Response.json({ error: 'Failed to set disposition' }, { status: response.status });
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});