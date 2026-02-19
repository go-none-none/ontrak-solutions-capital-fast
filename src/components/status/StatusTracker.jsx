import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, FileText, Search, BadgeCheck, FileSignature, PenTool, DollarSign, Upload, FileQuestion } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

const leadStatusMap = {
  'open - not contacted': { display: 'Open', step: 1 },
  'working - contacted': { display: 'Contact Initiated', step: 2 },
  'working - application out': { display: 'Application Sent', step: 3 },
  'application missing info': { display: 'Missing Information', step: 4 },
  'closed - not converted': { display: 'Declined', step: -1 },
  'converted': { display: 'Converted', step: 5 }
};

const opportunityStatusMap = {
  'application in': { display: 'Application In', step: 1 },
  'underwriting': { display: 'Under Review', step: 2 },
  'approved': { display: 'Approved', step: 3 },
  'application missing info': { display: "Add'l Docs", step: 4 },
  'contracts out': { display: 'Contracts Out', step: 5 },
  'contracts in': { display: 'Contracts In', step: 6 },
  'renewal processing': { display: 'Renewal Processing', step: 6 },
  'closed - funded': { display: 'Funded', step: 7 },
  'funded': { display: 'Funded', step: 7 },
  'closed - declined': { display: 'Declined', step: 7 },
  'declined': { display: 'Declined', step: 7 }
};

export default function StatusTracker({ recordType, status, stageName, stageDetail, recordId, businessName, lastName, bankStatementChecklist }) {
  const currentStatus = recordType === 'Lead' ? status : stageName;
  const normalizedStatus = currentStatus?.toLowerCase();
  
  const isLeadDeclined = recordType === 'Lead' && normalizedStatus === 'closed - not converted';
  const isOpportunityDeclined = recordType === 'Opportunity' && (normalizedStatus === 'closed - declined' || normalizedStatus === 'declined');
  const isFunded = recordType === 'Opportunity' && (normalizedStatus === 'closed - funded' || normalizedStatus === 'funded');
  
  const statusMap = recordType === 'Lead' ? leadStatusMap : opportunityStatusMap;
  const statusInfo = statusMap[normalizedStatus] || { display: currentStatus, step: 0 };
  
  const steps = recordType === 'Lead' ? [
    { label: 'Open', step: 1, icon: FileText },
    { label: 'Contact Initiated', step: 2, icon: Search },
    { label: 'Application Sent', step: 3, icon: FileSignature },
    { label: 'Missing Information', step: 4, icon: Upload },
    { label: 'Application Completed', step: 5, icon: CheckCircle }
  ] : isOpportunityDeclined ? [
    { label: 'Application Received', step: 1, icon: FileText },
    { label: 'Under Review', step: 2, icon: Search },
    { label: 'Declined', step: 6, icon: XCircle }
  ] : [
    { label: 'Application Received', step: 1, icon: FileText },
    { label: 'Under Review', step: 2, icon: Search },
    { label: 'Approved', step: 3, icon: BadgeCheck },
    { label: "Add'l Docs", step: 4, icon: FileQuestion },
    { label: 'Contracts Sent', step: 5, icon: FileSignature },
    { label: 'Contracts Signed', step: 6, icon: PenTool },
    { label: 'Funded', step: 7, icon: DollarSign }
  ];
  
  const isMissingInfo = currentStatus?.toLowerCase() === 'application missing info';
  
  return (
    <div className="space-y-6">
      {/* Status Tracker */}
      {!isLeadDeclined && (
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-2">
          {steps.map((step, index) => {
            const isCompleted = statusInfo.step > step.step;
            const isCurrent = statusInfo.step === step.step;
            const StepIcon = step.icon;

            return (
              <div key={index} className="flex sm:flex-col items-center sm:items-center flex-1 relative gap-4 sm:gap-0">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative z-10 transition-all duration-300 flex-shrink-0 ${
                    isCurrent ? 'scale-125' : 'scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent && isOpportunityDeclined && step.step === 6 ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 shadow-2xl ring-4 ring-red-500/20' :
                    isCurrent && isFunded ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-500 shadow-2xl ring-4 ring-green-500/20' :
                    isCurrent ? 'bg-gradient-to-r from-blue-50 to-cyan-100 border-[#08708E] shadow-2xl ring-4 ring-[#08708E]/20' :
                    isCompleted && isFunded ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500' :
                    isCompleted ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E]' :
                    'bg-slate-50 border-slate-200 opacity-40'
                  }`}>
                    {isCompleted && !(isOpportunityDeclined && step.step === 6) ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : (
                      <StepIcon className={`w-7 h-7 ${
                        isCurrent && isOpportunityDeclined && step.step === 6 ? 'text-red-600' :
                        isCurrent ? 'text-[#08708E]' : 'text-slate-400'
                      }`} />
                    )}
                  </div>
                </motion.div>

                <div className="flex-1">
                  <p className={`sm:mt-3 text-sm sm:text-center font-medium transition-all duration-300 ${
                    isCurrent && isOpportunityDeclined && step.step === 6 ? 'text-red-600 font-bold' :
                    isCurrent ? 'text-[#08708E] font-bold' :
                    isCompleted ? 'text-slate-700' :
                    'text-slate-400'
                  }`}>
                    {step.label}
                  </p>

                  {isCurrent && isOpportunityDeclined && step.step === 6 && stageDetail && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200 sm:text-center">
                      {stageDetail}
                    </div>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <>
                    {/* Mobile: Vertical line */}
                    <div className={`sm:hidden absolute left-8 top-[72px] w-1 h-6 rounded-full transition-all duration-500 ${
                      statusInfo.step > step.step ? 'bg-gradient-to-b from-[#08708E] to-[#065a72]' : 'bg-slate-200'
                    }`} />
                    {/* Desktop: Horizontal line */}
                    <div className={`hidden sm:block absolute top-8 left-[60%] w-full h-1 rounded-full transition-all duration-500 ${
                      statusInfo.step > step.step ? 'bg-gradient-to-r from-[#08708E] to-[#065a72]' : 'bg-slate-200'
                    }`} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isLeadDeclined && (
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg border-2 bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800">
            <XCircle className="w-6 h-6" />
            <span className="font-bold text-xl">{statusInfo.display}</span>
          </div>
        </div>
      )}
      
      {/* Bank Statement Checklist */}
      {isMissingInfo && recordType === 'Lead' && bankStatementChecklist && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Required Bank Statements</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4 ml-[52px]">
            We're still waiting for the missing bank statements below. Please upload them using the form below to keep your application moving forward.
          </p>
          <div className="bg-white rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bankStatementChecklist.split(/<br\s*\/?>/i).map((item, index) => {
              const trimmedItem = item.trim();
              if (!trimmedItem) return null;
              const isMissing = trimmedItem.includes('❌');
              const isReceived = trimmedItem.includes('✅');
              return (
                <div key={index} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  isMissing ? 'bg-red-50 border-2 border-red-300' : 
                  isReceived ? 'bg-green-50 border-2 border-green-300' : 
                  'bg-slate-50 border-2 border-slate-200'
                }`}>
                  <span className={`text-3xl ${isMissing ? 'animate-pulse' : ''}`}>
                    {isMissing ? '❌' : isReceived ? '✅' : '📄'}
                  </span>
                  <span className={`text-center text-sm font-semibold ${
                    isMissing ? 'text-red-700' : 
                    isReceived ? 'text-green-700' : 
                    'text-slate-700'
                  }`}>
                    {trimmedItem.replace(/[❌✅]/g, '').replace('Bank Statement – ', '').trim()}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}




    </div>
  );
}