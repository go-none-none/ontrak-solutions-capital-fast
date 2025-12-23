import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get Contact Roles for the Opportunity
    const query = `SELECT Id, ContactId, Contact.Name, Contact.Email, Contact.Phone, Contact.MobilePhone, Role FROM OpportunityContactRole WHERE OpportunityId = '${recordId}'`;
    const queryUrl = `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`;

    const response = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error: `Failed to fetch contact roles: ${error}` }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ contactRoles: data.records || [] });
  } catch (error) {
    console.error('Get contact roles error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});