import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contentDocumentId, token, instanceUrl } = await req.json();

    if (!token || !instanceUrl || !contentDocumentId) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Get file content first
    const versionQuery = `SELECT Id FROM ContentVersion WHERE ContentDocumentId = '${contentDocumentId}' AND IsLatest = true LIMIT 1`;
    const versionResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(versionQuery)}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const versionData = await versionResponse.json();
    if (!versionData.records || versionData.records.length === 0) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    const contentVersionId = versionData.records[0].Id;

    // Fetch binary
    const binaryResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${contentVersionId}/VersionData`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const arrayBuffer = await binaryResponse.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binaryString += String.fromCharCode(...chunk);
    }
    
    const base64 = btoa(binaryString);

    // Use AI to parse the PDF
    const parseResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this bank statement PDF and extract the following financial data in JSON format:
      - avgDailyBalance (number)
      - totalDeposits (number)
      - totalWithdrawals (number)
      - lenderPayments (array of {description: string, amount: number}) - look for ACH payments, loan payments, merchant cash advance payments
      - negativeBalances (number) - count of times account went negative
      
      Return only valid JSON. If data is not found, return null for that field.`,
      file_urls: [`data:application/pdf;base64,${base64}`],
      response_json_schema: {
        type: "object",
        properties: {
          avgDailyBalance: { type: "number" },
          totalDeposits: { type: "number" },
          totalWithdrawals: { type: "number" },
          lenderPayments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                amount: { type: "number" }
              }
            }
          },
          negativeBalances: { type: "number" }
        }
      }
    });

    return Response.json(parseResponse);
  } catch (error) {
    console.error('Parse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});