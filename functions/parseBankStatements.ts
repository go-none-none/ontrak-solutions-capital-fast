import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { opportunityId, token, instanceUrl } = await req.json();

    if (!opportunityId || !token || !instanceUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Create or update analysis record
    const existingAnalysis = await base44.asServiceRole.entities.FinancialAnalysis.filter({ 
      opportunity_id: opportunityId 
    });

    let analysisId;
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      await base44.asServiceRole.entities.FinancialAnalysis.update(analysisId, {
        parsing_status: 'processing',
        analysis_date: new Date().toISOString()
      });
    } else {
      const newAnalysis = await base44.asServiceRole.entities.FinancialAnalysis.create({
        opportunity_id: opportunityId,
        parsing_status: 'processing',
        analysis_date: new Date().toISOString()
      });
      analysisId = newAnalysis.id;
    }

    // Fetch all PDF files from Salesforce
    const filesResponse = await fetch(
      `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(
        `SELECT Id, Title, LatestPublishedVersionId FROM ContentDocumentLink WHERE LinkedEntityId = '${opportunityId}'`
      )}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const filesData = await filesResponse.json();
    const pdfFiles = filesData.records?.filter(r => 
      r.ContentDocument?.LatestPublishedVersion?.FileType === 'PDF' || 
      r.Title?.toLowerCase().endsWith('.pdf')
    ) || [];

    if (pdfFiles.length === 0) {
      await base44.asServiceRole.entities.FinancialAnalysis.update(analysisId, {
        parsing_status: 'failed',
        error_message: 'No PDF files found'
      });
      return Response.json({ error: 'No PDF files found' }, { status: 400 });
    }

    const allTransactions = [];
    const pdfFilenames = [];

    // Process each PDF
    for (const file of pdfFiles) {
      try {
        // Get file content
        const versionId = file.LatestPublishedVersionId || file.ContentDocument?.LatestPublishedVersionId;
        const contentResponse = await fetch(
          `${instanceUrl}/services/data/v59.0/sobjects/ContentVersion/${versionId}/VersionData`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const pdfBuffer = await contentResponse.arrayBuffer();
        const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        
        // Upload to Base44 for processing
        const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({
          file: pdfBase64
        });
        
        const fileUrl = uploadResponse.file_url;
        pdfFilenames.push(file.Title);

        // Use LLM with structured extraction
        const extractionSchema = {
          type: "object",
          properties: {
            transactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  description: { type: "string" },
                  debit: { type: "number" },
                  credit: { type: "number" },
                  balance: { type: "number" }
                }
              }
            },
            statement_period: {
              type: "object",
              properties: {
                start: { type: "string" },
                end: { type: "string" }
              }
            }
          }
        };

        const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Parse this bank statement PDF and extract ALL transactions. For each transaction, provide:
- Transaction date (YYYY-MM-DD format)
- Description/memo (clean, exact text)
- Debit amount (if withdrawal/payment)
- Credit amount (if deposit)
- Running balance (if shown)

Also extract the statement period (start and end dates).

Be thorough - extract EVERY transaction line. Handle multiple formats. If a column shows combined amounts, determine if it's debit or credit based on context.`,
          response_json_schema: extractionSchema,
          file_urls: [fileUrl]
        });

        // Normalize and store transactions
        for (const tx of llmResponse.transactions || []) {
          const isDebit = (tx.debit && tx.debit > 0);
          const isCredit = (tx.credit && tx.credit > 0);
          
          const normalized = {
            opportunity_id: opportunityId,
            pdf_filename: file.Title,
            transaction_date: tx.date,
            description: tx.description,
            description_clean: cleanDescription(tx.description),
            debit: tx.debit || 0,
            credit: tx.credit || 0,
            balance: tx.balance || 0,
            type: isDebit ? 'debit' : 'credit',
            confidence_score: 80
          };

          allTransactions.push(normalized);
        }
      } catch (fileError) {
        console.error(`Error processing ${file.Title}:`, fileError);
      }
    }

    // Bulk create transactions
    if (allTransactions.length > 0) {
      // Delete old transactions for this opportunity
      const oldTransactions = await base44.asServiceRole.entities.BankTransaction.filter({
        opportunity_id: opportunityId
      });
      for (const old of oldTransactions) {
        await base44.asServiceRole.entities.BankTransaction.delete(old.id);
      }

      // Create new transactions
      await base44.asServiceRole.entities.BankTransaction.bulkCreate(allTransactions);
    }

    // Calculate summary metrics
    const totalDeposits = allTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const totalWithdrawals = allTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const netCashFlow = totalDeposits - totalWithdrawals;

    const dates = allTransactions.map(t => new Date(t.transaction_date)).sort((a, b) => a - b);
    const dateRangeStart = dates[0]?.toISOString().split('T')[0];
    const dateRangeEnd = dates[dates.length - 1]?.toISOString().split('T')[0];

    // Calculate average daily balance
    const balances = allTransactions.filter(t => t.balance > 0).map(t => t.balance);
    const avgDailyBalance = balances.length > 0 
      ? balances.reduce((sum, b) => sum + b, 0) / balances.length 
      : 0;

    // Count NSFs
    const nsfCount = allTransactions.filter(t => 
      t.description_clean.toLowerCase().includes('nsf') ||
      t.description_clean.toLowerCase().includes('returned') ||
      t.description_clean.toLowerCase().includes('insufficient')
    ).length;

    // Count negative days
    const negativeDays = allTransactions.filter(t => t.balance < 0).length;

    // Update analysis
    await base44.asServiceRole.entities.FinancialAnalysis.update(analysisId, {
      parsing_status: 'completed',
      pdf_count: pdfFilenames.length,
      pdf_filenames: pdfFilenames,
      total_transactions: allTransactions.length,
      date_range_start: dateRangeStart,
      date_range_end: dateRangeEnd,
      total_deposits: totalDeposits,
      total_withdrawals: totalWithdrawals,
      net_cash_flow: netCashFlow,
      avg_daily_balance: avgDailyBalance,
      nsf_count: nsfCount,
      negative_days_count: negativeDays
    });

    return Response.json({
      success: true,
      analysis_id: analysisId,
      transactions_parsed: allTransactions.length,
      pdfs_processed: pdfFilenames.length
    });

  } catch (error) {
    console.error('Parse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toUpperCase();
}