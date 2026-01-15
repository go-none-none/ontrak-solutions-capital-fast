Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Parse form data from Twilio webhook
    const formData = await req.formData();
    const messageId = formData.get('MessageSid');
    const status = formData.get('MessageStatus'); // queued, failed, sent, delivered
    const errorCode = formData.get('ErrorCode');

    console.log(`SMS Status Update - MessageSid: ${messageId}, Status: ${status}, ErrorCode: ${errorCode}`);

    // Store status in your database or session storage
    // For now, we just log it - the status is also retrieved from Twilio API when fetching history
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Twilio status callback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});