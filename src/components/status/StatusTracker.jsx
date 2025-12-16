import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, FileText, Search, BadgeCheck, FileSignature, PenTool, DollarSign, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

const leadStatusMap = {
  'open - not contacted': { display: 'Application Received', step: 1 },
  'working - contacted': { display: 'Application Received', step: 1 },
  'working - application out': { display: 'Application Out', step: 2 },
  'application missing info': { display: 'Missing Information', step: 2 },
  'closed - not converted': { display: 'Declined', step: -1 },
  'Converted': { display: 'Converted', step: 4 }
};

const opportunityStatusMap = {
  'application in': { display: 'Application In', step: 1 },
  'underwriting': { display: 'Under Review', step: 2 },
  'approved': { display: 'Approved', step: 3 },
  'contracts out': { display: 'Contracts Out', step: 4 },
  'contracts in': { display: 'Contracts In', step: 5 },
  'renewal processing': { display: 'Renewal Processing', step: 5 },
  'closed - funded': { display: 'Funded', step: 6 },
  'closed - declined': { display: 'Declined', step: -1 }
};

export default function StatusTracker({ recordType, status, stageName, recordId, businessName, lastName }) {
  const statusMap = recordType === 'Lead' ? leadStatusMap : opportunityStatusMap;
  const currentStatus = recordType === 'Lead' ? status : stageName;
  const statusInfo = statusMap[currentStatus] || { display: currentStatus, step: 0 };
  
  const isDeclined = statusInfo.step === -1;
  const isFunded = stageName === 'closed - funded';
  
  const steps = recordType === 'Lead' ? [
    { label: 'Application Submitted', step: 1, icon: FileText },
    { label: 'Initial Review', step: 2, icon: Search },
    { label: 'Qualification Review', step: 3, icon: BadgeCheck },
    { label: 'Moving Forward', step: 4, icon: CheckCircle }
  ] : [
    { label: 'Application Received', step: 1, icon: FileText },
    { label: 'Under Review', step: 2, icon: Search },
    { label: 'Approved', step: 3, icon: BadgeCheck },
    { label: 'Contracts Sent', step: 4, icon: FileSignature },
    { label: 'Contracts Signed', step: 5, icon: PenTool },
    { label: 'Funded', step: 6, icon: DollarSign }
  ];
  
  const isMissingInfo = currentStatus?.toLowerCase() === 'application missing info';
  const uploadUrl = `${createPageUrl('MissingDocs')}?id149=${recordId}&cn=${encodeURIComponent(businessName || '')}&ln=${encodeURIComponent(lastName || '')}`;
  
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg border-2 ${
          isDeclined ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800' :
          isFunded ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-300 text-green-800' :
          'bg-gradient-to-r from-blue-50 to-cyan-100 border-[#08708E] text-[#08708E]'
        }`}>
          {isDeclined && <XCircle className="w-6 h-6" />}
          {isFunded && <CheckCircle className="w-6 h-6 animate-pulse" />}
          {!isDeclined && !isFunded && <Clock className="w-6 h-6 animate-pulse" />}
          <span className="font-bold text-xl">{statusInfo.display}</span>
        </div>
      </div>
      
      {/* Missing Documents CTA */}
      {isMissingInfo && recordType === 'Lead' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Documents Required
              </h3>
              <p className="text-slate-600 mb-4">
                We need additional documents to continue processing your application.
              </p>
              <a href={uploadUrl}>
                <Button className="bg-[#08708E] hover:bg-[#065a72]">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {!isDeclined && (
        <div className="relative">
          <div className="flex justify-between items-start">
            {steps.map((step, index) => {
              const isCompleted = statusInfo.step > step.step;
              const isCurrent = statusInfo.step === step.step;
              const StepIcon = step.icon;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E] shadow-lg' :
                      isCurrent ? 'bg-white border-[#08708E] ring-4 ring-[#08708E]/20 shadow-md' :
                      'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${
                        isCurrent ? 'text-[#08708E]' : 'text-slate-400'
                      }`} />
                    )}
                  </motion.div>
                  <p className={`mt-3 text-sm text-center max-w-[120px] ${
                    isCompleted ? 'text-[#08708E] font-semibold' :
                    isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                  
                  {index < steps.length - 1 && (
                    <div className={`absolute top-7 h-1 rounded-full transition-all duration-500 ${
                      statusInfo.step > step.step ? 'bg-gradient-to-r from-[#08708E] to-[#065a72]' : 'bg-slate-300'
                    }`} style={{
                      left: `${(index + 1) * (100 / steps.length)}%`,
                      width: `${100 / steps.length}%`
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}