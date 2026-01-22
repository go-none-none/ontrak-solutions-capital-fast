import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Phone, DollarSign, Calendar, Building, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import ActivityPanel from './ActivityPanel';

export default function RecordDetailsModal({ record, type, isOpen, onClose, expandable = false, onExpand, session }) {
  const navigate = useNavigate();
  if (!record) return null;

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLead = type === 'lead';
  const statusColors = {
    'Open - Not Contacted': 'bg-blue-100 text-blue-800',
    'Working - Contacted': 'bg-purple-100 text-purple-800',
    'Working - Application Out': 'bg-yellow-100 text-yellow-800',
    'Application Missing Info': 'bg-orange-100 text-orange-800',
    'Closed - Not Converted': 'bg-red-100 text-red-800',
    'Application In': 'bg-blue-100 text-blue-800',
    'Underwriting': 'bg-purple-100 text-purple-800',
    'Approved': 'bg-green-100 text-green-800',
    'Contracts Out': 'bg-yellow-100 text-yellow-800',
    'Contracts In': 'bg-indigo-100 text-indigo-800'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between gap-2">
            <button 
              onClick={() => {
                onClose();
                navigate(createPageUrl('LeadDetail') + `?id=${record.Id}`);
              }}
              className="text-[#08708E] hover:underline flex items-center gap-1 group"
            >
              <span className="group-hover:font-semibold">{isLead ? record.Name : record.Name}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <Badge className={statusColors[isLead ? record.Status : record.StageName] || 'bg-slate-100 text-slate-800'}>
              {isLead ? record.Status : record.StageName}
            </Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isLead ? 'Lead details and information' : 'Opportunity details and information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Primary Info */}
          <div className="grid grid-cols-2 gap-4">
            {isLead ? (
              <>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="font-medium text-slate-900">{record.Company || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <a href={`mailto:${record.Email}`} className="font-medium text-[#08708E] hover:underline">
                      {record.Email || 'N/A'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <a href={`tel:${record.Phone}`} className="font-medium text-[#08708E] hover:underline">
                      {record.Phone || 'N/A'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Funding Requested</p>
                    <p className="font-semibold text-[#08708E]">{formatCurrency(record.Amount_Requested__c)}</p>
                  </div>
                </div>
                {record.Estimated_Monthly_Revenue__c && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Monthly Revenue</p>
                      <p className="font-medium text-slate-900">{formatCurrency(record.Estimated_Monthly_Revenue__c)}</p>
                    </div>
                  </div>
                )}
                {record.Months_In_Business__c && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Time in Business</p>
                      <p className="font-medium text-slate-900">{record.Months_In_Business__c} months</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Account</p>
                    <p className="font-medium text-slate-900">{record.Account?.Name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="font-semibold text-[#08708E] text-lg">{formatCurrency(record.Amount)}</p>
                  </div>
                </div>
                {record.CloseDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Close Date</p>
                      <p className="font-medium text-slate-900">{formatDate(record.CloseDate)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Company & Address Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-900 mb-3">Company & Address Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {isLead ? (
                <>
                  {record.Company && (
                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs">Company Name</p>
                      <p className="font-medium text-slate-900 text-base">{record.Company}</p>
                    </div>
                  )}
                  {record.Street && (
                    <div>
                      <p className="text-slate-500 text-xs">Street Address</p>
                      <p className="font-medium text-slate-900">{record.Street}</p>
                    </div>
                  )}
                  {record.City && (
                    <div>
                      <p className="text-slate-500 text-xs">City, State, Zip</p>
                      <p className="font-medium text-slate-900">{record.City}, {record.State} {record.PostalCode}</p>
                    </div>
                  )}
                  {record.Country && (
                    <div>
                      <p className="text-slate-500 text-xs">Country</p>
                      <p className="font-medium text-slate-900">{record.Country}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {record.Account?.Name && (
                    <div className="col-span-2">
                      <p className="text-slate-500 text-xs">Account Name</p>
                      <p className="font-medium text-slate-900 text-base">{record.Account.Name}</p>
                    </div>
                  )}
                  {record.Account?.BillingStreet && (
                    <div>
                      <p className="text-slate-500 text-xs">Billing Street</p>
                      <p className="font-medium text-slate-900">{record.Account.BillingStreet}</p>
                    </div>
                  )}
                  {record.Account?.BillingCity && (
                    <div>
                      <p className="text-slate-500 text-xs">City, State, Zip</p>
                      <p className="font-medium text-slate-900">{record.Account.BillingCity}, {record.Account.BillingState} {record.Account.BillingPostalCode}</p>
                    </div>
                  )}
                  {record.Account?.Phone && (
                    <div>
                      <p className="text-slate-500 text-xs">Company Phone</p>
                      <a href={`tel:${record.Account.Phone}`} className="font-medium text-[#08708E] hover:underline">
                        {record.Account.Phone}
                      </a>
                    </div>
                  )}
                  {record.Account?.BillingCountry && (
                    <div>
                      <p className="text-slate-500 text-xs">Country</p>
                      <p className="font-medium text-slate-900">{record.Account.BillingCountry}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Call Disposition (for leads) */}
          {isLead && record.Call_Disposition__c && (
           <div className="border-t pt-4">
             <h3 className="font-semibold text-slate-900 mb-3">Call Disposition</h3>
             <Badge className="bg-blue-600 text-white">{record.Call_Disposition__c}</Badge>
           </div>
          )}

          {/* Additional Details */}
          <div className="border-t pt-4">
           <h3 className="font-semibold text-slate-900 mb-3">Additional Information</h3>
           <div className="grid grid-cols-2 gap-3 text-sm">
             {isLead ? (
               <>
                 {record.LeadSource && (
                   <div>
                     <p className="text-slate-500 text-xs">Lead Source</p>
                     <p className="font-medium text-slate-900">{record.LeadSource}</p>
                   </div>
                 )}
                 {record.Industry && (
                   <div>
                     <p className="text-slate-500 text-xs">Industry</p>
                     <p className="font-medium text-slate-900">{record.Industry}</p>
                   </div>
                 )}
                 {record.Rating && (
                   <div>
                     <p className="text-slate-500 text-xs">Rating</p>
                     <p className="font-medium text-slate-900">{record.Rating}</p>
                   </div>
                 )}
                 {record.Use_of_Proceeds__c && (
                   <div className="col-span-2">
                     <p className="text-slate-500 text-xs">Use of Funds</p>
                     <p className="font-medium text-slate-900">{record.Use_of_Proceeds__c}</p>
                   </div>
                 )}
               </>
             ) : (
               <>
                 {record.Probability != null && (
                   <div>
                     <p className="text-slate-500 text-xs">Probability</p>
                     <p className="font-medium text-slate-900">{record.Probability}%</p>
                   </div>
                 )}
                 {record.Amount_Requested__c && (
                   <div>
                     <p className="text-slate-500 text-xs">Amount Requested</p>
                     <p className="font-medium text-slate-900">{formatCurrency(record.Amount_Requested__c)}</p>
                   </div>
                 )}
                 {record.Estimated_Monthly_Revenue__c && (
                   <div>
                     <p className="text-slate-500 text-xs">Monthly Revenue</p>
                     <p className="font-medium text-slate-900">{formatCurrency(record.Estimated_Monthly_Revenue__c)}</p>
                   </div>
                 )}
                 {record.Type && (
                   <div>
                     <p className="text-slate-500 text-xs">Type</p>
                     <p className="font-medium text-slate-900">{record.Type}</p>
                   </div>
                 )}
                 {record.LeadSource && (
                   <div>
                     <p className="text-slate-500 text-xs">Lead Source</p>
                     <p className="font-medium text-slate-900">{record.LeadSource}</p>
                   </div>
                 )}
                 {record.Use_of_Proceeds__c && (
                   <div className="col-span-2">
                     <p className="text-slate-500 text-xs">Use of Funds</p>
                     <p className="font-medium text-slate-900">{record.Use_of_Proceeds__c}</p>
                   </div>
                 )}
               </>
             )}
           </div>
          </div>

          {/* Activity Timeline */}
          {isLead && session && (
           <div className="border-t pt-4">
             <ActivityPanel
               recordId={record.Id}
               recordType="Lead"
               session={session}
             />
           </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {expandable && onExpand && (
              <Button 
                onClick={() => {
                  onClose();
                  onExpand();
                }}
                className="flex-1 bg-[#08708E] hover:bg-[#065a72]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Info
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}