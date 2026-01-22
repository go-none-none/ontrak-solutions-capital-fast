import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, Calendar, Edit, X, ExternalLink, Save, Building, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function TaskItem({ task, session, onUpdate, onOpenModal }) {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [relatedRecords, setRelatedRecords] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ Subject: task.Subject, Description: task.Description || '', Priority: task.Priority, Status: task.Status, ActivityDate: task.ActivityDate || '' });
  const [saving, setSaving] = useState(false);

  const getTaskCategory = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    if (!task.ActivityDate) return 'upcoming';
    if (task.ActivityDate < today) return 'overdue';
    if (task.ActivityDate === today) return 'today';
    if (task.ActivityDate <= weekEndStr) return 'week';
    return 'upcoming';
  };

  const category = getTaskCategory();

  const getCategoryColor = () => {
    switch (category) {
      case 'overdue': return 'border-l-red-500 bg-red-50';
      case 'today': return 'border-l-orange-500 bg-orange-50';
      case 'week': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-slate-300 bg-white';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'today': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'week': return <Calendar className="w-5 h-5 text-blue-600" />;
      default: return <Calendar className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', { taskId: task.Id, updates: { Status: 'Completed' }, token: session.token, instanceUrl: session.instanceUrl });
      await onUpdate();
    } catch (error) {
      alert(`Failed to complete task: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', { taskId: task.Id, updates: editValues, token: session.token, instanceUrl: session.instanceUrl });
      setIsEditing(false);
      await onUpdate();
    } catch (error) {
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleViewAccount = async () => {
    if (!task.Account?.Id) return;
    
    setLoadingAccount(true);
    setShowAccountModal(true);
    setActiveTab('details');
    
    try {
      const [accountRes, relatedRes] = await Promise.all([
        base44.functions.invoke('getSalesforceAccount', { accountId: task.Account.Id, token: session.token, instanceUrl: session.instanceUrl }),
        base44.functions.invoke('getSalesforceAccountRelated', { accountId: task.Account.Id, token: session.token, instanceUrl: session.instanceUrl })
      ]);
      setAccountData(accountRes.data.account);
      setRelatedRecords(relatedRes.data);
    } catch (error) {
      alert('Failed to load account details');
      setShowAccountModal(false);
    } finally {
      setLoadingAccount(false);
    }
  };

  return (
    <>
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account: {accountData?.Name || 'Loading...'}</DialogTitle>
            <DialogDescription>View account information and related records</DialogDescription>
          </DialogHeader>
          {loadingAccount ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : accountData ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="leads">Leads ({relatedRecords?.leads?.length || 0})</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities ({relatedRecords?.opportunities?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-slate-500 mb-1">Account Name</p><p className="text-slate-900 font-semibold text-base">{accountData.Name || 'N/A'}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Phone</p>{accountData.Phone ? <a href={`tel:${accountData.Phone}`} className="text-orange-600 hover:underline font-medium">{accountData.Phone}</a> : <p className="text-slate-400">Not available</p>}</div>
                  <div><p className="text-xs text-slate-500 mb-1">Website</p>{accountData.Website ? <a href={accountData.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-medium break-all">{accountData.Website}</a> : <p className="text-slate-400">Not available</p>}</div>
                  <div><p className="text-xs text-slate-500 mb-1">Type</p>{accountData.Type ? <p className="text-slate-900 font-medium">{accountData.Type}</p> : <p className="text-slate-400">Not available</p>}</div>
                  <div><p className="text-xs text-slate-500 mb-1">Industry</p>{accountData.Industry ? <p className="text-slate-900 font-medium">{accountData.Industry}</p> : <p className="text-slate-400">Not available</p>}</div>
                </div>
                
                {(accountData.BillingStreet || accountData.BillingCity) ? (
                  <div className="border-t pt-4">
                    <p className="text-xs text-slate-500 mb-2 font-semibold">Billing Address</p>
                    {accountData.BillingStreet && <p className="text-slate-900">{accountData.BillingStreet}</p>}
                    {accountData.BillingCity && (<p className="text-slate-900">{accountData.BillingCity}{accountData.BillingState ? `, ${accountData.BillingState}` : ''} {accountData.BillingPostalCode || ''}</p>)}
                    {accountData.BillingCountry && <p className="text-slate-900">{accountData.BillingCountry}</p>}
                  </div>
                ) : null}
                
                {accountData.Description ? (
                  <div className="border-t pt-4">
                    <p className="text-xs text-slate-500 mb-2 font-semibold">Description</p>
                    <p className="text-slate-900 text-sm leading-relaxed">{accountData.Description}</p>
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="leads" className="space-y-2">
                {relatedRecords?.leads?.length > 0 ? (
                  relatedRecords.leads.map(lead => (
                    <button key={lead.Id} onClick={() => window.location.href = `${createPageUrl('LeadDetail')}?id=${lead.Id}`} className="block w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{lead.Name}</p>
                          <p className="text-sm text-slate-600">{lead.Email} • {lead.Phone}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{lead.Status}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No leads found</p>
                )}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-2">
                {relatedRecords?.opportunities?.length > 0 ? (
                  relatedRecords.opportunities.map(opp => (
                    <button key={opp.Id} onClick={() => window.location.href = `${createPageUrl('OpportunityDetail')}?id=${opp.Id}`} className="block w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900">{opp.Name}</p>
                          <p className="text-sm text-slate-600">${(opp.Amount || 0).toLocaleString()} • {new Date(opp.CloseDate).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{opp.StageName}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No opportunities found</p>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>
    
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => onOpenModal && onOpenModal(task)} className={`border-l-4 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${getCategoryColor()}`}>
        {isEditing ? (
          <div className="space-y-3">
            <Input value={editValues.Subject} onChange={(e) => setEditValues({ ...editValues, Subject: e.target.value })} placeholder="Subject" />
            <Textarea value={editValues.Description} onChange={(e) => setEditValues({ ...editValues, Description: e.target.value })} placeholder="Description" rows={2} />
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-slate-600 mb-1 block">Priority</label><Select value={editValues.Priority} onValueChange={(val) => setEditValues({ ...editValues, Priority: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
              <div><label className="text-xs text-slate-600 mb-1 block">Due Date</label><Input type="date" value={editValues.ActivityDate} onChange={(e) => setEditValues({ ...editValues, ActivityDate: e.target.value })} /></div>
              <div><label className="text-xs text-slate-600 mb-1 block">Status</label><Select value={editValues.Status} onValueChange={(val) => setEditValues({ ...editValues, Status: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Not Started">Not Started</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Waiting">Waiting</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange-600"><Save className="w-4 h-4 mr-1" />Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditValues({ Subject: task.Subject, Description: task.Description || '', Priority: task.Priority, Status: task.Status, ActivityDate: task.ActivityDate || '' }); }}><X className="w-4 h-4 mr-1" />Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex items-start gap-3">
              {getCategoryIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 mb-1">{task.Subject}</h3>
                {task.Description && (<p className="text-sm text-slate-600 mb-2">{task.Description}</p>)}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-white border border-slate-300">Due: {formatDate(task.ActivityDate)}</span>
                  <span className="px-2 py-1 rounded-full bg-white border border-slate-300">{task.Priority} Priority</span>
                  <span className="px-2 py-1 rounded-full bg-white border border-slate-300">{task.Status}</span>
                  {task.WhatId && task.Account?.Name && (
                    <button onClick={(e) => { e.stopPropagation(); handleViewAccount(); }} className="px-2 py-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center gap-1 text-xs transition-colors">
                      <Building className="w-3 h-3" />{task.Account.Name}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}><Edit className="w-4 h-4" /></Button>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleMarkComplete(e); }} disabled={saving} className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}