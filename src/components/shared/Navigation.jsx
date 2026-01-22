import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: createPageUrl('Home') },
    { label: 'How It Works', href: createPageUrl('HowItWorks') },
    { label: 'Industries', href: createPageUrl('Industries') },
    { label: 'About', href: createPageUrl('About') },
    { label: 'Reviews', href: createPageUrl('Reviews') },
    { label: 'FAQ', href: createPageUrl('FAQ') },
    { label: 'Contact', href: createPageUrl('Contact') }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 font-bold text-xl text-[#08708E]">
            <div className="w-8 h-8 bg-[#08708E] rounded-lg flex items-center justify-center text-white text-sm font-bold">
              FI
            </div>
            <span className="hidden sm:inline">FastFund</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-slate-700 hover:text-[#08708E] transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to={createPageUrl('application')}>
              <Button variant="outline" className="text-[#08708E] border-[#08708E] hover:bg-[#08708E] hover:text-white">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={createPageUrl('application')}
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <Button className="w-full bg-[#08708E] hover:bg-[#065a72]">
                Apply Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}