import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, recipientName, subject, message, recordId, recordType, token, instanceUrl } = await req.json();

    console.log('Sending email to:', recipientEmail, 'for record:', recordId, 'type:', recordType);

    if (!recipientEmail || !subject || !message || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First, send the actual email using Base44's email integration
    console.log('Sending email via Base44...');
    const emailResult = await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: subject,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi ${recipientName || 'there'},</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Best regards,<br>${user.full_name || 'OnTrak Capital'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">OnTrak Capital</p>
        </div>
      `,
      from_name: user.full_name || 'OnTrak Capital'
    });
    console.log('Email sent successfully via Base44');

    // Then, log it as a Task in Salesforce for activity tracking
    const taskBody = {
      Subject: `Email: ${subject}`,
      Description: message,
      Status: 'Completed',
      Priority: 'Normal',
      ActivityDate: new Date().toISOString().split('T')[0],
      Type: 'Email'
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
    
    if (!sfResponse.ok) {
      console.error('Salesforce task creation error:', sfResult);
      return Response.json({ 
        success: true,
        message: 'Email sent but not logged in Salesforce',
        error: sfResult
      });
    }

    console.log('Salesforce task created:', sfResult);

    return Response.json({ 
      success: true,
      message: 'Email sent and logged successfully',
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