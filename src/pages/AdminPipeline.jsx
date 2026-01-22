import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, DollarSign, Target, Loader2, LogOut, RefreshCw, ChevronDown, ChevronRight, LayoutDashboard, X, Plus, CheckSquare, Search, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import RecordDetailsModal from '../components/rep/RecordDetailsModal';
import CreateTaskModal from '../components/admin/CreateTaskModal';
import TaskDetailsModal from '../components/admin/TaskDetailsModal';

export default function AdminPipeline() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [repsData, setRepsData] = useState([]);
  const [expandedRep, setExpandedRep] = useState(null);
  const [activeView, setActiveView] = useState('leads');
  const [stageFilter, setStageFilter] = useState({});
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [repSearch, setRepSearch] = useState({});
  const [tableSort, setTableSort] = useState({ column: null, direction: 'asc' });
  const [universalSearch, setUniversalSearch] = useState('');
  const [searchResults, setSearchResults] = useState({ leads: [], opportunities: [], tasks: [] });

  useEffect(() => {
    checkSession();
    sessionStorage.setItem('fromAdminPortal', 'true');
    
    const savedState = sessionStorage.getItem('adminPipelineState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setActiveView(state.activeView || 'leads');
      setExpandedRep(state.expandedRep || null);
      setStageFilter(state.stageFilter || {});
      setRepSearch(state.repSearch || {});
      setTableSort(state.tableSort || { column: null, direction: 'asc' });
    }
  }, []);

  useEffect(() => {
    const state = { activeView, expandedRep, stageFilter, repSearch, tableSort };
    sessionStorage.setItem('adminPipelineState', JSON.stringify(state));
  }, [activeView, expandedRep, stageFilter, repSearch, tableSort]);

  const checkSession = () => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
      loadAllRepsData(parsed);
    } else {
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
      alert('Failed to connect to Salesforce.');
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
    setRepsData([]);
    setAllTasks([]);
    window.location.reload();
  };

  const loadAllRepsData = async (sessionData, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [pipelineRes, tasksRes, usersRes] = await Promise.all([
        base44.functions.invoke('getAllRepsPipeline', {
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getAllSalesforceTasks', {
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getSalesforceUsers', {
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);

      setRepsData(pipelineRes.data.reps || []);
      setAllTasks(tasksRes.data.tasks || []);
      setAllUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Load error:', error);
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
      loadAllRepsData(session, true);
    }
  };

  const leadStages = [
    { name: 'Open - Not Contacted', label: 'New', color: 'bg-blue-500' },
    { name: 'Working - Contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { name: 'Working - Application Out', label: 'App Out', color: 'bg-purple-500' },
    { name: 'Application Missing Info', label: 'Missing Info', color: 'bg-orange-500' },
    { name: 'Closed - Not Converted', label: 'Not Converted', color: 'bg-red-500' }
  ];

  const opportunityStages = [
    { name: 'Application In', label: 'App In', color: 'bg-blue-500' },
    { name: 'Underwriting', label: 'Underwriting', color: 'bg-purple-500' },
    { name: 'Approved', label: 'Approved', color: 'bg-green-500' },
    { name: 'Contracts Out', label: 'Contracts Out', color: 'bg-yellow-500' },
    { name: 'Contracts In', label: 'Contracts In', color: 'bg-indigo-500' },
    { name: 'Closed - Funded', label: 'Funded', color: 'bg-green-600' },
    { name: 'Declined', label: 'Declined', color: 'bg-red-500' }
  ];

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getRepTasks = (repUserId) => {
    return allTasks.filter(t => t.OwnerId === repUserId);
  };

  const categorizeTasksByDueDate = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const categorized = {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      upcoming: []
    };

    tasks.forEach(task => {
      if (!task.ActivityDate) {
        categorized.upcoming.push(task);
      } else if (task.ActivityDate < today) {
        categorized.overdue.push(task);
      } else if (task.ActivityDate === today) {
        categorized.dueToday.push(task);
      } else if (task.ActivityDate <= weekEndStr) {
        categorized.dueThisWeek.push(task);
      } else {
        categorized.upcoming.push(task);
      }
    });

    return categorized;
  };

  const getStageCount = (rep, stageName) => {
    if (activeView === 'leads') {
      return rep.leads?.filter(l => l.Status === stageName).length || 0;
    } else if (activeView === 'opportunities') {
      if (stageName === 'Declined') {
        return rep.opportunities?.filter(o => o.StageName?.includes('Declined')).length || 0;
      }
      return rep.opportunities?.filter(o => o.StageName === stageName).length || 0;
    } else {
      const repTasks = getRepTasks(rep.userId);
      const categorized = categorizeTasksByDueDate(repTasks);
      return categorized[stageName]?.length || 0;
    }
  };

  const getStageAmount = (rep, stageName) => {
    if (activeView === 'leads') return 0;
    if (stageName === 'Declined') return 0;
    const opps = rep.opportunities?.filter(o => o.StageName === stageName) || [];
    return opps.reduce((sum, o) => sum + (o.Amount || 0), 0);
  };

  const getTotalPipeline = (rep) => {
    return rep.opportunities?.filter(o => !o.StageName?.includes('Declined')).reduce((sum, o) => sum + (o.Amount || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#08708E] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Admin Pipeline</h1>
          <p className="text-slate-600 mb-8">
            Sign in with Salesforce to view all reps' pipelines
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

  const taskCategories = [
    { name: 'overdue', label: 'Overdue', color: 'bg-red-500' },
    { name: 'dueToday', label: 'Today', color: 'bg-orange-500' },
    { name: 'dueThisWeek', label: 'This Week', color: 'bg-blue-500' },
    { name: 'upcoming', label: 'Upcoming', color: 'bg-slate-500' }
  ];

  const stages = activeView === 'leads' ? leadStages : activeView === 'opportunities' ? opportunityStages : taskCategories;

  let allRepsData = allUsers.map(user => {
    const existingRep = repsData.find(r => r.userId === user.Id);
    return existingRep || {
      userId: user.Id,
      name: user.Name,
      email: user.Email,
      leads: [],
      opportunities: []
    };
  });

  if (tableSort.column) {
    allRepsData = [...allRepsData].sort((a, b) => {
      let aVal, bVal;
      if (tableSort.column === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else {
        aVal = getStageCount(a, tableSort.column);
        bVal = getStageCount(b, tableSort.column);
      }
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return tableSort.direction === 'asc' ? comparison : -comparison;
    });
  }

  const totalLeads = allRepsData.reduce((sum, rep) => sum + (rep.leads?.length || 0), 0);
  const totalOpps = allRepsData.reduce((sum, rep) => sum + (rep.opportunities?.length || 0), 0);
  const totalPipelineValue = allRepsData.reduce((sum, rep) => sum + getTotalPipeline(rep), 0);
  const totalTasks = allTasks.length;
  const openTasks = allTasks.filter(t => t.Status !== 'Completed').length;

  const handleUniversalSearch = (searchTerm) => {
    setUniversalSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setSearchResults({ leads: [], opportunities: [], tasks: [] });
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = { leads: [], opportunities: [], tasks: [] };

    allRepsData.forEach(rep => {
      rep.leads?.forEach(lead => {
        if (
          lead.Name?.toLowerCase().includes(term) ||
          lead.Company?.toLowerCase().includes(term) ||
          lead.Email?.toLowerCase().includes(term) ||
          lead.Phone?.toLowerCase().includes(term) ||
          lead.Status?.toLowerCase().includes(term)
        ) {
          results.leads.push({ ...lead, ownerName: rep.name });
        }
      });
    });

    allRepsData.forEach(rep => {
      rep.opportunities?.forEach(opp => {
        if (
          opp.Name?.toLowerCase().includes(term) ||
          opp.Account?.Name?.toLowerCase().includes(term) ||
          opp.StageName?.toLowerCase().includes(term) ||
          (opp.Amount && opp.Amount.toString().includes(term))
        ) {
          results.opportunities.push({ ...opp, ownerName: rep.name });
        }
      });
    });

    allTasks.forEach(task => {
      if (
        task.Subject?.toLowerCase().includes(term) ||
        task.Description?.toLowerCase().includes(term) ||
        task.Status?.toLowerCase().includes(term) ||
        task.What?.Name?.toLowerCase().includes(term)
      ) {
        const owner = allUsers.find(u => u.Id === task.OwnerId);
        results.tasks.push({ ...task, ownerName: owner?.Name });
      }
    });

    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Admin Pipeline</h1>
              <p className="text-xs sm:text-sm text-slate-600 truncate">Manage team performance</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
               <Button onClick={() => setShowCreateTask(true)} className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 min-h-[44px]">
                 <Plus className="w-4 h-4 sm:mr-2" />
                 <span className="hidden sm:inline">Create Task</span>
               </Button>
               <Link to={createPageUrl('RepPortal')} className="flex-1 sm:flex-initial">
                 <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
                   <Users className="w-4 h-4 sm:mr-2" />
                   <span className="hidden sm:inline">Rep Portal</span>
                 </Button>
               </Link>
               <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex-1 sm:flex-initial min-h-[44px]">
                 <RefreshCw className={`w-4 h-4 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                 <span className="hidden sm:inline">Refresh</span>
               </Button>
               <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-initial min-h-[44px]">
                 <LogOut className="w-4 h-4 sm:mr-2" />
                 <span className="hidden sm:inline">Logout</span>
               </Button>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm min-h-[120px]">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{allUsers.length}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} onClick={() => setActiveView('leads')} className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all hover:shadow-md min-h-[120px] ${activeView === 'leads' ? 'ring-2 ring-[#08708E]' : ''}`}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Leads</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalLeads}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onClick={() => setActiveView('opportunities')} className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all hover:shadow-md min-h-[120px] ${activeView === 'opportunities' ? 'ring-2 ring-[#08708E]' : ''}`}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Opportunities</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalOpps}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl p-4 sm:p-6 shadow-sm min-h-[120px]">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Pipeline</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onClick={() => setActiveView('tasks')} className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm cursor-pointer transition-all hover:shadow-md min-h-[120px] ${activeView === 'tasks' ? 'ring-2 ring-[#08708E]' : ''}`}>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Open Tasks</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{openTasks}</p>
                <p className="text-xs text-slate-500 mt-1">of {totalTasks} total</p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search across all leads, opportunities, and tasks..."
              value={universalSearch}
              onChange={(e) => handleUniversalSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {universalSearch && (
              <button onClick={() => handleUniversalSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {universalSearch && (
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              {searchResults.leads.length === 0 && searchResults.opportunities.length === 0 && searchResults.tasks.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No results found</p>
              ) : (
                <>
                  {searchResults.leads.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Leads ({searchResults.leads.length})</h4>
                      <div className="space-y-2">
                        {searchResults.leads.map(lead => (
                          <button key={lead.Id} onClick={() => navigate(createPageUrl('LeadDetail') + `?id=${lead.Id}`)} className="w-full bg-slate-50 hover:bg-slate-100 rounded-lg p-3 text-left transition-colors border border-slate-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-slate-900">{lead.Name}</p>
                                <p className="text-xs text-slate-500">{lead.Company}</p>
                                <p className="text-xs text-slate-600 mt-1">Owner: {lead.ownerName}</p>
                              </div>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{lead.Status}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.opportunities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Opportunities ({searchResults.opportunities.length})</h4>
                      <div className="space-y-2">
                        {searchResults.opportunities.map(opp => (
                          <button key={opp.Id} onClick={() => navigate(createPageUrl('OpportunityDetail') + `?id=${opp.Id}`)} className="w-full bg-slate-50 hover:bg-slate-100 rounded-lg p-3 text-left transition-colors border border-slate-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-slate-900">{opp.Name}</p>
                                <p className="text-xs text-slate-500">{opp.Account?.Name}</p>
                                <p className="text-xs text-slate-600 mt-1">Owner: {opp.ownerName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[#08708E] text-sm">{formatCurrency(opp.Amount || 0)}</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">{opp.StageName}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Tasks ({searchResults.tasks.length})</h4>
                      <div className="space-y-2">
                        {searchResults.tasks.map(task => (
                          <button key={task.Id} onClick={() => setSelectedTask(task)} className="w-full bg-slate-50 hover:bg-slate-100 rounded-lg p-3 text-left transition-colors border border-slate-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{task.Subject}</p>
                                {task.What?.Name && <p className="text-xs text-purple-600 mt-1">Related: {task.What.Name}</p>}
                                <p className="text-xs text-slate-600 mt-1">Owner: {task.ownerName}</p>
                              </div>
                              <div className="text-right ml-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">{task.Status}</span>
                                {task.ActivityDate && <p className="text-xs text-slate-500 mt-1">{new Date(task.ActivityDate).toLocaleDateString()}</p>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[800px] md:min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="text-left px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 min-w-[180px] md:min-w-[250px] cursor-pointer hover:bg-slate-100 transition-colors sticky left-0 bg-slate-50 z-10" onClick={() => setTableSort(prev => ({ column: 'name', direction: prev.column === 'name' && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                    <div className="flex items-center gap-2">
                      Rep Name
                      {tableSort.column === 'name' ? (tableSort.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />) : <ArrowUpDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </th>
                  {stages.map((stage, idx) => (
                    <th key={idx} className="text-center px-2 md:px-3 py-2 md:py-4 text-[10px] md:text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setTableSort(prev => ({ column: stage.name, direction: prev.column === stage.name && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                      <div className="flex items-center justify-center gap-1">
                        {stage.label}
                        {tableSort.column === stage.name ? (tableSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                      </div>
                    </th>
                  ))}
                  <th className="text-right px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-700 min-w-[100px] md:min-w-[140px]">
                    {activeView === 'opportunities' ? 'Pipeline' : activeView === 'tasks' ? 'Tasks' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allRepsData.map((rep, repIdx) => {
                  const totalCount = activeView === 'leads' ? rep.leads?.length || 0 : activeView === 'opportunities' ? rep.opportunities?.length || 0 : getRepTasks(rep.userId).length;
                  const pipelineValue = getTotalPipeline(rep);
                  const isExpanded = expandedRep === rep.userId;

                  return (
                    <React.Fragment key={rep.userId}>
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: repIdx * 0.05 }} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setExpandedRep(isExpanded ? null : rep.userId)}>
                        <td className="px-3 md:px-6 py-3 md:py-4 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2 md:gap-3">
                            <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                              {isExpanded ? <ChevronDown className="w-4 md:w-5 h-4 md:h-5" /> : <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />}
                            </button>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 text-xs md:text-sm truncate">{rep.name}</p>
                              <p className="text-[10px] md:text-xs text-slate-500 truncate">{rep.email}</p>
                            </div>
                          </div>
                        </td>
                        {stages.map((stage, idx) => {
                          const count = getStageCount(rep, stage.name);
                          const amount = getStageAmount(rep, stage.name);
                          const isActiveFilter = stageFilter[rep.userId] === stage.name;
                          return (
                            <td key={idx} className="px-2 md:px-3 py-2 md:py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={(e) => { e.stopPropagation(); if (count > 0) { setStageFilter(prev => ({ ...prev, [rep.userId]: prev[rep.userId] === stage.name ? null : stage.name })); if (!isExpanded) setExpandedRep(rep.userId); }}}>
                              <div className="flex flex-col items-center gap-0.5 md:gap-1">
                                <span className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg ${count > 0 ? stage.color : 'bg-slate-200'} text-white font-semibold text-xs md:text-sm transition-all ${isActiveFilter ? 'ring-1 md:ring-2 ring-offset-1 md:ring-offset-2 ring-slate-900' : ''}`}>{count}</span>
                                {activeView === 'opportunities' && amount > 0 && <span className="text-[10px] md:text-xs text-slate-600 whitespace-nowrap">{formatCurrency(amount)}</span>}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-900 text-sm md:text-lg">{totalCount}</span>
                            {activeView === 'opportunities' && pipelineValue > 0 && <span className="text-xs md:text-sm text-[#08708E] font-semibold whitespace-nowrap">{formatCurrency(pipelineValue)}</span>}
                          </div>
                        </td>
                      </motion.tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={stages.length + 2} className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-900">
                                  {activeView === 'leads' ? 'Leads' : activeView === 'opportunities' ? 'Opportunities' : 'Tasks'} Details
                                  {stageFilter[rep.userId] && <span className="ml-2 text-sm font-normal text-slate-600">(Filtered by: {stages.find(s => s.name === stageFilter[rep.userId])?.label})</span>}
                                </h4>
                                {stageFilter[rep.userId] && (
                                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setStageFilter(prev => ({ ...prev, [rep.userId]: null })); }} className="text-xs">Clear Filter</Button>
                                )}
                              </div>
                              <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder={`Search ${activeView === 'leads' ? 'leads' : activeView === 'opportunities' ? 'opportunities' : 'tasks'}...`} value={repSearch[rep.userId] || ''} onChange={(e) => { e.stopPropagation(); setRepSearch(prev => ({ ...prev, [rep.userId]: e.target.value })); }} onClick={(e) => e.stopPropagation()} className="pl-10" />
                              </div>
                              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                {activeView === 'leads' ? rep.leads?.filter(lead => {
                                  const stageMatch = !stageFilter[rep.userId] || lead.Status === stageFilter[rep.userId];
                                  const searchTerm = (repSearch[rep.userId] || '').toLowerCase();
                                  const searchMatch = !searchTerm || lead.Name?.toLowerCase().includes(searchTerm) || lead.Company?.toLowerCase().includes(searchTerm) || lead.Email?.toLowerCase().includes(searchTerm) || lead.Status?.toLowerCase().includes(searchTerm);
                                  return stageMatch && searchMatch;
                                }).map((lead, idx) => (
                                  <button key={idx} onClick={(e) => { e.stopPropagation(); sessionStorage.setItem('fromAdminPortal', 'true'); navigate(createPageUrl('LeadDetail') + `?id=${lead.Id}`); }} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-[#08708E] transition-all text-left w-full">
                                    <div>
                                      <p className="font-medium text-slate-900">{lead.Name}</p>
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{lead.Company}</span>
                                        {lead.Phone && (<><span>•</span><a href={`tel:${lead.Phone}`} className="text-[#08708E] hover:underline font-medium">{lead.Phone}</a></>)}
                                        <span>•</span>
                                        <span>{lead.Email}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">{lead.Status}</span>
                                  </button>
                                )) : activeView === 'opportunities' ? rep.opportunities?.filter(opp => {
                                  const stageMatch = !stageFilter[rep.userId] || (stageFilter[rep.userId] === 'Declined' ? opp.StageName?.includes('Declined') : opp.StageName === stageFilter[rep.userId]);
                                  const searchTerm = (repSearch[rep.userId] || '').toLowerCase();
                                  const searchMatch = !searchTerm || opp.Name?.toLowerCase().includes(searchTerm) || opp.Account?.Name?.toLowerCase().includes(searchTerm) || opp.StageName?.toLowerCase().includes(searchTerm);
                                  return stageMatch && searchMatch;
                                }).map((opp, idx) => (
                                  <button key={idx} onClick={(e) => { e.stopPropagation(); sessionStorage.setItem('fromAdminPortal', 'true'); navigate(createPageUrl('OpportunityDetail') + `?id=${opp.Id}`); }} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-[#08708E] transition-all text-left w-full">
                                    <div>
                                      <p className="font-medium text-slate-900">{opp.Name}</p>
                                      <p className="text-xs text-slate-500">{opp.Account?.Name}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-[#08708E]">{formatCurrency(opp.Amount || 0)}</p>
                                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{opp.StageName}</span>
                                    </div>
                                  </button>
                                )) : (() => {
                                  const repTasks = getRepTasks(rep.userId);
                                  const categorized = categorizeTasksByDueDate(repTasks);
                                  let tasksToShow = repTasks;
                                  if (stageFilter[rep.userId]) tasksToShow = categorized[stageFilter[rep.userId]] || [];
                                  const searchTerm = (repSearch[rep.userId] || '').toLowerCase();
                                  if (searchTerm) tasksToShow = tasksToShow.filter(task => task.Subject?.toLowerCase().includes(searchTerm) || task.Description?.toLowerCase().includes(searchTerm) || task.Status?.toLowerCase().includes(searchTerm) || task.What?.Name?.toLowerCase().includes(searchTerm));
                                  return tasksToShow.map((task, idx) => (
                                    <button key={idx} onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }} className="w-full bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-500 transition-all text-left">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <p className="font-medium text-slate-900">{task.Subject}</p>
                                          {task.Description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.Description}</p>}
                                          {task.What?.Name && <p className="text-xs text-purple-600 mt-1">Related: {task.What.Name}</p>}
                                        </div>
                                        <div className="text-right ml-3">
                                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 block mb-1">{task.Status}</span>
                                          {task.ActivityDate && <span className="text-xs text-slate-500">{new Date(task.ActivityDate).toLocaleDateString()}</span>}
                                        </div>
                                      </div>
                                    </button>
                                  ));
                                })()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
          </div>
        </div>

        <CreateTaskModal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} session={session} repsData={repsData} onSuccess={() => loadAllRepsData(session, true)} />
      <TaskDetailsModal task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} session={session} onUpdate={() => loadAllRepsData(session, true)} />
      </div>
    </div>
  );
}