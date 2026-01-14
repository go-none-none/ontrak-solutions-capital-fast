import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Determine the relationship field based on record type
    const relationField = recordType === 'Lead' ? 'WhoId' : 'WhatId';

    // Get all Tasks - including calls and all outcomes
    const tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype, CallOutcome, CallDurationInSeconds, CallType, ReminderDateTime, IsReminderSet, AccountId, OwnerId, Owner.Name FROM Task WHERE ${relationField} = '${recordId}' ORDER BY CreatedDate DESC`;
    
    // Get all Events - including all types
    const eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate, Location, IsAllDayEvent, DurationInMinutes, Type FROM Event WHERE ${relationField} = '${recordId}' ORDER BY StartDateTime DESC`;
    
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

    const tasksData = tasksRes.ok ? (await tasksRes.json()) : { records: [] };
    const eventsData = eventsRes.ok ? (await eventsRes.json()) : { records: [] };
    const emailsData = emailsRes.ok ? (await emailsRes.json()) : { records: [] };

    const tasks = tasksData.records || [];
    const events = eventsData.records || [];
    const emails = emailsData.records || [];

    console.log(`Activities found - Tasks: ${tasks.length}, Events: ${events.length}, Emails: ${emails.length}`);
    console.log('Sample task:', tasks[0]);

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