import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { recipientEmail, recipientName, subject, message, senderName, token, instanceUrl } = await req.json();

    if (!recipientEmail || !subject || !message || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #08708E 0%, #065a72 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">OnTrak Capital</h1>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            <div class="message">
              ${message}
            </div>
            <p>If you have any questions, feel free to reach out anytime.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>${senderName || 'OnTrak Capital'}</strong><br>OnTrak Capital</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OnTrak Capital. All rights reserved.</p>
            <p>This email was sent from OnTrak Capital's Rep Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Use Salesforce to send email via SingleEmailMessage
    const response = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/EmailMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ToAddress: recipientEmail,
        Subject: subject,
        HtmlBody: emailHTML,
        ValidatedFromAddress: null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData[0]?.message || 'Failed to send email via Salesforce');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});