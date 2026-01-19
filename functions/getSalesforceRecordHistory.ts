import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { recordId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !recordId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Determine object type from record ID prefix
    const prefix = recordId.substring(0, 3);
    let objectType;
    if (prefix === '00Q') objectType = 'Lead';
    else if (prefix === '006') objectType = 'Opportunity';
    else if (prefix === '003') objectType = 'Contact';
    else if (prefix === '001') objectType = 'Account';
    else objectType = 'Unknown';

    // Get the record's system fields
    const recordResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/${objectType}/${recordId}?fields=Id,LastModifiedById,LastModifiedDate,CreatedById,CreatedDate,LastModifiedBy.Name,CreatedBy.Name`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!recordResponse.ok) {
      const errorText = await recordResponse.text();
      return Response.json({ error: 'Failed to fetch record', details: errorText }, { status: recordResponse.status });
    }

    const record = await recordResponse.json();

    // Try to get field history
    let fieldHistory = [];
    try {
      const historyQuery = `SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name FROM ${objectType}History WHERE ${objectType}Id = '${recordId}' ORDER BY CreatedDate DESC LIMIT 200`;
      
      const historyResponse = await fetch(
        `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(historyQuery)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        fieldHistory = historyData.records || [];
      }
    } catch (error) {
      console.log('Field history not available or not tracked:', error.message);
    }

    // Extract stage history (StageName for Opportunity, Status for Lead)
    const stageField = objectType === 'Opportunity' ? 'StageName' : objectType === 'Lead' ? 'Status' : null;
    const stageHistory = stageField 
      ? fieldHistory.filter(h => h.Field === stageField).map(h => ({
          oldValue: h.OldValue,
          newValue: h.NewValue,
          changedBy: h.CreatedBy?.Name,
          changedDate: h.CreatedDate
        }))
      : [];

    return Response.json({
      record: {
        id: record.Id,
        createdBy: record.CreatedBy?.Name,
        createdDate: record.CreatedDate,
        lastModifiedBy: record.LastModifiedBy?.Name,
        lastModifiedDate: record.LastModifiedDate
      },
      fieldHistory: fieldHistory.map(h => ({
        field: h.Field,
        oldValue: h.OldValue,
        newValue: h.NewValue,
        changedBy: h.CreatedBy?.Name,
        changedDate: h.CreatedDate
      })),
      stageHistory,
      objectType
    });

  } catch (error) {
    console.error('Error fetching record history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});