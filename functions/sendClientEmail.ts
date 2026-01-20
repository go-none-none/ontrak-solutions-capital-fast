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

    // Use Salesforce Tooling API to send email
    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:met="http://soap.sforce.com/2006/04/metadata">
        <soapenv:Header>
          <met:SessionHeader>
            <met:sessionId>${token}</met:sessionId>
          </met:SessionHeader>
        </soapenv:Header>
        <soapenv:Body>
          <met:sendEmail>
            <met:request>
              <met:lists>
                <met:toAddresses>${recipientEmail}</met:toAddresses>
              </met:lists>
              <met:subject>${subject}</met:subject>
              <met:plainTextBody>View this email in HTML format.</met:plainTextBody>
              <met:htmlBody><![CDATA[${emailHTML}]]></met:htmlBody>
            </met:request>
          </met:sendEmail>
        </soapenv:Body>
      </soapenv:Envelope>`;

    const response = await fetch(`${instanceUrl}/services/Soap/m/57.0`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=UTF-8',
        'SOAPAction': 'sendEmail'
      },
      body: soapRequest
    });

    const responseText = await response.text();
    if (!response.ok || responseText.includes('faultstring')) {
      throw new Error('Failed to send email via Salesforce');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});