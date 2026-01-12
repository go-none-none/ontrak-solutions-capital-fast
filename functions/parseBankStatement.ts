import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MCA_KEYWORDS = [
  'merchant cash', 'mca', 'advance', 'factoring',
  'daily pay', 'rapid pay', 'ach debit', 'owed', 'outstanding',
  'principal', 'funder', 'lender', 'capital advance'
];

const MCA_LENDERS = [
  'rapid finance', 'business lenders', 'fundbox', 'kabbage', 'amex working capital',
  'stripe capital', 'shopify capital', 'square capital', 'paypal working capital',
  'lendingclub', 'elevate credit', 'enova', 'curo', 'installment loan'
];

const PAYROLL_KEYWORDS = ['payroll', 'wages', 'salary', 'pay stub', 'direct deposit'];
const RENT_KEYWORDS = ['rent', 'landlord', 'property management', 'lease'];
const UTILITY_KEYWORDS = ['electric', 'gas', 'water', 'utility', 'power', 'internet'];
const INSURANCE_KEYWORDS = ['insurance', 'premium', 'claim', 'coverage'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fileUrl, opportunityId } = await req.json();

    if (!fileUrl || !opportunityId) {
      return Response.json({ error: 'Missing fileUrl or opportunityId' }, { status: 400 });
    }

    console.log(`Starting PDF parsing for opportunity: ${opportunityId}`);

    // Fetch the PDF
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      return Response.json({ error: 'Failed to fetch PDF' }, { status: 400 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Use LLM to extract and parse transaction data from PDF
    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all transactions from this bank statement PDF. For each transaction, provide:
- Date (YYYY-MM-DD format)
- Description/memo
- Amount (positive for deposits, negative for withdrawals)
- Running balance if visible

Format as JSON array of objects with keys: date, description, amount, balance

Also extract:
- Bank name
- Statement start date
- Statement end date
- Account number (last 4 digits only)

Return complete JSON with structure:
{
  "bank_name": "...",
  "statement_start_date": "YYYY-MM-DD",
  "statement_end_date": "YYYY-MM-DD",
  "transactions": [...]
}`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          bank_name: { type: 'string' },
          statement_start_date: { type: 'string' },
          statement_end_date: { type: 'string' },
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                description: { type: 'string' },
                amount: { type: 'number' },
                balance: { type: 'number' }
              }
            }
          }
        }
      }
    });

    if (!extractionResult.transactions || extractionResult.transactions.length === 0) {
      return Response.json({ error: 'No transactions extracted from PDF' }, { status: 400 });
    }

    console.log(`Extracted ${extractionResult.transactions.length} transactions`);

    // Create BankStatement record
    const bankStatement = await base44.entities.BankStatement.create({
      opportunity_id: opportunityId,
      file_url: fileUrl,
      file_name: fileUrl.split('/').pop(),
      bank_name: extractionResult.bank_name || 'Unknown',
      statement_start_date: extractionResult.statement_start_date,
      statement_end_date: extractionResult.statement_end_date,
      parsing_status: 'parsing'
    });

    // Process transactions
    const transactions = [];
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let nsfsCount = 0;
    let mcaCount = 0;
    let totalMcaPayments = 0;

    for (const txn of extractionResult.transactions) {
      const amount = parseFloat(txn.amount) || 0;
      const description = txn.description || '';
      
      // Determine type
      const type = amount > 0 ? 'credit' : 'debit';
      
      // Track totals
      if (amount > 0) totalDeposits += amount;
      else totalWithdrawals += Math.abs(amount);

      // Detect NSF
      if (description.toLowerCase().includes('nsf') || description.toLowerCase().includes('overdraft')) {
        nsfsCount++;
      }

      // Categorize and detect MCA
      let category = 'other';
      let isMca = false;
      let mcaConfidence = 0;

      const lowerDesc = description.toLowerCase();

      // Check for MCA
      for (const keyword of MCA_KEYWORDS) {
        if (lowerDesc.includes(keyword)) {
          mcaConfidence += 30;
        }
      }
      for (const lender of MCA_LENDERS) {
        if (lowerDesc.includes(lender)) {
          mcaConfidence += 50;
        }
      }

      if (mcaConfidence > 40) {
        isMca = true;
        category = 'mca';
        mcaCount++;
        if (type === 'debit') totalMcaPayments += Math.abs(amount);
      }

      // Categorize other types
      if (!isMca) {
        if (lowerDesc.match(new RegExp(PAYROLL_KEYWORDS.join('|'), 'i'))) {
          category = 'payroll';
        } else if (lowerDesc.match(new RegExp(RENT_KEYWORDS.join('|'), 'i'))) {
          category = 'rent';
        } else if (lowerDesc.match(new RegExp(UTILITY_KEYWORDS.join('|'), 'i'))) {
          category = 'utilities';
        } else if (lowerDesc.match(new RegExp(INSURANCE_KEYWORDS.join('|'), 'i'))) {
          category = 'insurance';
        }
      }

      transactions.push({
        bank_statement_id: bankStatement.id,
        opportunity_id: opportunityId,
        transaction_date: txn.date,
        description: description.substring(0, 200),
        amount: amount,
        type: type,
        category: category,
        is_mca: isMca,
        mca_confidence: mcaConfidence
      });
    }

    // Bulk create transactions
    if (transactions.length > 0) {
      await base44.entities.Transaction.bulkCreate(transactions);
    }

    // Detect recurring patterns
    const patterns = detectRecurringPatterns(transactions, opportunityId);
    if (patterns.length > 0) {
      await base44.entities.RecurringPattern.bulkCreate(patterns);
    }

    // Update BankStatement with summary
    await base44.entities.BankStatement.update(bankStatement.id, {
      total_deposits: totalDeposits,
      total_withdrawals: totalWithdrawals,
      net_cash_flow: totalDeposits - totalWithdrawals,
      average_daily_balance: (totalDeposits - totalWithdrawals) / 30,
      nsf_count: nsfsCount,
      transaction_count: transactions.length,
      mca_transaction_count: mcaCount,
      total_mca_payments: totalMcaPayments,
      parsing_status: 'completed'
    });

    // Update Opportunity with parsed data
    await base44.asServiceRole.entities.Opportunity.update(opportunityId, {
      Bank_Statement_Analyzed__c: true,
      Avg_Gross_Monthly_Sales__c: totalDeposits / 1,
      Avg_Bank_Deposits__c: totalDeposits,
      Avg_Negative_Days__c: nsfsCount,
      Parsed_Data_Verified__c: false
    }, { token: req.headers.get('authorization') });

    return Response.json({
      success: true,
      bankStatementId: bankStatement.id,
      transactionCount: transactions.length,
      patterns: patterns.length
    });

  } catch (error) {
    console.error('Parsing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function detectRecurringPatterns(transactions, opportunityId) {
  const patterns = [];
  const descriptionGroups = {};

  // Group by description (simplified)
  for (const txn of transactions) {
    const key = txn.description.substring(0, 50);
    if (!descriptionGroups[key]) {
      descriptionGroups[key] = [];
    }
    descriptionGroups[key].push(txn);
  }

  // Detect patterns with 2+ occurrences
  for (const [desc, group] of Object.entries(descriptionGroups)) {
    if (group.length >= 2) {
      const amounts = group.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const totalPaid = amounts.reduce((a, b) => a + b, 0);
      
      // Determine frequency
      let frequency = 'other';
      if (group.length >= 5) frequency = 'daily';
      else if (group.length >= 3) frequency = 'weekly';
      else frequency = 'monthly';

      const isMca = group.some(t => t.is_mca);
      const confidence = isMca ? 85 : (group.length >= 5 ? 90 : 70);

      patterns.push({
        opportunity_id: opportunityId,
        pattern_name: desc,
        pattern_type: group[0].category,
        frequency: frequency,
        occurrence_count: group.length,
        average_amount: avgAmount,
        total_paid: totalPaid,
        confidence_score: confidence,
        is_mca: isMca,
        description_keywords: desc
      });
    }
  }

  return patterns;
}