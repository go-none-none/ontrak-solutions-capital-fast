import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Building2, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function OpportunityCard({ opportunity, session, onUpdate, onQuickView }) {
  const navigate = useNavigate();

  const stages = [
    { label: 'App In', name: 'Application In' },
    { label: 'Underwriting', name: 'Underwriting' },
    { label: 'Approved', name: 'Approved' },
    { label: 'Contracts Out', name: 'Contracts Out' },
    { label: 'Contracts In', name: 'Contracts In' },
    { label: 'Funded', name: 'Closed - Funded' }
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.name === opportunity.StageName);
    return index >= 0 ? index : 0;
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

  const handleFullView = (e) => {
    e.stopPropagation();
    navigate(createPageUrl('OpportunityDetail') + `?id=${opportunity.Id}`);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(opportunity);
    }
  };

  const currentStage = getCurrentStageIndex();
  const isDeclined = opportunity.StageName && opportunity.StageName.includes('Declined');

  const statusColors = {
    'Application In': 'bg-blue-100 text-blue-800',
    'Underwriting': 'bg-purple-100 text-purple-800',
    'Approved': 'bg-green-100 text-green-800',
    'Contracts Out': 'bg-yellow-100 text-yellow-800',
    'Contracts In': 'bg-indigo-100 text-indigo-800',
    'Closed - Funded': 'bg-emerald-100 text-emerald-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-5 bg-white transition-all ${
        isDeclined 
          ? 'border-red-200 bg-red-50/50 hover:shadow-lg hover:border-red-400' 
          : 'border-slate-200 hover:shadow-lg hover:border-orange-600'
      }`}
    >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{opportunity.Name}</h3>
            {opportunity.Account?.Name && (
              <div className="flex items-center gap-1 text-slate-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{opportunity.Account.Name}</span>
              </div>
            )}
          </div>
          <Badge className={
            isDeclined 
              ? 'bg-red-100 text-red-800' 
              : statusColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'
          }>
            {opportunity.StageName}
          </Badge>
        </div>

        {/* Stage Progress Bar */}
        {!isDeclined && (
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2 gap-1">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold flex-shrink-0 ${
                    idx <= currentStage ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-[9px] md:text-xs text-slate-600 mt-0.5 md:mt-1 text-center leading-tight h-[20px] md:h-[24px] flex items-start justify-center">{stage.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-0.5 md:gap-1">
              {stages.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded ${
                  idx <= currentStage ? 'bg-orange-600' : 'bg-slate-200'
                }`} />
              ))}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium text-center">{opportunity.StageName}</p>
          </div>
        )}

        <div className="flex items-center gap-6 text-sm mb-3">
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(opportunity.Amount)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <TrendingUp className="w-4 h-4" />
            <span>{opportunity.Probability}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Close: {formatDate(opportunity.CloseDate)}</span>
          </div>
          <span>Updated {formatDate(opportunity.LastModifiedDate)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickView}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Quick View
          </Button>
          <Button
            size="sm"
            onClick={handleFullView}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-xs"
          >
            Full View
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
    </motion.div>
  );
}