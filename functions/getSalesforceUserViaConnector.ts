import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get access token from Salesforce connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("salesforce");
    
    if (!accessToken) {
      return Response.json({ error: 'Failed to get Salesforce access token' }, { status: 401 });
    }
    
    console.log('Using Salesforce connector access token, length:', accessToken?.length);
    
    // We need to figure out the instance URL - it's typically stored with the connector
    // For now, we'll try the standard Salesforce instance
    // Better: query the org limits endpoint which tells us the instance
    
    let instanceUrl = 'https://login.salesforce.com';
    
    try {
      // First try to get org limits to find instance URL
      const response = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('User info from standard instance:', { email: userInfo.email, id: userInfo.sub });
        
        // Extract instance URL from the response headers or use from userinfo
        const subParts = userInfo.sub.split('/');
        const userId = subParts[subParts.length - 1];
        
        // Check if user is admin
        let isAdmin = false;
        try {
          const profileResponse = await fetch(
            `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
              `SELECT Profile.Name FROM User WHERE Id = '${userId}'`
            )}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            const profileName = profileData.records?.[0]?.Profile?.Name || '';
            isAdmin = profileName.toLowerCase().includes('system administrator') || 
                      profileName.toLowerCase().includes('admin');
          }
        } catch (e) {
          console.error('Error checking admin status:', e);
        }
        
        const sessionData = {
          userId,
          email: userInfo.email,
          name: userInfo.name,
          instanceUrl,
          token: accessToken,
          isAdmin,
          timestamp: Date.now()
        };
        
        console.log('Session data prepared:', { userId, email: userInfo.email, tokenLength: accessToken.length });
        
        return Response.json({ sessionData });
      }
    } catch (e) {
      console.error('Error with standard instance:', e);
    }
    
    // Fallback: try common Salesforce instances
    const instances = [
      'https://ontrakcap.my.salesforce.com',
      'https://na1.salesforce.com',
      'https://na2.salesforce.com',
      'https://na3.salesforce.com'
    ];
    
    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/services/oauth2/userinfo`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const userInfo = await response.json();
          instanceUrl = instance;
          const subParts = userInfo.sub.split('/');
          const userId = subParts[subParts.length - 1];
          
          console.log('Found working instance:', instance);
          console.log('User:', { email: userInfo.email, id: userId });
          
          // Check if user is admin
          let isAdmin = false;
          try {
            const profileResponse = await fetch(
              `${instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(
                `SELECT Profile.Name FROM User WHERE Id = '${userId}'`
              )}`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const profileName = profileData.records?.[0]?.Profile?.Name || '';
              isAdmin = profileName.toLowerCase().includes('system administrator') || 
                        profileName.toLowerCase().includes('admin');
            }
          } catch (e) {
            console.error('Error checking admin status:', e);
          }
          
          const sessionData = {
            userId,
            email: userInfo.email,
            name: userInfo.name,
            instanceUrl,
            token: accessToken,
            isAdmin,
            timestamp: Date.now()
          };
          
          console.log('Session data prepared:', { userId, email: userInfo.email, instanceUrl, tokenLength: accessToken.length });
          
          return Response.json({ sessionData });
        }
      } catch (e) {
        // Try next instance
        continue;
      }
    }
    
    return Response.json({ error: 'Could not determine Salesforce instance' }, { status: 500 });
  } catch (error) {
    console.error('Salesforce connector error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});