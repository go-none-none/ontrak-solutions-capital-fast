import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { file_uri } = await req.json();

    if (!file_uri) {
      return Response.json({ error: 'Missing file_uri' }, { status: 400 });
    }

    console.log(`Creating signed URL for: ${file_uri}`);

    const result = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: file_uri,
      expires_in: 3600
    });

    return Response.json({
      success: true,
      signed_url: result.signed_url
    });

  } catch (error) {
    console.error('Signed URL error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});