import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: createPageUrl('Home') },
    { name: 'About', href: createPageUrl('About') },
    { name: 'How It Works', href: createPageUrl('HowItWorks') },
    { name: 'FAQ', href: createPageUrl('FAQ') },
    { name: 'Use Cases', href: createPageUrl('UseCases') },
    { name: 'Reviews', href: createPageUrl('Reviews') },
    { name: 'Contact', href: createPageUrl('Contact') },
  ];

  const industries = [
    { name: 'Restaurants & Food Service', href: createPageUrl('IndustryRestaurants') },
    { name: 'Retail', href: createPageUrl('IndustryRetail') },
    { name: 'Healthcare & Medical', href: createPageUrl('IndustryHealthcare') },
    { name: 'Construction', href: createPageUrl('IndustryConstruction') },
    { name: 'Transportation & Logistics', href: createPageUrl('IndustryTransportation') },
    { name: 'Beauty & Wellness', href: createPageUrl('IndustryBeauty') },
    { name: 'Fitness & Recreation', href: createPageUrl('IndustryFitness') },
    { name: 'Auto Services', href: createPageUrl('IndustryAuto') },
    { name: 'Professional Services', href: createPageUrl('IndustryProfessional') },
    { name: 'View All Industries', href: createPageUrl('Industries') }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center">
              <img 
                src="https://ontrakcap.com/wp-content/uploads/2025/10/cropped-customcolor_logo_transparent_background-1-scaled-1-e1761864411651-1536x382.png"
                alt="OnTrak Solutions"
                className={`h-10 w-auto transition-all duration-300 ${
                  isScrolled ? '' : 'brightness-0 invert'
                }`}
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-base font-normal transition-all duration-300 hover:opacity-70 ${
                    isScrolled ? 'text-slate-700' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link to={createPageUrl('Application')}>
                <Button 
                  className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                    isScrolled 
                      ? 'bg-[#08708E] hover:bg-[#065a72] text-white' 
                      : 'bg-white text-[#08708E] hover:bg-white/90'
                  }`}
                >
                  Get Funds Today
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-slate-700' : 'text-white'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-700' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-2 py-4 pb-24">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-slate-700 py-2.5 border-b border-slate-100"
                >
                  {link.name}
                </Link>
              ))}
              <Link to={createPageUrl('Application')} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full mt-4 bg-[#08708E] hover:bg-[#065a72] text-white py-5 rounded-full text-base">
                  Get Funds Today
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}