const TRACK_URL = "https://api.base44.com/api/apps/69b997d063541d627aa671c2/functions/trackWebEvent";
const API_KEY = "a8F3kL9xQ2mZ7vP1rT6wYc4HjN5uD0sB";

export async function trackEvent(email, eventType, metadata = {}) {
  if (!email) return;
  try {
    await fetch(TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ email, event_type: eventType, metadata })
    });
  } catch (e) {}
}