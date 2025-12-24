import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { taskId, updates, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !taskId || !updates) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/Task/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to update task' }, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});