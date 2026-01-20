import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { recipientEmail, recipientName, subject, message, senderName, instanceUrl, offers, opportunityId, token } = body;

    if (!recipientEmail || !subject || !message || !instanceUrl || !offers || !opportunityId || !token) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Starting to send email to:', recipientEmail);

    // Build offers table for email
    const offersHTML = offers.map((offer, idx) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">Offer ${idx + 1}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${offer.csbs__Lender__c || 'Unknown'}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${Number(offer.csbs__Funded__c).toLocaleString()}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${Number(offer.csbs__Payment_Amount__c).toLocaleString()} ${offer.csbs__Payment_Frequency__c}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${offer.csbs__Term__c} mo</td>
      </tr>
    `).join('');

    // Create Email Activity record with HTML body
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #08708E 0%, #065a72 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .offers-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .offers-table th { background: #f0f0f0; padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">OnTrak Capital</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Offer Proposal</p>
          </div>
          <div class="content">
            <p>Hi ${recipientName || 'there'},</p>
            <div class="message">
              ${message}
            </div>
            <h3>Your Offers</h3>
            <table class="offers-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Lender</th>
                  <th>Funded Amount</th>
                  <th>Payment Amount</th>
                  <th>Term</th>
                </tr>
              </thead>
              <tbody>
                ${offersHTML}
              </tbody>
            </table>
            <p>Please review the offers above and let us know if you have any questions.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>${senderName || 'OnTrak Capital'}</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} OnTrak Capital. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Sending email via Salesforce SendEmail action...');

    // Use Salesforce's SendEmail action to actually send the email
    const sendEmailResponse = await fetch(`${instanceUrl}/services/data/v59.0/actions/standard/emailSimple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          emailAddresses: [recipientEmail],
          emailSubject: subject,
          emailBody: emailHTML,
          useSignature: false
        }]
      })
    });

    const sendEmailData = await sendEmailResponse.json();
    console.log('Send email response status:', sendEmailResponse.status);
    console.log('Send email response:', JSON.stringify(sendEmailData));

    if (!sendEmailResponse.ok) {
      const errorMsg = sendEmailData.errors?.[0]?.message || JSON.stringify(sendEmailData);
      console.error('Email send error:', errorMsg);
      throw new Error(`Failed to send email: ${errorMsg}`);
    }

    // Also log as activity in Salesforce
    console.log('Logging email activity in Salesforce...');
    const activityResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/EmailMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ToAddress: recipientEmail,
        Subject: subject,
        HtmlBody: emailHTML,
        TextBody: 'Offer proposal email sent',
        RelatedToId: opportunityId,
        FromName: senderName || 'OnTrak Capital',
        Status: '3'
      })
    });

    if (!activityResponse.ok) {
      console.warn('Warning: Could not log email activity, but email was sent');
    }

    console.log('Email sent successfully');
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});