import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query leads owned by this rep
    const query = `SELECT Id, Name, Company, Phone, Email, Status, LeadSource, CreatedDate, LastModifiedDate FROM Lead WHERE OwnerId = '${userId}' AND IsConverted = false ORDER BY LastModifiedDate DESC LIMIT 2000`;
    
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ leads: data.records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});