import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ 
        error: 'Missing required fields: token, instanceUrl' 
      }, { status: 400 });
    }

    // Helper function to fetch all records
    const fetchAllRecords = async (initialUrl) => {
      let allRecords = [];
      let nextUrl = initialUrl;

      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${await response.text()}`);
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records);
        nextUrl = data.nextRecordsUrl ? `${instanceUrl}${data.nextRecordsUrl}` : null;
      }

      return allRecords;
    };

    // Fetch all open tasks
    const taskQuery = `
      SELECT Id, Subject, Description, Status, Priority, ActivityDate, 
             OwnerId, Owner.Name, WhatId, What.Name, What.Type, 
             CreatedDate, LastModifiedDate
      FROM Task 
      WHERE IsClosed = false
      ORDER BY ActivityDate ASC NULLS LAST, Priority DESC
    `;

    const tasksUrl = `${instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(taskQuery)}`;
    const tasks = await fetchAllRecords(tasksUrl);

    // Categorize tasks by due date
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const categorized = {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      upcoming: []
    };

    tasks.forEach(task => {
      if (!task.ActivityDate) {
        categorized.upcoming.push(task);
      } else if (task.ActivityDate < today) {
        categorized.overdue.push(task);
      } else if (task.ActivityDate === today) {
        categorized.dueToday.push(task);
      } else if (task.ActivityDate <= weekEndStr) {
        categorized.dueThisWeek.push(task);
      } else {
        categorized.upcoming.push(task);
      }
    });

    return Response.json({
      tasks,
      categorized,
      total: tasks.length
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});