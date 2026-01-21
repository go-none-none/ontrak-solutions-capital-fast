import { jsPDF } from 'npm:jspdf@2.5.2';
import 'npm:jspdf-autotable@3.5.31';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDER_EMAIL = "funding@ontrak.co";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { recipientEmail, recipientName, subject, message, senderName, offers, opportunityId, sessionToken, sessionInstanceUrl } = body;

    if (!recipientEmail || !subject || !message || !offers || !opportunityId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanMessage = message.replace(/<[^>]*>/g, '').trim();

        // Get session from headers
        const authHeader = req.headers.get('authorization');
        let sessionToken = null;
        let sessionInstanceUrl = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const sessionData = authHeader.substring(7);
          try {
            const parsed = JSON.parse(atob(sessionData));
            sessionToken = parsed.token;
            sessionInstanceUrl = parsed.instanceUrl;
            console.log('Session parsed successfully:', { hasToken: !!sessionToken, hasInstanceUrl: !!sessionInstanceUrl });
          } catch (e) {
            console.error('Failed to parse session from auth header:', e.message);
          }
        } else {
          console.log('No authorization header or invalid format');
        }

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 0;

        // Header
        doc.setFillColor(8, 112, 142);
        doc.rect(0, 0, pageWidth, 50, 'F');
        doc.setTextColor(255, 255, 255);

        // Try to add logo image
        try {
          const logoUrl = 'https://ontrakcap.com/wp-content/uploads/2025/10/cropped-customcolor_logo_transparent_background-1-scaled-1-e1761864411651-1536x382.png';
          const logoResponse = await fetch(logoUrl);
          if (logoResponse.ok) {
            const logoBlob = await logoResponse.blob();
            const logoDataUrl = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(logoBlob);
            });
            doc.addImage(logoDataUrl, 'PNG', 20, 8, 15, 15);
          }
        } catch (err) {
          // Silently continue without logo
        }

        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.text('Your Offer Proposal', pageWidth / 2, 32, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Funding Specialist', pageWidth / 2, 42, { align: 'center' });

    yPosition = 60;

    // Greeting
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Hi ${recipientName || 'Valued Customer'},`, 20, yPosition);
    yPosition += 12;

    // Introduction
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const introText = 'Great news! We\'ve secured funding offers specifically tailored for your business. These offers are designed to provide fast access to capital when you need it most, helping you grow, manage cash flow, and seize opportunities.';
    const introLines = doc.splitTextToSize(introText, 170);
    doc.text(introLines, 20, yPosition);
    yPosition += introLines.length * 5 + 8;

    // Custom message
    if (cleanMessage) {
      const messageLines = doc.splitTextToSize(cleanMessage, 170);
      doc.text(messageLines, 20, yPosition);
      yPosition += messageLines.length * 5 + 8;
    }

    // Your Offers title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Your Offers', 20, yPosition);
    yPosition += 8;

    // Table
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
      headStyles: { fillColor: [8, 112, 142], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: [15, 23, 42], fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      margin: { left: 20, right: 20 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 40 }, 2: { cellWidth: 35 }, 3: { cellWidth: 40 }, 4: { cellWidth: 20 } }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Urgency box
    doc.setFillColor(255, 245, 238);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition, 170, 32, 'FD');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('⏰ TIME SENSITIVE - ACT NOW FOR SAME-DAY FUNDING', 25, yPosition + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const urgencyText = doc.splitTextToSize('These offers expire within 24-48 hours. Once you select your preferred offer, we can process funding and get money to your account TODAY. Don\'t miss this opportunity—respond immediately to lock in your funding.', 160);
    doc.text(urgencyText, 25, yPosition + 13);
    yPosition += 36;

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Best regards,', 20, yPosition);
    yPosition += 6;
    doc.text(senderName || 'OnTrak Capital', 20, yPosition);
    yPosition += 6;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 115, 128);
    doc.setFontSize(10);
    doc.text('Funding Specialist', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.text(`© ${new Date().getFullYear()} OnTrak Capital. All rights reserved.`, 20, yPosition);

    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    // Upload PDF to Salesforce
    let pdfUploaded = false;
    if (sessionToken && sessionInstanceUrl) {
      try {
        console.log('Uploading PDF to Salesforce for opportunity:', opportunityId);
        const uploadResponse = await fetch(`${sessionInstanceUrl}/services/data/v59.0/sobjects/ContentVersion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Title: 'Offer_Proposal.pdf',
            PathOnClient: 'Offer_Proposal.pdf',
            VersionData: pdfBase64
          })
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('ContentVersion upload failed:', uploadResponse.status, errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }

        const cvResult = await uploadResponse.json();
        console.log('ContentVersion created:', cvResult.id);

        // Get ContentDocumentId
        const cdQuery = `SELECT ContentDocumentId FROM ContentVersion WHERE Id = '${cvResult.id}'`;
        const cdResponse = await fetch(
          `${sessionInstanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(cdQuery)}`,
          { headers: { 'Authorization': `Bearer ${sessionToken}` } }
        );

        if (!cdResponse.ok) {
          const errorText = await cdResponse.text();
          console.error('ContentDocument query failed:', cdResponse.status, errorText);
          throw new Error(`Query failed: ${errorText}`);
        }

        const cdData = await cdResponse.json();
        const contentDocumentId = cdData.records[0].ContentDocumentId;
        console.log('ContentDocumentId:', contentDocumentId);

        // Link to opportunity
        const linkResponse = await fetch(`${sessionInstanceUrl}/services/data/v59.0/sobjects/ContentDocumentLink`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ContentDocumentId: contentDocumentId,
            LinkedEntityId: opportunityId,
            ShareType: 'V'
          })
        });

        if (!linkResponse.ok) {
          const errorText = await linkResponse.text();
          console.error('ContentDocumentLink creation failed:', linkResponse.status, errorText);
          throw new Error(`Link failed: ${errorText}`);
        }

        console.log('PDF successfully attached to opportunity:', opportunityId);
        pdfUploaded = true;
      } catch (uploadError) {
        console.error('Failed to upload PDF to Salesforce:', uploadError);
        console.error('Full error:', uploadError.message);
        // Continue with email even if upload fails
      }
    } else {
      console.log('No session token or instance URL - skipping Salesforce upload');
    }

    const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Offer Proposal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
<tr>
  <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
              <td style="background: linear-gradient(135deg, #08708E 0%, #065a72 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                  <img src="https://ontrakcap.com/wp-content/uploads/2025/10/cropped-customcolor_logo_transparent_background-1-scaled-1-e1761864411651-1536x382.png" alt="OnTrak Capital" style="height: 40px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" />
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">Your Offer Proposal</h1>
              </td>
          </tr>
          <tr>
              <td style="padding: 40px 30px;">
                  <p style="color: #0f172a; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Hi ${recipientName || 'Valued Customer'},</p>
                  <p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;">Great news! We've secured funding offers specifically tailored for your business. These offers are designed to provide fast access to capital when you need it most, helping you grow, manage cash flow, and seize opportunities.</p>
                  ${cleanMessage ? `<p style="color: #64748b; font-size: 15px; line-height: 1.8; margin: 0 0 30px 0;">${cleanMessage}</p>` : ''}
                  <h3 style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 30px 0 20px 0;">Your Offers</h3>
                  <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                      <tr style="background-color: #08708E;">
                          <td style="color: #ffffff; font-weight: bold; font-size: 13px; border-radius: 12px 0 0 0;">Offer</td>
                          <td style="color: #ffffff; font-weight: bold; font-size: 13px;">Lender</td>
                          <td style="color: #ffffff; font-weight: bold; font-size: 13px;">Funded Amount</td>
                          <td style="color: #ffffff; font-weight: bold; font-size: 13px;">Payment Amount</td>
                          <td style="color: #ffffff; font-weight: bold; font-size: 13px; border-radius: 0 12px 0 0;">Term</td>
                      </tr>
                      ${offers.map((offer, idx) => `<tr style="border-top: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};"><td style="color: #0f172a; font-size: 13px; font-weight: 500;">Offer ${idx + 1}</td><td style="color: #0f172a; font-size: 13px;">${offer.csbs__Lender__c || 'Unknown'}</td><td style="color: #0f172a; font-size: 13px; font-weight: 600;">$${Number(offer.csbs__Funded__c).toLocaleString()}</td><td style="color: #0f172a; font-size: 13px;">$${Number(offer.csbs__Payment_Amount__c).toLocaleString()} ${offer.csbs__Payment_Frequency__c}</td><td style="color: #0f172a; font-size: 13px;">${offer.csbs__Term__c} months</td></tr>`).join('')}
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff5ee 0%, #fee2e2 100%); border-left: 5px solid #dc2626; border-radius: 12px; margin: 30px 0; border-collapse: collapse;">
                      <tr>
                          <td style="padding: 25px;">
                              <p style="color: #dc2626; font-size: 15px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">⏰ TIME SENSITIVE - ACT NOW FOR SAME-DAY FUNDING</p>
                              <p style="color: #0f172a; font-size: 14px; line-height: 1.7; margin: 0;"><strong>These offers expire within 24-48 hours.</strong> Once you select your preferred offer, we can process funding and get money to your account TODAY. Don't miss this opportunity—respond immediately to lock in your funding.</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
          <tr>
              <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">Best regards,</p>
                  <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${senderName || 'OnTrak Capital'}</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 15px 0;">Funding Specialist</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">© ${new Date().getFullYear()} OnTrak Capital. All rights reserved.</p>
              </td>
          </tr>
      </table>
  </td>
</tr>
</table>
</body>
</html>`;

    // Send email via SendGrid
    const sendResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipientEmail }] }],
        from: { email: SENDER_EMAIL, name: 'Funding | OnTrak Solutions' },
        subject: subject,
        content: [{ type: 'text/html', value: emailHTML }],
        attachments: [{ content: pdfBase64, type: 'application/pdf', filename: 'Offer_Proposal.pdf', disposition: 'attachment' }]
      })
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(`SendGrid error: ${JSON.stringify(errorData)}`);
    }

    return Response.json({ success: true, pdfUploaded });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});