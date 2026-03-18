import { useCallback } from 'react';

export function useExternalTracking() {
  const trackEvent = useCallback(async (email, eventType, metadata = {}) => {
    if (!email) return;

    try {
      const endpoint = process.env.REACT_APP_EXTERNAL_TRACKING_ENDPOINT || 
        'https://app.base44.com/apps/69b997d063541d627aa671c2/api/functions/trackWebEvent';
      
      const apiKey = process.env.REACT_APP_EXTERNAL_TRACKING_API_KEY ||
        'a8F3kL9xQ2mZ7vP1rT6wYc4HjN5uD0sB';

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          event_type: eventType,
          metadata
        })
      });
    } catch (error) {
      console.debug('Tracking event failed:', error);
    }
  }, []);

  return trackEvent;
}