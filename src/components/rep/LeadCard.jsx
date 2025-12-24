import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2, Calendar, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function LeadCard({ lead, session, onOpenModal }) {
  const [isHovered, setIsHovered] = useState(false);

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

  const handleClick = () => {
    if (onOpenModal) {
      onOpenModal(lead, 'lead');
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
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className="border border-slate-200 rounded-xl p-5 bg-white transition-all cursor-pointer hover:shadow-lg hover:border-[#08708E]"
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
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{lead.Phone}</span>
            </div>
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

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDate(lead.LastModifiedDate)}</span>
          </div>
          {lead.LeadSource && (
            <span className="px-2 py-1 bg-slate-100 rounded">{lead.LeadSource}</span>
          )}
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
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="font-medium text-slate-900">{lead.Company}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a href={`mailto:${lead.Email}`} className="font-medium text-[#08708E] hover:underline">
                    {lead.Email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <a href={`tel:${lead.Phone}`} className="font-medium text-[#08708E] hover:underline">
                    {lead.Phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Funding Requested</p>
                  <p className="font-semibold text-[#08708E]">{formatCurrency(lead.Amount_Requested__c)}</p>
                </div>
                {lead.LeadSource && (
                  <div>
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="font-medium text-slate-900">{lead.LeadSource}</p>
                  </div>
                )}
                {lead.Industry && (
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="font-medium text-slate-900">{lead.Industry}</p>
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