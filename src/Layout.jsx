import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from './utils/tracking';
import { base44 } from '@/api/base44Client';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import { NotificationProvider } from './components/context/NotificationContext';

export default function Layout({ children, currentPageName }) {
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