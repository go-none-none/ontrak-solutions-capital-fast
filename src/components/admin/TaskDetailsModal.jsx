import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, AlertCircle, Clock, CheckCircle2, Edit, Save, X, Building, Users as UsersIcon, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function TaskDetailsModal({ task, isOpen, onClose, session, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [iframeModal, setIframeModal] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeTitle, setIframeTitle] = useState('');
  const [editValues, setEditValues] = useState({
    Subject: task?.Subject || '',
    Description: task?.Description || '',
    Priority: task?.Priority || 'Normal',
    Status: task?.Status || 'Not Started',
    ActivityDate: task?.ActivityDate || ''
  });

  if (!task) return null;

  const getTaskCategory = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!task.ActivityDate) return 'upcoming';
    if (task.ActivityDate < today) return 'overdue';
    if (task.ActivityDate === today) return 'today';
    return 'upcoming';
  };

  const category = getTaskCategory();

  const getCategoryColor = () => {
    switch (category) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', {
        taskId: task.Id,
        updates: editValues,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setIsEditing(false);
      if (onUpdate) await onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
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
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg ${getCategoryColor()} font-medium text-sm`}>
              {category === 'overdue' ? 'Overdue' : category === 'today' ? 'Due Today' : 'Upcoming'}
            </div>
            <span className="text-slate-900">{task.Subject}</span>
          </DialogTitle>
          <DialogDescription>Task details and information</DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
              <Input
                value={editValues.Subject}
                onChange={(e) => setEditValues({ ...editValues, Subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <Textarea
                value={editValues.Description}
                onChange={(e) => setEditValues({ ...editValues, Description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
                <Select value={editValues.Priority} onValueChange={(val) => setEditValues({ ...editValues, Priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={editValues.ActivityDate}
                  onChange={(e) => setEditValues({ ...editValues, ActivityDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <Select value={editValues.Status} onValueChange={(val) => setEditValues({ ...editValues, Status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="bg-purple-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditValues({ Subject: task.Subject, Description: task.Description || '', Priority: task.Priority, Status: task.Status, ActivityDate: task.ActivityDate || '' }); }}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Task Info */}
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

            {/* Description */}
            {task.Description && (
              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Description</p>
                <p className="text-slate-900 text-sm leading-relaxed">{task.Description}</p>
              </div>
            )}

            {/* Related To */}
            {task.WhatId && task.What?.Name && (
              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-2 font-semibold">Related To</p>
                <button
                  onClick={() => {
                    const isLead = task.WhatId.startsWith('00Q');
                    const isOpp = task.WhatId.startsWith('006');
                    if (isLead || isOpp) {
                      setIframeUrl(`${createPageUrl(isLead ? 'LeadDetail' : 'OpportunityDetail')}?id=${task.WhatId}`);
                      setIframeTitle(`${isLead ? 'Lead' : 'Opportunity'}: ${task.What.Name}`);
                      setIframeModal(true);
                    }
                  }}
                  className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-purple-500 transition-all text-left"
                >
                  {task.WhatId.startsWith('00Q') ? (
                    <UsersIcon className="w-4 h-4 text-blue-600" />
                  ) : task.WhatId.startsWith('006') ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <Building className="w-4 h-4 text-slate-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{task.What.Name}</p>
                    <p className="text-xs text-slate-500">
                      {task.WhatId.startsWith('00Q') ? 'Lead' : task.WhatId.startsWith('006') ? 'Opportunity' : task.What.Type || 'Record'}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Timestamps */}
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

            {/* Actions */}
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

      {/* Iframe Modal */}
      <Dialog open={iframeModal} onOpenChange={setIframeModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{iframeTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              View detailed record information
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(90vh-80px)]">
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              title={iframeTitle}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}