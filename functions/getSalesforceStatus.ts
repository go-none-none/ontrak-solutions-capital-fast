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

            // Fetch owner information
            let ownerName = '';
            let ownerPhone = '';
            let ownerAlias = '';
            if (lead.OwnerId) {
                const ownerResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/User/${lead.OwnerId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (ownerResponse.ok) {
                    const owner = await ownerResponse.json();
                    ownerName = owner.Name || '';
                    ownerPhone = owner.Phone || owner.MobilePhone || '';
                    ownerAlias = owner.Alias || '';
                }
            }

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
                lastName: lead.LastName,
                phone: lead.Phone || lead.MobilePhone || '',
                email: lead.Email || '',
                ownerName: ownerName,
                ownerPhone: ownerPhone,
                ownerAlias: ownerAlias,
                token: accessToken,
                instanceUrl: instanceUrl
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
            console.log('Looking for name fields:', {
                FirstName__c: opp.FirstName__c,
                LastName__c: opp.LastName__c,
                Contact: opp.Contact,
                ContactId: opp.ContactId
            });

            // Try different possible field names for stage detail
            const stageDetail = opp.Stage_Detail__c || 
                               opp.StageDetail__c || 
                               opp.Decline_Reason__c || 
                               opp.DeclineReason__c ||
                               null;

            // Try to get first name from various sources
            let firstName = opp.FirstName__c || '';

            // If no custom field, try to get from Contact
            if (!firstName && opp.ContactId) {
                const contactResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Contact/${opp.ContactId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (contactResponse.ok) {
                    const contact = await contactResponse.json();
                    firstName = contact.FirstName || '';
                }
            }

            console.log('Final firstName value:', firstName);

            // Fetch owner information
            let ownerName = '';
            let ownerPhone = '';
            let ownerAlias = '';
            if (opp.OwnerId) {
                const ownerResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/User/${opp.OwnerId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (ownerResponse.ok) {
                    const owner = await ownerResponse.json();
                    ownerName = owner.Name || '';
                    ownerPhone = owner.Phone || owner.MobilePhone || '';
                    ownerAlias = owner.Alias || '';
                }
            }

            // Get contact info for phone and email if not on opportunity
            let phone = opp.Phone__c || '';
            let email = opp.Email__c || '';
            
            if ((!phone || !email) && opp.ContactId) {
                const contactResponse = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Contact/${opp.ContactId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (contactResponse.ok) {
                    const contact = await contactResponse.json();
                    if (!phone) phone = contact.Phone || contact.MobilePhone || '';
                    if (!email) email = contact.Email || '';
                }
            }

            // Fetch all offers for Approved, Contracts Out, or Contracts In stages
            let offers = [];
            const stageLower = opp.StageName?.toLowerCase();
            if (stageLower === 'approved' || stageLower === 'contracts out' || stageLower === 'contracts in') {
                const offerQuery = `SELECT Id, Name, csbs__Lender__c, csbs__Funded__c, csbs__Payment_Amount__c, csbs__Term__c, csbs__Payment_Frequency__c, csbs__Selected__c FROM csbs__Offer__c WHERE csbs__Opportunity__c = '${opp.Id}' ORDER BY CreatedDate DESC`;
                const offersResponse = await fetch(`${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(offerQuery)}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (offersResponse.ok) {
                    const offersData = await offersResponse.json();
                    offers = offersData.records || [];
                }
            }

            // Collect missing stipulations
            const missingStipulations = [];
            if (!opp.Voided_Check__c) missingStipulations.push('Voided Check');
            if (!opp.Driver_s_License_Valid__c) missingStipulations.push("Driver's License (Valid)");
            if (!opp.Month_to_Date_Activity__c) missingStipulations.push('Month-to-Date Activity');
            if (!opp.Proof_of_Ownership__c) missingStipulations.push('Proof of Ownership');
            if (!opp.Proof_of_EIN__c) missingStipulations.push('Proof of EIN');
            if (!opp.Signed_RPA__c) missingStipulations.push('Signed RPA');

            return Response.json({
                recordType: 'Opportunity',
                id: opp.Id,
                businessName: opp.Name,
                stageName: opp.StageName,
                stageDetail: stageDetail,
                missingDocsFlag: missingDocsFlag,
                missingDocs: opp.Missing_Docs__c || null,
                bankStatementChecklist: opp.Bank_Statement_Checklist__c || null,
                missingStipulations: missingStipulations.length > 0 ? missingStipulations : null,
                lastModifiedDate: opp.LastModifiedDate,
                firstName: firstName,
                lastName: opp.LastName__c || '',
                phone: phone,
                email: email,
                ownerName: ownerName,
                ownerPhone: ownerPhone,
                ownerAlias: ownerAlias,
                token: accessToken,
                instanceUrl: instanceUrl,
                offers: offers,
                // Include debug info
                allFields: Object.keys(opp)
            });
        }

        return Response.json({ error: 'Record not found in Salesforce' }, { status: 404 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});