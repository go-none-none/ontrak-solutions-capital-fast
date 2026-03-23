import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing token or instanceUrl' }, { status: 400 });
    }

    // Fetch all accounts from Salesforce
    const accountsResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=SELECT+Id,Name,Type,Industry,Phone,Website,AnnualRevenue,NumberOfEmployees,BillingStreet,BillingCity,BillingState,BillingPostalCode,BillingCountry,RecordTypeId+FROM+Account+ORDER+BY+CreatedDate+DESC`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!accountsResponse.ok) {
      const error = await accountsResponse.text();
      console.error('Salesforce query error:', error);
      return Response.json({ error: 'Failed to fetch accounts from Salesforce' }, { status: 500 });
    }

    const { records } = await accountsResponse.json();
    console.log(`Fetched ${records.length} accounts from Salesforce`);

    // Get record type mapping
    const recordTypeResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=SELECT+Id,Name+FROM+RecordType+WHERE+SobjectType='Account'`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const recordTypeData = recordTypeResponse.ok ? await recordTypeResponse.json() : { records: [] };
    const recordTypeMap = {};
    recordTypeData.records.forEach(rt => {
      recordTypeMap[rt.Id] = rt.Name;
    });

    // Transform and store accounts
    const accountsToSync = records.map(sf => ({
      salesforce_id: sf.Id,
      name: sf.Name,
      type: sf.Type,
      industry: sf.Industry,
      phone: sf.Phone,
      website: sf.Website,
      annual_revenue: sf.AnnualRevenue,
      employees: sf.NumberOfEmployees,
      billing_street: sf.BillingStreet,
      billing_city: sf.BillingCity,
      billing_state: sf.BillingState,
      billing_zip: sf.BillingPostalCode,
      billing_country: sf.BillingCountry,
      record_type_id: sf.RecordTypeId,
      record_type_name: recordTypeMap[sf.RecordTypeId] || 'Master',
      sf_data: sf
    }));

    // Upsert accounts (delete old ones and insert new)
    if (accountsToSync.length > 0) {
      // Get existing accounts
      const existing = await base44.asServiceRole.entities.Account.list();
      
      // Delete accounts not in SF anymore
      const sfIds = new Set(accountsToSync.map(a => a.salesforce_id));
      for (const existing_account of existing) {
        if (!sfIds.has(existing_account.salesforce_id)) {
          await base44.asServiceRole.entities.Account.delete(existing_account.id);
        }
      }

      // Bulk create/update accounts
      for (const account of accountsToSync) {
        const existing_account = existing.find(e => e.salesforce_id === account.salesforce_id);
        if (existing_account) {
          await base44.asServiceRole.entities.Account.update(existing_account.id, account);
        } else {
          await base44.asServiceRole.entities.Account.create(account);
        }
      }
    }

    return Response.json({
      success: true,
      synced: accountsToSync.length,
      message: `Synced ${accountsToSync.length} accounts`
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});