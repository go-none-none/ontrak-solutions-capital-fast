import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

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

export default function StatusTracker({ recordType, status, stageName }) {
  const statusMap = recordType === 'Lead' ? leadStatusMap : opportunityStatusMap;
  const currentStatus = recordType === 'Lead' ? status : stageName;
  const statusInfo = statusMap[currentStatus] || { display: currentStatus, step: 0 };
  
  const isDeclined = statusInfo.step === -1;
  const isFunded = stageName === 'closed - funded';
  
  const steps = recordType === 'Lead' ? [
    { label: '📝 Application Submitted', step: 1 },
    { label: '🔍 Initial Review', step: 2 },
    { label: '✅ Qualification Review', step: 3 },
    { label: '🎉 Moving Forward', step: 4 }
  ] : [
    { label: '📝 Application Received', step: 1 },
    { label: '🔍 Under Review', step: 2 },
    { label: '✅ Approved', step: 3 },
    { label: '📋 Contracts Sent', step: 4 },
    { label: '✍️ Contracts Signed', step: 5 },
    { label: '💰 Funded', step: 6 }
  ];
  
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
      
      {/* Progress Steps */}
      {!isDeclined && (
        <div className="relative">
          <div className="flex justify-between items-start">
            {steps.map((step, index) => {
              const isCompleted = statusInfo.step >= step.step;
              const isCurrent = statusInfo.step === step.step;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-br from-[#08708E] to-[#065a72] border-[#08708E] shadow-lg' :
                      isCurrent ? 'bg-white border-[#08708E] ring-4 ring-[#08708E]/20 animate-pulse' :
                      'bg-white border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 rounded-full bg-[#08708E] animate-pulse" />
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">{step.step}</span>
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