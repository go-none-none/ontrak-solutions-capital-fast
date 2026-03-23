import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, token, instanceUrl } = await req.json();

    if (!phoneNumber || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Normalize phone number - remove all non-digits
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Create different format variations to search
    const variations = [
      cleanNumber,
      `+1${cleanNumber}`,
      `1${cleanNumber}`,
      cleanNumber.slice(-10), // Last 10 digits
      `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`,
      `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`,
      `${cleanNumber.slice(0, 3)}.${cleanNumber.slice(3, 6)}.${cleanNumber.slice(6)}`
    ];

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const matches = [];

    // Search Leads
    for (const variant of variations) {
      try {
        const leadQuery = `SELECT Id, Name, Company, Phone, MobilePhone, Email, Status FROM Lead WHERE (Phone LIKE '%${variant}%' OR MobilePhone LIKE '%${variant}%') AND IsConverted = false LIMIT 10`;
        const leadResponse = await fetch(
          `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(leadQuery)}`,
          { headers }
        );

        if (leadResponse.ok) {
          const leadData = await leadResponse.json();
          if (leadData.records && leadData.records.length > 0) {
            matches.push(...leadData.records.map(record => ({
              ...record,
              type: 'Lead'
            })));
          }
        }
      } catch (error) {
        console.error('Lead search error:', error);
      }
    }

    // Search Contacts (through Opportunities)
    for (const variant of variations) {
      try {
        const contactQuery = `SELECT Id, Name, Phone, MobilePhone, Email, AccountId, Account.Name FROM Contact WHERE (Phone LIKE '%${variant}%' OR MobilePhone LIKE '%${variant}%') LIMIT 10`;
        const contactResponse = await fetch(
          `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(contactQuery)}`,
          { headers }
        );

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          if (contactData.records && contactData.records.length > 0) {
            // For each contact, try to find their most recent opportunity
            for (const contact of contactData.records) {
              try {
                const oppQuery = `SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity WHERE AccountId = '${contact.AccountId}' ORDER BY CreatedDate DESC LIMIT 1`;
                const oppResponse = await fetch(
                  `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(oppQuery)}`,
                  { headers }
                );

                if (oppResponse.ok) {
                  const oppData = await oppResponse.json();
                  if (oppData.records && oppData.records.length > 0) {
                    matches.push({
                      ...oppData.records[0],
                      type: 'Opportunity',
                      ContactName: contact.Name,
                      Phone: contact.Phone,
                      MobilePhone: contact.MobilePhone
                    });
                  }
                }
              } catch (error) {
                console.error('Opportunity search error:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Contact search error:', error);
      }
    }

    // Remove duplicates based on Id
    const uniqueMatches = matches.filter((match, index, self) =>
      index === self.findIndex(m => m.Id === match.Id)
    );

    // Sort by exact match preference
    uniqueMatches.sort((a, b) => {
      const aPhone = (a.Phone || a.MobilePhone || '').replace(/\D/g, '');
      const bPhone = (b.Phone || b.MobilePhone || '').replace(/\D/g, '');
      const aMatch = aPhone === cleanNumber || aPhone.endsWith(cleanNumber.slice(-10));
      const bMatch = bPhone === cleanNumber || bPhone.endsWith(cleanNumber.slice(-10));
      
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    return Response.json({ 
      matches: uniqueMatches,
      searchedNumber: phoneNumber,
      totalMatches: uniqueMatches.length
    });

  } catch (error) {
    console.error('Match phone error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});