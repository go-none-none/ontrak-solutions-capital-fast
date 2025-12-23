import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phoneNumber, message, recordId, recordType, token, instanceUrl } = await req.json();

    if (!phoneNumber || !message) {
      return Response.json({ error: 'Phone number and message required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DIALPAD_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Dialpad API key not configured' }, { status: 500 });
    }

    // Send SMS via Dialpad
    const response = await fetch('https://dialpad.com/api/v2/sms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_number: phoneNumber.replace(/\D/g, ''),
        text: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialpad API error:', errorText);
      return Response.json({ 
        error: 'Failed to send SMS',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();

    // Log as activity in Salesforce
    if (recordId && token && instanceUrl) {
      try {
        await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Task`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            WhoId: recordType === 'Lead' ? recordId : null,
            WhatId: recordType === 'Opportunity' ? recordId : null,
            Subject: 'SMS Sent',
            Description: message,
            Status: 'Completed',
            ActivityDate: new Date().toISOString().split('T')[0]
          })
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }
    }

    return Response.json({ success: true, messageId: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});