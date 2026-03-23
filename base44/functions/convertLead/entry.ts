import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, token, instanceUrl } = await req.json();

    if (!leadId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert lead using Salesforce REST API
    const response = await fetch(`${instanceUrl}/services/data/v57.0/actions/standard/convertLead`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          leadId: leadId,
          convertedStatus: 'Qualified'
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Convert lead error:', errorText);
      return Response.json({ error: 'Failed to convert lead' }, { status: response.status });
    }

    const result = await response.json();
    
    return Response.json({ 
      success: true,
      opportunityId: result[0]?.outputValues?.opportunityId,
      accountId: result[0]?.outputValues?.accountId,
      contactId: result[0]?.outputValues?.contactId
    });
  } catch (error) {
    console.error('Convert lead error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});