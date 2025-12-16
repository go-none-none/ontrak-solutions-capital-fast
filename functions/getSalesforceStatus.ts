import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { recordId } = await req.json();
        
        if (!recordId) {
            return Response.json({ error: 'Record ID is required' }, { status: 400 });
        }

        const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
        
        const tokenInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!tokenInfoResponse.ok) {
            return Response.json({ error: 'Failed to get Salesforce user info' }, { status: 500 });
        }
        
        const tokenInfo = await tokenInfoResponse.json();
        const instanceUrl = tokenInfo.urls?.custom_domain || tokenInfo.urls?.profile?.split('/')[0] + '//' + tokenInfo.urls?.profile?.split('/')[2];

        // Try Lead first
        let leadResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Lead/${recordId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (leadResponse.ok) {
            const lead = await leadResponse.json();
            const missingDocsFlag = lead.Status?.toLowerCase() === 'application missing info';
            return Response.json({
                recordType: 'Lead',
                businessName: lead.Company,
                status: lead.Status,
                missingDocsFlag: missingDocsFlag,
                lastModifiedDate: lead.LastModifiedDate,
                leadId: lead.Id,
                lastName: lead.LastName
            });
        }

        // Try Opportunity
        let oppResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Opportunity/${recordId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (oppResponse.ok) {
            const opp = await oppResponse.json();
            const missingDocsFlag = opp.StageName?.toLowerCase() === 'application missing info';
            return Response.json({
                recordType: 'Opportunity',
                businessName: opp.Name,
                stageName: opp.StageName,
                missingDocsFlag: missingDocsFlag,
                lastModifiedDate: opp.LastModifiedDate,
                leadId: opp.Lead_ID__c || opp.Id,
                lastName: opp.LastName__c || ''
            });
        }

        return Response.json({ error: 'Record not found in Salesforce' }, { status: 404 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});