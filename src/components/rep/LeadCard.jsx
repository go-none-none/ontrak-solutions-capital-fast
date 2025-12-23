import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2, Calendar, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function LeadCard({ lead, session }) {
  const statusColors = {
    'Open - Not Contacted': 'bg-blue-100 text-blue-800',
    'Working - Contacted': 'bg-yellow-100 text-yellow-800',
    'Working - Application Out': 'bg-purple-100 text-purple-800',
    'Application Missing Info': 'bg-orange-100 text-orange-800',
    'Converted': 'bg-green-100 text-green-800',
    'Closed - Not Converted': 'bg-red-100 text-red-800'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            <h3 className="text-lg font-semibold text-slate-900">{lead.Name}</h3>
            <Badge className={statusColors[lead.Status] || 'bg-slate-100 text-slate-800'}>
              {lead.Status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-slate-600 mb-1">
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

      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
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