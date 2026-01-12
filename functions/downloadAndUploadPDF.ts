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
      return Response.json({ error: 'Failed to download PDF from Salesforce' }, { status: 400 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const uint8Array = new Uint8Array(pdfBuffer);

    // Upload to Base44 private storage
    console.log(`Uploading PDF to Base44 storage (${uint8Array.length} bytes)`);
    const uploadResult = await base44.integrations.Core.UploadPrivateFile({
      file: uint8Array
    });

    console.log(`PDF uploaded to Base44: ${uploadResult.file_uri}`);

    return Response.json({
      success: true,
      file_uri: uploadResult.file_uri
    });

  } catch (error) {
    console.error('Download/Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});