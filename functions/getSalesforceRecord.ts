import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recordId, recordType, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId || !recordType) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Query to get record with Owner information
    const query = `SELECT FIELDS(ALL), Owner.Name, Owner.Id FROM ${recordType} WHERE Id = '${recordId}' LIMIT 1`;
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
      return Response.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const record = data.records && data.records[0] ? data.records[0] : null;
    
    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    // Fetch call dispositions (completed call tasks)
    const callQuery = `SELECT Id, Subject, Description, CallDisposition, CallDurationInSeconds, ActivityDate, CreatedDate FROM Task WHERE WhoId = '${recordId}' AND TaskSubtype = 'Call' AND Status = 'Completed' ORDER BY CreatedDate DESC LIMIT 20`;
    const callResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(callQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let callDispositions = [];
    if (callResponse.ok) {
      const callData = await callResponse.json();
      callDispositions = callData.records || [];
    }
    
    return Response.json({ record, callDispositions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});