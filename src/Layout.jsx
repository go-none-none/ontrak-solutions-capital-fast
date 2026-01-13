import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';

export default function Layout({ children, currentPageName }) {
  const { pathname } = useLocation();
  const isRepPortal = currentPageName === 'RepPortal' || currentPageName === 'LeadDetail' || currentPageName === 'OpportunityDetail' || currentPageName === 'AdminPipeline';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Suppress Base44 auth errors for Salesforce-authenticated pages
    if (isRepPortal) {
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(err => {
          if (args[0]?.includes('/entities/User/me')) {
            return new Response('', { status: 200 });
          }
          throw err;
        });
      };
    }
  }, [pathname, isRepPortal]);

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
    <div className="min-h-screen flex flex-col">
      {!isRepPortal && <Navigation />}
      <main className="flex-1">
        {children}
      </main>
      {!isRepPortal && <Footer />}
    </div>
  );
}