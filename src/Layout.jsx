import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── WEB BEHAVIOR TRACKER ────────────────────────────────────
const TRACKER_ENDPOINT = 'https://flow-mail-pulse.base44.app/api/functions/trackWebBehavior';
const TRACKING_SECRET = 'a8F3kL9xQ2mZ7vP1rT6wYc4HjN5uD0sB';

function useWebTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const campaignId = params.get('campaign_id');
    if (!email) return;

    function track(eventType, meta) {
      fetch(TRACKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tracking-Secret': TRACKING_SECRET },
        body: JSON.stringify({ email, event_type: eventType, campaign_id: campaignId || undefined, metadata: meta }),
      }).catch(() => {});
    }

    track('page_view', { page: pathname });

    const handleClick = (e) => {
      const a = e.target.closest('a');
      if (a) track('click', { href: a.href, label: a.innerText?.trim().slice(0, 50) || '', page: pathname });
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);
}
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import { NotificationProvider } from './components/context/NotificationContext';

export default function Layout({ children, currentPageName }) {
  useWebTracker();

  useEffect(() => {
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/69a88ada9e1af81c3555c969/1jit5spv0';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  }, []);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
          setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }, 0);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
}