import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Build WHERE clause based on record type
    // Contacts can be in both WhoId and WhatId, others are specific
    let taskWhere = '';
    let eventWhere = '';
    
    if (recordType === 'Lead') {
      taskWhere = `WHERE WhoId = '${recordId}'`;
      eventWhere = `WHERE WhoId = '${recordId}'`;
    } else if (recordType === 'Contact') {
      // Contacts can appear in either WhoId OR WhatId
      taskWhere = `WHERE (WhoId = '${recordId}' OR WhatId = '${recordId}')`;
      eventWhere = `WHERE (WhoId = '${recordId}' OR WhatId = '${recordId}')`;
    } else if (recordType === 'Opportunity' || recordType === 'Account') {
      taskWhere = `WHERE WhatId = '${recordId}'`;
      eventWhere = `WHERE WhatId = '${recordId}'`;
    }

    // Build comprehensive Task query (includes calls, SMS)
    const taskFields = [
      'Id', 'Subject', 'Status', 'Priority', 'ActivityDate', 'CreatedDate', 
      'CompletedDateTime', 'Description', 'Owner.Name', 'OwnerId', 'WhoId', 'WhatId',
      'Who.Name', 'What.Name', 'CallDurationInSeconds', 'CallType', 
      'CallDisposition', 'TaskSubtype', 'LastModifiedDate'
    ].join(',');

    const taskQuery = `SELECT ${taskFields} FROM Task ${taskWhere} ORDER BY CreatedDate DESC`;

    // Build Event query
    const eventFields = [
      'Id', 'Subject', 'StartDateTime', 'EndDateTime', 'Description',
      'Location', 'IsAllDayEvent', 'Owner.Name', 'OwnerId', 'WhoId', 'WhatId',
      'Who.Name', 'What.Name', 'CreatedDate', 'ActivityDate', 'Type', 'LastModifiedDate'
    ].join(',');

    const eventQuery = `SELECT ${eventFields} FROM Event ${eventWhere} ORDER BY StartDateTime DESC`;

    // Build EmailMessage query - try multiple approaches
    const emailFields = [
      'Id', 'Subject', 'TextBody', 'HtmlBody', 'FromAddress', 'ToAddress',
      'CcAddress', 'BccAddress', 'MessageDate', 'Status', 'Incoming',
      'CreatedDate', 'RelatedToId', 'LastModifiedDate', 'FirstOpenedDate',
      'LastOpenedDate'
    ].join(',');

    const emailQuery = `SELECT ${emailFields} FROM EmailMessage WHERE RelatedToId = '${recordId}' ORDER BY MessageDate DESC`;

    console.log('=== QUERY DEBUG ===');
    console.log('Record ID:', recordId);
    console.log('Record Type:', recordType);
    console.log('Task Query:', taskQuery);
    console.log('Event Query:', eventQuery);
    console.log('Email Query:', emailQuery);
    console.log('==================');

    // First, test if EmailMessage object is accessible
    const testEmailQuery = `SELECT COUNT() FROM EmailMessage`;
    const testEmailResponse = await fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(testEmailQuery)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (testEmailResponse.ok) {
      const testEmailData = await testEmailResponse.json();
      console.log('Total emails in org:', testEmailData.totalSize);
    } else {
      console.log('EmailMessage object not accessible or does not exist');
    }

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

    // Parse responses with detailed error logging
    let tasksData, eventsData, emailsData;
    
    if (tasksResponse.ok) {
      tasksData = await tasksResponse.json();
      console.log('Tasks response:', JSON.stringify(tasksData, null, 2));
    } else {
      const errorText = await tasksResponse.text();
      console.error('Task query failed:', tasksResponse.status, errorText);
      tasksData = { records: [] };
    }

    if (eventsResponse.ok) {
      eventsData = await eventsResponse.json();
      console.log('Events response:', JSON.stringify(eventsData, null, 2));
    } else {
      const errorText = await eventsResponse.text();
      console.error('Event query failed:', eventsResponse.status, errorText);
      eventsData = { records: [] };
    }

    if (emailsResponse.ok) {
      emailsData = await emailsResponse.json();
      console.log('Emails response:', JSON.stringify(emailsData, null, 2));
      console.log('Email records found:', emailsData.records?.length);
      if (emailsData.records?.length > 0) {
        console.log('First email sample:', JSON.stringify(emailsData.records[0], null, 2));
      }
    } else {
      const errorText = await emailsResponse.text();
      console.error('Email query failed:', emailsResponse.status, errorText);
      emailsData = { records: [] };
    }

    const tasks = tasksData.records || [];
    const events = eventsData.records || [];
    const emails = emailsData.records || [];

    console.log('Tasks found:', tasks.length);
    console.log('Events found:', events.length);
    console.log('Emails found:', emails.length);

    // Categorize and normalize activities
    const activities = [];

    // Process Tasks
    tasks.forEach(task => {
      // Determine if it's a call or SMS
      const isCall = task.TaskSubtype === 'Call' || 
                     task.CallType || 
                     task.CallDurationInSeconds || 
                     task.Subject?.toLowerCase().includes('call');
      
      const isSMS = task.Subject?.toLowerCase().includes('sms') || 
                    task.Subject?.toLowerCase().includes('text message') ||
                    task.TaskSubtype === 'SMS' ||
                    task.TaskSubtype === 'Text';
      
      activities.push({
        id: task.Id,
        type: isCall ? 'call' : isSMS ? 'sms' : 'task',
        subject: task.Subject || 'Task',
        status: task.Status,
        priority: task.Priority,
        date: task.ActivityDate || task.CompletedDateTime || task.CreatedDate,
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
        firstOpenedDate: email.FirstOpenedDate,
        lastOpenedDate: email.LastOpenedDate,
        emailStatus: email.EmailStatus,
        rawData: email
      });
    });

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Total activities processed:', activities.length);

    return Response.json({ 
      activities,
      counts: {
        tasks: tasks.length,
        events: events.length,
        emails: emails.length,
        calls: activities.filter(a => a.type === 'call').length,
        sms: activities.filter(a => a.type === 'sms').length,
        total: activities.length
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});