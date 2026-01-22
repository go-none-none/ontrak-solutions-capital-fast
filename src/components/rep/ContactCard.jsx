import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building2, MapPin, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ContactCard({ contact }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(createPageUrl('ContactDetail') + `?id=${contact.Id}`)}
      className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer p-4"
    >
      <div className="space-y-3">
        {/* Name and Title */}
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{contact.Name}</h3>
          {contact.Title && (
            <p className="text-sm text-slate-600">{contact.Title}</p>
          )}
        </div>

        {/* Account and Department */}
        <div className="flex flex-wrap gap-2">
          {contact.AccountName && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {contact.AccountName}
            </Badge>
          )}
          {contact.Department && (
            <Badge variant="outline" className="text-xs">
              {contact.Department}
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {contact.Email && (
            <a 
              href={`mailto:${contact.Email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-[#08708E] hover:underline flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {contact.Email}
            </a>
          )}
          {contact.MobilePhone && (
            <a 
              href={`tel:${contact.MobilePhone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-[#08708E] hover:underline flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {contact.MobilePhone}
            </a>
          )}
          {contact.MailingCity && (
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {[contact.MailingCity, contact.MailingState, contact.MailingCountry].filter(Boolean).join(', ')}
            </div>
          )}
          {contact.csbs__Ownership__c && (
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              {contact.csbs__Ownership__c}% Owner
            </div>
          )}
        </div>

        {/* Credit Score */}
        {contact.csbs__Credit_Score__c && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Credit Score</p>
            <p className="font-semibold text-slate-900">{contact.csbs__Credit_Score__c}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}