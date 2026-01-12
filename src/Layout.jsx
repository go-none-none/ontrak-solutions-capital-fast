import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';
import MiniDialer from './components/rep/MiniDialer';

export default function Layout({ children, currentPageName }) {
  const { pathname } = useLocation();
  const isRepPortal = currentPageName === 'RepPortal' || currentPageName === 'LeadDetail' || currentPageName === 'OpportunityDetail' || currentPageName === 'AdminPipeline';
  const [session, setSession] = useState(null);

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

  useEffect(() => {
    if (isRepPortal) {
      const sessionData = sessionStorage.getItem('sfSession');
      if (sessionData) {
        setSession(JSON.parse(sessionData));
      }
    }
  }, [isRepPortal]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isRepPortal && <Navigation />}
      <main className="flex-1">
        {children}
      </main>
      {!isRepPortal && <Footer />}
      {isRepPortal && session && <MiniDialer session={session} />}
    </div>
  );
}