import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';
import 'npm:jspdf-autotable@3.5.31';

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
    const { recipientEmail, recipientName, subject, message, senderName, instanceUrl, offers, opportunityId, token, pdfFileName } = body;

    if (!recipientEmail || !subject || !message || !instanceUrl || !offers || !opportunityId || !token || !pdfFileName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Starting to send email to:', recipientEmail);

    // Generate PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFillColor(8, 112, 142);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('OnTrak Capital', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Offer Proposal', 105, 28, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Greeting
    doc.setFontSize(12);
    doc.text(`Hi ${recipientName || 'Valued Customer'},`, 20, yPosition);
    yPosition += 15;

    // Message
    doc.setFontSize(11);
    const messageLines = doc.splitTextToSize(message, 170);
    doc.text(messageLines, 20, yPosition);
    yPosition += messageLines.length * 6 + 10;

    // Offers table
    doc.setFontSize(12);
    doc.text('Your Offers', 20, yPosition);
    yPosition += 10;

    const tableData = [
      ['Offer', 'Lender', 'Funded Amount', 'Payment Amount', 'Term'],
      ...offers.map((offer, idx) => [
        `Offer ${idx + 1}`,
        offer.csbs__Lender__c || 'Unknown',
        `$${Number(offer.csbs__Funded__c).toLocaleString()}`,
        `$${Number(offer.csbs__Payment_Amount__c).toLocaleString()} ${offer.csbs__Payment_Frequency__c}`,
        `${offer.csbs__Term__c} mo`
      ])
    ];

    doc.autoTable({
      startY: yPosition,
      head: [tableData[0]],
      body: tableData.slice(1),
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: 20,
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 } }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Please review the offers above and let us know if you have any questions.', 20, finalY);
    doc.text(`Best regards, ${senderName || 'OnTrak Capital'}`, 20, finalY + 10);

    const pdfBytes = doc.output('arraybuffer');
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Upload PDF to Salesforce
    console.log('Uploading PDF to Salesforce...');
    const uploadResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/ContentVersion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Title: pdfFileName,
        PathOnClient: `/${pdfFileName}.pdf`,
        VersionData: base64PDF,
        IsMajorVersion: true
      })
    });

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      console.warn('Could not upload PDF:', JSON.stringify(uploadData));
    }

    let pdfLink = '';
    if (uploadResponse.ok && uploadData.id) {
      // Get content document ID
      const contentVersionId = uploadData.id;
      const getResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${contentVersionId}?fields=ContentDocumentId`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (getResponse.ok) {
        const contentData = await getResponse.json();
        const contentDocId = contentData.ContentDocumentId;

        // Link to opportunity
        await fetch(`${instanceUrl}/services/data/v59.0/sobjects/ContentDocumentLink`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ContentDocumentId: contentDocId,
            LinkedEntityId: opportunityId,
            ShareType: 'V'
          })
        }).catch(err => console.warn('Could not link PDF:', err.message));

        pdfLink = `${instanceUrl}/sfc/servlet.shepherd/version/download/${contentVersionId}`;
      }
    }

    // Build email from template
    const offersRows = offers.map((offer, idx) => `
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">Offer ${idx + 1}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">${offer.csbs__Lender__c || 'Unknown'}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">$${Number(offer.csbs__Funded__c).toLocaleString()}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">$${Number(offer.csbs__Payment_Amount__c).toLocaleString()} ${offer.csbs__Payment_Frequency__c}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">${offer.csbs__Term__c} mo</td>
      </tr>
    `).join('');

    const emailHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .email-wrapper { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #08708E 0%, #065a72 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .message-box { background: #f0f9ff; border-left: 4px solid #08708E; padding: 15px; margin: 20px 0; }
    .offers-section { margin: 30px 0; }
    .offers-section h3 { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #08708E; }
    .offers-table { width: 100%; border-collapse: collapse; }
    .offers-table th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; font-size: 13px; border: 1px solid #e5e7eb; }
    .offers-table td { padding: 12px; border: 1px solid #e5e7eb; font-size: 13px; }
    .offers-table tr:nth-child(even) { background: #fafafa; }
    .cta-section { margin: 30px 0; text-align: center; }
    .cta-button { display: inline-block; background: #08708E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; }
    .cta-button:hover { background: #065a72; }
    .footer-text { color: #6b7280; font-size: 13px; margin-top: 20px; }
    .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>OnTrak Capital</h1>
        <p>Offer Proposal</p>
      </div>
      <div class="content">
        <div class="greeting">Hi ${recipientName || 'Valued Customer'},</div>
        <div class="message-box">
          ${message}
        </div>
        <div class="offers-section">
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
              ${offersRows}
            </tbody>
          </table>
        </div>
        ${pdfLink ? `<div class="cta-section"><a href="${pdfLink}" class="cta-button">View Full Proposal PDF</a></div>` : ''}
        <div class="footer-text">
          <p>Please review the offers above and let us know if you have any questions.</p>
        </div>
        <div class="divider"></div>
        <div style="margin-top: 30px;">
          <p>Best regards,<br><strong>${senderName || 'OnTrak Capital'}</strong></p>
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} OnTrak Capital. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send email via Salesforce
    console.log('Sending email via Salesforce...');
    const sendResponse = await fetch(`${instanceUrl}/services/data/v59.0/actions/standard/emailSimple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          emailAddresses: recipientEmail,
          emailSubject: subject,
          emailBody: emailHTML,
          useSignature: false
        }]
      })
    });

    const responseData = await sendResponse.json();
    console.log('Salesforce response status:', sendResponse.status);
    console.log('Salesforce response:', JSON.stringify(responseData));

    if (!sendResponse.ok) {
      throw new Error(`Salesforce API error: ${JSON.stringify(responseData)}`);
    }

    // Log email as activity
    await fetch(`${instanceUrl}/services/data/v59.0/sobjects/EmailMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ToAddress: recipientEmail,
        Subject: subject,
        HtmlBody: emailHTML,
        RelatedToId: opportunityId,
        Status: '3'
      })
    }).catch(err => console.warn('Could not log activity:', err.message));

    console.log('Email sent successfully');
    return Response.json({ success: true, pdfLink });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});