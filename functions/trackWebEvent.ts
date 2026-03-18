import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const { email, event_type, metadata } = await req.json();

    if (!email || !event_type) {
      return Response.json({ error: 'Missing email or event_type' }, { status: 400 });
    }

    const apiKey = Deno.env.get("WEB_TRACKING_API_KEY");

    const res = await fetch("https://api.base44.com/api/apps/69b997d063541d627aa671c2/functions/trackWebEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ email, event_type, metadata })
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});