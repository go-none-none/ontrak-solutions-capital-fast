import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './components/shared/Navigation';
import Footer from './components/shared/Footer';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}