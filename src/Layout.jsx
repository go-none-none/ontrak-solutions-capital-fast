import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import { NotificationProvider } from './components/context/NotificationContext';

export default function Layout({ children, currentPageName }) {
  const { pathname } = useLocation();
  const isRepPortal = currentPageName === 'RepPortal' || currentPageName === 'LeadDetail' || currentPageName === 'OpportunityDetail' || currentPageName === 'AdminPipeline' || currentPageName === 'ContactDetail';

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
        {!isRepPortal && <Navigation />}
        <main className="flex-1">
          {children}
        </main>
        {!isRepPortal && <Footer />}
      </div>
    </NotificationProvider>
  );
}