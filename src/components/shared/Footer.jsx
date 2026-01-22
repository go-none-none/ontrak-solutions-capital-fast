import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#08708E] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                FI
              </div>
              <span className="font-bold text-white text-lg">FastFund</span>
            </div>
            <p className="text-sm">Fast, flexible small business funding solutions.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('HowItWorks')} className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to={createPageUrl('Industries')} className="hover:text-white transition-colors">Industries</Link></li>
              <li><Link to={createPageUrl('application')} className="hover:text-white transition-colors">Apply Now</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('About')} className="hover:text-white transition-colors">About</Link></li>
              <li><Link to={createPageUrl('Contact')} className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to={createPageUrl('FAQ')} className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+18005551234" className="hover:text-white transition-colors">(800) 555-1234</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@fastfund.com" className="hover:text-white transition-colors">support@fastfund.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Business Ave, Suite 100<br/>New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {currentYear} FastFund. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to={createPageUrl('TermsOfService')} className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}