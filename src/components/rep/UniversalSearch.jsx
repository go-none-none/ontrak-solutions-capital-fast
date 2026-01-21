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
        const results = await Promise.allSettled([
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
          base44.functions.invoke('getSalesforceAccounts', {
            token: session?.token,
            instanceUrl: session?.instanceUrl
          })
        ]);

        const leadsRes = results[0].status === 'fulfilled' ? results[0].value : { data: {} };
        const oppsRes = results[1].status === 'fulfilled' ? results[1].value : { data: {} };
        const contactsRes = results[2].status === 'fulfilled' ? results[2].value : { data: {} };
        const accountsRes = results[3].status === 'fulfilled' ? results[3].value : { data: {} };

        const searchLower = searchTerm.toLowerCase();
        const allResults = [];

        // Filter leads
        if (leadsRes.data?.leads) {
          leadsRes.data.leads
            .filter(l => l.Name?.toLowerCase().includes(searchLower) || l.Company?.toLowerCase().includes(searchLower))
            .forEach(lead => {
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

        // Filter opportunities
        if (oppsRes.data?.opportunities) {
          oppsRes.data.opportunities
            .filter(o => o.Name?.toLowerCase().includes(searchLower) || o.Account?.Name?.toLowerCase().includes(searchLower))
            .forEach(opp => {
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

        // Filter contacts
        if (contactsRes.data?.contacts) {
          contactsRes.data.contacts
            .filter(c => c.Name?.toLowerCase().includes(searchLower) || c.AccountId?.toLowerCase().includes(searchLower))
            .forEach(contact => {
              allResults.push({
                id: contact.Id,
                name: contact.Name,
                subtitle: contact.Title,
                type: 'Contact',
                category: 'Contact',
                color: 'bg-purple-100 text-purple-800',
                icon: User,
                path: 'ContactDetail',
                record: contact
              });
            });
        }

        // Filter all accounts by RecordType
        if (accountsRes.data?.accounts) {
        accountsRes.data.accounts
        .filter(a => a.Name?.toLowerCase().includes(searchLower))
        .forEach(account => {
        // Check RecordType for lender/merchant categorization
        const recordTypeName = account.RecordType?.Name?.toLowerCase() || '';
        let accountCategory = 'Account';
        let color = 'bg-slate-100 text-slate-800';
        let icon = Building2;

        if (recordTypeName.includes('lender')) {
          accountCategory = 'Lender';
          color = 'bg-emerald-100 text-emerald-800';
        } else if (recordTypeName.includes('merchant')) {
          accountCategory = 'Merchant';
          color = 'bg-violet-100 text-violet-800';
        }

        allResults.push({
          id: account.Id,
          name: account.Name,
          subtitle: account.Industry,
          type: accountCategory,
          category: 'Account',
          color: color,
          icon: icon,
          path: 'AccountDetail',
          recordType: recordTypeName.charAt(0).toUpperCase() + recordTypeName.slice(1),
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

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, session]);

  const handleResultClick = (result) => {
    if (result.path) {
      navigate(createPageUrl(result.path) + `?id=${result.id}`);
      setSearchTerm('');
      setShowDropdown(false);
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
                        {result.recordType && result.category === 'Account' && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${result.color}`}>
                            {result.recordType}
                          </span>
                        )}
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