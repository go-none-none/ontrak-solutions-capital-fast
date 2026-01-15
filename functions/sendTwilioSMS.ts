import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { phoneNumber, message, recordId, recordType, token, instanceUrl } = await req.json();

    if (!phoneNumber || !message || !recordId || !recordType || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    // Send SMS via Twilio with status callback
    const statusCallbackUrl = `${Deno.env.get('APP_URL') || 'https://api.base44.app'}/functions/twilioStatusCallback`;
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: `+1${phoneNumber.replace(/\D/g, '')}`,
          Body: message,
          StatusCallback: statusCallbackUrl
        })
      }
    );

    if (!twilioResponse.ok) {
      const error = await twilioResponse.json();
      return Response.json({ error: error.message || 'Failed to send SMS' }, { status: 400 });
    }

    const smsData = await twilioResponse.json();

    // Log SMS in Salesforce as a task/activity
    if (recordId && token && instanceUrl) {
      try {
        const activityUrl = `${instanceUrl}/services/data/v61.0/sobjects/Task`;
        await fetch(activityUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Subject: `SMS: ${message.substring(0, 50)}...`,
            WhoId: recordType === 'Lead' ? null : null,
            WhatId: recordId,
            ActivityDate: new Date().toISOString().split('T')[0],
            Status: 'Completed',
            Type: 'Call',
            Description: `SMS sent to ${phoneNumber}\n\nMessage: ${message}\n\nSID: ${smsData.sid}`
          })
        });
      } catch (activityError) {
        console.error('Failed to log activity in Salesforce:', activityError);
        // Don't fail the response if activity logging fails
      }
    }

    return Response.json({ 
      success: true, 
      sid: smsData.sid,
      message: 'SMS sent successfully'
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});