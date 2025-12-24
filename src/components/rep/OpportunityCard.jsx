import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Building2, TrendingUp, ChevronDown, ChevronUp, MapPin, FileText, Briefcase } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function OpportunityCard({ opportunity, session, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
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

  const currentStage = getCurrentStageIndex();
  const isDeclined = opportunity.StageName && opportunity.StageName.includes('Declined');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white"
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
        <div className="flex items-center gap-2">
          <span>Updated {formatDate(opportunity.LastModifiedDate)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="h-6 text-xs"
          >
            {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            {expanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-slate-200 space-y-3 text-sm">
              {opportunity.Account?.BillingStreet && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Billing Address</p>
                    <p className="text-slate-700">{opportunity.Account.BillingStreet}</p>
                    {opportunity.Account.BillingCity && (
                      <p className="text-slate-700">
                        {opportunity.Account.BillingCity}, {opportunity.Account.BillingState} {opportunity.Account.BillingPostalCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {opportunity.Amount_Requested__c && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Amount Requested</p>
                    <p className="text-slate-700">{formatCurrency(opportunity.Amount_Requested__c)}</p>
                  </div>
                </div>
              )}
              {opportunity.Estimated_Monthly_Revenue__c && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Monthly Revenue</p>
                    <p className="text-slate-700">{formatCurrency(opportunity.Estimated_Monthly_Revenue__c)}</p>
                  </div>
                </div>
              )}
              {opportunity.Type && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="text-slate-700">{opportunity.Type}</p>
                  </div>
                </div>
              )}
              {opportunity.LeadSource && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Lead Source</p>
                    <p className="text-slate-700">{opportunity.LeadSource}</p>
                  </div>
                </div>
              )}
              {opportunity.Use_of_Proceeds__c && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Use of Funds</p>
                  <p className="text-slate-700">{opportunity.Use_of_Proceeds__c}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}