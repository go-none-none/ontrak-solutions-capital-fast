import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { taskData, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !taskData) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/Task`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to create task' }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});