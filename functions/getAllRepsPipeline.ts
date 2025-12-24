import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, instanceUrl } = await req.json();

    if (!token || !instanceUrl) {
      return Response.json({ error: 'Missing token or instanceUrl' }, { status: 400 });
    }

    // Get all users who are reps (not admins)
    const usersResponse = await fetch(
      `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
        "SELECT Id, Name, Email FROM User WHERE IsActive = true AND UserRole.Name != null ORDER BY Name"
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!usersResponse.ok) {
      const errorData = await usersResponse.json();
      return Response.json({ error: 'Failed to fetch users', details: errorData }, { status: usersResponse.status });
    }

    const usersData = await usersResponse.json();
    const users = usersData.records || [];

    // For each user, get their leads and opportunities
    const repsData = await Promise.all(
      users.map(async (user) => {
        try {
          // Fetch leads
          const leadsResponse = await fetch(
            `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
              `SELECT Id, Name, Company, Email, Phone, Status, CreatedDate, LastModifiedDate FROM Lead WHERE OwnerId = '${user.Id}' AND IsConverted = false ORDER BY LastModifiedDate DESC`
            )}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          // Fetch opportunities
          const oppsResponse = await fetch(
            `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
              `SELECT Id, Name, StageName, Amount, CloseDate, Account.Name, IsClosed, IsWon, Probability, LastModifiedDate FROM Opportunity WHERE OwnerId = '${user.Id}' AND IsClosed = false ORDER BY LastModifiedDate DESC`
            )}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const leadsData = leadsResponse.ok ? await leadsResponse.json() : { records: [] };
          const oppsData = oppsResponse.ok ? await oppsResponse.json() : { records: [] };

          return {
            userId: user.Id,
            name: user.Name,
            email: user.Email,
            leads: leadsData.records || [],
            opportunities: oppsData.records || []
          };
        } catch (error) {
          console.error(`Error fetching data for user ${user.Name}:`, error);
          return {
            userId: user.Id,
            name: user.Name,
            email: user.Email,
            leads: [],
            opportunities: []
          };
        }
      })
    );

    // Filter out reps with no data
    const activeReps = repsData.filter(rep => 
      (rep.leads.length > 0 || rep.opportunities.length > 0)
    );

    return Response.json({ reps: activeReps });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});