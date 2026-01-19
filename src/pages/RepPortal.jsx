import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Users, TrendingUp, Search, LogOut, Loader2, RefreshCw, Shield, X, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../components/context/NotificationContext';
import LeadCard from '../components/rep/LeadCard';
import OpportunityCard from '../components/rep/OpportunityCard';
import PipelineView from '../components/rep/PipelineView';
import TaskCard from '../components/rep/TaskCard';
import TaskItem from '../components/rep/TaskItem';
import RecordDetailsModal from '../components/rep/RecordDetailsModal';
import TaskDetailsModal from '../components/admin/TaskDetailsModal';
import CreateTaskModal from '../components/admin/CreateTaskModal';
import ContactCard from '../components/rep/ContactCard';
import RepPortalHeader from '../components/rep/RepPortalHeader';

export default function RepPortal() {
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [tasks, setTasks] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'opportunities', 'tasks', or 'dispositions'
  const [stageFilter, setStageFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskFilter, setTaskFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [dispositionFilter, setDispositionFilter] = useState('all');
  const [dispositionOptions, setDispositionOptions] = useState([]);
  const [updatingDisposition, setUpdatingDisposition] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const lastPollTime = useRef(new Date());
  const itemsPerPage = 100;

  // Disposition color mapping
  const dispositionColorMap = {
    'Contacted': 'bg-green-500 text-white',
    'No Contact': 'bg-blue-500 text-white',
    'Do Not Call': 'bg-red-500 text-white',
    'Wrong Number': 'bg-red-400 text-white',
    'Left Message': 'bg-amber-500 text-white',
    'Not Interested': 'bg-pink-500 text-white',
    'Call Back': 'bg-indigo-500 text-white',
    'Connected': 'bg-emerald-500 text-white',
    'Voicemail': 'bg-violet-500 text-white'
  };

  const getDispositionColor = (disposition) => {
    if (!disposition) return 'bg-gray-300 text-white';
    
    const lowerDisposition = disposition.toLowerCase();
    if (lowerDisposition.includes('wrong number') || lowerDisposition.includes('do not call')) {
      return 'bg-red-600 text-white';
    }
    
    return dispositionColorMap[disposition] || 'bg-gray-400 text-white';
  };

  useEffect(() => {
    checkSession();
    
    // Restore state from sessionStorage
    const savedState = sessionStorage.getItem('repPortalState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setActiveTab(state.activeTab || 'leads');
      setStageFilter(state.stageFilter || null);
      setSearchTerm(state.searchTerm || '');
      setCurrentPage(state.currentPage || 1);
      setTaskFilter(state.taskFilter || 'all');
    }
  }, []);

  // Poll for new SMS notifications globally (from contacts with phone numbers)
  useEffect(() => {
    if (!session || !contacts.length) return;
    
    const pollSms = async () => {
      const currentTime = new Date();
      
      try {
        // Check contacts with phone numbers for SMS
        const contactsWithPhone = contacts.filter(c => c.MobilePhone || c.Phone);
        
        for (const contact of contactsWithPhone.slice(0, 5)) {
          try {
            const phone = (contact.MobilePhone || contact.Phone)?.replace(/\D/g, '');
            if (!phone) continue;
            
            const response = await base44.functions.invoke('getTwilioSmsHistory', {
              phoneNumber: phone,
              recordId: contact.Id,
              recordType: 'Contact',
              token: session.token,
              instanceUrl: session.instanceUrl
            });
            
            const messages = response.data.messages || [];
            const inboundMessages = messages.filter(m => {
              // Only notify on messages received after the last poll
              const msgDate = new Date(m.date);
              return m.direction === 'inbound' && msgDate > lastPollTime.current;
            });
            
            inboundMessages.forEach(msg => {
              // Find related lead or opportunity to link to
              const phone = (contact.MobilePhone || contact.Phone)?.replace(/\D/g, '');
              const email = contact.Email?.toLowerCase();

              console.log('SMS Notification - Contact:', contact.Name, 'Phone:', phone, 'Email:', email, 'AccountId:', contact.AccountId);

              let link = createPageUrl('ContactDetail') + `?id=${contact.Id}`;
              let recordId = contact.Id;
              let recordType = 'Contact';

              // Check for related lead first
              const relatedLead = leads.find(l => {
                const leadPhone = l.MobilePhone?.replace(/\D/g, '');
                const leadEmail = l.Email?.toLowerCase();
                const phoneMatch = leadPhone === phone;
                const emailMatch = leadEmail === email;
                if (phoneMatch || emailMatch) {
                  console.log('MATCH - Lead:', l.Name, 'phoneMatch:', phoneMatch, 'emailMatch:', emailMatch);
                }
                return phoneMatch || emailMatch;
              });

              if (relatedLead) {
                console.log('✓ Using Lead:', relatedLead.Name, relatedLead.Id);
                link = createPageUrl('LeadDetail') + `?id=${relatedLead.Id}`;
                recordId = relatedLead.Id;
                recordType = 'Lead';
              } else {
                console.log('No lead found, checking opportunities...');
                // Check for related opportunity through account
                const relatedOpp = opportunities.find(o => {
                  const match = o.AccountId === contact.AccountId && contact.AccountId;
                  if (match) {
                    console.log('MATCH - Opportunity:', o.Name, 'AccountId:', o.AccountId);
                  }
                  return match;
                });

                if (relatedOpp) {
                  console.log('✓ Using Opportunity:', relatedOpp.Name, relatedOpp.Id);
                  link = createPageUrl('OpportunityDetail') + `?id=${relatedOpp.Id}`;
                  recordId = relatedOpp.Id;
                  recordType = 'Opportunity';
                } else {
                  console.log('✗ No lead or opportunity found, using Contact');
                }
              }

              console.log('Final notification:', { link, recordId, recordType });

              addNotification({
                title: `New SMS from ${contact.Name}`,
                message: msg.body,
                smsSid: msg.sid,
                link: link,
                recordId: recordId,
                recordType: recordType
              });
            });
          } catch (err) {
            // Silent fail for individual contacts
          }
        }
      } catch (error) {
        // Silent fail
      } finally {
        lastPollTime.current = currentTime;
      }
    };

    const interval = setInterval(pollSms, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [session, contacts, addNotification]);

  useEffect(() => {
    // Save state to sessionStorage whenever it changes
    const state = {
      activeTab,
      stageFilter,
      searchTerm,
      currentPage,
      taskFilter
    };
    sessionStorage.setItem('repPortalState', JSON.stringify(state));
  }, [activeTab, stageFilter, searchTerm, currentPage, taskFilter]);

  const checkSession = () => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
      setIsAdmin(parsed.isAdmin || false);
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

  const handleOAuthCallback = async (code) => {
    try {
      const response = await base44.functions.invoke('salesforceAuth', {
        action: 'exchangeCode',
        code
      });

      const sessionData = {
        userId: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        instanceUrl: response.data.instanceUrl,
        token: response.data.token,
        isAdmin: response.data.isAdmin,
        timestamp: Date.now()
      };

      console.log('Session stored:', { userId: sessionData.userId, email: sessionData.email, tokenType: typeof sessionData.token, tokenExists: !!sessionData.token });
      sessionStorage.setItem('sfSession', JSON.stringify(sessionData));
      setSession(sessionData);
      setIsAdmin(response.data.isAdmin || false);
      window.history.replaceState({}, '', createPageUrl('RepPortal'));
      loadData(sessionData);
    } catch (error) {
      console.error('OAuth error:', error);
      alert(`Failed to authenticate: ${error.response?.data?.error || error.message}`);
      setLoading(false);
    }
  };
  


  const handleLogout = async () => {
    if (session?.token && session?.instanceUrl) {
      try {
        await fetch(`${session.instanceUrl}/services/oauth2/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `token=${session.token}`
        });
      } catch (error) {
        console.error('Error revoking token:', error);
      }
    }
    
    sessionStorage.removeItem('sfSession');
    setSession(null);
    setLeads([]);
    setOpportunities([]);
    setTasks(null);
    window.location.reload();
  };

  const loadData = async (sessionData, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      console.log('loadData - Session data:', { 
        userId: sessionData.userId, 
        hasToken: !!sessionData.token, 
        tokenLength: sessionData.token?.length,
        instanceUrl: sessionData.instanceUrl 
      });

      const [leadsRes, oppsRes, tasksRes] = await Promise.all([
                        base44.functions.invoke('getRepLeads', {
                          userId: sessionData.userId,
                          token: sessionData.token,
                          instanceUrl: sessionData.instanceUrl
                        }),
                        base44.functions.invoke('getRepOpportunities', {
                          userId: sessionData.userId,
                          token: sessionData.token,
                          instanceUrl: sessionData.instanceUrl
                        }),
                        base44.functions.invoke('getSalesforceTasks', {
                          userId: sessionData.userId,
                          token: sessionData.token,
                          instanceUrl: sessionData.instanceUrl
                        })
                      ]);

              setLeads(leadsRes.data.leads || []);
              setOpportunities(oppsRes.data.opportunities || []);
              setTasks(tasksRes.data);

              // Load contacts separately with error handling
              try {
                console.log('Loading contacts for userId:', sessionData.userId);
                const contactsRes = await base44.functions.invoke('getRepContacts', {
                  userId: sessionData.userId,
                  token: sessionData.token,
                  instanceUrl: sessionData.instanceUrl
                });
                console.log('Contacts response:', contactsRes.data);
                console.log('Contacts count:', contactsRes.data.contacts?.length || 0);
                console.log('First contact:', contactsRes.data.contacts?.[0]);
                setContacts(contactsRes.data.contacts || []);
              } catch (error) {
                console.error('Contacts load error:', error);
                console.error('Error response:', error.response?.data);
                setContacts([]);
              }
              setLoadingContacts(false);
      setLoadingTasks(false);

      // Load disposition options separately so it doesn't break the main data load
      try {
        const dispositionRes = await base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'Lead',
          fieldName: 'Call_Disposition__c',
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        });
        setDispositionOptions(dispositionRes.data.values || []);
      } catch (err) {
        console.error('Load disposition error:', err);
      }
    } catch (error) {
      console.error('Load error:', error);
      setLoadingTasks(false);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    if (session) {
      loadData(session, true);
    }
  };

  const handleDispositionUpdate = async (leadId, newDisposition) => {
    setUpdatingDisposition(leadId);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: leadId,
        data: { Call_Disposition__c: newDisposition },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      setLeads(leads.map(lead => 
        lead.Id === leadId ? { ...lead, Call_Disposition__c: newDisposition } : lead
      ));
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update call disposition');
    } finally {
      setUpdatingDisposition(null);
    }
  };

  const handleStageClick = (stageName) => {
    setStageFilter(stageName);
    setSearchTerm('');
    setCurrentPage(1);
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

    let stageMatch = true;
    if (stageFilter) {
      if (stageFilter === 'Declined') {
        stageMatch = opp.StageName && opp.StageName.includes('Declined');
      } else {
        stageMatch = opp.StageName === stageFilter;
      }
    }

    return searchMatch && stageMatch;
  });

  // Pagination
  const totalLeadPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const totalOppPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIdx, endIdx);
  const paginatedOpportunities = filteredOpportunities.slice(startIdx, endIdx);

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
      <RepPortalHeader
        isAdmin={isAdmin}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        userName={session.name}
        showCreateTask={true}
        onCreateTaskClick={() => setShowCreateTask(true)}
      />

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => { setActiveTab('leads'); setStageFilter(null); setCurrentPage(1); }}
            className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all min-h-[120px] ${
              activeTab === 'leads' ? 'ring-2 ring-rose-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Active Leads</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{leads.length}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => { setActiveTab('opportunities'); setStageFilter(null); setCurrentPage(1); }}
            className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all min-h-[120px] ${
              activeTab === 'opportunities' ? 'ring-2 ring-orange-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Open Opportunities</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{opportunities.length}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ${opportunities.reduce((sum, o) => sum + (o.Amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <TaskCard 
            tasksData={tasks} 
            loading={loadingTasks}
            onClick={() => { setActiveTab('tasks'); setTaskFilter('all'); setCurrentPage(1); }}
            isActive={activeTab === 'tasks'}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => { setActiveTab('dispositions'); setDispositionFilter('all'); setCurrentPage(1); }}
            className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all min-h-[120px] ${
              activeTab === 'dispositions' ? 'ring-2 ring-sky-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Call Dispositions</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{leads.filter(l => l.Call_Disposition__c).length}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">of {leads.length} leads</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>
          </div>

        {/* Pipeline */}
        {activeTab !== 'tasks' && activeTab !== 'dispositions' && (
          <PipelineView 
            leads={leads} 
            opportunities={opportunities} 
            activeTab={activeTab}
            onStageClick={handleStageClick} 
          />
        )}

        {/* Search & Content */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
          {activeTab === 'leads' && (
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>
          )}
          {activeTab === 'opportunities' && (
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={taskFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTaskFilter('all'); setCurrentPage(1); }}
                  className={taskFilter === 'all' ? 'bg-purple-600' : ''}
                >
                  All ({tasks?.total || 0})
                </Button>
                <Button
                  variant={taskFilter === 'overdue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTaskFilter('overdue'); setCurrentPage(1); }}
                  className={taskFilter === 'overdue' ? 'bg-red-600' : ''}
                >
                  Overdue ({tasks?.categorized?.overdue?.length || 0})
                </Button>
                <Button
                  variant={taskFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTaskFilter('today'); setCurrentPage(1); }}
                  className={taskFilter === 'today' ? 'bg-orange-600' : ''}
                >
                  Due Today ({tasks?.categorized?.dueToday?.length || 0})
                </Button>
                <Button
                  variant={taskFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setTaskFilter('week'); setCurrentPage(1); }}
                  className={taskFilter === 'week' ? 'bg-blue-600' : ''}
                >
                  This Week ({tasks?.categorized?.dueThisWeek?.length || 0})
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              {stageFilter && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm text-blue-900">Filtering by: <strong>{stageFilter}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => { setStageFilter(null); setCurrentPage(1); }}>Clear Filter</Button>
                </div>
              )}
              <div className="space-y-3">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No leads found</p>
                  </div>
                ) : (
                  paginatedLeads.map(lead => (
                    <LeadCard 
                      key={lead.Id} 
                      lead={lead} 
                      session={session}
                    />
                  ))
                )}
              </div>
              {totalLeadPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-slate-600">
                    Showing {startIdx + 1}-{Math.min(endIdx, filteredLeads.length)} of {filteredLeads.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalLeadPages) }, (_, i) => {
                        let pageNum;
                        if (totalLeadPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalLeadPages - 2) {
                          pageNum = totalLeadPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalLeadPages, p + 1))}
                      disabled={currentPage === totalLeadPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )}

            {activeTab === 'opportunities' && (
            <div>
              {stageFilter && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm text-blue-900">Filtering by: <strong>{stageFilter}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => { setStageFilter(null); setCurrentPage(1); }}>Clear Filter</Button>
                </div>
              )}
              <div className="space-y-3">
                {filteredOpportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No opportunities found</p>
                  </div>
                ) : (
                  paginatedOpportunities.map(opp => (
                    <OpportunityCard 
                      key={opp.Id}
                      opportunity={opp} 
                      session={session}
                      onUpdate={() => loadData(session)}
                    />
                  ))
                  )}
              </div>
              {totalOppPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-slate-600">
                    Showing {startIdx + 1}-{Math.min(endIdx, filteredOpportunities.length)} of {filteredOpportunities.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalOppPages) }, (_, i) => {
                        let pageNum;
                        if (totalOppPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalOppPages - 2) {
                          pageNum = totalOppPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalOppPages, p + 1))}
                      disabled={currentPage === totalOppPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )}

        {activeTab === 'tasks' && (
          <div>
            <div className="space-y-3">
              {(() => {
                let filteredTasks = tasks?.tasks || [];
                if (taskFilter === 'overdue') filteredTasks = tasks?.categorized?.overdue || [];
                else if (taskFilter === 'today') filteredTasks = tasks?.categorized?.dueToday || [];
                else if (taskFilter === 'week') filteredTasks = tasks?.categorized?.dueThisWeek || [];

                const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
                const startIdx = (currentPage - 1) * itemsPerPage;
                const endIdx = startIdx + itemsPerPage;
                const paginatedTasks = filteredTasks.slice(startIdx, endIdx);

                return (
                  <>
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No tasks found</p>
                      </div>
                    ) : (
                      paginatedTasks.map(task => (
                        <TaskItem 
                          key={task.Id} 
                          task={task} 
                          session={session}
                          onUpdate={() => loadData(session, true)}
                          onOpenModal={(task) => setSelectedTask(task)}
                        />
                      ))
                    )}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-6 border-t">
                        <p className="text-sm text-slate-600">
                          Showing {startIdx + 1}-{Math.min(endIdx, filteredTasks.length)} of {filteredTasks.length}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'dispositions' && (
          <div>
            <div className="mb-4 sm:mb-6">
              <div className="relative flex-1 mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <Input
                  placeholder="Search by lead name, company, or phone..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base mb-4"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dispositionFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setDispositionFilter('all'); setCurrentPage(1); }}
                  className={dispositionFilter === 'all' ? 'bg-orange-600' : ''}
                >
                  All ({leads.length})
                </Button>
                <Button
                  variant={dispositionFilter === 'set' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setDispositionFilter('set'); setCurrentPage(1); }}
                  className={dispositionFilter === 'set' ? 'bg-green-600' : ''}
                >
                  Set ({leads.filter(l => l.Call_Disposition__c).length})
                </Button>
                <Button
                  variant={dispositionFilter === 'unset' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setDispositionFilter('unset'); setCurrentPage(1); }}
                  className={dispositionFilter === 'unset' ? 'bg-red-600' : ''}
                >
                  Not Set ({leads.filter(l => !l.Call_Disposition__c).length})
                </Button>
                {dispositionOptions.map(option => (
                  <Button
                    key={option}
                    variant={dispositionFilter === option ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDispositionFilter(option); setCurrentPage(1); }}
                    className={dispositionFilter === option ? 'bg-blue-600' : ''}
                  >
                    {option} ({leads.filter(l => l.Call_Disposition__c === option).length})
                  </Button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-900">Lead Name</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-900">Phone</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-900">Company</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-900">Status</th>
                    <th className="text-left px-4 py-4 text-sm font-bold text-slate-900">Disposition</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let filteredLeads = leads;
                    if (dispositionFilter === 'set') {
                      filteredLeads = leads.filter(l => l.Call_Disposition__c);
                    } else if (dispositionFilter === 'unset') {
                      filteredLeads = leads.filter(l => !l.Call_Disposition__c);
                    } else if (dispositionFilter !== 'all') {
                      filteredLeads = leads.filter(l => l.Call_Disposition__c === dispositionFilter);
                    }

                    if (searchTerm) {
                      const term = searchTerm.toLowerCase();
                      filteredLeads = filteredLeads.filter(lead =>
                        lead.Name?.toLowerCase().includes(term) ||
                        lead.Company?.toLowerCase().includes(term) ||
                        lead.Phone?.toLowerCase().includes(term)
                      );
                    }

                    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
                    const startIdx = (currentPage - 1) * itemsPerPage;
                    const endIdx = startIdx + itemsPerPage;
                    const paginatedLeads = filteredLeads.slice(startIdx, endIdx);

                    return (
                      <>
                        {paginatedLeads.map(lead => (
                          <tr key={lead.Id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-4">
                              <button
                                onClick={() => navigate(createPageUrl('LeadDetail') + `?id=${lead.Id}`)}
                                className="font-semibold text-[#08708E] hover:underline text-left"
                              >
                                {lead.Name || '-'}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                              {lead.MobilePhone ? (
                                <a href={`tel:${lead.MobilePhone}`} className="text-[#08708E] hover:underline font-medium">
                                  {lead.MobilePhone}
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">{lead.Company || '-'}</td>
                            <td className="px-4 py-4 text-xs text-slate-700 font-medium">{lead.Status}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                  lead.Call_Disposition__c 
                                    ? getDispositionColor(lead.Call_Disposition__c)
                                    : 'bg-gray-300 text-gray-800'
                                }`}>
                                  {lead.Call_Disposition__c || 'Not set'}
                                </span>
                                <Select
                                  value={lead.Call_Disposition__c || ''}
                                  onValueChange={(value) => handleDispositionUpdate(lead.Id, value)}
                                  disabled={updatingDisposition === lead.Id}
                                >
                                  <SelectTrigger className="w-20 h-8 text-xs">
                                    <SelectValue>
                                      {updatingDisposition === lead.Id ? 'Updating...' : 'Change'}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dispositionOptions.map(option => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                              No leads found
                            </td>
                          </tr>
                        )}
                        {totalPages > 1 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                  Showing {startIdx + 1}-{Math.min(endIdx, filteredLeads.length)} of {filteredLeads.length}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                  >
                                    Previous
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                  >
                                    Next
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        session={session}
        repsData={[{
          userId: session?.userId,
          name: session?.name,
          leads,
          opportunities
        }]}
        onSuccess={() => loadData(session, true)}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        session={session}
        onUpdate={() => loadData(session, true)}
        />
        </div>
        );
        }