import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { fileUrl, opportunityId, token } = await req.json();

  try {
    // Download from Salesforce with auth
    const pdfRes = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!pdfRes.ok) throw new Error(`Download failed: ${pdfRes.status}`);
    const pdfBuffer = await pdfRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    
    // Use LLM to parse PDF
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract bank statement data from this PDF. Return ONLY valid JSON with: bank_name, statement_start_date (YYYY-MM-DD), statement_end_date (YYYY-MM-DD), transactions (array with: transaction_date, description, amount, type as "debit" or "credit"), total_deposits, total_withdrawals.`,
      file_urls: [`data:application/pdf;base64,${base64}`],
      response_json_schema: {
        type: "object",
        properties: {
          bank_name: { type: "string" },
          statement_start_date: { type: "string" },
          statement_end_date: { type: "string" },
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transaction_date: { type: "string" },
                description: { type: "string" },
                amount: { type: "number" },
                type: { type: "string" }
              }
            }
          },
          total_deposits: { type: "number" },
          total_withdrawals: { type: "number" }
        }
      }
    });

    const stmt = await base44.entities.BankStatement.create({
      opportunity_id: opportunityId,
      file_url: fileUrl,
      file_name: 'statement.pdf',
      bank_name: result.bank_name,
      statement_start_date: result.statement_start_date,
      statement_end_date: result.statement_end_date,
      total_deposits: result.total_deposits || 0,
      total_withdrawals: result.total_withdrawals || 0,
      net_cash_flow: (result.total_deposits || 0) - (result.total_withdrawals || 0),
      transaction_count: result.transactions?.length || 0,
      parsing_status: 'completed'
    });

    if (result.transactions?.length > 0) {
      await base44.entities.Transaction.bulkCreate(
        result.transactions.map(t => ({
          bank_statement_id: stmt.id,
          opportunity_id: opportunityId,
          transaction_date: t.transaction_date,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: 'other'
        }))
      );
    }

    return Response.json({ success: true, stmt_id: stmt.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});