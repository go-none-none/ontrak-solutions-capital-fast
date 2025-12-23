import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, token, instanceUrl } = await req.json();

    if (!userId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Query leads by specific statuses - 100 latest updated for each
    const statuses = ['Contacted', 'Application Out', 'Application Missing Info'];
    const allLeads = [];
    
    for (const status of statuses) {
      const query = `SELECT Id, Name, Company, Phone, MobilePhone, Email, Status, LeadSource, CreatedDate, LastModifiedDate, Owner.Name, Owner.Email, Owner.Phone, Owner.MobilePhone, Owner.Title, Owner.Department, Owner.Division, Owner.CompanyName, Owner.UserRole.Name, Owner.Manager.Name, Owner.Manager.Email, Industry, AnnualRevenue, NumberOfEmployees, Website, Description, Street, City, State, PostalCode, Country, Title, Rating, OwnerId FROM Lead WHERE OwnerId = '${userId}' AND Status = '${status}' AND IsConverted = false ORDER BY LastModifiedDate DESC LIMIT 100`;
      
      const response = await fetch(
        `${instanceUrl}/services/data/v59.0/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        allLeads.push(...data.records);
      }
    }

    return Response.json({ leads: allLeads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});