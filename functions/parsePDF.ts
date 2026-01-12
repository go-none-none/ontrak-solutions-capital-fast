import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { fileUrl, opportunityId, token } = await req.json();

  try {
    // Download from Salesforce with auth
    const pdfRes = await fetch(fileUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!pdfRes.ok) throw new Error(`Salesforce download failed: ${pdfRes.status}`);
    const pdfBuffer = await pdfRes.arrayBuffer();
    
    // Upload to Base44 storage
    const uploadRes = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBuffer], { type: 'application/pdf' })
    });
    
    // Extract from Base44 URL
    const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: uploadRes.file_url,
      json_schema: {
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

    if (extracted.status !== 'success') throw new Error(extracted.details);

    const stmt = await base44.entities.BankStatement.create({
      opportunity_id: opportunityId,
      file_url: uploadRes.file_url,
      file_name: 'statement.pdf',
      bank_name: extracted.output.bank_name,
      statement_start_date: extracted.output.statement_start_date,
      statement_end_date: extracted.output.statement_end_date,
      total_deposits: extracted.output.total_deposits || 0,
      total_withdrawals: extracted.output.total_withdrawals || 0,
      net_cash_flow: (extracted.output.total_deposits || 0) - (extracted.output.total_withdrawals || 0),
      transaction_count: extracted.output.transactions?.length || 0,
      parsing_status: 'completed'
    });

    if (extracted.output.transactions?.length > 0) {
      await base44.entities.Transaction.bulkCreate(
        extracted.output.transactions.map(t => ({
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