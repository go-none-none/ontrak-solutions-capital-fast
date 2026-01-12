import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'Missing fileUrl' }, { status: 400 });
    }

    console.log(`Downloading PDF from: ${fileUrl}`);

    // Download the PDF from Salesforce
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      return Response.json({ error: `Failed to download PDF: ${pdfResponse.status}` }, { status: 400 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(`Downloaded ${pdfBuffer.byteLength} bytes`);

    // Write to temp file with timestamp
    const tempPath = `/tmp/statement_${Date.now()}.pdf`;
    await Deno.writeFile(tempPath, new Uint8Array(pdfBuffer));
    console.log(`Wrote to temp file: ${tempPath}`);
    
    const file = await Deno.open(tempPath);
    
    // Upload to Base44 public storage (for parsing)
    console.log(`Uploading PDF to Base44 storage (${pdfBuffer.byteLength} bytes)`);
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: file
    });

    file.close();
    await Deno.remove(tempPath);

    console.log(`PDF uploaded to Base44: ${uploadResult.file_url}`);

    return Response.json({
      success: true,
      file_url: uploadResult.file_url
    });

  } catch (error) {
    console.error('Download/Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});