import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { 
      assignedTo,
      subject,
      dueDate,
      priority,
      status,
      relatedToId,
      relatedToType,
      description,
      token,
      instanceUrl
    } = await req.json();

    if (!token || !instanceUrl || !assignedTo || !subject) {
      return Response.json({ 
        error: 'Missing required fields: token, instanceUrl, assignedTo, subject' 
      }, { status: 400 });
    }

    // Build task payload
    const taskPayload = {
      OwnerId: assignedTo,
      Subject: subject,
      Priority: priority || 'Normal',
      Status: status || 'Not Started',
      Description: description || ''
    };

    if (dueDate) {
      taskPayload.ActivityDate = dueDate;
    }

    // Add "Related To" relationship
    if (relatedToId) {
      taskPayload.WhatId = relatedToId;
    }

    const response = await fetch(
      `${instanceUrl}/services/data/v57.0/sobjects/Task`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskPayload)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce API error:', error);
      return Response.json({ 
        error: `Failed to create task: ${error}` 
      }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ success: true, taskId: result.id });

  } catch (error) {
    console.error('Error creating task:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});