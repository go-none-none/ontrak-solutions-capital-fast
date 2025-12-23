import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2, Calendar, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import DialpadWidget from './DialpadWidget';

export default function LeadCard({ lead, session }) {
  const stages = [
    { label: 'New', status: 'Open - Not Contacted' },
    { label: 'Contacted', status: 'Working - Contacted' },
    { label: 'App Out', status: 'Working - Application Out' },
    { label: 'Missing Info', status: 'Application Missing Info' },
    { label: 'Converted', status: 'Converted' }
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

  const currentStage = getCurrentStageIndex();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{lead.Name}</h3>
          <div className="flex items-center gap-1 text-slate-600 mb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">{lead.Company}</span>
          </div>
        </div>
        <Link to={`${createPageUrl('LeadDetail')}?id=${lead.Id}`}>
          <Button variant="outline" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
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
          <a href={`tel:${lead.Phone}`} className="flex items-center gap-1 hover:text-[#08708E]">
            <Phone className="w-4 h-4" />
            <span>{lead.Phone}</span>
          </a>
        )}
        {lead.Email && (
          <a href={`mailto:${lead.Email}`} className="flex items-center gap-1 hover:text-[#08708E]">
            <Mail className="w-4 h-4" />
            <span>{lead.Email}</span>
          </a>
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
  );
}