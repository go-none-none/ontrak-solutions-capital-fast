import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <img 
              src="https://ontrakcap.com/wp-content/uploads/2025/10/cropped-customcolor_logo_transparent_background-1-scaled-1-e1761864411651-1536x382.png"
              alt="OnTrak Solutions"
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Fast, flexible business funding solutions designed to help your company grow. 
              Get capital in as little as 24 hours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: 'About' },
                { name: 'How It Works', href: 'HowItWorks' },
                { name: 'FAQ', href: 'FAQ' },
                { name: 'Industries', href: 'Industries' },
                { name: 'Reviews', href: 'Reviews' },
                { name: 'Apply Now', href: 'Application' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={createPageUrl(link.href)} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Industries</h4>
            <ul className="space-y-3">
              {['Restaurants', 'Retail', 'Healthcare', 'Construction', 'Transportation'].map((industry) => (
                <li key={industry}>
                  <Link 
                    to={createPageUrl('Industries')} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {industry}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#08708E] mt-1" />
                <a href="tel:+13025205200" className="text-slate-400 hover:text-white transition-colors text-sm">(302) 520-5200</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#08708E] mt-1" />
                <a href="mailto:info@ontrak.co" className="text-slate-400 hover:text-white transition-colors text-sm">info@ontrak.co</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#08708E] mt-1" />
                <span className="text-slate-400 text-sm">1019 Ave P, STE 305<br />Brooklyn, NY 11223</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} OnTrak Solutions LLC. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to={createPageUrl('PrivacyPolicy')} className="text-slate-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl('TermsOfService')} className="text-slate-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}