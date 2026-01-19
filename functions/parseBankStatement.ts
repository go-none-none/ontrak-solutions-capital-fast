import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { fileUrl } = await req.json();
    
    const base44 = createClientFromRequest(req);
    
    console.log('Parsing bank statement from:', fileUrl);

    // Use InvokeLLM with file attachment to analyze the bank statement
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this bank statement PDF in detail and extract the following information:

1. Bank Name
2. Account Number (last 4 digits if partially masked)
3. Statement Period: Starting Date and Ending Date
4. Average Daily Balance
5. Total Deposit Amount (sum of all deposits)
6. Number of Deposits (count of deposit transactions)
7. Number of NSF/Returned Items
8. Ending Balance

Please analyze the entire document carefully, looking at:
- Account summary sections
- Transaction listings
- Any balance information
- Fees or penalties that might indicate NSFs

Return the data in a structured format. Use null for any field you cannot confidently extract.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          bank_name: { type: ["string", "null"] },
          account_number: { type: ["string", "null"] },
          starting_date: { type: ["string", "null"], description: "Format as YYYY-MM-DD" },
          ending_date: { type: ["string", "null"], description: "Format as YYYY-MM-DD" },
          average_daily_balance: { type: ["number", "null"] },
          deposit_amount: { type: ["number", "null"] },
          deposit_count: { type: ["integer", "null"] },
          nsf_count: { type: ["integer", "null"] },
          ending_balance: { type: ["number", "null"] }
        }
      }
    });

    console.log('Parsed data:', result);

    return Response.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Parse error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});