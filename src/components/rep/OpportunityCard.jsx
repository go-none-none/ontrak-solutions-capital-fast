import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Building2, TrendingUp } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function OpportunityCard({ opportunity, session, onUpdate, onOpenModal }) {

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

  const handleClick = () => {
    if (onOpenModal) {
      onOpenModal(opportunity, 'opportunity');
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
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={`border rounded-xl p-5 bg-white transition-all cursor-pointer ${
          isDeclined 
            ? 'border-red-200 bg-red-50/50 hover:shadow-lg hover:border-red-400' 
            : 'border-slate-200 hover:shadow-lg hover:border-[#08708E]'
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
            <div className="flex justify-between items-center mb-2">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    idx <= currentStage ? 'bg-[#08708E] text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-600 mt-1 text-center">{stage.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {stages.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded ${
                  idx <= currentStage ? 'bg-[#08708E]' : 'bg-slate-200'
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

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border-2 border-[#08708E] p-6 z-50 min-w-[500px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Account</p>
                  <p className="font-medium text-slate-900">{opportunity.Account?.Name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="font-semibold text-[#08708E] text-lg">{formatCurrency(opportunity.Amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Close Date</p>
                  <p className="font-medium text-slate-900">
                    {formatDate(opportunity.CloseDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Probability</p>
                  <p className="font-medium text-slate-900">{opportunity.Probability || 0}%</p>
                </div>
                {opportunity.Amount_Requested__c && (
                  <div>
                    <p className="text-xs text-slate-500">Requested</p>
                    <p className="font-medium text-slate-900">${(opportunity.Amount_Requested__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Type && (
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="font-medium text-slate-900">{opportunity.Type}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center pt-2 border-t">Click anywhere to view full details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}