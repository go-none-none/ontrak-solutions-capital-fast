import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const { recipientEmail, recipientName, subject, message, senderName, token, instanceUrl, offers, opportunityId, pdfLinkLabel } = await req.json();

    if (!recipientEmail || !subject || !message || !token || !instanceUrl || !offers || !opportunityId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    // Create Email Activity in Salesforce
    const activityResponse = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/EmailMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ToAddress: recipientEmail,
        Subject: subject,
        HtmlBody: emailHTML,
        TextBody: 'Please view this email in HTML format to see the offer proposal.',
        RelatedToId: opportunityId,
        FromName: senderName || 'OnTrak Capital',
        ValidatedFromAddress: '0D2Vz0000000E4bKAE',
        Status: '3'
      })
    });

    if (!activityResponse.ok) {
      const errorData = await activityResponse.json();
      const errorMsg = errorData[0]?.message || JSON.stringify(errorData);
      throw new Error(`${errorMsg}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});