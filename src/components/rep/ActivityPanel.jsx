import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, CheckCircle2, Phone, Mail, Calendar, MessageSquare, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ActivityPanel({ recordId, recordType, session }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (recordId && session) {
      loadActivities();
    }
  }, [recordId, session]);

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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4" />;
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Event': return <Calendar className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type, status) => {
    if (status === 'Completed') return 'text-green-600 bg-green-50';
    if (type === 'Call') return 'text-blue-600 bg-blue-50';
    if (type === 'Email') return 'text-purple-600 bg-purple-50';
    if (type === 'Event') return 'text-orange-600 bg-orange-50';
    return 'text-slate-600 bg-slate-50';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
            <Badge variant="secondary">{activities.length}</Badge>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t">
            {/* Activities List */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#08708E] animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No activities found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="border-l-2 border-slate-200 pl-4 pb-3 relative">
                      <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.Status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{activity.Subject || 'No subject'}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                              {activity.Status && (
                                <Badge 
                                  variant={activity.Status === 'Completed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {activity.Status}
                                </Badge>
                              )}
                              {activity.Priority && activity.Priority !== 'Normal' && (
                                <Badge variant="destructive" className="text-xs">
                                  {activity.Priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 whitespace-nowrap">{formatDate(activity.date)}</p>
                        </div>

                        {/* Call specific details */}
                        {activity.type === 'Call' && (
                          <div className="flex gap-4 text-xs text-slate-600 mt-2">
                            {activity.CallDurationInSeconds && (
                              <span>Duration: {formatDuration(activity.CallDurationInSeconds)}</span>
                            )}
                            {activity.CallType && (
                              <span>Type: {activity.CallType}</span>
                            )}
                            {activity.CallOutcome && (
                              <span className="font-medium">Outcome: {activity.CallOutcome}</span>
                            )}
                          </div>
                        )}

                        {/* Event specific details */}
                        {activity.type === 'Event' && (
                          <div className="flex gap-4 text-xs text-slate-600 mt-2">
                            {activity.StartDateTime && (
                              <span>Start: {formatDate(activity.StartDateTime)}</span>
                            )}
                            {activity.DurationInMinutes && (
                              <span>Duration: {activity.DurationInMinutes} min</span>
                            )}
                            {activity.Location && (
                              <span>Location: {activity.Location}</span>
                            )}
                          </div>
                        )}

                        {/* Email specific details */}
                        {activity.type === 'Email' && (
                          <div className="text-xs text-slate-600 mt-2 space-y-1">
                            {activity.FromAddress && (
                              <div>From: {activity.FromAddress}</div>
                            )}
                            {activity.ToAddress && (
                              <div>To: {activity.ToAddress}</div>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {activity.Description && (
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                            {activity.Description}
                          </p>
                        )}

                        {/* Owner info */}
                        {activity.Owner?.Name && (
                          <p className="text-xs text-slate-500 mt-2">
                            Assigned to: {activity.Owner.Name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}