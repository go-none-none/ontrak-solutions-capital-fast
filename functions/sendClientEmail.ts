import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const { recipientEmail, recipientName, subject, message, senderName, token, instanceUrl, offers, opportunityId, pdfLinkLabel, pdfFileName } = await req.json();

    if (!recipientEmail || !subject || !message || !token || !instanceUrl || !offers || !opportunityId || !pdfFileName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(pdfLinkLabel || 'Offer Proposal', 10, 10);
    
    doc.setFontSize(12);
    let yPos = 25;
    
    offers.forEach((offer, idx) => {
      doc.text(`Offer ${idx + 1}`, 10, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.text(`Lender: ${offer.csbs__Lender__c || 'Unknown'}`, 10, yPos);
      yPos += 5;
      doc.text(`Funded: $${Number(offer.csbs__Funded__c).toLocaleString()}`, 10, yPos);
      yPos += 5;
      doc.text(`Payment: $${Number(offer.csbs__Payment_Amount__c).toLocaleString()} ${offer.csbs__Payment_Frequency__c}`, 10, yPos);
      yPos += 5;
      doc.text(`Term: ${offer.csbs__Term__c} months`, 10, yPos);
      yPos += 5;
      if (offer.csbs__Factor_Rate__c) {
        doc.text(`Factor Rate: ${offer.csbs__Factor_Rate__c}`, 10, yPos);
        yPos += 5;
      }
      yPos += 10;
      doc.setFontSize(12);
    });

    const pdfBytes = doc.output('arraybuffer');
    const uint8Array = new Uint8Array(pdfBytes);
    const base64Pdf = btoa(String.fromCharCode.apply(null, uint8Array));

    // Upload PDF to Salesforce Files
    const uploadResponse = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/ContentVersion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Title: pdfFileName + '.pdf',
        VersionData: base64Pdf,
        ContentLocation: 'S'
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload PDF to Salesforce');
    }

    const uploadData = await uploadResponse.json();
    const contentDocumentId = uploadData.id;

    // Link file to opportunity
    const linkResponse = await fetch(`${instanceUrl}/services/data/v57.0/sobjects/ContentDocumentLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ContentDocumentId: contentDocumentId,
        LinkedEntityId: opportunityId,
        ShareType: 'V',
        Visibility: 'AllUsers'
      })
    });

    if (!linkResponse.ok) {
      throw new Error('Failed to link PDF to opportunity');
    }

    // Create Email Activity
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

    // Create Email Activity record
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
        TextBody: 'View this email in HTML format.',
        RelatedToId: opportunityId,
        FromName: senderName || 'OnTrak Capital',
        FromAddress: 'info@ontrak.co'
      })
    });

    if (!activityResponse.ok) {
      const errorData = await activityResponse.json();
      throw new Error(errorData[0]?.message || 'Failed to create email activity');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});