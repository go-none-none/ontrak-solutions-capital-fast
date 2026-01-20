import { jsPDF } from 'npm:jspdf@2.5.2';
import 'npm:jspdf-autotable@3.5.31';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDER_EMAIL = "funding@ontrak.co";

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

    if (!recipientEmail || !subject || !message || !offers || !opportunityId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Starting to send email to:', recipientEmail);

    // Clean message - strip HTML tags if present
    const cleanMessage = message.replace(/<[^>]*>/g, '').trim() || 'Please review the offers below.';

    // Generate PDF with professional styling matching email template
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 0;

    // Header with gradient effect (using color blocks)
    doc.setFillColor(8, 112, 142);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Your Offer Proposal', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('OnTrak Capital - Funding Specialist', pageWidth / 2, 38, { align: 'center' });

    yPosition = 60;

    // Greeting
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Hi ${recipientName || 'Valued Customer'},`, 20, yPosition);
    yPosition += 12;

    // Message
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const cleanMessageLines = doc.splitTextToSize(cleanMessage, 170);
    doc.text(cleanMessageLines, 20, yPosition);
    yPosition += cleanMessageLines.length * 5 + 8;

    // Time Sensitive Urgency box
    doc.setFillColor(255, 245, 238);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition, 170, 28, 'FD');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('⏰ TIME SENSITIVE - FUNDING AVAILABLE TODAY', 25, yPosition + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const urgencyText = doc.splitTextToSize('These offers expire within 24-48 hours. We can process funding TODAY once you select your preferred offer. Act now to secure your funding.', 160);
    doc.text(urgencyText, 25, yPosition + 13);
    yPosition += 32;

    // Your Offers title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Your Offers', 20, yPosition);
    yPosition += 8;

    // Table data
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
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [15, 23, 42],
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Questions box
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(8, 112, 142);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition, 170, 22, 'FD');
    doc.setTextColor(8, 112, 142);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('❓ QUESTIONS?', 25, yPosition + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('I\'m here to help! Feel free to reach out if you need any clarification on these offers.', 25, yPosition + 13);
    yPosition += 28;

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

    // Generate base64 for email attachment
    const pdfBytes = doc.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

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

              <!-- Header -->
              <tr>
                  <td style="background: linear-gradient(135deg, #08708E 0%, #065a72 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; line-height: 1.3;">Your Offer Proposal</h1>
                  </td>
              </tr>

              <!-- Body Content -->
              <tr>
                  <td style="padding: 40px 30px;">
                      <p style="color: #0f172a; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Hi ${recipientName || 'Valued Customer'},</p>

                      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          ${cleanMessage}
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff5ee 0%, #fee2e2 100%); border-left: 4px solid #dc2626; border-radius: 8px; margin: 30px 0; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 20px;">
                                  <p style="color: #dc2626; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">⏰ TIME SENSITIVE - FUNDING AVAILABLE TODAY</p>
                                  <p style="color: #0f172a; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Act immediately!</strong> These offers expire within 24-48 hours. We can process your funding and get money to you TODAY once you select your preferred option. Don't delay—respond now to move forward.</p>
                              </td>
                          </tr>
                      </table>





                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px 0;">
                          <tr>
                              <td style="padding: 20px; background-color: #f0f9ff; border-radius: 12px;">
                                  <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">❓ Questions?</p>
                                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                                      I'm here to help! Feel free to reach out if you need any clarification on these offers.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>

              <!-- Footer -->
              <tr>
                  <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">Best regards,</p>
                      <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${senderName || 'OnTrak Capital'}</p>
                      <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">Funding Specialist</p>
                      <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0; line-height: 1.6;">
                          © ${new Date().getFullYear()} OnTrak Capital. All rights reserved.
                      </p>
                  </td>
              </tr>

          </table>
      </td>
    </tr>
    </table>
    </body>
    </html>`;

    // Send email via SendGrid with PDF attachment
    console.log('Sending email via SendGrid...');
    const sendResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: recipientEmail }]
        }],
        from: { email: SENDER_EMAIL, name: senderName || 'OnTrak Capital' },
        subject: subject,
        content: [{
          type: 'text/html',
          value: emailHTML
        }],
        attachments: [{
          content: pdfBase64,
          type: 'application/pdf',
          filename: 'Offer_Proposal.pdf',
          disposition: 'attachment'
        }]
      })
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(`SendGrid API error: ${JSON.stringify(errorData)}`);
    }

    // Log email as activity in Salesforce
    if (token && instanceUrl) {
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
    }

    console.log('Email sent successfully via SendGrid');
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});