import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Contact, Briefcase, Building2, X, User } from 'lucide-react';
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
    if (!searchTerm.trim() || !session?.token) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const searchLower = searchTerm.toLowerCase();
        
        // Perform search via backend function
        const response = await base44.functions.invoke('performUniversalSearch', {
          searchTerm: searchLower,
          userId: session?.userId,
          token: session?.token,
          instanceUrl: session?.instanceUrl
        });

        const allResults = [];

        // Process leads
        if (response.data?.leads) {
          response.data.leads.forEach(lead => {
            allResults.push({
              id: lead.Id,
              name: lead.Name,
              subtitle: lead.Company,
              type: 'Lead',
              category: 'Lead',
              color: 'bg-blue-100 text-blue-800',
              icon: Contact,
              path: 'LeadDetail',
              record: lead
            });
          });
        }

        // Process opportunities
        if (response.data?.opportunities) {
          response.data.opportunities.forEach(opp => {
            allResults.push({
              id: opp.Id,
              name: opp.Name,
              subtitle: opp.Account?.Name,
              type: 'Opportunity',
              category: 'Opportunity',
              color: 'bg-orange-100 text-orange-800',
              icon: Briefcase,
              path: 'OpportunityDetail',
              record: opp
            });
          });
        }

        // Process contacts
        if (response.data?.contacts) {
          response.data.contacts.forEach(contact => {
            allResults.push({
              id: contact.Id,
              name: contact.Name,
              subtitle: contact.Title,
              type: 'Contact',
              category: 'Contact',
              color: 'bg-cyan-100 text-cyan-800',
              icon: User,
              path: 'ContactDetail',
              record: contact
            });
          });
        }

        // Process accounts - use Active Lender checkbox
        if (response.data?.accounts) {
          response.data.accounts.forEach(account => {
            let accountCategory = 'Account';
            let color = 'bg-slate-100 text-slate-800';
            let icon = Building2;

            // Check if Active Lender
            if (account.csbs__Active_Lender__c) {
              accountCategory = 'Lender';
              color = 'bg-emerald-100 text-emerald-800';
            } else {
              // Default to Merchant if not a lender
              const recordTypeName = account.RecordType?.Name?.toLowerCase() || '';
              if (recordTypeName.includes('merchant')) {
                accountCategory = 'Merchant';
                color = 'bg-purple-100 text-purple-800';
              }
            }

            allResults.push({
              id: account.Id,
              name: account.Name,
              subtitle: account.RecordType?.Name,
              type: accountCategory,
              category: 'Account',
              color: color,
              icon: icon,
              path: 'AccountDetail',
              record: account
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

    const timer = setTimeout(performSearch, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, session]);

  const handleResultClick = (result) => {
    if (result.path) {
      window.location.href = createPageUrl(result.path) + `?id=${result.id}`;
    }
  };



  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg mx-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, opps, contacts, accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowDropdown(true)}
            className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {loading ? (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          ) : searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>


      </div>

      {showDropdown && (results.length > 0 || searchTerm) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto">
           {loading && results.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.category}-${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{result.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${result.color}`}>
                          {result.type}
                        </span>
                        {result.subtitle && (
                          <span className="text-[11px] text-slate-500 truncate">{result.subtitle}</span>
                        )}
                      </div>
                    </div>
                  </button>
                  );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}