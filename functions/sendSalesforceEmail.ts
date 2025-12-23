import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { recipientEmail, recipientName, subject, message, recordId, recordType, token, instanceUrl, senderName } = await req.json();

    console.log('Sending email to:', recipientEmail, 'for record:', recordId, 'type:', recordType);

    if (!recipientEmail || !subject || !message || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the email as a Task in Salesforce for activity tracking
    console.log('Logging email activity in Salesforce...');
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
        success: false,
        error: 'Failed to log email in Salesforce',
        details: sfResult
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