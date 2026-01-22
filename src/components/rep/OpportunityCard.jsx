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
  const [contactRoles, setContactRoles] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isExpanded && !fullData && session) {
      setLoadingData(true);
      Promise.all([
        base44.functions.invoke('getSalesforceRecord', {
          recordId: opportunity.Id,
          recordType: 'Opportunity',
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforceContactRoles', {
          recordId: opportunity.Id,
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]).then(([oppRes, contactRes]) => {
        setFullData(oppRes.data.record);
        setContactRoles(contactRes.data.contactRoles || []);
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
      className={`border rounded-lg bg-white transition-all cursor-pointer ${
        isDeclined 
          ? 'border-red-200 bg-red-50/50 hover:shadow-lg hover:border-red-400' 
          : 'border-slate-200 hover:shadow-lg hover:border-orange-600'
      }`}
    >
      <div className="p-3" onClick={handleCardClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">{opportunity.Name}</h3>
            {opportunity.Account?.Name && (
              <div className="flex items-center gap-1 text-slate-600">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{opportunity.Account.Name}</span>
              </div>
            )}
          </div>
          <Badge className={`text-xs ml-2 flex-shrink-0 ${
            isDeclined 
              ? 'bg-red-100 text-red-800' 
              : statusColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'
          }`}>
            {opportunity.StageName}
          </Badge>
        </div>

        {/* Stage Progress Bar */}
        {!isDeclined && (
          <div className="mb-2">
            <div className="flex justify-between items-start mb-1 gap-0.5">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                    idx <= currentStage ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-0.5 text-center leading-tight">{stage.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-0.5">
              {stages.map((_, idx) => (
                <div key={idx} className={`h-1 flex-1 rounded ${
                  idx <= currentStage ? 'bg-orange-600' : 'bg-slate-200'
                }`} />
              ))}
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mb-2 p-2 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800 font-medium text-center">{opportunity.StageName}</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs mb-2">
          <div className="flex items-center gap-1 text-orange-600 font-semibold">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(opportunity.Amount)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <TrendingUp className="w-3 h-3" />
            <span>{opportunity.Probability}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Close: {formatDate(opportunity.CloseDate)}</span>
          </div>
          <span>Updated {formatDate(opportunity.LastModifiedDate)}</span>
        </div>
        </div>
      </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 pt-0 border-t border-slate-200"
          >
            {loadingData && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Contacts */}
              {contactRoles && contactRoles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Contacts</p>
                  <div className="space-y-1 text-xs">
                    {contactRoles.map(role => (
                      <div key={role.Id} className="border-b pb-1 last:border-b-0">
                        <p className="font-medium text-orange-600">{role.Contact?.Name}</p>
                        {role.Role && <p className="text-slate-500">{role.Role}</p>}
                        {role.Contact?.Email && <p className="text-slate-600">{role.Contact.Email}</p>}
                        {role.Contact?.Phone && <p className="text-slate-600">{role.Contact.Phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Info */}
              {fullData && (fullData.Amount || fullData.CloseDate || fullData.Probability) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Key Info</p>
                  <div className="space-y-1 text-xs">
                    {fullData.Amount && <div><span className="text-slate-500">Amount:</span> {formatCurrency(fullData.Amount)}</div>}
                    {fullData.CloseDate && <div><span className="text-slate-500">Close:</span> {formatDate(fullData.CloseDate)}</div>}
                    {fullData.Probability && <div><span className="text-slate-500">Prob:</span> {fullData.Probability}%</div>}
                  </div>
                </div>
              )}

              {/* Opp Info */}
              {fullData && (fullData.Type || fullData.LeadSource || fullData.csbs__ISO__c || fullData.csbs__Line_of_Credit__c) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Opp Info</p>
                  <div className="space-y-1 text-xs">
                    {fullData.Type && <div><span className="text-slate-500">Type:</span> {fullData.Type}</div>}
                    {fullData.LeadSource && <div><span className="text-slate-500">Source:</span> {fullData.LeadSource}</div>}
                    {fullData.csbs__ISO__c && <div><span className="text-slate-500">ISO:</span> {fullData.csbs__ISO__c}</div>}
                    {fullData.csbs__Line_of_Credit__c && <div><span className="text-slate-500">LOC:</span> {fullData.csbs__Line_of_Credit__c}</div>}
                  </div>
                </div>
              )}

              {/* Qualifying Info */}
              {fullData && (fullData.csbs__Amount_Requested__c || fullData.csbs__Months_In_Business__c || fullData.csbs__Estimated_Monthly_Revenue__c) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Qualifying</p>
                  <div className="space-y-1 text-xs">
                    {fullData.csbs__Amount_Requested__c && <div><span className="text-slate-500">Req:</span> {formatCurrency(fullData.csbs__Amount_Requested__c)}</div>}
                    {fullData.csbs__Months_In_Business__c && <div><span className="text-slate-500">Months:</span> {fullData.csbs__Months_In_Business__c}</div>}
                    {fullData.csbs__Use_of_Proceeds__c && <div><span className="text-slate-500">Use:</span> {fullData.csbs__Use_of_Proceeds__c}</div>}
                    {fullData.csbs__Estimated_Monthly_Revenue__c && <div><span className="text-slate-500">Revenue:</span> {formatCurrency(fullData.csbs__Estimated_Monthly_Revenue__c)}</div>}
                    {fullData.csbs__Number_of_Terminals__c && <div><span className="text-slate-500">Terminals:</span> {fullData.csbs__Number_of_Terminals__c}</div>}
                    {fullData.csbs__Open_Loan_Balances__c && <div><span className="text-slate-500">Balances:</span> {formatCurrency(fullData.csbs__Open_Loan_Balances__c)}</div>}
                    {fullData.csbs__Open_Bankruptcies__c && <div><span className="text-slate-500">Bankruptcies:</span> {fullData.csbs__Open_Bankruptcies__c}</div>}
                    {fullData.csbs__Number_of_Open_Positions__c && <div><span className="text-slate-500">Positions:</span> {fullData.csbs__Number_of_Open_Positions__c}</div>}
                  </div>
                </div>
              )}

              {/* Financial Info */}
              {(opportunity.csbs__Avg_Gross_Monthly_Sales__c || opportunity.csbs__Avg_Daily_Balance__c) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase">Financial</p>
                  <div className="space-y-1 text-xs">
                    {opportunity.csbs__Avg_Gross_Monthly_Sales__c && <div><span className="text-slate-500">Sales:</span> {formatCurrency(opportunity.csbs__Avg_Gross_Monthly_Sales__c)}</div>}
                    {opportunity.csbs__Avg_Bank_Deposits__c && <div><span className="text-slate-500">Deposits:</span> {formatCurrency(opportunity.csbs__Avg_Bank_Deposits__c)}</div>}
                    {opportunity.csbs__Avg_Daily_Balance__c && <div><span className="text-slate-500">Bal:</span> {formatCurrency(opportunity.csbs__Avg_Daily_Balance__c)}</div>}
                    {opportunity.csbs__Avg_NSFs__c && <div><span className="text-slate-500">NSFs:</span> {opportunity.csbs__Avg_NSFs__c}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Open Balances */}
            {fullData && (fullData.Lender_Name_1__c || fullData.Lender_Name_2__c || fullData.Lender_Name_3__c) && (
              <div className="space-y-2 border-t pt-3 mt-3 mt-4">
                <p className="text-xs font-semibold text-slate-700 uppercase">Open Balances</p>
                <div className="space-y-1 text-xs">
                  {fullData.Lender_Name_1__c && <div><span className="text-slate-500">{fullData.Lender_Name_1__c}:</span> {formatCurrency(fullData.Open_Balance_Amount_1__c)}</div>}
                  {fullData.Lender_Name_2__c && <div><span className="text-slate-500">{fullData.Lender_Name_2__c}:</span> {formatCurrency(fullData.Open_Balance_Amount_2__c)}</div>}
                  {fullData.Lender_Name_3__c && <div><span className="text-slate-500">{fullData.Lender_Name_3__c}:</span> {formatCurrency(fullData.Open_Balance_Amount_3__c)}</div>}
                </div>
              </div>
            )}

            {/* Funded Terms */}
            {fullData && (fullData.csbs__Funded__c || fullData.csbs__Payment_Amount__c || fullData.csbs__Term__c) && (
              <div className="space-y-2 border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-slate-700 uppercase">Funded Terms</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {fullData.csbs__Funded_Date__c && <div><span className="text-slate-500">Date:</span> {formatDate(fullData.csbs__Funded_Date__c)}</div>}
                  {fullData.csbs__Funded__c && <div><span className="text-slate-500">Funded:</span> {formatCurrency(fullData.csbs__Funded__c)}</div>}
                  {fullData.csbs__Lender__c && <div><span className="text-slate-500">Lender:</span> {fullData.csbs__Lender__c}</div>}
                  {fullData.csbs__Payment_Amount__c && <div><span className="text-slate-500">Payment:</span> {formatCurrency(fullData.csbs__Payment_Amount__c)}</div>}
                  {fullData.csbs__Term__c && <div><span className="text-slate-500">Term:</span> {fullData.csbs__Term__c}mo</div>}
                  {fullData.csbs__Factor_Rate__c && <div><span className="text-slate-500">Factor:</span> {fullData.csbs__Factor_Rate__c}</div>}
                  {fullData.csbs__Payment_Frequency__c && <div><span className="text-slate-500">Freq:</span> {fullData.csbs__Payment_Frequency__c}</div>}
                  {fullData.csbs__Net_Funded__c && <div><span className="text-slate-500">Net:</span> {formatCurrency(fullData.csbs__Net_Funded__c)}</div>}
                  {fullData.csbs__Payback__c && <div><span className="text-slate-500">Payback:</span> {formatCurrency(fullData.csbs__Payback__c)}</div>}
                  {fullData.csbs__Commission_Amount__c && <div><span className="text-slate-500">Commission:</span> {formatCurrency(fullData.csbs__Commission_Amount__c)}</div>}
                </div>
              </div>
            )}

            {/* Banking Activity */}
            {fullData && (fullData.csbs__Avg_Gross_Monthly_Sales__c || fullData.csbs__Avg_Credit_Card_Volume__c || fullData.csbs__Avg_NSFs__c) && (
              <div className="space-y-2 border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-slate-700 uppercase">Banking Activity</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {fullData.csbs__Avg_Gross_Monthly_Sales__c && <div><span className="text-slate-500">Sales:</span> {formatCurrency(fullData.csbs__Avg_Gross_Monthly_Sales__c)}</div>}
                  {fullData.csbs__Avg_Credit_Card_Volume__c && <div><span className="text-slate-500">CC Vol:</span> {formatCurrency(fullData.csbs__Avg_Credit_Card_Volume__c)}</div>}
                  {fullData.csbs__Avg_Daily_Balance__c && <div><span className="text-slate-500">Avg Bal:</span> {formatCurrency(fullData.csbs__Avg_Daily_Balance__c)}</div>}
                  {fullData.csbs__Avg_NSFs__c && <div><span className="text-slate-500">NSFs:</span> {fullData.csbs__Avg_NSFs__c}</div>}
                  {fullData.csbs__Avg_Negative_Days__c && <div><span className="text-slate-500">Neg Days:</span> {fullData.csbs__Avg_Negative_Days__c}</div>}
                  {fullData.csbs__Avg_Bank_Deposits_Number__c && <div><span className="text-slate-500">Deposits:</span> {fullData.csbs__Avg_Bank_Deposits_Number__c}</div>}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {fullData && (fullData.csbs__Renewal_Status__c || fullData.csbs__Previous_Funding__c) && (
              <div className="space-y-2 border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-slate-700 uppercase">Additional</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {fullData.csbs__Renewal_Status__c && <div><span className="text-slate-500">Renewal:</span> {fullData.csbs__Renewal_Status__c}</div>}
                  {fullData.csbs__Previous_Funding__c && <div><span className="text-slate-500">Prev Fund:</span> {formatCurrency(fullData.csbs__Previous_Funding__c)}</div>}
                  {fullData.csbs__Open_Bankruptcies__c && <div><span className="text-slate-500">Bankruptcies:</span> {fullData.csbs__Open_Bankruptcies__c}</div>}
                  {fullData.csbs__Judgements_Liens__c && <div><span className="text-slate-500">Liens:</span> {fullData.csbs__Judgements_Liens__c}</div>}
                </div>
              </div>
            )}
          </motion.div>
        )}
    </motion.div>
  );
}