import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { data, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !data) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get the Lender record type ID
    const recordTypeQuery = `SELECT Id FROM RecordType WHERE SObjectType = 'Account' AND DeveloperName = 'Lender' LIMIT 1`;
    const recordTypeResponse = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(recordTypeQuery)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let recordTypeId = null;
    if (recordTypeResponse.ok) {
      const recordTypeData = await recordTypeResponse.json();
      if (recordTypeData.records && recordTypeData.records.length > 0) {
        recordTypeId = recordTypeData.records[0].Id;
      }
    }

    // Prepare account data with RecordTypeId if found
    const accountData = { ...data };
    if (recordTypeId) {
      accountData.RecordTypeId = recordTypeId;
    }

    // Create the Account
    const response = await fetch(
      `${instanceUrl}/services/data/v58.0/sobjects/Account`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return Response.json({ 
        error: 'Failed to create lender', 
        details: error 
      }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ id: result.id, success: result.success });
  } catch (error) {
    console.error('Create lender error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});