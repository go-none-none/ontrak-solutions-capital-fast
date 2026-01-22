import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Zap, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function LeadCard({ lead, session, onSelect }) {
  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'funded': 'bg-green-100 text-green-800',
      'declined': 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-800';
  };

  const getPriorityColor = (amount) => {
    if (amount >= 50000) return 'bg-red-100 text-red-700';
    if (amount >= 25000) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect && onSelect(lead)}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{lead.Name}</CardTitle>
              <p className="text-xs text-slate-600 mt-1 truncate">{lead.Company || lead.Email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {lead.Email && (
              <a href={`mailto:${lead.Email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{lead.Email}</span>
              </a>
            )}
            {lead.Phone && (
              <a href={`tel:${lead.Phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{lead.Phone}</span>
              </a>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {lead.Company && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{lead.Company}</span>
              </div>
            )}
            {lead.funding_amount_requested && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <DollarSign className="w-3 h-3" />
                  Requesting:
                </span>
                <span className="font-semibold">${Number(lead.funding_amount_requested).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex gap-1 flex-wrap pt-2 border-t">
            <Badge className={`text-xs ${getStatusColor(lead.Status)}`}>{lead.Status}</Badge>
            {lead.funding_amount_requested && (
              <Badge className={`text-xs ${getPriorityColor(lead.funding_amount_requested)}`}>
                {lead.funding_amount_requested >= 50000 ? 'High' : lead.funding_amount_requested >= 25000 ? 'Med' : 'Low'}
              </Badge>
            )}
          </div>

          {lead.created_date && (
            <p className="text-xs text-slate-500 text-right">{format(new Date(lead.created_date), 'MMM d')}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}