import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fileUrl, opportunityId } = await req.json();

    if (!fileUrl || !opportunityId) {
      return Response.json({ error: 'Missing fileUrl or opportunityId' }, { status: 400 });
    }

    console.log(`Downloading PDF from Salesforce: ${fileUrl}`);

    // Download the PDF
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      return Response.json({ error: `Failed to download: ${pdfResponse.status}` }, { status: 400 });
    }

    const pdfBlob = await pdfResponse.blob();
    console.log(`Downloaded ${pdfBlob.size} bytes`);
    
    // Upload to private storage
    console.log('Uploading to private storage...');
    const uploadResult = await base44.integrations.Core.UploadPrivateFile({
      file: pdfBlob
    });
    
    const fileUri = uploadResult.file_uri;
    console.log(`Uploaded to private storage: ${fileUri}`);

    // Create signed URL for extraction
    const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 3600
    });

    console.log('Extracting bank statement data...');
    
    // Extract transaction data from PDF
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: signedUrlResult.signed_url,
      json_schema: {
        type: "object",
        properties: {
          bank_name: { type: "string" },
          statement_start_date: { type: "string", format: "date" },
          statement_end_date: { type: "string", format: "date" },
          transactions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transaction_date: { type: "string", format: "date" },
                description: { type: "string" },
                amount: { type: "number" },
                type: { type: "string", enum: ["debit", "credit"] }
              },
              required: ["transaction_date", "description", "amount", "type"]
            }
          },
          total_deposits: { type: "number" },
          total_withdrawals: { type: "number" },
          average_daily_balance: { type: "number" }
        },
        required: ["bank_name", "statement_start_date", "statement_end_date", "transactions"]
      }
    });

    if (extractResult.status !== 'success') {
      return Response.json({ error: `Extraction failed: ${extractResult.details}` }, { status: 400 });
    }

    const data = extractResult.output;
    console.log(`Extracted ${data.transactions.length} transactions`);

    // Create BankStatement record
    const bankStatement = await base44.entities.BankStatement.create({
      opportunity_id: opportunityId,
      file_url: signedUrlResult.signed_url,
      file_name: 'bank_statement.pdf',
      bank_name: data.bank_name,
      statement_start_date: data.statement_start_date,
      statement_end_date: data.statement_end_date,
      total_deposits: data.total_deposits || 0,
      total_withdrawals: data.total_withdrawals || 0,
      net_cash_flow: (data.total_deposits || 0) - (data.total_withdrawals || 0),
      average_daily_balance: data.average_daily_balance || 0,
      transaction_count: data.transactions.length,
      parsing_status: 'completed'
    });

    console.log(`Created BankStatement: ${bankStatement.id}`);

    // Create Transaction records
    const transactions = data.transactions.map(t => ({
      bank_statement_id: bankStatement.id,
      opportunity_id: opportunityId,
      transaction_date: t.transaction_date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: 'other'
    }));

    if (transactions.length > 0) {
      await base44.entities.Transaction.bulkCreate(transactions);
      console.log(`Created ${transactions.length} transactions`);
    }

    return Response.json({
      success: true,
      bank_statement_id: bankStatement.id,
      transaction_count: transactions.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});