import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    console.log(`Fetching activities for ${recordType} ${recordId}`);

    // Get all Tasks - handles both WhoId and WhatId relationships
    const tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype, CallOutcome, CallDurationInSeconds, CallType, ReminderDateTime, IsReminderSet, AccountId, OwnerId, Owner.Name FROM Task WHERE WhoId = '${recordId}' OR WhatId = '${recordId}' ORDER BY ActivityDate DESC NULLS LAST`;
    
    // Get all Events - handles both WhoId and WhatId relationships
    const eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate, Location, IsAllDayEvent, DurationInMinutes, Type FROM Event WHERE WhoId = '${recordId}' OR WhatId = '${recordId}' ORDER BY StartDateTime DESC NULLS LAST`;
    
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
      const type = (t.CallOutcome || t.CallDurationInSeconds || t.CallType) ? 'Call' : 'Task';
      console.log(`  ${type}: "${t.Subject}" (${t.ActivityDate || t.CreatedDate})`);
    });
    events.forEach(e => console.log(`  Event: "${e.Subject}" (${e.StartDateTime})`));
    emails.forEach(e => console.log(`  Email: "${e.Subject}" (${e.MessageDate}`));

    // Combine all activities without any filtering
    const allActivities = [
      ...tasks.map(t => ({ 
        ...t, 
        type: (t.CallOutcome || t.CallDurationInSeconds || t.CallType) ? 'Call' : (t.TaskSubtype === 'Email' ? 'Email' : 'Task'),
        date: t.ActivityDate || t.CreatedDate
      })),
      ...events.map(e => ({ 
        ...e, 
        type: 'Event',
        date: e.StartDateTime 
      })),
      ...emails.map(e => ({ 
        ...e, 
        type: 'Email', 
        date: e.MessageDate,
        Description: e.TextBody || (e.HtmlBody?.replace(/<[^>]*>/g, ' ').substring(0, 500) || '')
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allActivities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});