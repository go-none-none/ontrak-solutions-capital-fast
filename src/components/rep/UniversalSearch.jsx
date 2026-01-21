import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Contact, Briefcase, Building2, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function UniversalSearch({ session }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const [leadsRes, oppsRes, contactsRes, lendersRes] = await Promise.all([
          base44.functions.invoke('getRepLeads', {
            userId: session?.userId,
            token: session?.token,
            instanceUrl: session?.instanceUrl
          }),
          base44.functions.invoke('getRepOpportunities', {
            userId: session?.userId,
            token: session?.token,
            instanceUrl: session?.instanceUrl
          }),
          base44.functions.invoke('getRepContacts', {
            userId: session?.userId,
            token: session?.token,
            instanceUrl: session?.instanceUrl
          }),
          base44.functions.invoke('getSalesforceLenders', {
            token: session?.token,
            instanceUrl: session?.instanceUrl
          })
        ]);

        const searchLower = searchTerm.toLowerCase();
        const allResults = [];

        // Filter leads
        if (leadsRes.data?.leads) {
          leadsRes.data.leads
            .filter(l => l.Name?.toLowerCase().includes(searchLower) || l.Company?.toLowerCase().includes(searchLower))
            .slice(0, 3)
            .forEach(lead => {
              allResults.push({
                id: lead.Id,
                name: lead.Name,
                subtitle: lead.Company,
                type: 'Lead',
                color: 'bg-blue-100 text-blue-800',
                icon: Contact,
                path: 'LeadDetail',
                record: lead
              });
            });
        }

        // Filter opportunities
        if (oppsRes.data?.opportunities) {
          oppsRes.data.opportunities
            .filter(o => o.Name?.toLowerCase().includes(searchLower) || o.Account?.Name?.toLowerCase().includes(searchLower))
            .slice(0, 3)
            .forEach(opp => {
              allResults.push({
                id: opp.Id,
                name: opp.Name,
                subtitle: opp.Account?.Name,
                type: 'Opportunity',
                color: 'bg-orange-100 text-orange-800',
                icon: Briefcase,
                path: 'OpportunityDetail',
                record: opp
              });
            });
        }

        // Filter contacts
        if (contactsRes.data?.contacts) {
          contactsRes.data.contacts
            .filter(c => c.Name?.toLowerCase().includes(searchLower) || c.AccountId?.toLowerCase().includes(searchLower))
            .slice(0, 3)
            .forEach(contact => {
              allResults.push({
                id: contact.Id,
                name: contact.Name,
                subtitle: contact.Title,
                type: 'Contact',
                color: 'bg-purple-100 text-purple-800',
                icon: User,
                path: 'ContactDetail',
                record: contact
              });
            });
        }

        // Filter lenders
        if (lendersRes.data?.lenders) {
          lendersRes.data.lenders
            .filter(l => l.Name?.toLowerCase().includes(searchLower))
            .slice(0, 3)
            .forEach(lender => {
              allResults.push({
                id: lender.Id,
                name: lender.Name,
                subtitle: lender.Industry__c,
                type: 'Lender',
                color: 'bg-green-100 text-green-800',
                icon: Building2,
                path: null,
                record: lender
              });
            });
        }

        setResults(allResults);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, session]);

  const handleResultClick = (result) => {
    if (result.path) {
      navigate(createPageUrl(result.path) + `?id=${result.id}`);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads, opps, contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowDropdown(true)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {showDropdown && (results.length > 0 || searchTerm) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{result.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${result.color}`}>
                          {result.type}
                        </span>
                        {result.subtitle && (
                          <span className="text-xs text-slate-500 truncate">{result.subtitle}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}