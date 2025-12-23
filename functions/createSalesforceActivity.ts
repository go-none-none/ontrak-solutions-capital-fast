import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, activityType, data, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !activityType) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const relationField = recordType === 'Lead' ? 'WhoId' : 'WhatId';
    
    let endpoint = '';
    let body = {};

    if (activityType === 'Task') {
      endpoint = `${instanceUrl}/services/data/v59.0/sobjects/Task`;
      body = {
        [relationField]: recordId,
        Subject: data.subject || 'Task',
        Status: data.status || 'Not Started',
        Priority: data.priority || 'Normal',
        Description: data.description
      };
    } else if (activityType === 'Event') {
      endpoint = `${instanceUrl}/services/data/v59.0/sobjects/Event`;
      body = {
        [relationField]: recordId,
        Subject: data.subject || 'Meeting',
        StartDateTime: data.startDateTime,
        EndDateTime: data.endDateTime,
        Description: data.description
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ error }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, id: result.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});