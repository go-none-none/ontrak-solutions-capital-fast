import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Phone, Mail, Calendar, CheckSquare, MessageSquare, ChevronDown, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function ActivityPanel({ recordId, recordType, session }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ tasks: 0, events: 0, emails: 0, total: 0 });
  const [filter, setFilter] = useState('all');
  const [expandedActivities, setExpandedActivities] = useState({});

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
      setCounts(response.data.counts || { tasks: 0, events: 0, emails: 0, total: 0 });
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = (id) => {
    setExpandedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'task': return <CheckSquare className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-orange-100 text-orange-800';
      case 'sms': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Activity Timeline</h3>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-slate-800' : ''}
          >
            All ({counts.total})
          </Button>
          <Button
            variant={filter === 'task' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('task')}
            className={filter === 'task' ? 'bg-orange-600' : ''}
          >
            <CheckSquare className="w-3 h-3 mr-1" />
            Tasks
          </Button>
          <Button
            variant={filter === 'call' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('call')}
            className={filter === 'call' ? 'bg-blue-600' : ''}
          >
            <Phone className="w-3 h-3 mr-1" />
            Calls
          </Button>
          <Button
            variant={filter === 'event' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('event')}
            className={filter === 'event' ? 'bg-green-600' : ''}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Events
          </Button>
          <Button
            variant={filter === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('email')}
            className={filter === 'email' ? 'bg-purple-600' : ''}
          >
            <Mail className="w-3 h-3 mr-1" />
            Emails
          </Button>
          <Button
            variant={filter === 'sms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sms')}
            className={filter === 'sms' ? 'bg-pink-600' : ''}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            SMS
          </Button>
        </div>
      </div>

      {/* Activities List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No activities found
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {activity.subject || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}`}
                        </h4>
                        
                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(activity.date)}
                            {activity.date && ` at ${formatTime(activity.date)}`}
                          </span>
                          
                          {activity.owner && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.owner}
                            </span>
                          )}

                          {activity.status && (
                            <Badge variant="outline" className="text-xs py-0">
                              {activity.status}
                            </Badge>
                          )}

                          {activity.priority && activity.priority !== 'Normal' && (
                            <Badge variant="outline" className="text-xs py-0 border-orange-300 text-orange-700">
                              {activity.priority}
                            </Badge>
                          )}

                          {activity.callDuration && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Phone className="w-3 h-3" />
                              {formatDuration(activity.callDuration)}
                            </span>
                          )}
                        </div>

                        {/* Call disposition */}
                        {activity.callDisposition && (
                          <div className="mt-2">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {activity.callDisposition}
                            </Badge>
                          </div>
                        )}

                        {/* Event details */}
                        {activity.type === 'event' && (
                          <div className="mt-2 text-xs text-slate-600">
                            {activity.startDate && activity.endDate && (
                              <div>
                                {formatTime(activity.startDate)} - {formatTime(activity.endDate)}
                              </div>
                            )}
                            {activity.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Email details */}
                        {activity.type === 'email' && (
                          <div className="mt-2 text-xs text-slate-600">
                            <div><strong>From:</strong> {activity.from}</div>
                            <div><strong>To:</strong> {activity.to}</div>
                            {activity.cc && <div><strong>Cc:</strong> {activity.cc}</div>}
                          </div>
                        )}

                        {/* Description/Body preview */}
                        {(activity.description || activity.body) && (
                          <button
                            onClick={() => toggleActivity(activity.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedActivities[activity.id] ? 'rotate-180' : ''}`} />
                            {expandedActivities[activity.id] ? 'Hide details' : 'Show details'}
                          </button>
                        )}

                        {expandedActivities[activity.id] && (activity.description || activity.body) && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                            {activity.description || activity.body}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}