import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { callId, disposition, notes, recordId, recordType, token, instanceUrl } = await req.json();

    if (!callId || !disposition) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DIALPAD_API_KEY');

    // Update disposition in Dialpad
    if (apiKey) {
      await fetch(`https://dialpad.com/api/v2/calls/${callId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disposition })
      });
    }

    // Create task in Salesforce to log the call
    if (token && instanceUrl && recordId) {
      const relationField = recordType === 'Lead' ? 'WhoId' : 'WhatId';
      
      await fetch(
        `${instanceUrl}/services/data/v59.0/sobjects/Task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            [relationField]: recordId,
            Subject: `Call - ${disposition}`,
            Status: 'Completed',
            TaskSubtype: 'Call',
            Description: notes || `Call disposition: ${disposition}`,
            ActivityDate: new Date().toISOString().split('T')[0]
          })
        }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});