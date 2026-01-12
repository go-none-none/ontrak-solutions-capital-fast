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

    const pdfBlob = await pdfResponse.blob();
    console.log(`Downloaded ${pdfBlob.size} bytes`);
    
    // Upload blob directly to Base44 public storage
    console.log(`Uploading PDF to Base44 storage (${pdfBlob.size} bytes)`);
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: pdfBlob
    });

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