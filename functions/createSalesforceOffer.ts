import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, submissionId, offerData, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !opportunityId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create the offer
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/csbs__Offer__c`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          csbs__Opportunity__c: opportunityId,
          csbs__Submission__c: submissionId,
          ...offerData
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json({ 
        error: 'Failed to create offer', 
        details: errorData 
      }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, offerId: result.id });

  } catch (error) {
    console.error('Error creating offer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});