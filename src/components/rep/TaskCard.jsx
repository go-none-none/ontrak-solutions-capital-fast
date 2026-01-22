import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskCard({ task, session, onSelect }) {
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
    const colors = {
      overdue: 'bg-red-100 text-red-800',
      today: 'bg-orange-100 text-orange-800',
      week: 'bg-blue-100 text-blue-800',
      upcoming: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'overdue':
        return <AlertCircle className="w-3 h-3" />;
      case 'today':
        return <Clock className="w-3 h-3" />;
      case 'week':
        return <Calendar className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Waiting': 'bg-yellow-100 text-yellow-800',
      'Not Started': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-600',
      'Normal': 'text-slate-600',
      'Low': 'text-green-600'
    };
    return colors[priority] || 'text-slate-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect && onSelect(task)}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{task.Subject}</CardTitle>
              {task.Description && <p className="text-xs text-slate-600 mt-1 truncate">{task.Description}</p>}
            </div>
            {task.Status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.What?.Name && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Zap className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Related: {task.What.Name}</span>
            </div>
          )}

          {task.ActivityDate && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {getCategoryIcon()}
              <span>{format(new Date(task.ActivityDate), 'MMM d, yyyy')}</span>
            </div>
          )}

          <div className="flex gap-1 flex-wrap pt-2 border-t">
            <Badge className={`text-xs ${getCategoryColor()}`}>
              {category === 'overdue' ? 'Overdue' : category === 'today' ? 'Today' : category === 'week' ? 'This Week' : 'Upcoming'}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(task.Status)}`}>{task.Status}</Badge>
            {task.Priority && (
              <Badge className={`text-xs bg-white border ${getPriorityColor(task.Priority)} border-current`}>
                {task.Priority}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}