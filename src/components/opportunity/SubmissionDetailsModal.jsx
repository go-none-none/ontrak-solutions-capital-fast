import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

export default function SubmissionDetailsModal({ isOpen, onClose, submission }) {
  if (!submission) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Submission Details</span>
            <Badge>{submission.csbs__Status__c || 'Pending'}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Submission Name</p>
                <p className="font-medium text-slate-900">{submission.Name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Lender</p>
                <p className="font-medium text-slate-900">{submission.csbs__Lender__r?.Name || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Status</p>
                <p className="font-medium text-slate-900">{submission.csbs__Status__c || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Type</p>
                <p className="font-medium text-slate-900">{submission.csbs__Type__c || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">API Lender Status</p>
                <p className="font-medium text-slate-900">{submission.csbs__API_Lender_Status__c || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Submission Date</p>
                <p className="font-medium text-slate-900">{formatDate(submission.csbs__Submission_Date__c)}</p>
              </div>
            </div>
          </div>

          {/* Term Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Term Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Min Term</p>
                <p className="font-medium text-slate-900">{submission.csbs__Min_Term__c || '-'} months</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Max Term</p>
                <p className="font-medium text-slate-900">{submission.csbs__Max_Term__c || '-'} months</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {submission.csbs__Notes__c && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Notes</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{submission.csbs__Notes__c}</p>
            </div>
          )}

          {/* Additional Fields */}
          {(submission.csbs__API_ID__c || submission.csbs__API_Response__c) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">API Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {submission.csbs__API_ID__c && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">API ID</p>
                    <p className="font-medium text-slate-900 break-all">{submission.csbs__API_ID__c}</p>
                  </div>
                )}
                {submission.csbs__API_Response__c && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs mb-1">API Response</p>
                    <p className="font-medium text-slate-900 text-xs bg-slate-50 p-2 rounded break-all">{submission.csbs__API_Response__c}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}