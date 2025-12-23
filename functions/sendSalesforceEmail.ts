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

    // Load and format email template
    const templatePath = new URL('../components/email/RepEmail.html', import.meta.url);
    const templateResponse = await fetch(templatePath);
    const template = await templateResponse.text();

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