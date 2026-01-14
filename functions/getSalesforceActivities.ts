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

    // Get Tasks (including all types)
    const tasksQuery = `SELECT Id, Subject, Status, Priority, ActivityDate, Description, CreatedDate, LastModifiedDate, TaskSubtype, CallType, CallDurationInSeconds, CallDisposition FROM Task WHERE ${relationField} = '${recordId}' ORDER BY CreatedDate DESC LIMIT 200`;
    
    // Get Events
    const eventsQuery = `SELECT Id, Subject, StartDateTime, EndDateTime, Description, CreatedDate, LastModifiedDate, IsAllDayEvent, Location, EventSubtype FROM Event WHERE ${relationField} = '${recordId}' ORDER BY StartDateTime DESC LIMIT 200`;
    
    // Get Email Messages (if available)
    const emailsQuery = `SELECT Id, Subject, MessageDate, TextBody, HtmlBody, FromAddress, ToAddress, Status, Outcome FROM EmailMessage WHERE RelatedToId = '${recordId}' ORDER BY MessageDate DESC LIMIT 200`;

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

    // Combine and sort by date
    const activityMap = new Map();
    
    tasks.forEach(t => {
      // Determine type based on TaskSubtype or subject
      let type = 'Task';
      if (t.CallType || t.TaskSubtype === 'Call') {
        type = 'Call';
      } else if (t.TaskSubtype === 'Email') {
        type = 'Email';
      } else if (t.Subject?.toLowerCase().includes('call') || t.Subject?.toLowerCase().includes('phone')) {
        type = 'Call';
      }
      
      activityMap.set(t.Id, { 
        ...t, 
        type, 
        date: t.ActivityDate || t.CreatedDate 
      });
    });
    
    events.forEach(e => {
      const type = e.Subject?.toLowerCase().includes('call') || e.Subject?.toLowerCase().includes('phone') ? 'Call' : 'Event';
      activityMap.set(e.Id, { 
        ...e, 
        type, 
        date: e.StartDateTime 
      });
    });
    
    emails.forEach(e => {
      activityMap.set(e.Id, { 
        ...e, 
        type: 'Email', 
        date: e.MessageDate,
        Description: e.TextBody || e.HtmlBody?.replace(/<[^>]*>/g, ' ').substring(0, 500) || '',
        Subject: e.Subject || '(No Subject)'
      });
    });
    
    const allActivities = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allActivities });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});