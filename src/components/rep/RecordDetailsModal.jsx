import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Phone, DollarSign, Calendar, Building } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function RecordDetailsModal({ record, type, isOpen, onClose }) {
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
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-purple-100 text-purple-800',
    'qualified': 'bg-green-100 text-green-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
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
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>{isLead ? record.Name : record.Name}</span>
            <Badge className={statusColors[isLead ? record.Status : record.StageName] || 'bg-slate-100 text-slate-800'}>
              {isLead ? record.Status : record.StageName}
            </Badge>
          </DialogTitle>
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
                </>
              ) : (
                <>
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
                  {record.Probability != null && (
                    <div>
                      <p className="text-slate-500 text-xs">Probability</p>
                      <p className="font-medium text-slate-900">{record.Probability}%</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <p className="text-slate-500 text-xs">Owner</p>
                <p className="font-medium text-slate-900">{record.Owner?.Name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Link 
              to={`${createPageUrl(isLead ? 'LeadDetail' : 'OpportunityDetail')}?id=${record.Id}`}
              className="flex-1"
            >
              <Button className="w-full bg-[#08708E] hover:bg-[#065a72]">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}