import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Building2, Calendar, DollarSign, Eye, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function LeadCard({ lead, session, onQuickView, isExpanded, onToggleExpand }) {
  const navigate = useNavigate();

  const stages = [
    { label: 'New', status: 'Open - Not Contacted' },
    { label: 'Contacted', status: 'Working - Contacted' },
    { label: 'App Out', status: 'Working - Application Out' },
    { label: 'Missing Info', status: 'Application Missing Info' }
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.status === lead.Status);
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
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFullView = (e) => {
    e.stopPropagation();
    navigate(createPageUrl('LeadDetail') + `?id=${lead.Id}`);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(lead.Id);
    }
  };

  const currentStage = getCurrentStageIndex();
  const statusColors = {
    'Open - Not Contacted': 'bg-blue-100 text-blue-800',
    'Working - Contacted': 'bg-purple-100 text-purple-800',
    'Working - Application Out': 'bg-yellow-100 text-yellow-800',
    'Application Missing Info': 'bg-orange-100 text-orange-800',
    'Closed - Not Converted': 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-lg bg-white transition-all hover:shadow-lg hover:border-[#08708E]"
    >
      <div className="flex gap-2 p-3">
        {/* Left Action Buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleQuickView}
            className="h-8 w-8"
            title={isExpanded ? 'Collapse' : 'Quick View'}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullView}
            className="h-8 w-8 text-[#08708E] hover:text-[#065a72]"
            title="Full View"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">{lead.Name}</h3>
            <div className="flex items-center gap-1 text-slate-600">
              <Building2 className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{lead.Company}</span>
            </div>
          </div>
          <Badge className={`${statusColors[lead.Status] || 'bg-slate-100 text-slate-800'} text-xs ml-2 flex-shrink-0`}>
            {lead.Status}
          </Badge>
        </div>

        {/* Stage Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            {stages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  idx <= currentStage ? 'bg-[#08708E] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5 text-center leading-tight">{stage.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {stages.map((_, idx) => (
              <div key={idx} className={`h-1 flex-1 rounded ${
                idx <= currentStage ? 'bg-[#08708E]' : 'bg-slate-200'
              }`} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-2">
          {lead.Phone && (
            <a
              href={`tel:${lead.Phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-[#08708E] transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{lead.Phone}</span>
            </a>
          )}
          {lead.Email && (
            <div className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{lead.Email}</span>
            </div>
          )}
        </div>

        {lead.Funding_Amount_Requested__c && (
          <div className="mb-2 text-xs">
            <span className="text-slate-500">Requested: </span>
            <span className="font-semibold text-[#08708E]">
              ${parseFloat(lead.Funding_Amount_Requested__c).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(lead.LastModifiedDate)}</span>
          </div>
          {lead.LeadSource && (
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{lead.LeadSource}</span>
          )}
        </div>
        </div>
      </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 space-y-3"
          >
            {/* Quick Info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 uppercase">Quick Info</p>
              {lead.AnnualRevenue && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Annual Revenue</p>
                  <p className="text-sm font-semibold text-[#08708E]">{formatCurrency(lead.AnnualRevenue)}</p>
                </div>
              )}
            </div>

            {/* Contact & Basic */}
            {(lead.Title || lead.Industry || lead.Website) && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-semibold text-slate-700 uppercase">Contact & Basic</p>
                <div className="grid grid-cols-2 gap-3">
                  {lead.Title && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Title</p>
                      <p className="text-sm text-slate-900">{lead.Title}</p>
                    </div>
                  )}
                  {lead.Industry && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Industry</p>
                      <p className="text-sm text-slate-900">{lead.Industry}</p>
                    </div>
                  )}
                  {lead.Website && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Website</p>
                      <p className="text-sm text-slate-900 truncate text-ellipsis">{lead.Website}</p>
                    </div>
                  )}
                  {lead.Rating && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Rating</p>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">{lead.Rating}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Info */}
            {lead.Call_Disposition__c && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-semibold text-slate-700 uppercase">Business</p>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Call Disposition</p>
                  <Badge className="bg-green-600 text-white text-xs">{lead.Call_Disposition__c}</Badge>
                </div>
              </div>
            )}

            {lead.Description && (
              <div className="border-t pt-3">
                <p className="text-xs text-slate-500 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-900 line-clamp-3">{lead.Description}</p>
              </div>
            )}

          </motion.div>
        )}
      </motion.div>
  );
}