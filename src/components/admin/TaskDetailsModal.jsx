import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, AlertCircle, Clock, CheckCircle2, Edit, Save, X, Building, Users as UsersIcon, TrendingUp, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function TaskDetailsModal({ task, isOpen, onClose, session, onUpdate, onOpenRelated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    Subject: '',
    Description: '',
    Priority: 'Normal',
    Status: 'Not Started',
    ActivityDate: '',
    WhatId: ''
  });
  const [relatedSearch, setRelatedSearch] = useState('');
  const [relatedResults, setRelatedResults] = useState([]);
  const [searchingRelated, setSearchingRelated] = useState(false);
  const [selectedRelated, setSelectedRelated] = useState(null);

  useEffect(() => {
    if (task) {
      setEditValues({
        Subject: task.Subject || '',
        Description: task.Description || '',
        Priority: task.Priority || 'Normal',
        Status: task.Status || 'Not Started',
        ActivityDate: task.ActivityDate || '',
        WhatId: task.WhatId || ''
      });
      setSelectedRelated(task.WhatId && task.What?.Name ? { Id: task.WhatId, Name: task.What.Name, Type: task.What.Type } : null);
      setIsEditing(false);
    }
  }, [task]);

  const searchRelatedRecords = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setRelatedResults([]);
      return;
    }

    setSearchingRelated(true);
    try {
      const leadsQuery = `SELECT Id, Name, Company FROM Lead WHERE Name LIKE '%${searchTerm}%' OR Company LIKE '%${searchTerm}%' LIMIT 5`;
      const oppsQuery = `SELECT Id, Name, Account.Name FROM Opportunity WHERE Name LIKE '%${searchTerm}%' OR Account.Name LIKE '%${searchTerm}%' LIMIT 5`;

      const [leadsRes, oppsRes] = await Promise.all([
        fetch(`${session.instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(leadsQuery)}`, {
          headers: { 'Authorization': `Bearer ${session.token}` }
        }),
        fetch(`${session.instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(oppsQuery)}`, {
          headers: { 'Authorization': `Bearer ${session.token}` }
        })
      ]);

      const leadsData = await leadsRes.json();
      const oppsData = await oppsRes.json();

      const results = [
        ...(leadsData.records || []).map(r => ({ ...r, Type: 'Lead' })),
        ...(oppsData.records || []).map(r => ({ ...r, Type: 'Opportunity' }))
      ];

      setRelatedResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchingRelated(false);
    }
  };

  if (!task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...editValues };
      if (selectedRelated) {
        updates.WhatId = selectedRelated.Id;
      }
      await base44.functions.invoke('updateSalesforceTask', {
        taskId: task.Id,
        updates,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setIsEditing(false);
      if (onUpdate) await onUpdate();
      onClose();
    } catch (error) {
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', {
        taskId: task.Id,
        updates: { Status: 'Completed' },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      if (onUpdate) await onUpdate();
      onClose();
    } catch (error) {
      alert('Failed to complete task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{task.Subject}</DialogTitle>
          <DialogDescription>Task details and information</DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
              <Input value={editValues.Subject} onChange={(e) => setEditValues({ ...editValues, Subject: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <Textarea value={editValues.Description} onChange={(e) => setEditValues({ ...editValues, Description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
                <Select value={editValues.Priority} onValueChange={(val) => setEditValues({ ...editValues, Priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <Select value={editValues.Status} onValueChange={(val) => setEditValues({ ...editValues, Status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Due Date</label>
              <Input type="date" value={editValues.ActivityDate} onChange={(e) => setEditValues({ ...editValues, ActivityDate: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Related To (Optional)</label>
              <div className="space-y-2">
                {selectedRelated ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedRelated.Id?.startsWith('00Q') ? (
                      <UsersIcon className="w-4 h-4 text-blue-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{selectedRelated.Name}</p>
                      <p className="text-xs text-slate-500">{selectedRelated.Type}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRelated(null); setEditValues({ ...editValues, WhatId: '' }); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search leads or opportunities..." value={relatedSearch} onChange={(e) => { setRelatedSearch(e.target.value); searchRelatedRecords(e.target.value); }} className="pl-10" />
                    {relatedResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {relatedResults.map((result) => (
                          <button key={result.Id} onClick={() => { setSelectedRelated(result); setEditValues({ ...editValues, WhatId: result.Id }); setRelatedSearch(''); setRelatedResults([]); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-0">
                            {result.Type === 'Lead' ? (
                              <UsersIcon className="w-4 h-4 text-blue-600" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900">{result.Name}</p>
                              <p className="text-xs text-slate-500">{result.Type} {result.Company ? `• ${result.Company}` : result.Account?.Name ? `• ${result.Account.Name}` : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="bg-orange-600"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditValues({ Subject: task.Subject, Description: task.Description || '', Priority: task.Priority, Status: task.Status, ActivityDate: task.ActivityDate || '', WhatId: task.WhatId || '' }); setSelectedRelated(task.WhatId && task.What?.Name ? { Id: task.WhatId, Name: task.What.Name, Type: task.What.Type } : null); setRelatedSearch(''); setRelatedResults([]); }}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <Badge variant="outline" className="text-sm">{task.Status}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Priority</p>
                <Badge variant="outline" className={task.Priority === 'High' ? 'border-red-500 text-red-700' : task.Priority === 'Low' ? 'border-slate-400' : 'border-yellow-500 text-yellow-700'}>
                  {task.Priority}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due Date
                </p>
                <p className="text-slate-900 font-medium">{formatDate(task.ActivityDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Assigned To
                </p>
                <p className="text-slate-900 font-medium">{task.Owner?.Name || 'Unknown'}</p>
              </div>
            </div>

            {task.Description && (
              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Description</p>
                <p className="text-slate-900 text-sm leading-relaxed">{task.Description}</p>
              </div>
            )}

            {task.WhatId && task.What?.Name && (
              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Related To</p>
                <button onClick={() => { if ((task.WhatId.startsWith('00Q') || task.WhatId.startsWith('006')) && onOpenRelated) { onOpenRelated({ recordId: task.WhatId, recordType: task.WhatId.startsWith('00Q') ? 'lead' : 'opportunity', recordName: task.What.Name }); onClose(); } }} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-orange-600 transition-all w-full text-left cursor-pointer">
                  {task.WhatId.startsWith('00Q') ? (
                    <UsersIcon className="w-4 h-4 text-blue-600" />
                  ) : task.WhatId.startsWith('006') ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <Building className="w-4 h-4 text-slate-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{task.What.Name}</p>
                    <p className="text-xs text-slate-500">
                      {task.WhatId.startsWith('00Q') ? 'Lead' : task.WhatId.startsWith('006') ? 'Opportunity' : task.What.Type || 'Record'}
                    </p>
                  </div>
                  {(task.WhatId.startsWith('00Q') || task.WhatId.startsWith('006')) && (
                    <span className="text-xs text-orange-600">View →</span>
                  )}
                </button>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                <div>
                  <p className="mb-1">Created</p>
                  <p className="text-slate-700">{formatDate(task.CreatedDate)}</p>
                </div>
                <div>
                  <p className="mb-1">Last Modified</p>
                  <p className="text-slate-700">{formatDate(task.LastModifiedDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </Button>
              {task.Status !== 'Completed' && (
                <Button onClick={handleMarkComplete} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}