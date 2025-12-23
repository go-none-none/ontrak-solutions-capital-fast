import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Users, TrendingUp, Search, LogOut, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import LeadCard from '../components/rep/LeadCard';
import OpportunityCard from '../components/rep/OpportunityCard';
import PipelineView from '../components/rep/PipelineView';

export default function RepPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  const [stageFilter, setStageFilter] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
      loadData(parsed);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        handleOAuthCallback(code);
      } else {
        setLoading(false);
      }
    }
  };

  const handleOAuthCallback = async (code) => {
    try {
      const response = await base44.functions.invoke('salesforceAuth', {
        action: 'exchangeCode',
        code
      });
      
      const sessionData = {
        ...response.data,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('sfSession', JSON.stringify(sessionData));
      setSession(sessionData);
      window.history.replaceState({}, '', createPageUrl('RepPortal'));
      loadData(sessionData);
    } catch (error) {
      console.error('OAuth error:', error);
      alert(`Failed to authenticate: ${error.response?.data?.error || error.message}`);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('salesforceAuth', {
        action: 'getLoginUrl'
      });
      window.location.href = response.data.loginUrl;
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to Salesforce. Please try again.');
      setLoading(false);
    }
  };
  


  const handleLogout = () => {
    sessionStorage.removeItem('sfSession');
    setSession(null);
    setLeads([]);
    setOpportunities([]);
  };

  const loadData = async (sessionData) => {
    setLoading(true);
    try {
      const [leadsRes, oppsRes] = await Promise.all([
        base44.functions.invoke('getRepLeads', {
          userId: sessionData.userId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getRepOpportunities', {
          userId: sessionData.userId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);

      setLeads(leadsRes.data.leads || []);
      setOpportunities(oppsRes.data.opportunities || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (stageName) => {
    setStageFilter(stageName);
    setSearchTerm('');
  };

  const filteredLeads = leads.filter(lead => {
    const searchMatch = lead.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.Company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.Email?.toLowerCase().includes(searchTerm.toLowerCase());
    const stageMatch = !stageFilter || lead.Status === stageFilter;
    return searchMatch && stageMatch;
  });

  const filteredOpportunities = opportunities.filter(opp => {
    const searchMatch = opp.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.Account?.Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const stageMatch = !stageFilter || opp.StageName === stageFilter;
    return searchMatch && stageMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#08708E] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Rep Portal</h1>
          <p className="text-slate-600 mb-8">
            Sign in with your Salesforce account to access your leads and opportunities.
          </p>
          <Button
            onClick={handleLogin}
            className="w-full h-14 bg-[#08708E] hover:bg-[#065a72] text-white text-lg font-semibold"
          >
            Sign in with Salesforce
          </Button>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'Active Leads', value: leads.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Open Opportunities', value: opportunities.length, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Total Pipeline', value: `$${opportunities.reduce((sum, o) => sum + (o.Amount || 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rep Portal</h1>
              <p className="text-sm text-slate-600">Welcome back, {session.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline */}
        <PipelineView 
          leads={leads} 
          opportunities={opportunities} 
          activeTab={activeTab}
          onStageClick={handleStageClick} 
        />

        {/* Search & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setStageFilter(null); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="leads">Leads ({filteredLeads.length})</TabsTrigger>
              <TabsTrigger value="opportunities">
                Opportunities ({filteredOpportunities.length})
                {stageFilter && <span className="ml-2 text-xs">• {stageFilter}</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leads">
              {stageFilter && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm text-blue-900">Filtering by: <strong>{stageFilter}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => setStageFilter(null)}>Clear Filter</Button>
                </div>
              )}
              <div className="space-y-3">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No leads found</p>
                  </div>
                ) : (
                  filteredLeads.map(lead => (
                    <LeadCard key={lead.Id} lead={lead} session={session} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="opportunities">
              {stageFilter && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm text-blue-900">Filtering by: <strong>{stageFilter}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => setStageFilter(null)}>Clear Filter</Button>
                </div>
              )}
              <div className="space-y-3">
                {filteredOpportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No opportunities found</p>
                  </div>
                ) : (
                  filteredOpportunities.map(opp => (
                    <OpportunityCard 
                      key={opp.Id} 
                      opportunity={opp} 
                      session={session}
                      onUpdate={() => loadData(session)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}