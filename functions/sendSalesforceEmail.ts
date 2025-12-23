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

    // First, send the actual email using Base44's email integration
    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: subject,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${recipientName || 'there'},</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Best regards,<br>${user.full_name || 'OnTrak Capital'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">OnTrak Capital</p>
        </div>
      `,
      from_name: user.full_name || 'OnTrak Capital'
    });

    // Then, log it as a Task in Salesforce for activity tracking
    const taskBody = {
      Subject: subject,
      Description: message,
      Status: 'Completed',
      Priority: 'Normal',
      ActivityDate: new Date().toISOString().split('T')[0],
      WhoId: recordId, // Link to Lead or Contact
      Type: 'Email',
      TaskSubtype: 'Email'
    };

    const sfResponse = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskBody)
    });

    if (!sfResponse.ok) {
      const error = await sfResponse.text();
      console.error('Salesforce task creation error:', error);
      // Don't fail the whole operation if logging fails
    }

    return Response.json({ 
      success: true,
      message: 'Email sent and logged successfully'
    });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});