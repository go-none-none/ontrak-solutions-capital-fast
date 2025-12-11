import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SalesforceWebToLeadForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Create a hidden iframe to submit the form
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set form target to iframe
    form.target = 'hidden_iframe';
    
    // Submit the form
    form.submit();
    
    // Show thank you message
    setSubmitted(true);
    
    // Clean up iframe after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col">
      {!submitted ? (
        <>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">Discover Your Funding Options</h3>
            <p className="text-slate-500 text-center">Fast, simple, and takes just 30 seconds</p>
          </div>

          <form 
            action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00Dam00001TLTFV" 
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-4 flex-1 flex flex-col"
          >
            {/* Salesforce hidden fields */}
            <input type="hidden" name="oid" value="00Dam00001TLTFV" />
            <input type="hidden" name="retURL" value="" />

            <div>
              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="First Name"
                maxLength="40"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
              />
            </div>

            <div>
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Last Name"
                maxLength="80"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
              />
            </div>

            <div>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Business Name"
                maxLength="40"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
              />
            </div>

            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone Number"
                maxLength="40"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                maxLength="80"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
              />
            </div>

            <div className="flex-1" />

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                />
                <span>
                  I consent to receive texts and agree to the{' '}
                  <Link to={createPageUrl('TermsOfService')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to={createPageUrl('PrivacyPolicy')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
              <p className="text-xs text-slate-500 leading-relaxed">
                By submitting your phone number, you agree to receive recurring SMS messages from OnTrak Solutions LLC regarding your account and service updates. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out or HELP for help. Your information will not be sold or shared. View our <Link to={createPageUrl('PrivacyPolicy')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Privacy Policy</Link> and <Link to={createPageUrl('TermsOfService')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Terms of Service</Link>. Consent is not a condition of service.
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-14 bg-[#08708E] hover:bg-[#065a72] text-white rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#08708E]/25 flex items-center justify-center gap-2"
            >
              Get Funding Estimate
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-center text-slate-400">
              No credit check required. No obligation.
            </p>
          </form>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
          <p className="text-slate-600">We'll get back to you within 24 hours.</p>
        </div>
      )}
    </div>
  );
}