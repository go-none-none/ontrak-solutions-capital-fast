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

    // Get Tasks (exclude email tasks to avoid duplicates)
    const tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype FROM Task WHERE ${relationField} = '${recordId}' AND (TaskSubtype != 'Email' OR TaskSubtype = NULL) ORDER BY CreatedDate DESC`;
    
    // Get Events
    const eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate FROM Event WHERE ${relationField} = '${recordId}' ORDER BY StartDateTime DESC`;
    
    // Get Email Messages (if available)
    const emailsQuery = `SELECT Id, Subject, MessageDate, TextBody, HtmlBody, FromAddress, ToAddress, Status FROM EmailMessage WHERE RelatedToId = '${recordId}' ORDER BY MessageDate DESC LIMIT 100`;

    const [tasksRes, eventsRes, emailsRes] = await Promise.all([
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(tasksQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(eventsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(emailsQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => ({ ok: false })) // Email might not be available
    ]);

    const tasks = tasksRes.ok ? (await tasksRes.json()).records : [];
    const events = eventsRes.ok ? (await eventsRes.json()).records : [];
    const emails = emailsRes.ok ? (await emailsRes.json()).records : [];

    // Combine and sort by date, removing duplicates
    const activityMap = new Map();
    const subjectDateMap = new Map(); // Track by subject+date to catch duplicates across types
    
    tasks.forEach(t => {
      if (!t.Subject) return; // Skip tasks without subjects
      const type = t.Subject?.toLowerCase().includes('call') || t.Subject?.toLowerCase().includes('phone') ? 'Call' : 'Task';
      const key = `${t.Subject}_${t.CreatedDate}`;
      if (!subjectDateMap.has(key)) {
        activityMap.set(t.Id, { ...t, type, date: t.CreatedDate });
        subjectDateMap.set(key, true);
      }
    });
    
    events.forEach(e => {
      if (!e.Subject) return;
      const type = e.Subject?.toLowerCase().includes('call') || e.Subject?.toLowerCase().includes('phone') ? 'Call' : 'Event';
      const key = `${e.Subject}_${e.StartDateTime}`;
      if (!subjectDateMap.has(key)) {
        activityMap.set(e.Id, { ...e, type, date: e.StartDateTime });
        subjectDateMap.set(key, true);
      }
    });
    
    emails.forEach(e => {
      if (!e.Subject) return;
      const key = `${e.Subject}_${e.MessageDate}`;
      if (!subjectDateMap.has(key)) {
        activityMap.set(e.Id, { 
          ...e, 
          type: 'Email', 
          date: e.MessageDate,
          Description: e.TextBody || e.HtmlBody?.replace(/<[^>]*>/g, ' ').substring(0, 500) || ''
        });
        subjectDateMap.set(key, true);
      }
    });
    
    const allActivities = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allActivities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});