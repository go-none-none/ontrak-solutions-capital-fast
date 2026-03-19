import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── WEB BEHAVIOR TRACKER ────────────────────────────────────
const TRACKER_ENDPOINT = 'https://flow-mail-pulse.base44.app/api/functions/trackWebBehavior';
const TRACKING_SECRET = 'a8F3kL9xQ2mZ7vP1rT6wYc4HjN5uD0sB';

function useWebTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    (function(){
      var params = new URLSearchParams(window.location.search);
      var email = params.get('email');
      var campaignId = params.get('campaign_id');

      if (email && !sessionStorage.getItem('mf_email')) sessionStorage.setItem('mf_email', email);
      if (campaignId && !sessionStorage.getItem('mf_campaign_id')) sessionStorage.setItem('mf_campaign_id', campaignId);
      email = sessionStorage.getItem('mf_email');
      campaignId = sessionStorage.getItem('mf_campaign_id') || undefined;

      if (!email) return;

      function track(eventType, meta) {
        fetch(TRACKER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Tracking-Secret': TRACKING_SECRET },
          body: JSON.stringify({ email, event_type: eventType, campaign_id: campaignId, metadata: meta })
        }).catch(() => {});
      }

      // Page view — once per session per page
      var pvKey = 'mf_pv_' + window.location.pathname;
      if (!sessionStorage.getItem(pvKey)) {
        sessionStorage.setItem(pvKey, '1');
        track('page_view', { page: window.location.pathname });
      }

      // Click tracking
      var clickHandler = function(e) {
        var el = e.target.closest('a, button');
        if (!el) return;
        var tag = el.tagName.toLowerCase();
        track(tag === 'button' ? 'button_click' : 'click', {
          label: el.innerText.trim().slice(0, 50),
          href: el.href || undefined,
          page: window.location.pathname
        });
      };
      document.addEventListener('click', clickHandler);

      // Scroll depth
      var scrollFired = {};
      var scrollHandler = function() {
        var pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        [25, 50, 75, 90].forEach(function(d) {
          var key = 'mf_scroll_' + window.location.pathname + '_' + d;
          if (pct >= d && !scrollFired[d] && !sessionStorage.getItem(key)) {
            scrollFired[d] = true;
            sessionStorage.setItem(key, '1');
            track('scroll_depth', { depth: d, page: window.location.pathname });
          }
        });
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });

      return function cleanup() {
        document.removeEventListener('click', clickHandler);
        window.removeEventListener('scroll', scrollHandler);
      };
    })();
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