import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, AlertCircle, Calendar, Edit, X, ExternalLink, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function TaskItem({ task, session, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    Subject: task.Subject,
    Description: task.Description || '',
    Priority: task.Priority,
    Status: task.Status,
    ActivityDate: task.ActivityDate || ''
  });
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
      await base44.functions.invoke('updateSalesforceTask', {
        taskId: task.Id,
        updates: { Status: 'Completed', IsClosed: true },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      await onUpdate();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    } finally {
      setSaving(false);
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
      await onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 rounded-lg p-4 transition-all ${getCategoryColor()}`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editValues.Subject}
            onChange={(e) => setEditValues({ ...editValues, Subject: e.target.value })}
            placeholder="Subject"
          />
          <Textarea
            value={editValues.Description}
            onChange={(e) => setEditValues({ ...editValues, Description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Priority</label>
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
              <label className="text-xs text-slate-600 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={editValues.ActivityDate}
                onChange={(e) => setEditValues({ ...editValues, ActivityDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Status</label>
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
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-purple-600">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditValues({ Subject: task.Subject, Description: task.Description || '', Priority: task.Priority, Status: task.Status, ActivityDate: task.ActivityDate || '' }); }}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex items-start gap-3">
            {getCategoryIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 mb-1">{task.Subject}</h3>
              {task.Description && (
                <p className="text-sm text-slate-600 mb-2">{task.Description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-white border border-slate-300">
                  Due: {formatDate(task.ActivityDate)}
                </span>
                <span className="px-2 py-1 rounded-full bg-white border border-slate-300">
                  {task.Priority} Priority
                </span>
                <span className="px-2 py-1 rounded-full bg-white border border-slate-300">
                  {task.Status}
                </span>
                {task.WhatId && (
                  <>
                    {task.WhatId.startsWith('001') && task.Account?.Name ? (
                      <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs">
                        Account: {task.Account.Name}
                      </span>
                    ) : task.What?.Name && (
                      <a
                        href={`${createPageUrl(
                          task.WhatId.startsWith('00Q') 
                            ? 'LeadDetail' 
                            : 'OpportunityDetail'
                        )}?id=${task.WhatId}`}
                        className="px-2 py-1 rounded-full bg-[#08708E] text-white hover:bg-[#065a72] flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.What.Name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}