import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Calendar, Edit, Loader2, TrendingUp, User, Building2, FileText, Percent } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';
import EditOpportunityModal from '../components/rep/EditOpportunityModal.jsx';

export default function OpportunityDetail() {
  const [session, setSession] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    setSession(JSON.parse(sessionData));
    loadOpportunity(JSON.parse(sessionData));
  }, []);

  const loadOpportunity = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oppId = urlParams.get('id');

      const response = await base44.functions.invoke('getSalesforceRecord', {
        recordId: oppId,
        recordType: 'Opportunity',
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });

      setOpportunity(response.data.record);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates) => {
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        recordId: opportunity.Id,
        recordType: 'Opportunity',
        updates,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      await loadOpportunity(session);
      setEditMode(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update opportunity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#08708E] animate-spin" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Opportunity not found</p>
      </div>
    );
  }

  const stageColors = {
    'Application In': 'bg-blue-100 text-blue-800',
    'Underwriting': 'bg-purple-100 text-purple-800',
    'Approved': 'bg-green-100 text-green-800',
    'Contracts Out': 'bg-yellow-100 text-yellow-800',
    'Contracts In': 'bg-indigo-100 text-indigo-800',
    'Closed - Funded': 'bg-green-100 text-green-800',
    'Funded': 'bg-green-100 text-green-800',
    'Declined': 'bg-red-100 text-red-800',
    'Closed - Declined': 'bg-red-100 text-red-800'
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('RepPortal')}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{opportunity.Name}</h1>
                <p className="text-sm text-slate-600">{opportunity.Account?.Name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={stageColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'}>
                {opportunity.StageName}
              </Badge>
              <Button onClick={() => setEditMode(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#08708E]" />
                Key Metrics
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-[#08708E] to-[#065a72] text-white">
                  <p className="text-sm text-white/80 mb-1">Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(opportunity.Amount)}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Probability</p>
                  <p className="text-2xl font-bold text-slate-900">{opportunity.Probability}%</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-1">Close Date</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(opportunity.CloseDate)}</p>
                </div>
              </div>
            </div>

            {/* Opportunity Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#08708E]" />
                Opportunity Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Type && (
                  <div>
                    <p className="text-slate-500 mb-1">Type</p>
                    <p className="font-medium text-slate-900">{opportunity.Type}</p>
                  </div>
                )}
                {opportunity.LeadSource && (
                  <div>
                    <p className="text-slate-500 mb-1">Lead Source</p>
                    <p className="font-medium text-slate-900">{opportunity.LeadSource}</p>
                  </div>
                )}
                {opportunity.ISO__c && (
                  <div>
                    <p className="text-slate-500 mb-1">ISO</p>
                    <p className="font-medium text-slate-900">{opportunity.ISO__c}</p>
                  </div>
                )}
                {opportunity.Stage_Detail__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Stage Detail</p>
                    <p className="font-medium text-slate-900">{opportunity.Stage_Detail__c}</p>
                  </div>
                )}
                {opportunity.Description && (
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-1">Description</p>
                    <p className="font-medium text-slate-900">{opportunity.Description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#08708E]" />
                Financial Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Amount_Requested__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Amount Requested</p>
                    <p className="font-semibold text-[#08708E] text-lg">{formatCurrency(opportunity.Amount_Requested__c)}</p>
                  </div>
                )}
                {opportunity.Months_In_Business__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Months In Business</p>
                    <p className="font-medium text-slate-900">{opportunity.Months_In_Business__c}</p>
                  </div>
                )}
                {opportunity.Use_of_Proceeds__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Use of Proceeds</p>
                    <p className="font-medium text-slate-900">{opportunity.Use_of_Proceeds__c}</p>
                  </div>
                )}
                {opportunity.Estimated_Monthly_Revenue__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Monthly Revenue</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Estimated_Monthly_Revenue__c)}</p>
                  </div>
                )}
                {opportunity.Number_of_Terminals__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Number of Terminals</p>
                    <p className="font-medium text-slate-900">{opportunity.Number_of_Terminals__c}</p>
                  </div>
                )}
                {opportunity.Open_Balances__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Open Balances</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Open_Balances__c)}</p>
                  </div>
                )}
                {opportunity.Current_Credit_Card_Processor__c && (
                  <div>
                    <p className="text-slate-500 mb-1">CC Processor</p>
                    <p className="font-medium text-slate-900">{opportunity.Current_Credit_Card_Processor__c}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Open Bankruptcies</p>
                  <p className="font-medium text-slate-900">{opportunity.Open_Bankruptcies__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Judgements/Liens</p>
                  <p className="font-medium text-slate-900">{opportunity.Judgements_Liens__c ? 'Yes' : 'No'}</p>
                </div>
                {opportunity.of_Open_Positions__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Open Positions</p>
                    <p className="font-medium text-slate-900">{opportunity.of_Open_Positions__c}</p>
                  </div>
                )}
                {opportunity.Estimated_Monthly_MCA_Amount__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Est. Monthly MCA</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Estimated_Monthly_MCA_Amount__c)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#08708E]" />
                Owner Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Owner__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Owner 1</p>
                    <p className="font-medium text-slate-900">{opportunity.Owner__c}</p>
                  </div>
                )}
                {opportunity.Owner_2__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Owner 2</p>
                    <p className="font-medium text-slate-900">{opportunity.Owner_2__c}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank & Card Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#08708E]" />
                Banking Statistics
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Avg_Gross_Monthly_Sales__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg Gross Monthly Sales</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Avg_Gross_Monthly_Sales__c)}</p>
                  </div>
                )}
                {opportunity.Avg_Bank_Deposits__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg Bank Deposits $</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Avg_Bank_Deposits__c)}</p>
                  </div>
                )}
                {opportunity.Avg_Bank_Deposits_Count__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg Bank Deposits #</p>
                    <p className="font-medium text-slate-900">{opportunity.Avg_Bank_Deposits_Count__c}</p>
                  </div>
                )}
                {opportunity.Avg_Credit_Card_Volume__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg CC Volume</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Avg_Credit_Card_Volume__c)}</p>
                  </div>
                )}
                {opportunity.Avg_Daily_Balance__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg Daily Balance</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Avg_Daily_Balance__c)}</p>
                  </div>
                )}
                {opportunity.Avg_Credit_Card_Batches__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg CC Batches</p>
                    <p className="font-medium text-slate-900">{opportunity.Avg_Credit_Card_Batches__c}</p>
                  </div>
                )}
                {opportunity.Avg_NSFs__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg NSFs</p>
                    <p className="font-medium text-slate-900">{opportunity.Avg_NSFs__c}</p>
                  </div>
                )}
                {opportunity.Avg_Credit_Card_Transaction_Amount__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg CC Transaction</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Avg_Credit_Card_Transaction_Amount__c)}</p>
                  </div>
                )}
                {opportunity.Avg_Negative_Days__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Avg Negative Days</p>
                    <p className="font-medium text-slate-900">{opportunity.Avg_Negative_Days__c}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Lenders */}
            {opportunity.Lender_Name_1__c && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#08708E]" />
                  Existing Lenders
                </h2>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Lender 1</p>
                    <p className="font-medium text-slate-900">{opportunity.Lender_Name_1__c}</p>
                    {opportunity.Open_Balance_Amount_1__c && (
                      <p className="text-[#08708E] font-semibold">{formatCurrency(opportunity.Open_Balance_Amount_1__c)}</p>
                    )}
                  </div>
                  {opportunity.Lender_Name_2__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Lender 2</p>
                      <p className="font-medium text-slate-900">{opportunity.Lender_Name_2__c}</p>
                      {opportunity.Open_Balance_Amount_2__c && (
                        <p className="text-[#08708E] font-semibold">{formatCurrency(opportunity.Open_Balance_Amount_2__c)}</p>
                      )}
                    </div>
                  )}
                  {opportunity.Lender_Name_3__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Lender 3</p>
                      <p className="font-medium text-slate-900">{opportunity.Lender_Name_3__c}</p>
                      {opportunity.Open_Balance_Amount_3__c && (
                        <p className="text-[#08708E] font-semibold">{formatCurrency(opportunity.Open_Balance_Amount_3__c)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Offer / Funding Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#08708E]" />
                Funding Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Funded_Date__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Funded Date</p>
                    <p className="font-medium text-slate-900">{formatDate(opportunity.Funded_Date__c)}</p>
                  </div>
                )}
                {opportunity.Selected_Offer__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Selected Offer</p>
                    <p className="font-medium text-slate-900">{opportunity.Selected_Offer__c}</p>
                  </div>
                )}
                {opportunity.Lender__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Lender</p>
                    <p className="font-medium text-slate-900">{opportunity.Lender__c}</p>
                  </div>
                )}
                {opportunity.Product__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Product</p>
                    <p className="font-medium text-slate-900">{opportunity.Product__c}</p>
                  </div>
                )}
                {opportunity.Buy_Rate__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Buy Rate</p>
                    <p className="font-medium text-slate-900">{opportunity.Buy_Rate__c.toFixed(5)}</p>
                  </div>
                )}
                {opportunity.Factor_Rate__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Factor Rate</p>
                    <p className="font-medium text-slate-900">{opportunity.Factor_Rate__c.toFixed(5)}</p>
                  </div>
                )}
                {opportunity.Funded__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Funded</p>
                    <p className="font-semibold text-[#08708E]">{formatCurrency(opportunity.Funded__c)}</p>
                  </div>
                )}
                {opportunity.Net_Funded__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Net Funded</p>
                    <p className="font-semibold text-[#08708E]">{formatCurrency(opportunity.Net_Funded__c)}</p>
                  </div>
                )}
                {opportunity.Payoff__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Payoff</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Payoff__c)}</p>
                  </div>
                )}
                {opportunity.Payback__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Payback</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Payback__c)}</p>
                  </div>
                )}
                {opportunity.Payment_Amount__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Payment Amount</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Payment_Amount__c)}</p>
                  </div>
                )}
                {opportunity.Term__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Term</p>
                    <p className="font-medium text-slate-900">{opportunity.Term__c}</p>
                  </div>
                )}
                {opportunity.Payment_Frequency__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Payment Frequency</p>
                    <p className="font-medium text-slate-900">{opportunity.Payment_Frequency__c}</p>
                  </div>
                )}
                {opportunity.Payment_Method__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Payment Method</p>
                    <p className="font-medium text-slate-900">{opportunity.Payment_Method__c}</p>
                  </div>
                )}
                {opportunity.Holdback__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Holdback %</p>
                    <p className="font-medium text-slate-900">{opportunity.Holdback__c}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Commission & Fees */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#08708E]" />
                Commission & Fees
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {opportunity.Commission__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Commission $</p>
                    <p className="font-semibold text-green-600 text-lg">{formatCurrency(opportunity.Commission__c)}</p>
                  </div>
                )}
                {opportunity.Commission_Percentage__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Commission %</p>
                    <p className="font-medium text-slate-900">{opportunity.Commission_Percentage__c}%</p>
                  </div>
                )}
                {opportunity.Origination_Fee__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Origination Fee $</p>
                    <p className="font-medium text-slate-900">{formatCurrency(opportunity.Origination_Fee__c)}</p>
                  </div>
                )}
                {opportunity.Origination_Fee_Percentage__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Origination Fee %</p>
                    <p className="font-medium text-slate-900">{opportunity.Origination_Fee_Percentage__c}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Renewal Information */}
            {(opportunity.Renewal_Status__c || opportunity.Previous_Funding__c) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Renewal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {opportunity.Renewal_Status__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Renewal Status</p>
                      <p className="font-medium text-slate-900">{opportunity.Renewal_Status__c}</p>
                    </div>
                  )}
                  {opportunity.Renewal_Status_Notes__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Renewal Notes</p>
                      <p className="font-medium text-slate-900">{opportunity.Renewal_Status_Notes__c}</p>
                    </div>
                  )}
                  {opportunity.Previous_Funding__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Previous Funding</p>
                      <p className="font-medium text-slate-900">{opportunity.Previous_Funding__c}</p>
                    </div>
                  )}
                  {opportunity.Next_Funding__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Next Funding</p>
                      <p className="font-medium text-slate-900">{opportunity.Next_Funding__c}</p>
                    </div>
                  )}
                  {opportunity.Originating_Opportunity__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Originating Opportunity</p>
                      <p className="font-medium text-slate-900">{opportunity.Originating_Opportunity__c}</p>
                    </div>
                  )}
                  {opportunity.Current_Renewal__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Current Renewal</p>
                      <p className="font-medium text-slate-900">{opportunity.Current_Renewal__c}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <ActivityTimeline
              key={refreshKey}
              recordId={opportunity.Id}
              recordType="Opportunity"
              session={session}
              onActivityAdded={() => setRefreshKey(prev => prev + 1)}
            />

            {/* Files */}
            <FileManager
              key={refreshKey}
              recordId={opportunity.Id}
              session={session}
              onFileUploaded={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dialpad Widget */}
            <DialpadWidget
              phoneNumber={opportunity.Phone}
              recordId={opportunity.Id}
              recordType="Opportunity"
              session={session}
              onCallCompleted={() => setRefreshKey(prev => prev + 1)}
            />

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#08708E]" />
                Timeline
              </h3>
              <div className="space-y-3 text-xs">
                {opportunity.Application_In_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Application In</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Application_In_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Underwriting_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Underwriting</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Underwriting_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Approved_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Approved</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Approved_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Contracts_Out_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Contracts Out</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Contracts_Out_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Contracts_In_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Contracts In</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Contracts_In_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Funded_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Funded</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Funded_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Declined_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Declined</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Declined_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Application_Missing_Info_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Missing Info</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Application_Missing_Info_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Paid In Tracking */}
            {(opportunity.X60_Paid_In__c || opportunity.X20_Paid_In__c) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Paid In Progress</h3>
                <div className="space-y-2 text-sm">
                  {opportunity.X20_Paid_In__c && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">20% Paid In</p>
                      <p className="font-medium text-slate-900">{formatDate(opportunity.X20_Paid_In__c)}</p>
                    </div>
                  )}
                  {opportunity.X40_Paid_In__c && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">40% Paid In</p>
                      <p className="font-medium text-slate-900">{formatDate(opportunity.X40_Paid_In__c)}</p>
                    </div>
                  )}
                  {opportunity.X60_Paid_In__c && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">60% Paid In</p>
                      <p className="font-medium text-slate-900">{formatDate(opportunity.X60_Paid_In__c)}</p>
                    </div>
                  )}
                  {opportunity.X80_Paid_In__c && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">80% Paid In</p>
                      <p className="font-medium text-slate-900">{formatDate(opportunity.X80_Paid_In__c)}</p>
                    </div>
                  )}
                  {opportunity.X100_Paid_In__c && (
                    <div>
                      <p className="text-slate-500 text-xs mb-1">100% Paid In</p>
                      <p className="font-medium text-slate-900">{formatDate(opportunity.X100_Paid_In__c)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">System Info</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-500">Created By</p>
                  <p className="font-medium text-slate-900">{opportunity.CreatedBy?.Name}</p>
                  <p className="text-slate-500">{formatDate(opportunity.CreatedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Modified By</p>
                  <p className="font-medium text-slate-900">{opportunity.LastModifiedBy?.Name}</p>
                  <p className="text-slate-500">{formatDate(opportunity.LastModifiedDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <EditOpportunityModal
          opportunity={opportunity}
          onSave={handleUpdate}
          onClose={() => setEditMode(false)}
        />
      )}
    </div>
  );
}