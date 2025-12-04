import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SalesforceWebToLeadForm() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Your Free Quote</h3>
        <p className="text-slate-500">Takes less than 60 seconds</p>
      </div>

      <form 
        action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DHs00000EL3pu" 
        method="POST"
        className="space-y-4 flex-1 flex flex-col"
      >
        {/* Salesforce hidden fields */}
        <input type="hidden" name="oid" value="00DHs00000EL3pu" />
        <input type="hidden" name="retURL" value={typeof window !== 'undefined' ? window.location.href : ''} />

        <div>
          <input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="First Name"
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
            required
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
          />
        </div>

        <div>
          <select
            id="00NHs00000etEGm"
            name="00NHs00000etEGm"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent text-slate-500"
          >
            <option value="">Monthly Revenue</option>
            <option value="$10K - $25K">$10K - $25K</option>
            <option value="$25K - $50K">$25K - $50K</option>
            <option value="$50K - $100K">$50K - $100K</option>
            <option value="$100K - $250K">$100K - $250K</option>
            <option value="$250K+">$250K+</option>
          </select>
        </div>

        <div className="flex-1" />

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
    </div>
  );
}