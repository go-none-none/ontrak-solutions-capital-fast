import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !userId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Query for open tasks assigned to the user
    const query = `
      SELECT Id, Subject, Description, Status, Priority, ActivityDate, 
             IsClosed, IsHighPriority, WhatId, What.Name, What.Type,
             WhoId, Who.Name, Who.Type, CreatedDate, LastModifiedDate,
             Account.Name, Account.Id
      FROM Task 
      WHERE OwnerId = '${userId}' 
        AND IsClosed = false
      ORDER BY ActivityDate ASC NULLS LAST, Priority DESC, CreatedDate DESC
    `;

    const response = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Salesforce error:', error);
      return Response.json({ error: 'Failed to fetch tasks' }, { status: response.status });
    }

    const data = await response.json();
    
    // Categorize tasks
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = now.toISOString().split('T')[0];
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const weekEnd = endOfWeek.toISOString().split('T')[0];

    const categorized = {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      upcoming: []
    };

    data.records.forEach(task => {
      if (!task.ActivityDate) {
        categorized.upcoming.push(task);
      } else if (task.ActivityDate < today) {
        categorized.overdue.push(task);
      } else if (task.ActivityDate === today) {
        categorized.dueToday.push(task);
      } else if (task.ActivityDate <= weekEnd) {
        categorized.dueThisWeek.push(task);
      } else {
        categorized.upcoming.push(task);
      }
    });

    return Response.json({
      tasks: data.records,
      categorized,
      total: data.totalSize
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});