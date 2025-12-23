import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Calendar, FileText, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ActivityTimeline({ recordId, recordType, session, onActivityAdded }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ subject: '', description: '', status: 'Not Started', priority: 'Normal' });
  const [submitting, setSubmitting] = useState(false);

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
      case 'Task': return FileText;
      case 'Event': return Calendar;
      case 'Email': return Mail;
      default: return MessageSquare;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
        <Button size="sm" onClick={() => setShowAddTask(!showAddTask)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

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

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-[#08708E] animate-spin mx-auto" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No activities yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, i) => {
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
                    <h4 className="font-medium text-slate-900">{activity.Subject}</h4>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(activity.date)}</span>
                  </div>
                  {activity.Description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{activity.Description}</p>
                  )}
                  {activity.Status && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {activity.Status}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}