import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, CheckCircle2, Clock, AlertCircle, Calendar, Edit, Plus, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function TasksExpandedView({ isOpen, onClose, tasksData, session, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    Subject: '',
    Description: '',
    Priority: 'Normal',
    Status: 'Not Started',
    ActivityDate: ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const { tasks = [], categorized = {} } = tasksData || {};
  const { overdue = [], dueToday = [], dueThisWeek = [], upcoming = [] } = categorized;

  const getFilteredTasks = () => {
    switch (filter) {
      case 'overdue': return overdue;
      case 'today': return dueToday;
      case 'week': return dueThisWeek;
      case 'upcoming': return upcoming;
      default: return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const handleMarkComplete = async (taskId) => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', {
        taskId,
        updates: { Status: 'Completed', IsClosed: true },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      await onRefresh();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (taskId) => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', {
        taskId,
        updates: editValues,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setEditingTask(null);
      setEditValues({});
      await onRefresh();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskData.Subject) {
      alert('Subject is required');
      return;
    }

    setSaving(true);
    try {
      await base44.functions.invoke('createSalesforceTask', {
        taskData: {
          ...newTaskData,
          OwnerId: session.userId
        },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setShowNewTask(false);
      setNewTaskData({
        Subject: '',
        Description: '',
        Priority: 'Normal',
        Status: 'Not Started',
        ActivityDate: ''
      });
      await onRefresh();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const getTaskCategory = (task) => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'today': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'week': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'today': return <Clock className="w-4 h-4" />;
      case 'week': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">My Tasks</h2>
            <p className="text-sm text-white/80">{tasks.length} open tasks</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters & Actions */}
        <div className="px-6 py-4 border-b flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-purple-600' : ''}
            >
              All ({tasks.length})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('overdue')}
              className={filter === 'overdue' ? 'bg-red-600' : ''}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue ({overdue.length})
            </Button>
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('today')}
              className={filter === 'today' ? 'bg-orange-600' : ''}
            >
              <Clock className="w-3 h-3 mr-1" />
              Today ({dueToday.length})
            </Button>
            <Button
              variant={filter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('week')}
              className={filter === 'week' ? 'bg-blue-600' : ''}
            >
              <Calendar className="w-3 h-3 mr-1" />
              This Week ({dueThisWeek.length})
            </Button>
          </div>
          
          <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Subject *</label>
                  <Input
                    value={newTaskData.Subject}
                    onChange={(e) => setNewTaskData({ ...newTaskData, Subject: e.target.value })}
                    placeholder="Task subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                  <Textarea
                    value={newTaskData.Description}
                    onChange={(e) => setNewTaskData({ ...newTaskData, Description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
                    <Select value={newTaskData.Priority} onValueChange={(val) => setNewTaskData({ ...newTaskData, Priority: val })}>
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
                      value={newTaskData.ActivityDate}
                      onChange={(e) => setNewTaskData({ ...newTaskData, ActivityDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTask} disabled={saving} className="flex-1 bg-purple-600">
                    {saving ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No tasks in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const category = getTaskCategory(task);
                const isEditing = editingTask === task.Id;

                return (
                  <div
                    key={task.Id}
                    className={`border-2 rounded-xl p-4 transition-all ${getCategoryColor(category)}`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editValues.Subject || task.Subject}
                          onChange={(e) => setEditValues({ ...editValues, Subject: e.target.value })}
                          placeholder="Subject"
                        />
                        <Textarea
                          value={editValues.Description || task.Description || ''}
                          onChange={(e) => setEditValues({ ...editValues, Description: e.target.value })}
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Select
                            value={editValues.Priority || task.Priority}
                            onValueChange={(val) => setEditValues({ ...editValues, Priority: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={editValues.ActivityDate || task.ActivityDate || ''}
                            onChange={(e) => setEditValues({ ...editValues, ActivityDate: e.target.value })}
                          />
                          <Select
                            value={editValues.Status || task.Status}
                            onValueChange={(val) => setEditValues({ ...editValues, Status: val })}
                          >
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
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(task.Id)} disabled={saving}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingTask(null); setEditValues({}); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            {getCategoryIcon(category)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{task.Subject}</h3>
                              {task.Description && (
                                <p className="text-sm text-slate-600 mt-1">{task.Description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs mt-3">
                            <span className="px-2 py-1 rounded-full bg-white border">
                              Due: {formatDate(task.ActivityDate)}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-white border">
                              {task.Priority} Priority
                            </span>
                            <span className="px-2 py-1 rounded-full bg-white border">
                              {task.Status}
                            </span>
                            {task.What?.Name && (
                              <a
                                href={`${createPageUrl(task.What.Type === 'Lead' ? 'LeadDetail' : 'OpportunityDetail')}?id=${task.WhatId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-full bg-[#08708E] text-white hover:bg-[#065a72] flex items-center gap-1"
                              >
                                {task.What.Name}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTask(task.Id);
                              setEditValues({
                                Subject: task.Subject,
                                Description: task.Description,
                                Priority: task.Priority,
                                Status: task.Status,
                                ActivityDate: task.ActivityDate
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(task.Id)}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}