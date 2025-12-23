import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { recipientEmail, recipientName, subject, message, recordId, recordType, token, instanceUrl, senderName } = await req.json();

    console.log('Sending email to:', recipientEmail, 'for record:', recordId, 'type:', recordType);

    if (!recipientEmail || !subject || !message || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email via Salesforce Email API
    console.log('Sending email via Salesforce...');

    // Email template
    const template = `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
          <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                      <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #08708E 0%, #065a72 100%);">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Prestige Capital Corp</h1>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 40px;">
                          <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                              Hi {{recipientName}},
                          </p>
                          <div style="margin: 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                              {{message}}
                          </div>
                          <p style="margin: 30px 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                              Best regards,<br>
                              <strong>{{senderName}}</strong><br>
                              <span style="color: #666666; font-size: 14px;">Prestige Capital Corp</span>
                          </p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0;">
                          <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                              <strong>Prestige Capital Corp</strong>
                          </p>
                          <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                              This email was sent regarding your business funding inquiry.<br>
                              If you have any questions, please don't hesitate to reach out.
                          </p>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
    </table>
    </body>
    </html>`;

    // Replace template variables
    const htmlBody = template
      .replace(/{{recipientName}}/g, recipientName || 'there')
      .replace(/{{message}}/g, message.replace(/\n/g, '<br>'))
      .replace(/{{senderName}}/g, senderName || 'Your Rep');

    const emailPayload = {
      inputs: [{
        emailAddresses: recipientEmail,
        emailSubject: subject,
        emailBody: htmlBody,
        senderType: 'CurrentUser'
      }]
    };

    const emailResponse = await fetch(
      `${instanceUrl}/services/data/v58.0/actions/standard/emailSimple`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      }
    );

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Salesforce email error:', emailResult);
      return Response.json({ 
        error: 'Failed to send email via Salesforce',
        details: emailResult
      }, { status: 500 });
    }

    console.log('Email sent via Salesforce');

    // Log the email as a Task in Salesforce for activity tracking
    console.log('Logging email activity in Salesforce...');
    const taskBody = {
      Subject: `Email: ${subject}`,
      Description: message,
      Status: 'Completed',
      Priority: 'Normal',
      ActivityDate: new Date().toISOString().split('T')[0]
    };

    // Use WhoId for Lead, WhatId for Opportunity
    if (recordType === 'Lead') {
      taskBody.WhoId = recordId;
    } else if (recordType === 'Opportunity') {
      taskBody.WhatId = recordId;
    }

    console.log('Creating Salesforce task with body:', taskBody);
    const sfResponse = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskBody)
    });

    const sfResult = await sfResponse.json();
    
    console.log('Salesforce task creation response:', sfResult);
    console.log('Task response status:', sfResponse.status);
    
    if (!sfResponse.ok) {
      console.error('Salesforce task creation error:', JSON.stringify(sfResult, null, 2));
      return Response.json({ 
        success: false,
        error: 'Failed to log email in Salesforce',
        details: sfResult,
        statusCode: sfResponse.status
      }, { status: 500 });
    }

    console.log('Salesforce task created:', sfResult);

    return Response.json({ 
      success: true,
      message: 'Email sent and logged in Salesforce',
      taskId: sfResult.id
    });
  } catch (error) {
    console.error('Send email error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack,
      type: error.name
    }, { status: 500 });
  }
});