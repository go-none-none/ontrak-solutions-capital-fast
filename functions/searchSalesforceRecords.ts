import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, token, instanceUrl } = await req.json();

    if (!query || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Use SOSL (Salesforce Object Search Language) for better cross-object search
    const searchQuery = query.trim();
    
    // SOSL query format: FIND 'search_term' IN ALL FIELDS RETURNING object_list
    const soslQuery = `FIND "${searchQuery}" IN ALL FIELDS RETURNING Lead(Id, Name, Company, Email, Phone, Status LIMIT 10), Opportunity(Id, Name, Amount, StageName, Account.Name LIMIT 10)`;

    const response = await fetch(`${instanceUrl}/services/data/v60.0/search?q=${encodeURIComponent(soslQuery)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('SOSL search error:', data);
      return Response.json({
        leads: [],
        opportunities: [],
        error: data.message || 'Search failed'
      });
    }

    const leads = [];
    const opportunities = [];

    // Parse SOSL results
    if (data.searchRecords) {
      data.searchRecords.forEach(record => {
        if (record.attributes.type === 'Lead') {
          leads.push({
            Id: record.Id,
            Name: record.Name,
            Company: record.Company,
            Email: record.Email,
            Phone: record.Phone,
            Status: record.Status
          });
        } else if (record.attributes.type === 'Opportunity') {
          opportunities.push({
            Id: record.Id,
            Name: record.Name,
            Amount: record.Amount,
            StageName: record.StageName,
            AccountName: record.Account?.Name
          });
        }
      });
    }

    return Response.json({
      leads,
      opportunities
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});