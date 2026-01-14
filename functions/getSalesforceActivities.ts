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

    // Get Call objects if available
    const callsQuery = `SELECT Id, Subject, CallDurationInSeconds, CallType, CreatedDate, LastModifiedDate, Description, Status, Purpose FROM Call WHERE ${relationField} = '${recordId}' ORDER BY CreatedDate DESC LIMIT 500`.catch(() => null);

    // Get SMS records if available
    const smsQuery = `SELECT Id, Subject, CreatedDate, LastModifiedDate, Description, Status FROM SMS WHERE ${relationField} = '${recordId}' ORDER BY CreatedDate DESC LIMIT 500`.catch(() => null);

    const [tasksRes, eventsRes, emailsRes, callsRes, smsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(tasksQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(eventsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(emailsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false })),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(callsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false })),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(smsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false }))
    ]);

    const tasks = tasksRes.ok ? (await tasksRes.json()).records : [];
    const events = eventsRes.ok ? (await eventsRes.json()).records : [];
    const emails = emailsRes.ok ? (await emailsRes.json()).records : [];
    const calls = callsRes?.ok ? (await callsRes.json()).records : [];
    const sms = smsRes?.ok ? (await smsRes.json()).records : [];

    // Combine all activities without any filtering
    const allActivities = [
      ...tasks.map(t => ({ 
        ...t, 
        type: t.CallOutcome ? 'Call' : 'Task',
        date: t.ActivityDate || t.CreatedDate
      })),
      ...events.map(e => ({ 
        ...e, 
        type: e.Type || 'Event',
        date: e.StartDateTime 
      })),
      ...emails.map(e => ({ 
        ...e, 
        type: 'Email', 
        date: e.MessageDate,
        Description: e.TextBody || (e.HtmlBody?.replace(/<[^>]*>/g, ' ').substring(0, 500) || '')
      })),
      ...calls.map(c => ({
        ...c,
        type: 'Call',
        date: c.CreatedDate
      })),
      ...sms.map(s => ({
        ...s,
        type: 'SMS',
        date: s.CreatedDate
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allActivities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});