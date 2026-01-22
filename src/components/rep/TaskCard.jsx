import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, AlertCircle, Clock, Calendar } from 'lucide-react';

export default function TaskCard({ tasksData, onClick, loading, isActive }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-slate-200 rounded w-16"></div>
        </div>
      </motion.div>
    );
  }

  const { total = 0, categorized = {} } = tasksData || {};
  const { overdue = [], dueToday = [], dueThisWeek = [] } = categorized;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-xl p-3 shadow-sm cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-[#08708E] shadow-md' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-600 mb-0.5">My Tasks</p>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          
          {/* Breakdown */}
          <div className="mt-1 space-y-0.5">
            {overdue.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span className="font-semibold">{overdue.length} Overdue</span>
              </div>
            )}
            {dueToday.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Clock className="w-3 h-3" />
                <span className="font-semibold">{dueToday.length} Due Today</span>
              </div>
            )}
            {dueThisWeek.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Calendar className="w-3 h-3" />
                <span className="font-semibold">{dueThisWeek.length} This Week</span>
              </div>
            )}
            {total === 0 && (
              <p className="text-xs text-slate-500 mt-1">No open tasks</p>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}