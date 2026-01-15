import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log(`Fetching activities for ${recordType} ${recordId}`);

    // Build comprehensive Task query - gets all tasks related to this record
    // Includes regular tasks, calls, SMS, and all Task subtypes (00T prefix)
    let tasksQuery;
    if (recordType === 'Account') {
      tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype, CallOutcome, CallDurationInSeconds, CallType, ReminderDateTime, IsReminderSet, AccountId, WhoId, WhatId, OwnerId, Owner.Name FROM Task WHERE (AccountId = '${recordId}' OR WhoId = '${recordId}' OR WhatId = '${recordId}') ORDER BY CreatedDate DESC NULLS LAST`;
    } else {
      tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype, CallOutcome, CallDurationInSeconds, CallType, ReminderDateTime, IsReminderSet, AccountId, WhoId, WhatId, OwnerId, Owner.Name FROM Task WHERE (WhoId = '${recordId}' OR WhatId = '${recordId}') ORDER BY CreatedDate DESC NULLS LAST`;
    }
    
    // Get all Events - handles both WhoId and WhatId relationships
    let eventsQuery;
    if (recordType === 'Account') {
      eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate, Location, IsAllDayEvent, DurationInMinutes, Type, WhoId, WhatId FROM Event WHERE (AccountId = '${recordId}' OR WhoId = '${recordId}' OR WhatId = '${recordId}') ORDER BY StartDateTime DESC NULLS LAST`;
    } else {
      eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate, Location, IsAllDayEvent, DurationInMinutes, Type, WhoId, WhatId FROM Event WHERE (WhoId = '${recordId}' OR WhatId = '${recordId}') ORDER BY StartDateTime DESC NULLS LAST`;
    }
    
    // Get all Email Messages
    const emailsQuery = `SELECT Id, Subject, MessageDate, TextBody, HtmlBody, FromAddress, ToAddress, CcAddress, BccAddress, Status FROM EmailMessage WHERE RelatedToId = '${recordId}' ORDER BY MessageDate DESC LIMIT 500`;

    const [tasksRes, eventsRes, emailsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(tasksQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(eventsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(emailsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }))
    ]);

    // Handle Task response
    let tasksData = { records: [] };
    if (tasksRes.ok) {
      tasksData = await tasksRes.json();
    } else {
      const errorText = await tasksRes.text();
      console.error('Tasks query error:', tasksRes.status, errorText);
    }

    // Handle Event response
    let eventsData = { records: [] };
    if (eventsRes.ok) {
      eventsData = await eventsRes.json();
    } else {
      const errorText = await eventsRes.text();
      console.error('Events query error:', eventsRes.status, errorText);
    }

    // Handle Email response
    let emailsData = { records: [] };
    if (emailsRes.ok) {
      emailsData = await emailsRes.json();
    } else {
      console.log('Emails unavailable - may not be configured');
    }

    const tasks = tasksData.records || [];
    const events = eventsData.records || [];
    const emails = emailsData.records || [];

    console.log(`Activities found - Tasks: ${tasks.length}, Events: ${events.length}, Emails: ${emails.length}`);
    tasks.forEach(t => {
      let type = 'Task';
      if (t.CallOutcome || t.CallDurationInSeconds || t.CallType) type = 'Call';
      else if (t.TaskSubtype === 'Email') type = 'Email';
      else if (t.TaskSubtype && t.TaskSubtype.toLowerCase().includes('sms')) type = 'SMS';
      console.log(`  ${type}: "${t.Subject}" (Subtype: ${t.TaskSubtype || 'none'}) (${t.ActivityDate || t.CreatedDate})`);
    });
    events.forEach(e => console.log(`  Event: "${e.Subject}" (${e.StartDateTime})`));
    emails.forEach(e => console.log(`  Email: "${e.Subject}" (${e.MessageDate}`));

    // Combine all activities - includes Tasks (00T), Calls, SMS, Events
    const allActivities = [
      ...tasks.map(t => {
        let type = 'Task';
        if (t.CallOutcome || t.CallDurationInSeconds || t.CallType) {
          type = 'Call';
        } else if (t.TaskSubtype === 'Email') {
          type = 'Email';
        } else if (t.TaskSubtype && (t.TaskSubtype.toLowerCase().includes('sms') || t.TaskSubtype === 'Text')) {
          type = 'SMS';
        }
        
        return { 
          ...t, 
          type,
          date: t.ActivityDate || t.CreatedDate,
          source: 'salesforce'
        };
      }),
      ...events.map(e => ({ 
        ...e, 
        type: 'Event',
        date: e.StartDateTime,
        source: 'salesforce'
      })),
      ...emails.map(e => ({ 
        ...e, 
        type: 'Email', 
        date: e.MessageDate,
        Description: e.TextBody || (e.HtmlBody?.replace(/<[^>]*>/g, ' ').substring(0, 500) || ''),
        source: 'salesforce'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allActivities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});