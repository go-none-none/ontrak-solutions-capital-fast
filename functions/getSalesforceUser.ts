import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get Salesforce access token from app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
    
    // Get Salesforce user info
    const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      console.error('Salesforce user info error:', error);
      return Response.json({ error: 'Failed to get Salesforce user info' }, { status: 401 });
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Extract user ID from sub
    const subParts = userInfo.sub.split('/');
    const userId = subParts[subParts.length - 1];
    const instanceUrl = userInfo.sub.split('/id/')[0];
    
    return Response.json({
      userId: userId,
      email: userInfo.email,
      name: userInfo.name,
      instanceUrl: instanceUrl,
      token: accessToken
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});