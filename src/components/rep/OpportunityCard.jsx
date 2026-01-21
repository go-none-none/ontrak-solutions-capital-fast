import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Building2, TrendingUp, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function OpportunityCard({ opportunity, session, onUpdate, isExpanded, onToggleExpand }) {
  const navigate = useNavigate();
  const [fullData, setFullData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isExpanded && !fullData && session) {
      setLoadingData(true);
      base44.functions.invoke('getSalesforceRecord', {
        recordId: opportunity.Id,
        recordType: 'Opportunity',
        token: session.token,
        instanceUrl: session.instanceUrl
      }).then(res => {
        setFullData(res.data.record);
        setLoadingData(false);
      }).catch(() => setLoadingData(false));
    }
  }, [isExpanded, opportunity.Id, session, fullData]);

  const stages = [
    { label: 'App In', name: 'Application In' },
    { label: 'Underwriting', name: 'Underwriting' },
    { label: 'Approved', name: 'Approved' },
    { label: 'Contracts Out', name: 'Contracts Out' },
    { label: 'Contracts In', name: 'Contracts In' },
    { label: 'Funded', name: 'Closed - Funded' }
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.name === opportunity.StageName);
    return index >= 0 ? index : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFullView = (e) => {
    e.stopPropagation();
    navigate(createPageUrl('OpportunityDetail') + `?id=${opportunity.Id}`);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(opportunity.Id);
    }
  };

  const currentStage = getCurrentStageIndex();
  const isDeclined = opportunity.StageName && opportunity.StageName.includes('Declined');

  const statusColors = {
    'Application In': 'bg-blue-100 text-blue-800',
    'Underwriting': 'bg-purple-100 text-purple-800',
    'Approved': 'bg-green-100 text-green-800',
    'Contracts Out': 'bg-yellow-100 text-yellow-800',
    'Contracts In': 'bg-indigo-100 text-indigo-800',
    'Closed - Funded': 'bg-emerald-100 text-emerald-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-5 bg-white transition-all ${
        isDeclined 
          ? 'border-red-200 bg-red-50/50 hover:shadow-lg hover:border-red-400' 
          : 'border-slate-200 hover:shadow-lg hover:border-orange-600'
      }`}
    >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{opportunity.Name}</h3>
            {opportunity.Account?.Name && (
              <div className="flex items-center gap-1 text-slate-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{opportunity.Account.Name}</span>
              </div>
            )}
          </div>
          <Badge className={
            isDeclined 
              ? 'bg-red-100 text-red-800' 
              : statusColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'
          }>
            {opportunity.StageName}
          </Badge>
        </div>

        {/* Stage Progress Bar */}
        {!isDeclined && (
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2 gap-1">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold flex-shrink-0 ${
                    idx <= currentStage ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-[9px] md:text-xs text-slate-600 mt-0.5 md:mt-1 text-center leading-tight h-[20px] md:h-[24px] flex items-start justify-center">{stage.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-0.5 md:gap-1">
              {stages.map((_, idx) => (
                <div key={idx} className={`h-1.5 flex-1 rounded ${
                  idx <= currentStage ? 'bg-orange-600' : 'bg-slate-200'
                }`} />
              ))}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium text-center">{opportunity.StageName}</p>
          </div>
        )}

        <div className="flex items-center gap-6 text-sm mb-3">
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(opportunity.Amount)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <TrendingUp className="w-4 h-4" />
            <span>{opportunity.Probability}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Close: {formatDate(opportunity.CloseDate)}</span>
          </div>
          <span>Updated {formatDate(opportunity.LastModifiedDate)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickView}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            {isExpanded ? 'Collapse' : 'Quick View'}
          </Button>
          <Button
            size="sm"
            onClick={handleFullView}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-xs"
          >
            Full View
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 space-y-3 max-h-96 overflow-y-auto"
          >
            {/* Key Info */}
            {(opportunity.Amount || opportunity.CloseDate || opportunity.Probability) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Key Info</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {opportunity.Amount && <div><span className="text-slate-500">Amount:</span> {formatCurrency(opportunity.Amount)}</div>}
                  {opportunity.CloseDate && <div><span className="text-slate-500">Close:</span> {formatDate(opportunity.CloseDate)}</div>}
                  {opportunity.Probability && <div><span className="text-slate-500">Prob:</span> {opportunity.Probability}%</div>}
                </div>
              </div>
            )}

            {/* Opp Info */}
            {(opportunity.Type || opportunity.LeadSource || opportunity.csbs__ISO__c || opportunity.csbs__Line_of_Credit__c) && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Opp Info</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {opportunity.Type && <div><span className="text-slate-500">Type:</span> {opportunity.Type}</div>}
                  {opportunity.LeadSource && <div><span className="text-slate-500">Source:</span> {opportunity.LeadSource}</div>}
                  {opportunity.csbs__ISO__c && <div><span className="text-slate-500">ISO:</span> {opportunity.csbs__ISO__c}</div>}
                  {opportunity.csbs__Line_of_Credit__c && <div><span className="text-slate-500">LOC:</span> {opportunity.csbs__Line_of_Credit__c}</div>}
                </div>
              </div>
            )}

            {/* Qualifying Info */}
            {(opportunity.csbs__Amount_Requested__c || opportunity.csbs__Months_In_Business__c || opportunity.csbs__Estimated_Monthly_Revenue__c) && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Qualifying</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {opportunity.csbs__Amount_Requested__c && <div><span className="text-slate-500">Req:</span> {formatCurrency(opportunity.csbs__Amount_Requested__c)}</div>}
                  {opportunity.csbs__Months_In_Business__c && <div><span className="text-slate-500">Months:</span> {opportunity.csbs__Months_In_Business__c}</div>}
                  {opportunity.csbs__Use_of_Proceeds__c && <div className="col-span-2"><span className="text-slate-500">Use:</span> {opportunity.csbs__Use_of_Proceeds__c}</div>}
                  {opportunity.csbs__Estimated_Monthly_Revenue__c && <div><span className="text-slate-500">Revenue:</span> {formatCurrency(opportunity.csbs__Estimated_Monthly_Revenue__c)}</div>}
                  {opportunity.csbs__Number_of_Terminals__c && <div><span className="text-slate-500">Terminals:</span> {opportunity.csbs__Number_of_Terminals__c}</div>}
                  {opportunity.csbs__Open_Loan_Balances__c && <div><span className="text-slate-500">Balances:</span> {formatCurrency(opportunity.csbs__Open_Loan_Balances__c)}</div>}
                  {opportunity.csbs__Open_Bankruptcies__c && <div><span className="text-slate-500">Bankruptcies:</span> {opportunity.csbs__Open_Bankruptcies__c}</div>}
                  {opportunity.csbs__Number_of_Open_Positions__c && <div><span className="text-slate-500">Positions:</span> {opportunity.csbs__Number_of_Open_Positions__c}</div>}
                </div>
              </div>
            )}

            {/* Financial Info */}
            {(opportunity.csbs__Avg_Gross_Monthly_Sales__c || opportunity.csbs__Avg_Daily_Balance__c) && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Financial</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {opportunity.csbs__Avg_Gross_Monthly_Sales__c && <div><span className="text-slate-500">Sales:</span> {formatCurrency(opportunity.csbs__Avg_Gross_Monthly_Sales__c)}</div>}
                  {opportunity.csbs__Avg_Bank_Deposits__c && <div><span className="text-slate-500">Deposits:</span> {formatCurrency(opportunity.csbs__Avg_Bank_Deposits__c)}</div>}
                  {opportunity.csbs__Avg_Daily_Balance__c && <div><span className="text-slate-500">Bal:</span> {formatCurrency(opportunity.csbs__Avg_Daily_Balance__c)}</div>}
                  {opportunity.csbs__Avg_NSFs__c && <div><span className="text-slate-500">NSFs:</span> {opportunity.csbs__Avg_NSFs__c}</div>}
                </div>
              </div>
            )}

            {/* Open Balances */}
            {(opportunity.Lender_Name_1__c || opportunity.Lender_Name_2__c || opportunity.Lender_Name_3__c) && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Open Balances</p>
                <div className="space-y-1 text-xs">
                  {opportunity.Lender_Name_1__c && <div><span className="text-slate-500">{opportunity.Lender_Name_1__c}:</span> {formatCurrency(opportunity.Open_Balance_Amount_1__c)}</div>}
                  {opportunity.Lender_Name_2__c && <div><span className="text-slate-500">{opportunity.Lender_Name_2__c}:</span> {formatCurrency(opportunity.Open_Balance_Amount_2__c)}</div>}
                  {opportunity.Lender_Name_3__c && <div><span className="text-slate-500">{opportunity.Lender_Name_3__c}:</span> {formatCurrency(opportunity.Open_Balance_Amount_3__c)}</div>}
                </div>
              </div>
            )}

            {/* Funded Terms */}
            {(opportunity.csbs__Funded__c || opportunity.csbs__Payment_Amount__c || opportunity.csbs__Term__c) && (
              <div className="space-y-2 border-t pt-2">
                <p className="text-xs font-semibold text-slate-700 uppercase">Funded Terms</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {opportunity.csbs__Funded_Date__c && <div><span className="text-slate-500">Date:</span> {formatDate(opportunity.csbs__Funded_Date__c)}</div>}
                  {opportunity.csbs__Funded__c && <div><span className="text-slate-500">Funded:</span> {formatCurrency(opportunity.csbs__Funded__c)}</div>}
                  {opportunity.csbs__Lender__c && <div><span className="text-slate-500">Lender:</span> {opportunity.csbs__Lender__c}</div>}
                  {opportunity.csbs__Payment_Amount__c && <div><span className="text-slate-500">Payment:</span> {formatCurrency(opportunity.csbs__Payment_Amount__c)}</div>}
                  {opportunity.csbs__Term__c && <div><span className="text-slate-500">Term:</span> {opportunity.csbs__Term__c}mo</div>}
                  {opportunity.csbs__Factor_Rate__c && <div><span className="text-slate-500">Factor:</span> {opportunity.csbs__Factor_Rate__c}</div>}
                  {opportunity.csbs__Payment_Frequency__c && <div><span className="text-slate-500">Freq:</span> {opportunity.csbs__Payment_Frequency__c}</div>}
                </div>
              </div>
            )}
          </motion.div>
        )}
    </motion.div>
  );
}