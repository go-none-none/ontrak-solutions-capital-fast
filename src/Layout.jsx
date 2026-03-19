import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── WEB BEHAVIOR TRACKER ────────────────────────────────────
const TRACKER_ENDPOINT = 'https://flow-mail-pulse.base44.app/api/functions/trackWebBehavior';
const TRACKING_SECRET = 'a8F3kL9xQ2mZ7vP1rT6wYc4HjN5uD0sB';

function getTrackedEmail() {
  const params = new URLSearchParams(window.location.search);
  const emailFromUrl = params.get('email');
  if (emailFromUrl) {
    sessionStorage.setItem('tracked_email', emailFromUrl.toLowerCase().trim());
  }
  return sessionStorage.getItem('tracked_email');
}

function sendEvent(event_type, metadata = {}) {
  const email = getTrackedEmail();
  if (!email) return;
  fetch(TRACKER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tracking-Secret': TRACKING_SECRET },
    body: JSON.stringify({ email, event_type, metadata }),
  }).catch(() => {});
}

function useWebTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    sendEvent('page_view', { page: pathname });

    const handleClick = (e) => {
      const el = e.target.closest('button, a, [data-track]');
      if (!el) return;
      sendEvent(el.tagName === 'BUTTON' ? 'button_click' : 'click', {
        label: el.innerText?.trim().slice(0, 100) || '',
        tag: el.tagName,
        id: el.id || '',
        href: el.href || '',
        page: pathname,
      });
    };
    document.addEventListener('click', handleClick);

    const milestones = new Set();
    const handleScroll = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      [25, 50, 75, 100].forEach(m => {
        if (pct >= m && !milestones.has(m)) {
          milestones.add(m);
          sendEvent('scroll', { depth_percent: m, page: pathname });
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
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