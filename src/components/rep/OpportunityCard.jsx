import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Building2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function OpportunityCard({ opportunity, session, onSelect }) {
  const getStageColor = (stage) => {
    const colors = {
      'Application In': 'bg-blue-100 text-blue-800',
      'Underwriting': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Contracts Out': 'bg-yellow-100 text-yellow-800',
      'Contracts In': 'bg-indigo-100 text-indigo-800',
      'Closed - Funded': 'bg-green-600 text-white',
      'Declined': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-slate-100 text-slate-800';
  };

  const getAmountColor = (amount) => {
    if (amount >= 100000) return 'text-red-600';
    if (amount >= 50000) return 'text-orange-600';
    return 'text-green-600';
  };

  const daysSinceCreated = (createdDate) => {
    const days = Math.floor((new Date() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect && onSelect(opportunity)}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{opportunity.Name}</CardTitle>
              <p className="text-xs text-slate-600 mt-1 truncate">{opportunity.Account?.Name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-600">
                <DollarSign className="w-3 h-3" />
                Amount:
              </span>
              <span className={`font-semibold ${getAmountColor(opportunity.Amount)}`}>
                ${Number(opportunity.Amount || 0).toLocaleString()}
              </span>
            </div>

            {opportunity.CloseDate && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Close: {format(new Date(opportunity.CloseDate), 'MMM d')}</span>
              </div>
            )}

            {opportunity.Account?.Name && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{opportunity.Account.Name}</span>
              </div>
            )}

            {opportunity.Probability && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  Win:
                </span>
                <span className="font-semibold">{opportunity.Probability}%</span>
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-wrap pt-2 border-t">
            <Badge className={`text-xs ${getStageColor(opportunity.StageName)}`}>
              {opportunity.StageName}
            </Badge>
          </div>

          {opportunity.CreatedDate && (
            <p className="text-xs text-slate-500 text-right">{daysSinceCreated(opportunity.CreatedDate)}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}