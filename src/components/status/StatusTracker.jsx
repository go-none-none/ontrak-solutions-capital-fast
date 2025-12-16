import React, { useEffect } from 'react';
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
  const normalizedStatus = currentStatus?.toLowerCase();
  const statusInfo = statusMap[normalizedStatus] || { display: currentStatus, step: 0 };
  
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
  
  useEffect(() => {
    if (isMissingInfo && recordType === 'Lead') {
      const container = document.getElementById('jotform-missing-docs');
      if (container && !container.querySelector('iframe')) {
        let iframeSrc = 'https://form.jotform.com/253446533291155';
        const params = [];
        if (recordId) params.push(`id149=${encodeURIComponent(recordId)}`);
        if (businessName) params.push(`cn=${encodeURIComponent(businessName)}`);
        if (lastName) params.push(`ln=${encodeURIComponent(lastName)}`);
        
        if (params.length > 0) {
          iframeSrc += `?${params.join('&')}`;
        }
        
        container.innerHTML = `
          <iframe
            id="JotFormIFrame-missing-docs"
            title="Missing Documents Upload"
            allowtransparency="true"
            allow="geolocation; microphone; camera; fullscreen"
            src="${iframeSrc}"
            frameborder="0"
            style="min-width:100%;max-width:100%;height:539px;border:none;"
            scrolling="no"
          >
          </iframe>
        `;
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
        script.onload = () => {
          if (window.jotformEmbedHandler) {
            window.jotformEmbedHandler("iframe[id='JotFormIFrame-missing-docs']", "https://form.jotform.com/");
          }
        };
        document.body.appendChild(script);
        
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    }
  }, [isMissingInfo, recordType, recordId, businessName, lastName]);
  
  return (
    <div className="space-y-6">
      {/* Status Tracker */}
      {!isDeclined && (
        <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const isCompleted = statusInfo.step > step.step;
            const isCurrent = statusInfo.step === step.step;
            const StepIcon = step.icon;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 min-w-[120px] relative">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative z-10 transition-all duration-300 ${
                    isCurrent ? 'scale-125' : 'scale-100'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent ? 'bg-gradient-to-r from-blue-50 to-cyan-100 border-[#08708E] shadow-2xl ring-4 ring-[#08708E]/20' :
                    isCompleted ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E]' :
                    'bg-slate-50 border-slate-200 opacity-40'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : (
                      <StepIcon className={`w-7 h-7 ${
                        isCurrent ? 'text-[#08708E]' : 'text-slate-400'
                      }`} />
                    )}
                  </div>
                </motion.div>
                
                <p className={`mt-3 text-sm text-center font-medium transition-all duration-300 ${
                  isCurrent ? 'text-[#08708E] font-bold' :
                  isCompleted ? 'text-slate-700' :
                  'text-slate-400'
                }`}>
                  {step.label}
                </p>
                
                {isCurrent && (
                  <div className="mt-2 flex items-center gap-1 text-[#08708E] text-xs">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="font-medium">Current</span>
                  </div>
                )}
                
                {index < steps.length - 1 && (
                  <div className={`absolute top-8 left-[60%] w-full h-1 rounded-full transition-all duration-500 ${
                    statusInfo.step > step.step ? 'bg-gradient-to-r from-[#08708E] to-[#065a72]' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isDeclined && (
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg border-2 bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800">
            <XCircle className="w-6 h-6" />
            <span className="font-bold text-xl">{statusInfo.display}</span>
          </div>
        </div>
      )}
      
      {/* Missing Documents Form */}
      {isMissingInfo && recordType === 'Lead' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Documents Required
              </h3>
              <p className="text-slate-600">
                Please upload the required documents below to continue processing your application.
              </p>
            </div>
          </div>
          <div id="jotform-missing-docs" className="bg-white rounded-xl overflow-hidden">
            <p style={{textAlign: 'center', padding: '40px', color: '#08708E'}}>
              Loading upload form...
            </p>
          </div>
        </div>
      )}


    </div>
  );
}