import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const endpoint = Deno.env.get('EXTERNAL_TRACKING_ENDPOINT') || 'https://app.base44.com/apps/69b997d063541d627aa671c2/api/functions/trackWebEvent';
    const apiKey = Deno.env.get('EXTERNAL_TRACKING_API_KEY') || Deno.env.get('WEB_TRACKING_SECRET');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});