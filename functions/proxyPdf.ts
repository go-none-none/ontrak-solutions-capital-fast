import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const pdfUrl = url.searchParams.get('url');
    
    if (!pdfUrl) {
      return Response.json({ error: 'Missing PDF URL' }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="statement.pdf"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});