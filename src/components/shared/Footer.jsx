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
              OnTrak Solutions provides fast, flexible business funding and merchant cash advances 
              for small to medium-sized businesses across all industries. From working capital and 
              equipment financing to inventory purchases and business expansion, we offer customized 
              funding solutions with quick approvals and same-day funding. Get the capital your business 
              needs in as little as 24 hours with transparent terms, no hidden fees, and flexible 
              repayment options that adapt to your cash flow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: 'Home' },
                { name: 'About', href: 'About' },
                { name: 'How It Works', href: 'HowItWorks' },
                { name: 'FAQ', href: 'FAQ' },
                { name: 'Use Cases', href: 'UseCases' },
                { name: 'Industries', href: 'Industries' },
                { name: 'Reviews', href: 'Reviews' },
                { name: 'Contact', href: 'Contact' },
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
              {[
                { name: 'Restaurants & Food Service', page: 'IndustryRestaurants' },
                { name: 'Retail', page: 'IndustryRetail' },
                { name: 'Healthcare & Medical', page: 'IndustryHealthcare' },
                { name: 'Construction', page: 'IndustryConstruction' },
                { name: 'Transportation & Logistics', page: 'IndustryTransportation' },
                { name: 'Beauty & Wellness', page: 'IndustryBeauty' },
                { name: 'Fitness & Recreation', page: 'IndustryFitness' },
                { name: 'Auto Services', page: 'IndustryAuto' },
                { name: 'Professional Services', page: 'IndustryProfessional' }
              ].map((industry) => (
                <li key={industry.name}>
                  <Link 
                    to={createPageUrl(industry.page)} 
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {industry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-6 text-white">About OnTrak</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#08708E] mt-1" />
                <a href="tel:+13025205200" className="text-slate-400 hover:text-white transition-colors text-sm">(302) 520-5200</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#08708E] mt-1" />
                <a href="mailto:info@ontrak.co" className="text-slate-400 hover:text-white transition-colors text-sm">info@ontrak.co</a>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-slate-400 text-sm leading-relaxed">
                Since our founding, OnTrak Solutions has funded over $50M to over 1,000+ small and 
                medium-sized businesses nationwide. With a 95% approval rate and an A+ BBB rating, 
                we've become a trusted partner for entrepreneurs seeking fast, flexible business funding. 
                Our mission is to empower businesses with the capital they need to succeed.
              </p>
            </div>
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