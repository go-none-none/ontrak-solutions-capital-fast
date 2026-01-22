import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building2, User } from 'lucide-react';

export default function ContactCard({ contact, session, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect && onSelect(contact)}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{contact.Name}</CardTitle>
              {contact.Title && <p className="text-xs text-slate-600 mt-1 truncate">{contact.Title}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {contact.Email && (
              <a href={`mailto:${contact.Email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{contact.Email}</span>
              </a>
            )}
            {contact.Phone && (
              <a href={`tel:${contact.Phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{contact.Phone}</span>
              </a>
            )}
            {contact.MobilePhone && contact.MobilePhone !== contact.Phone && (
              <a href={`tel:${contact.MobilePhone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{contact.MobilePhone}</span>
              </a>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {contact.Account?.Name && (
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{contact.Account.Name}</span>
              </div>
            )}
            {contact.Department && (
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{contact.Department}</span>
              </div>
            )}
          </div>

          {contact.Title && (
            <div className="pt-2 border-t">
              <Badge className="text-xs bg-slate-100 text-slate-800">{contact.Title}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}