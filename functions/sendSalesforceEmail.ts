import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, recipientName, subject, message, recordId, token, instanceUrl } = await req.json();

    if (!recipientEmail || !subject || !message || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create email message using Salesforce API
    const emailBody = {
      messages: [{
        targetObjectId: recipientEmail,
        subject: subject,
        plainTextBody: message,
        senderDisplayName: user.full_name || 'OnTrak Capital',
        saveAsActivity: true,
        whatId: recordId // Link email to the Lead or Opportunity record
      }]
    };

    const response = await fetch(`${instanceUrl}/services/data/v58.0/actions/standard/emailSimple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce email error:', error);
      return Response.json({ error: 'Failed to send email via Salesforce' }, { status: 500 });
    }

    const result = await response.json();
    
    return Response.json({ 
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});