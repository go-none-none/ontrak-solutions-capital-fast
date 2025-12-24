import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Target, Loader2, LogOut, RefreshCw, ChevronDown, ChevronRight, LayoutDashboard, X, Plus, CheckSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import RecordDetailsModal from '../components/rep/RecordDetailsModal';
import CreateTaskModal from '../components/admin/CreateTaskModal';
import TaskDetailsModal from '../components/admin/TaskDetailsModal';

export default function AdminPipeline() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [repsData, setRepsData] = useState([]);
  const [expandedRep, setExpandedRep] = useState(null);
  const [activeView, setActiveView] = useState('leads'); // 'leads', 'opportunities', or 'tasks'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [stageFilter, setStageFilter] = useState({}); // {repUserId: stageName}
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [expandedRecordType, setExpandedRecordType] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    checkSession();
  }, []);

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
      // tasks view
      const repTasks = getRepTasks(rep.userId);
      const categorized = categorizeTasksByDueDate(repTasks);
      return categorized[stageName]?.length || 0;
    }
  };

  const getStageAmount = (rep, stageName) => {
    if (activeView === 'leads') return 0;
    
    // Don't show amounts for declined stage
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
  
  // Merge all users with reps data
  const allRepsData = allUsers.map(user => {
    const existingRep = repsData.find(r => r.userId === user.Id);
    return existingRep || {
      userId: user.Id,
      name: user.Name,
      email: user.Email,
      leads: [],
      opportunities: []
    };
  });

  const totalLeads = allRepsData.reduce((sum, rep) => sum + (rep.leads?.length || 0), 0);
  const totalOpps = allRepsData.reduce((sum, rep) => sum + (rep.opportunities?.length || 0), 0);
  const totalPipelineValue = allRepsData.reduce((sum, rep) => sum + getTotalPipeline(rep), 0);
  const totalTasks = allTasks.length;
  const openTasks = allTasks.filter(t => t.Status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Pipeline Dashboard</h1>
              <p className="text-sm text-slate-600">Overview of all reps' performance</p>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('RepPortal')}>
                <Button variant="outline">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Rep Portal
                </Button>
              </Link>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{allUsers.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-slate-900">{totalLeads}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Opportunities</p>
                <p className="text-3xl font-bold text-slate-900">{totalOpps}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Total Pipeline</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Open Tasks</p>
                <p className="text-3xl font-bold text-slate-900">{openTasks}</p>
                <p className="text-xs text-slate-500 mt-1">of {totalTasks} total</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <CheckSquare className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* View Toggle & Create Task */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveView('leads')}
              variant={activeView === 'leads' ? 'default' : 'outline'}
              className={activeView === 'leads' ? 'bg-[#08708E] hover:bg-[#065a72]' : ''}
            >
              <Target className="w-4 h-4 mr-2" />
              Leads Pipeline
            </Button>
            <Button
              onClick={() => setActiveView('opportunities')}
              variant={activeView === 'opportunities' ? 'default' : 'outline'}
              className={activeView === 'opportunities' ? 'bg-[#08708E] hover:bg-[#065a72]' : ''}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Opportunities Pipeline
            </Button>
            <Button
              onClick={() => setActiveView('tasks')}
              variant={activeView === 'tasks' ? 'default' : 'outline'}
              className={activeView === 'tasks' ? 'bg-[#08708E] hover:bg-[#065a72]' : ''}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </Button>
          </div>
          <Button onClick={() => setShowCreateTask(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Reps Pipeline Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 min-w-[250px]">Rep Name</th>
                  {stages.map((stage, idx) => (
                    <th key={idx} className="text-center px-3 py-4 text-xs font-semibold text-slate-700">
                      {stage.label}
                    </th>
                  ))}
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 min-w-[140px]">
                    {activeView === 'opportunities' ? 'Pipeline' : activeView === 'tasks' ? 'Tasks' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allRepsData.map((rep, repIdx) => {
                  const totalCount = activeView === 'leads' 
                    ? rep.leads?.length || 0 
                    : activeView === 'opportunities'
                      ? rep.opportunities?.length || 0
                      : getRepTasks(rep.userId).length;
                  const pipelineValue = getTotalPipeline(rep);
                  const isExpanded = expandedRep === rep.userId;

                  return (
                    <React.Fragment key={rep.userId}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: repIdx * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRep(isExpanded ? null : rep.userId)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            <div>
                              <p className="font-medium text-slate-900">{rep.name}</p>
                              <p className="text-xs text-slate-500">{rep.email}</p>
                            </div>
                          </div>
                        </td>
                        {stages.map((stage, idx) => {
                          const count = getStageCount(rep, stage.name);
                          const amount = getStageAmount(rep, stage.name);
                          const isActiveFilter = stageFilter[rep.userId] === stage.name;
                          return (
                            <td 
                              key={idx} 
                              className="px-3 py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (count > 0) {
                                  setStageFilter(prev => ({
                                    ...prev,
                                    [rep.userId]: prev[rep.userId] === stage.name ? null : stage.name
                                  }));
                                  if (!isExpanded) {
                                    setExpandedRep(rep.userId);
                                  }
                                }
                              }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${count > 0 ? stage.color : 'bg-slate-200'} text-white font-semibold text-sm transition-all ${isActiveFilter ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}>
                                  {count}
                                </span>
                                {activeView === 'opportunities' && amount > 0 && (
                                  <span className="text-xs text-slate-600 whitespace-nowrap">{formatCurrency(amount)}</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-900 text-lg">{totalCount}</span>
                            {activeView === 'opportunities' && pipelineValue > 0 && (
                              <span className="text-sm text-[#08708E] font-semibold whitespace-nowrap">{formatCurrency(pipelineValue)}</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={stages.length + 2} className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-900">
                                  {activeView === 'leads' ? 'Leads' : activeView === 'opportunities' ? 'Opportunities' : 'Tasks'} Details
                                  {stageFilter[rep.userId] && (
                                    <span className="ml-2 text-sm font-normal text-slate-600">
                                      (Filtered by: {stages.find(s => s.name === stageFilter[rep.userId])?.label})
                                    </span>
                                  )}
                                </h4>
                                {stageFilter[rep.userId] && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStageFilter(prev => ({ ...prev, [rep.userId]: null }));
                                    }}
                                    className="text-xs"
                                  >
                                    Clear Filter
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                {activeView === 'leads' 
                                  ? rep.leads?.filter(lead => {
                                      if (!stageFilter[rep.userId]) return true;
                                      return lead.Status === stageFilter[rep.userId];
                                    }).map((lead, idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedRecord(lead);
                                          setModalType('lead');
                                        }}
                                        className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-[#08708E] transition-all text-left w-full"
                                      >
                                        <div>
                                          <p className="font-medium text-slate-900">{lead.Name}</p>
                                          <p className="text-xs text-slate-500">{lead.Company} • {lead.Email}</p>
                                        </div>
                                        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                                          {lead.Status}
                                        </span>
                                      </button>
                                    ))
                                  : activeView === 'opportunities'
                                    ? rep.opportunities?.filter(opp => {
                                        if (!stageFilter[rep.userId]) return true;
                                        if (stageFilter[rep.userId] === 'Declined') {
                                          return opp.StageName?.includes('Declined');
                                        }
                                        return opp.StageName === stageFilter[rep.userId];
                                      }).map((opp, idx) => (
                                        <button
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRecord(opp);
                                            setModalType('opportunity');
                                          }}
                                          className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-[#08708E] transition-all text-left w-full"
                                        >
                                          <div>
                                            <p className="font-medium text-slate-900">{opp.Name}</p>
                                            <p className="text-xs text-slate-500">{opp.Account?.Name}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-[#08708E]">{formatCurrency(opp.Amount || 0)}</p>
                                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                              {opp.StageName}
                                            </span>
                                          </div>
                                        </button>
                                      ))
                                    : (() => {
                                        const repTasks = getRepTasks(rep.userId);
                                        const categorized = categorizeTasksByDueDate(repTasks);
                                        let tasksToShow = repTasks;
                                        
                                        if (stageFilter[rep.userId]) {
                                          tasksToShow = categorized[stageFilter[rep.userId]] || [];
                                        }

                                        return tasksToShow.map((task, idx) => (
                                          <button
                                            key={idx}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTask(task);
                                            }}
                                            className="w-full bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-500 transition-all text-left"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <p className="font-medium text-slate-900">{task.Subject}</p>
                                                {task.Description && (
                                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.Description}</p>
                                                )}
                                                {task.What?.Name && (
                                                  <p className="text-xs text-purple-600 mt-1">Related: {task.What.Name}</p>
                                                )}
                                              </div>
                                              <div className="text-right ml-3">
                                                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 block mb-1">
                                                  {task.Status}
                                                </span>
                                                {task.ActivityDate && (
                                                  <span className="text-xs text-slate-500">
                                                    {new Date(task.ActivityDate).toLocaleDateString()}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </button>
                                        ));
                                      })()
                                }
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
      </div>

      {/* Record Details Modal */}
      <RecordDetailsModal
        record={selectedRecord}
        type={modalType}
        isOpen={!!selectedRecord && !expandedRecord}
        expandable={true}
        onExpand={() => {
          setExpandedRecord(selectedRecord);
          setExpandedRecordType(modalType);
        }}
        onClose={() => {
          setSelectedRecord(null);
          setModalType(null);
        }}
      />

      {/* Expanded Record View */}
      {expandedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {expandedRecordType === 'lead' ? 'Lead Details' : 'Opportunity Details'}: {expandedRecord.Name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setExpandedRecord(null);
                  setExpandedRecordType(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <iframe
                src={`${createPageUrl(expandedRecordType === 'lead' ? 'LeadDetail' : 'OpportunityDetail')}?id=${expandedRecord.Id}`}
                className="w-full h-[calc(90vh-120px)] border-0"
                title="Record Details"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        session={session}
        repsData={repsData}
        onSuccess={() => loadAllRepsData(session, true)}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        session={session}
        onUpdate={() => loadAllRepsData(session, true)}
      />


    </div>
  );
}