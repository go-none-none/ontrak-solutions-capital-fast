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
      className="border border-slate-200 rounded-xl p-5 bg-white transition-all hover:shadow-lg hover:border-[#08708E]"
    >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{lead.Name}</h3>
            <div className="flex items-center gap-1 text-slate-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{lead.Company}</span>
            </div>
          </div>
          <Badge className={statusColors[lead.Status] || 'bg-slate-100 text-slate-800'}>
            {lead.Status}
          </Badge>
        </div>

        {/* Stage Progress Bar */}
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

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
          {lead.Phone && (
            <a
              href={`tel:${lead.Phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-[#08708E] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{lead.Phone}</span>
            </a>
          )}
          {lead.Email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span className="truncate">{lead.Email}</span>
            </div>
          )}
        </div>

        {lead.Funding_Amount_Requested__c && (
          <div className="mb-3 text-sm">
            <span className="text-slate-500">Funding Requested: </span>
            <span className="font-semibold text-[#08708E]">
              ${parseFloat(lead.Funding_Amount_Requested__c).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(lead.LastModifiedDate)}</span>
          </div>
          {lead.LeadSource && (
            <span className="px-2 py-1 bg-slate-100 rounded">{lead.LeadSource}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickView}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            {isExpanded ? 'Collapse' : 'Quick View'}
          </Button>
          <Button
            size="sm"
            onClick={handleFullView}
            className="flex-1 bg-[#08708E] hover:bg-[#065a72] text-xs"
          >
            Full View
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              {lead.Industry && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Industry</p>
                  <p className="text-sm text-slate-900">{lead.Industry}</p>
                </div>
              )}
              {lead.Rating && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Rating</p>
                  <Badge className="bg-blue-100 text-blue-800">{lead.Rating}</Badge>
                </div>
              )}
              {lead.Title && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Title</p>
                  <p className="text-sm text-slate-900">{lead.Title}</p>
                </div>
              )}
              {lead.Website && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Website</p>
                  <p className="text-sm text-slate-900 truncate">{lead.Website}</p>
                </div>
              )}
              </div>

              {lead.Description && (
              <div className="border-t pt-3">
                <p className="text-xs text-slate-500 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-900 line-clamp-3">{lead.Description}</p>
              </div>
              )}

            {lead.AnnualRevenue && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Annual Revenue</p>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(lead.AnnualRevenue)}</p>
              </div>
            )}
            
            {lead.Call_Disposition__c && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Call Disposition</p>
                <Badge className="bg-green-600 text-white">{lead.Call_Disposition__c}</Badge>
              </div>
            )}

            {lead.Description && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-600 line-clamp-2">{lead.Description}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
  );
}