import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import { NotificationProvider } from './components/context/NotificationContext';

const WEB_TRACKING_API_KEY = "YOUR_WEB_TRACKING_SECRET"; // Replace with actual key

export default function Layout({ children, currentPageName }) {
  // Save email from URL or sessionStorage on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email') || sessionStorage.getItem('crm_email');
    if (email) sessionStorage.setItem('crm_email', email);
  }, []);

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

    // Fire page view tracking event on every route change
    const email = sessionStorage.getItem('crm_email');
    if (email) {
      fetch("https://api.base44.com/api/apps/69b997d063541d627aa671c2/functions/trackWebEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": WEB_TRACKING_API_KEY },
        body: JSON.stringify({ email, event_type: "page_view", metadata: { page: window.location.pathname } })
      }).catch(() => {}); // Fail silently
    }
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