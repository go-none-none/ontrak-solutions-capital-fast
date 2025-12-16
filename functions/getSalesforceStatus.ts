export default async function getSalesforceStatus({ recordId }, { base44 }) {
  try {
    // Get Salesforce access token
    const { access_token, instance_url } = await base44.asServiceRole.connectors.getAccessToken('salesforce');
    
    // Try to fetch as Lead first
    let response = await fetch(
      `${instance_url}/services/data/v59.0/sobjects/Lead/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const lead = await response.json();
      return {
        recordType: 'Lead',
        id: lead.Id,
        businessName: lead.Company,
        lastName: lead.LastName,
        status: lead.Status,
        missingDocs: lead.Missing_Docs__c || '',
        missingDocsFlag: lead.Missing_Docs_Flag__c || false,
        lastModified: lead.LastModifiedDate,
        isConverted: lead.Status === 'Converted'
      };
    }
    
    // If not a Lead, try Opportunity
    response = await fetch(
      `${instance_url}/services/data/v59.0/sobjects/Opportunity/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const opportunity = await response.json();
      return {
        recordType: 'Opportunity',
        id: opportunity.Id,
        businessName: opportunity.Name,
        lastName: opportunity.LastName,
        stageName: opportunity.StageName,
        missingDocs: opportunity.Missing_Docs__c || '',
        missingDocsFlag: opportunity.Missing_Docs_Flag__c || false,
        lastModified: opportunity.LastModifiedDate
      };
    }
    
    return { error: 'Record not found' };
    
  } catch (error) {
    console.error('Salesforce API Error:', error);
    return { error: error.message };
  }
}