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
                id: lead.Id,
                businessName: lead.Company,
                status: lead.Status,
                missingDocsFlag: missingDocsFlag,
                missingDocs: lead.Missing_Docs__c || null,
                bankStatementChecklist: lead.Bank_Statement_Checklist__c || null,
                lastModifiedDate: lead.LastModifiedDate,
                firstName: lead.FirstName,
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
            
            // Log all available fields for debugging
            console.log('Opportunity fields:', Object.keys(opp));
            console.log('Looking for stage detail in:', {
                Stage_Detail__c: opp.Stage_Detail__c,
                StageDetail__c: opp.StageDetail__c,
                Decline_Reason__c: opp.Decline_Reason__c,
                DeclineReason__c: opp.DeclineReason__c
            });
            
            // Try different possible field names for stage detail
            const stageDetail = opp.Stage_Detail__c || 
                               opp.StageDetail__c || 
                               opp.Decline_Reason__c || 
                               opp.DeclineReason__c ||
                               null;
            
            console.log('Final stageDetail value:', stageDetail);
            
            return Response.json({
                recordType: 'Opportunity',
                id: opp.Id,
                businessName: opp.Name,
                stageName: opp.StageName,
                stageDetail: stageDetail,
                missingDocsFlag: missingDocsFlag,
                missingDocs: opp.Missing_Docs__c || null,
                bankStatementChecklist: opp.Bank_Statement_Checklist__c || null,
                lastModifiedDate: opp.LastModifiedDate,
                firstName: opp.FirstName__c || '',
                lastName: opp.LastName__c || '',
                // Include debug info
                allFields: Object.keys(opp)
            });
        }

        return Response.json({ error: 'Record not found in Salesforce' }, { status: 404 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});