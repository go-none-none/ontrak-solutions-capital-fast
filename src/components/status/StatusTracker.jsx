import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, FileText, Search, BadgeCheck, FileSignature, PenTool, DollarSign, Upload, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

const leadStatusMap = {
  'open - not contacted': { display: 'Open', step: 1 },
  'working - contacted': { display: 'Contacted', step: 2 },
  'working - application out': { display: 'Application Sent', step: 3 },
  'application missing info': { display: 'Missing Information', step: 3 },
  'closed - not converted': { display: 'Declined', step: -1 },
  'Converted': { display: 'Converted', step: 4 }
};

const opportunityStatusMap = {
  'application in': { display: 'Application Received', step: 1 },
  'underwriting': { display: 'Under Review', step: 2 },
  'approved': { display: 'Approved', step: 3 },
  'contracts out': { display: 'Contracts Sent', step: 4 },
  'contracts in': { display: 'Contracts Received', step: 5 },
  'renewal processing': { display: 'Renewal Eligible', step: 6 },
  'closed - funded': { display: 'Funded', step: 7 },
  'closed - declined': { display: 'Declined', step: -1 }
};

export default function StatusTracker({ recordType, status, stageName, recordId, businessName, lastName }) {
  const statusMap = recordType === 'Lead' ? leadStatusMap : opportunityStatusMap;
  const currentStatus = recordType === 'Lead' ? status : stageName;
  const statusInfo = statusMap[currentStatus] || { display: currentStatus, step: 0 };
  
  const isDeclined = statusInfo.step === -1;
  const isFunded = stageName === 'closed - funded';
  
  const steps = recordType === 'Lead' ? [
    { label: 'Open', step: 1, icon: FileText },
    { label: 'Contacted', step: 2, icon: Phone },
    { label: 'Application Sent', step: 3, icon: FileSignature },
    { label: 'Converted', step: 4, icon: CheckCircle }
  ] : [
    { label: 'Application Received', step: 1, icon: FileText },
    { label: 'Under Review', step: 2, icon: Search },
    { label: 'Approved', step: 3, icon: BadgeCheck },
    { label: 'Contracts Sent', step: 4, icon: FileSignature },
    { label: 'Contracts Received', step: 5, icon: PenTool },
    { label: 'Renewal Eligible', step: 6, icon: Clock },
    { label: 'Funded', step: 7, icon: DollarSign }
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
      }
    }
  }, [isMissingInfo, recordType, recordId, businessName, lastName]);
  
  return (
    <div className="space-y-6">
      
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

      {/* Status Bar */}
      {!isDeclined ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="relative">
            {/* Background Line */}
            <div className="absolute top-[52px] left-0 right-0 h-2 bg-slate-200 rounded-full" style={{ marginLeft: '6%', marginRight: '6%' }} />
            
            {/* Progress Line */}
            <div 
              className="absolute top-[52px] left-0 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ 
                marginLeft: '6%',
                width: `${Math.max(0, ((statusInfo.step - 1) / (steps.length - 1)) * 88)}%`,
                background: 'linear-gradient(to right, #08708E, #065a72)'
              }}
            />
            
            {/* Steps */}
            <div className="flex justify-between items-start relative">
              {steps.map((step, index) => {
                const isCompleted = statusInfo.step > step.step;
                const isCurrent = statusInfo.step === step.step;
                const isFuture = statusInfo.step < step.step;
                const StepIcon = step.icon;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-[104px] h-[104px] rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isCompleted ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E] shadow-xl' :
                        isCurrent ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E] shadow-2xl scale-110 ring-8 ring-[#08708E]/20' :
                        'bg-slate-100 border-slate-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-12 h-12 text-white" />
                      ) : (
                        <StepIcon className={`w-12 h-12 ${
                          isCurrent ? 'text-white' : 'text-slate-400'
                        }`} />
                      )}
                    </motion.div>
                    
                    {/* Label */}
                    <p className={`mt-4 text-center max-w-[140px] transition-all duration-300 ${
                      isCurrent ? 'text-[#08708E] font-bold text-lg' :
                      isCompleted ? 'text-[#08708E] font-semibold text-base' :
                      'text-slate-400 text-sm'
                    }`}>
                      {step.label}
                    </p>
                    
                    {/* Current Status Badge */}
                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 bg-[#08708E] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg"
                      >
                        CURRENT
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg border-2 bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800">
            <XCircle className="w-6 h-6" />
            <span className="font-bold text-xl">{statusInfo.display}</span>
          </div>
        </div>
      )}
    </div>
  );
}