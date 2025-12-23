import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Salesforce access token using Base44's connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("salesforce");
    
    // Get user info from Salesforce
    const userInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      return Response.json({ error: `Failed to get user info: ${error}` }, { status: 401 });
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Extract user ID from the sub field
    const subParts = userInfo.sub.split('/');
    const userId = subParts[subParts.length - 1];
    
    // Extract instance URL from organization_id
    const instanceUrl = userInfo.urls.enterprise.split('/services')[0];
    
    return Response.json({
      userId: userId,
      email: userInfo.email,
      name: userInfo.name,
      instanceUrl: instanceUrl,
      token: accessToken
    });
  } catch (error) {
    console.error('Salesforce auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});