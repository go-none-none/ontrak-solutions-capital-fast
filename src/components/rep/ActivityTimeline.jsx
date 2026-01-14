import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Calendar, FileText, MessageSquare, Plus, Loader2, Download, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ActivityTimeline({ recordId, recordType, session, onActivityAdded }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [newTask, setNewTask] = useState({ subject: '', description: '', status: 'Not Started', priority: 'Normal' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(['Call', 'Task', 'Event', 'Email']);

  useEffect(() => {
    loadActivities();
  }, [recordId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSalesforceActivities', {
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Load activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.subject) return;
    
    setSubmitting(true);
    try {
      await base44.functions.invoke('createSalesforceActivity', {
        recordId,
        recordType,
        activityType: 'Task',
        data: newTask,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setNewTask({ subject: '', description: '', status: 'Not Started', priority: 'Normal' });
      setShowAddTask(false);
      await loadActivities();
      if (onActivityAdded) onActivityAdded();
    } catch (error) {
      console.error('Add task error:', error);
      alert('Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return Phone;
      case 'Task': return FileText;
      case 'Event': return Calendar;
      case 'Email': return Mail;
      default: return MessageSquare;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'Call': return 'bg-orange-100 text-orange-600';
      case 'Task': return 'bg-blue-100 text-blue-600';
      case 'Event': return 'bg-purple-100 text-purple-600';
      case 'Email': return 'bg-green-100 text-green-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadActivities = () => {
    const csvContent = [
      ['Type', 'Subject', 'Description', 'Date & Time', 'Status', 'Priority'].join(','),
      ...activities.map(activity => [
        activity.type || '',
        `"${(activity.Subject || '').replace(/"/g, '""')}"`,
        `"${(activity.Description || '').replace(/"/g, '""')}"`,
        formatFullDateTime(activity.date),
        activity.Status || '',
        activity.Priority || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities_${recordId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#08708E] hover:underline inline-flex items-center gap-1 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  const toggleActivityType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const filteredActivities = activities.filter(a => selectedTypes.includes(a.type));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setShowTimeline(!showTimeline)}
          className="flex items-center gap-2 hover:text-[#08708E] transition-colors"
        >
          <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
          <span className="text-sm text-slate-500">({filteredActivities.length})</span>
        </button>
        <Button size="sm" onClick={() => setShowAddTask(!showAddTask)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showTimeline && (
        <div className="mb-4 flex flex-wrap gap-2 pb-4 border-b border-slate-200">
          <button
            onClick={() => toggleActivityType('Call')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedTypes.includes('Call')
                ? 'bg-cyan-100 border-cyan-400 text-cyan-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm font-medium">Call</span>
          </button>
          <button
            onClick={() => toggleActivityType('Task')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedTypes.includes('Task')
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Task</span>
          </button>
          <button
            onClick={() => toggleActivityType('Email')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedTypes.includes('Email')
                ? 'bg-slate-100 border-slate-400 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">Email</span>
          </button>
          <button
            onClick={() => toggleActivityType('Event')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedTypes.includes('Event')
                ? 'bg-purple-100 border-purple-400 text-purple-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Event</span>
          </button>
        </div>
      )}

      {showAddTask && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3"
        >
          <Input
            placeholder="Task subject"
            value={newTask.subject}
            onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3">
            <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTask} disabled={submitting || !newTask.subject} className="flex-1">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Task'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {showTimeline && (
        loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-[#08708E] animate-spin mx-auto" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No activities found for selected types</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, i) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 pb-4 border-b border-slate-100 last:border-0"
                >
                  <div className={`w-10 h-10 rounded-lg ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between gap-2 mb-1">
                       <h4 className="font-medium text-slate-900 break-words">{activity.Subject}</h4>
                       <span className="text-xs text-slate-500 whitespace-nowrap" title={formatFullDateTime(activity.date)}>
                         {formatDate(activity.date)}
                       </span>
                     </div>
                     {activity.Description && (
                       <p className="text-sm text-slate-600 break-words overflow-hidden">{renderTextWithLinks(activity.Description)}</p>
                     )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.CallOutcome && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-semibold">
                          Outcome: {activity.CallOutcome}
                        </span>
                      )}
                      {activity.CallDurationInSeconds && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                          Duration: {Math.floor(activity.CallDurationInSeconds / 60)}m {activity.CallDurationInSeconds % 60}s
                        </span>
                      )}
                      {activity.CallType && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                          {activity.CallType}
                        </span>
                      )}
                      {activity.Status && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                          {activity.Status}
                        </span>
                      )}
                      {activity.Priority && (
                        <span className="inline-block text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                          {activity.Priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatFullDateTime(activity.date)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}