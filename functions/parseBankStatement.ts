import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { fileUrl } = await req.json();
    
    const base44 = createClientFromRequest(req);
    
    console.log('Parsing bank statement from:', fileUrl);

    // Use InvokeLLM with service role (no user auth required for parsing)
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this bank statement PDF comprehensively and extract ALL of the following information:

ACCOUNT INFORMATION:
1. Bank Name - Extract the financial institution name
2. Account Number - Last 4 digits if partially masked
3. Account Title/Name - Account holder name
4. Company Name - Business name if present

STATEMENT PERIOD:
5. Starting Date - First day of statement period (format: YYYY-MM-DD)
6. Ending Date - Last day of statement period (format: YYYY-MM-DD)

BALANCES:
7. Starting Balance - Balance at beginning of period
8. Ending Balance - Balance at end of period
9. Average Daily Balance - Calculate or extract from summary

DEPOSITS:
10. Deposit Count - Total number of deposit transactions
11. Deposit Amount - Total sum of all deposits

WITHDRAWALS:
12. Withdrawals Count - Total number of withdrawal/debit transactions
13. Total Withdrawals - Total sum of all withdrawals

TRANSACTIONS:
14. Transactions Count - Total count of all transactions (deposits + withdrawals)

NSF/RETURNED ITEMS (CRITICAL):
15. NSFs - Count NSF fees, returned items, insufficient funds fees, bounced checks, or any transaction labeled as NSF/Returned/Insufficient Funds

NEGATIVE BALANCE:
16. Negative Days - Count how many days the account had a negative/overdrawn balance

NOTES/FRAUD:
17. Any unusual patterns or red flags (KEEP UNDER 255 CHARACTERS - summarize concisely)

Instructions:
- Read the ENTIRE statement page by page
- Look at summary sections, transaction details, and fee sections
- For NSFs: Look for "NSF", "Returned Item", "Insufficient Funds", "Bounced", "Returned Check" fees or notations
- For Negative Days: Track when daily balance goes below zero
- Be thorough and precise
- Use null only if data genuinely cannot be found
- For notes: Keep the summary brief and under 255 characters`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          bank_name: { type: ["string", "null"] },
          account_number: { type: ["string", "null"] },
          account_title: { type: ["string", "null"] },
          company: { type: ["string", "null"] },
          starting_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
          ending_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
          starting_balance: { type: ["number", "null"] },
          ending_balance: { type: ["number", "null"] },
          average_daily_balance: { type: ["number", "null"] },
          deposit_count: { type: ["integer", "null"] },
          deposit_amount: { type: ["number", "null"] },
          withdrawals_count: { type: ["integer", "null"] },
          total_withdrawals: { type: ["number", "null"] },
          transactions_count: { type: ["integer", "null"] },
          nsf_count: { type: ["integer", "null"], description: "Count of NSF/Returned Item fees or transactions" },
          negative_days: { type: ["integer", "null"], description: "Days with negative balance" },
          notes: { type: ["string", "null"], description: "Any red flags or unusual patterns (max 255 characters)" }
        }
      }
    });

    console.log('Parsed data:', result);

    // Ensure transaction count is calculated if not provided
    if (!result.transactions_count && result.deposit_count !== null && result.withdrawals_count !== null) {
      result.transactions_count = result.deposit_count + result.withdrawals_count;
    }

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