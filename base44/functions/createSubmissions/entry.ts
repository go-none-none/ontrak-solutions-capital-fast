import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunityId, lenders, token, instanceUrl } = await req.json();

    // Create submission records for each selected lender
    const submissions = lenders.map(lender => ({
      csbs__Opportunity__c: opportunityId,
      csbs__Lender__c: lender.lenderId,
      csbs__Status__c: 'Submitted',
      csbs__Type__c: 'Email',
      csbs__Notes__c: lender.notes || ''
    }));

    const response = await fetch(
      `${instanceUrl}/services/data/v62.0/composite/sobjects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allOrNone: false,
          records: submissions.map(sub => ({
            attributes: { type: 'csbs__Submission__c' },
            ...sub
          }))
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ results: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});