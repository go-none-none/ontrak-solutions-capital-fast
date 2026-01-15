import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { contentDocumentId, token, instanceUrl } = body;

    if (!token || !instanceUrl || !contentDocumentId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Delete ContentDocument (this will also delete all ContentVersions and ContentDocumentLinks)
    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentDocument/${contentDocumentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});