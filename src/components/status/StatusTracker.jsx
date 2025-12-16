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
    { label: 'Application Received', step: 1 },
    { label: 'Application Out', step: 2 },
    { label: 'Under Review', step: 3 },
    { label: 'Converted', step: 4 }
  ] : [
    { label: 'Application In', step: 1 },
    { label: 'Under Review', step: 2 },
    { label: 'Approved', step: 3 },
    { label: 'Contracts Out', step: 4 },
    { label: 'Contracts In', step: 5 },
    { label: 'Funded', step: 6 }
  ];
  
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
          isDeclined ? 'bg-red-100 text-red-800' :
          isFunded ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {isDeclined && <XCircle className="w-5 h-5" />}
          {isFunded && <CheckCircle className="w-5 h-5" />}
          {!isDeclined && !isFunded && <Clock className="w-5 h-5" />}
          <span className="font-semibold text-lg">{statusInfo.display}</span>
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-[#08708E] border-[#08708E]' :
                      isCurrent ? 'bg-white border-[#08708E]' :
                      'bg-white border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`text-sm font-semibold ${
                        isCurrent ? 'text-[#08708E]' : 'text-slate-400'
                      }`}>{step.step}</span>
                    )}
                  </motion.div>
                  <p className={`mt-2 text-xs text-center max-w-[100px] ${
                    isCompleted || isCurrent ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                  
                  {index < steps.length - 1 && (
                    <div className={`absolute top-5 h-0.5 ${
                      statusInfo.step > step.step ? 'bg-[#08708E]' : 'bg-slate-300'
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