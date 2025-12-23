import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function OpportunityCard({ opportunity, session }) {
  const stageColors = {
    'Application In': 'bg-blue-100 text-blue-800',
    'Underwriting': 'bg-purple-100 text-purple-800',
    'Approved': 'bg-green-100 text-green-800',
    'Contracts Out': 'bg-yellow-100 text-yellow-800',
    'Contracts In': 'bg-indigo-100 text-indigo-800',
    'Closed - Funded': 'bg-green-100 text-green-800',
    'Funded': 'bg-green-100 text-green-800',
    'Closed - Declined': 'bg-red-100 text-red-800'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{opportunity.Name}</h3>
            <Badge className={stageColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'}>
              {opportunity.StageName}
            </Badge>
          </div>
          {opportunity.Account?.Name && (
            <div className="flex items-center gap-1 text-slate-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{opportunity.Account.Name}</span>
            </div>
          )}
        </div>
        <Link to={`${createPageUrl('OpportunityDetail')}?id=${opportunity.Id}`}>
          <Button variant="outline" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm mb-3">
        <div className="flex items-center gap-1 text-[#08708E] font-semibold">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(opportunity.Amount)}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <TrendingUp className="w-4 h-4" />
          <span>{opportunity.Probability}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Close: {formatDate(opportunity.CloseDate)}</span>
        </div>
        <span>Updated {formatDate(opportunity.LastModifiedDate)}</span>
      </div>
    </motion.div>
  );
}