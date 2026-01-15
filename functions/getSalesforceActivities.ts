import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Determine which field to query based on record type
    const whoField = recordType === 'Lead' || recordType === 'Contact' ? 'WhoId' : null;
    const whatField = recordType === 'Account' || recordType === 'Opportunity' ? 'WhatId' : null;

    // Build comprehensive Task query
    const taskFields = [
      'Id', 'Subject', 'Status', 'Priority', 'ActivityDate', 'CreatedDate', 
      'CompletedDateTime', 'Description', 'Owner.Name', 'WhoId', 'WhatId',
      'Who.Name', 'What.Name', 'CallDurationInSeconds', 'CallType', 
      'CallDisposition', 'TaskSubtype', 'Type'
    ].join(',');

    let taskWhere = '';
    if (whoField) {
      taskWhere = `WHERE WhoId = '${recordId}'`;
    } else if (whatField) {
      taskWhere = `WHERE WhatId = '${recordId}'`;
    }

    const taskQuery = `SELECT ${taskFields} FROM Task ${taskWhere} ORDER BY CreatedDate DESC LIMIT 500`;

    // Build Event query
    const eventFields = [
      'Id', 'Subject', 'StartDateTime', 'EndDateTime', 'Description',
      'Location', 'IsAllDayEvent', 'Owner.Name', 'WhoId', 'WhatId',
      'Who.Name', 'What.Name', 'CreatedDate', 'ActivityDate', 'Type'
    ].join(',');

    let eventWhere = '';
    if (whoField) {
      eventWhere = `WHERE WhoId = '${recordId}'`;
    } else if (whatField) {
      eventWhere = `WHERE WhatId = '${recordId}'`;
    }

    const eventQuery = `SELECT ${eventFields} FROM Event ${eventWhere} ORDER BY StartDateTime DESC LIMIT 500`;

    // Build EmailMessage query (for cases where emails are logged)
    const emailFields = [
      'Id', 'Subject', 'TextBody', 'HtmlBody', 'FromAddress', 'ToAddress',
      'CcAddress', 'BccAddress', 'MessageDate', 'Status', 'Incoming',
      'CreatedDate', 'RelatedToId'
    ].join(',');

    const emailQuery = `SELECT ${emailFields} FROM EmailMessage WHERE RelatedToId = '${recordId}' ORDER BY MessageDate DESC LIMIT 500`;

    // Execute all queries in parallel
    const [tasksResponse, eventsResponse, emailsResponse] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(taskQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(eventQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(emailQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const tasks = tasksResponse.ok ? (await tasksResponse.json()).records || [] : [];
    const events = eventsResponse.ok ? (await eventsResponse.json()).records || [] : [];
    const emails = emailsResponse.ok ? (await emailsResponse.json()).records || [] : [];

    // Categorize and normalize activities
    const activities = [];

    // Process Tasks
    tasks.forEach(task => {
      const isCall = task.TaskSubtype === 'Call' || task.CallType || task.CallDurationInSeconds;
      const isSMS = task.Subject?.toLowerCase().includes('sms') || task.Type === 'SMS';
      
      activities.push({
        id: task.Id,
        type: isCall ? 'call' : isSMS ? 'sms' : 'task',
        subject: task.Subject,
        status: task.Status,
        priority: task.Priority,
        date: task.ActivityDate || task.CreatedDate,
        completedDate: task.CompletedDateTime,
        createdDate: task.CreatedDate,
        description: task.Description,
        owner: task.Owner?.Name,
        relatedTo: task.What?.Name || task.Who?.Name,
        whoId: task.WhoId,
        whatId: task.WhatId,
        // Call-specific fields
        callDuration: task.CallDurationInSeconds,
        callType: task.CallType,
        callDisposition: task.CallDisposition,
        rawData: task
      });
    });

    // Process Events
    events.forEach(event => {
      activities.push({
        id: event.Id,
        type: 'event',
        subject: event.Subject,
        startDate: event.StartDateTime,
        endDate: event.EndDateTime,
        date: event.ActivityDate || event.StartDateTime,
        createdDate: event.CreatedDate,
        description: event.Description,
        location: event.Location,
        isAllDay: event.IsAllDayEvent,
        owner: event.Owner?.Name,
        relatedTo: event.What?.Name || event.Who?.Name,
        whoId: event.WhoId,
        whatId: event.WhatId,
        rawData: event
      });
    });

    // Process Emails
    emails.forEach(email => {
      activities.push({
        id: email.Id,
        type: 'email',
        subject: email.Subject,
        date: email.MessageDate || email.CreatedDate,
        createdDate: email.CreatedDate,
        body: email.HtmlBody || email.TextBody,
        from: email.FromAddress,
        to: email.ToAddress,
        cc: email.CcAddress,
        bcc: email.BccAddress,
        status: email.Status,
        incoming: email.Incoming,
        relatedToId: email.RelatedToId,
        rawData: email
      });
    });

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ 
      activities,
      counts: {
        tasks: tasks.length,
        events: events.length,
        emails: emails.length,
        total: activities.length
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});