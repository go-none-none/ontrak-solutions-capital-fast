import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Loader2, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';

export default function OpportunityDetail() {
  const [session, setSession] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
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

  const handleFieldEdit = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

  const handleFieldSave = async (field) => {
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Opportunity',
        recordId: opportunity.Id,
        data: { [field]: editValues[field] },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      await loadOpportunity(session);
      setEditing({ ...editing, [field]: false });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const EditableField = ({ label, field, value, type = 'text' }) => {
    const isEditing = editing[field];
    const displayValue = isEditing ? editValues[field] : value;

    return (
      <div>
        <p className="text-slate-500 text-xs mb-1">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type={type}
              value={displayValue || ''}
              onChange={(e) => handleFieldEdit(field, e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" variant="ghost" onClick={() => handleFieldSave(field)}>
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, [field]: false })}>
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <p className="font-medium text-slate-900">{value || <span className="text-slate-400 text-sm">Not set</span>}</p>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => {
                setEditValues({ ...editValues, [field]: value || '' });
                setEditing({ ...editing, [field]: true });
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
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
    'Declined': 'bg-red-100 text-red-800'
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
      month: 'numeric',
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
            <Badge className={stageColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'}>
              {opportunity.StageName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Opportunity Name" field="Name" value={opportunity.Name} />
                <EditableField label="Account Name" field="AccountId" value={opportunity.Account?.Name} />
                <EditableField label="Close Date" field="CloseDate" value={formatDate(opportunity.CloseDate)} type="date" />
                <EditableField label="Type" field="Type" value={opportunity.Type} />
                <EditableField label="Lead Source" field="LeadSource" value={opportunity.LeadSource} />
                <EditableField label="Stage" field="StageName" value={opportunity.StageName} />
                <EditableField label="ISO" field="ISO__c" value={opportunity.ISO__c} />
                <EditableField label="Stage Detail" field="Stage_Detail__c" value={opportunity.Stage_Detail__c} />
                {opportunity.Description && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs mb-1">Description</p>
                    <p className="font-medium text-slate-900">{opportunity.Description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Qualifying Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Qualifying Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Amount Requested" field="Amount_Requested__c" value={opportunity.Amount_Requested__c ? formatCurrency(opportunity.Amount_Requested__c) : null} />
                <EditableField label="Months In Business" field="Months_In_Business__c" value={opportunity.Months_In_Business__c} />
                <EditableField label="Use of Proceeds" field="Use_of_Proceeds__c" value={opportunity.Use_of_Proceeds__c} />
                <EditableField label="Estimated Monthly Revenue" field="Estimated_Monthly_Revenue__c" value={opportunity.Estimated_Monthly_Revenue__c ? formatCurrency(opportunity.Estimated_Monthly_Revenue__c) : null} />
                <EditableField label="Number of Terminals" field="Number_of_Terminals__c" value={opportunity.Number_of_Terminals__c} />
                <EditableField label="Open Balances" field="Open_Balances__c" value={opportunity.Open_Balances__c ? formatCurrency(opportunity.Open_Balances__c) : null} />
                <EditableField label="Current Credit Card Processor" field="Current_Credit_Card_Processor__c" value={opportunity.Current_Credit_Card_Processor__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Open Bankruptcies</p>
                  <p className="font-medium text-slate-900">{opportunity.Open_Bankruptcies__c ? 'Yes' : 'No'}</p>
                </div>
                <EditableField label="# of Open Positions" field="of_Open_Positions__c" value={opportunity.of_Open_Positions__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Judgements/Liens</p>
                  <p className="font-medium text-slate-900">{opportunity.Judgements_Liens__c ? 'Yes' : 'No'}</p>
                </div>
                <EditableField label="Estimated Monthly MCA Amount" field="Estimated_Monthly_MCA_Amount__c" value={opportunity.Estimated_Monthly_MCA_Amount__c ? formatCurrency(opportunity.Estimated_Monthly_MCA_Amount__c) : null} />
              </div>
            </div>

            {/* Owners */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Owners</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Owner" field="Owner__c" value={opportunity.Owner__c} />
                <EditableField label="Owner 2" field="Owner_2__c" value={opportunity.Owner_2__c} />
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Avg Gross Monthly Sales" field="Avg_Gross_Monthly_Sales__c" value={opportunity.Avg_Gross_Monthly_Sales__c ? formatCurrency(opportunity.Avg_Gross_Monthly_Sales__c) : null} />
                <EditableField label="Avg Bank Deposits $" field="Avg_Bank_Deposits__c" value={opportunity.Avg_Bank_Deposits__c ? formatCurrency(opportunity.Avg_Bank_Deposits__c) : null} />
                <EditableField label="Avg Bank Deposits #" field="Avg_Bank_Deposits_Count__c" value={opportunity.Avg_Bank_Deposits_Count__c} />
                <EditableField label="Avg Credit Card Volume" field="Avg_Credit_Card_Volume__c" value={opportunity.Avg_Credit_Card_Volume__c ? formatCurrency(opportunity.Avg_Credit_Card_Volume__c) : null} />
                <EditableField label="Avg Daily Balance" field="Avg_Daily_Balance__c" value={opportunity.Avg_Daily_Balance__c ? formatCurrency(opportunity.Avg_Daily_Balance__c) : null} />
                <EditableField label="Avg Credit Card Batches" field="Avg_Credit_Card_Batches__c" value={opportunity.Avg_Credit_Card_Batches__c} />
                <EditableField label="Avg NSFs" field="Avg_NSFs__c" value={opportunity.Avg_NSFs__c} />
                <EditableField label="Avg Credit Card Transaction Amount" field="Avg_Credit_Card_Transaction_Amount__c" value={opportunity.Avg_Credit_Card_Transaction_Amount__c ? formatCurrency(opportunity.Avg_Credit_Card_Transaction_Amount__c) : null} />
                <EditableField label="Avg Negative Days" field="Avg_Negative_Days__c" value={opportunity.Avg_Negative_Days__c} />
              </div>
            </div>

            {/* Open Balances */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Open Balances</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <EditableField label="Lender Name 1" field="Lender_Name_1__c" value={opportunity.Lender_Name_1__c} />
                  <EditableField label="Open Balance Amount 1" field="Open_Balance_Amount_1__c" value={opportunity.Open_Balance_Amount_1__c ? formatCurrency(opportunity.Open_Balance_Amount_1__c) : null} />
                </div>
                <div>
                  <EditableField label="Lender Name 2" field="Lender_Name_2__c" value={opportunity.Lender_Name_2__c} />
                  <EditableField label="Open Balance Amount 2" field="Open_Balance_Amount_2__c" value={opportunity.Open_Balance_Amount_2__c ? formatCurrency(opportunity.Open_Balance_Amount_2__c) : null} />
                </div>
                <div>
                  <EditableField label="Lender Name 3" field="Lender_Name_3__c" value={opportunity.Lender_Name_3__c} />
                  <EditableField label="Open Balance Amount 3" field="Open_Balance_Amount_3__c" value={opportunity.Open_Balance_Amount_3__c ? formatCurrency(opportunity.Open_Balance_Amount_3__c) : null} />
                </div>
              </div>
            </div>

            {/* Funded Terms */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Funded Terms</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Funded Date" field="Funded_Date__c" value={opportunity.Funded_Date__c ? formatDate(opportunity.Funded_Date__c) : null} type="date" />
                <EditableField label="Selected Offer" field="Selected_Offer__c" value={opportunity.Selected_Offer__c} />
                <EditableField label="Lender" field="Lender__c" value={opportunity.Lender__c} />
                <EditableField label="Buy Rate" field="Buy_Rate__c" value={opportunity.Buy_Rate__c} />
                <EditableField label="Funded" field="Funded__c" value={opportunity.Funded__c ? formatCurrency(opportunity.Funded__c) : null} />
                <EditableField label="Factor Rate" field="Factor_Rate__c" value={opportunity.Factor_Rate__c} />
                <EditableField label="Payoff" field="Payoff__c" value={opportunity.Payoff__c ? formatCurrency(opportunity.Payoff__c) : null} />
                <EditableField label="Product" field="Product__c" value={opportunity.Product__c} />
                <EditableField label="Net Funded" field="Net_Funded__c" value={opportunity.Net_Funded__c ? formatCurrency(opportunity.Net_Funded__c) : null} />
                <EditableField label="Payment Amount" field="Payment_Amount__c" value={opportunity.Payment_Amount__c ? formatCurrency(opportunity.Payment_Amount__c) : null} />
                <EditableField label="Term" field="Term__c" value={opportunity.Term__c} />
                <EditableField label="Payment Frequency" field="Payment_Frequency__c" value={opportunity.Payment_Frequency__c} />
                <EditableField label="Payback" field="Payback__c" value={opportunity.Payback__c ? formatCurrency(opportunity.Payback__c) : null} />
                <EditableField label="Payment Method" field="Payment_Method__c" value={opportunity.Payment_Method__c} />
                <EditableField label="Holdback %" field="Holdback__c" value={opportunity.Holdback__c} />
                <EditableField label="Commission $" field="Commission__c" value={opportunity.Commission__c ? formatCurrency(opportunity.Commission__c) : null} />
                <EditableField label="Commission %" field="Commission_Percentage__c" value={opportunity.Commission_Percentage__c} />
                <EditableField label="Origination Fee $" field="Origination_Fee__c" value={opportunity.Origination_Fee__c ? formatCurrency(opportunity.Origination_Fee__c) : null} />
                <EditableField label="Origination Fee %" field="Origination_Fee_Percentage__c" value={opportunity.Origination_Fee_Percentage__c} />
              </div>
            </div>

            {/* Renewal Forecasting */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Renewal Forecasting</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="60% Paid In" field="X60_Paid_In__c" value={opportunity.X60_Paid_In__c ? formatDate(opportunity.X60_Paid_In__c) : null} type="date" />
                <EditableField label="20% Paid In" field="X20_Paid_In__c" value={opportunity.X20_Paid_In__c ? formatDate(opportunity.X20_Paid_In__c) : null} type="date" />
                <EditableField label="80% Paid In" field="X80_Paid_In__c" value={opportunity.X80_Paid_In__c ? formatDate(opportunity.X80_Paid_In__c) : null} type="date" />
                <EditableField label="40% Paid In" field="X40_Paid_In__c" value={opportunity.X40_Paid_In__c ? formatDate(opportunity.X40_Paid_In__c) : null} type="date" />
                <EditableField label="100% Paid In" field="X100_Paid_In__c" value={opportunity.X100_Paid_In__c ? formatDate(opportunity.X100_Paid_In__c) : null} type="date" />
                <EditableField label="Renewal Status" field="Renewal_Status__c" value={opportunity.Renewal_Status__c} />
                <EditableField label="Previous Funding" field="Previous_Funding__c" value={opportunity.Previous_Funding__c} />
                <EditableField label="Renewal Status Notes" field="Renewal_Status_Notes__c" value={opportunity.Renewal_Status_Notes__c} />
                <EditableField label="Next Funding" field="Next_Funding__c" value={opportunity.Next_Funding__c} />
                <EditableField label="Originating Opportunity" field="Originating_Opportunity__c" value={opportunity.Originating_Opportunity__c} />
                <EditableField label="Current Renewal" field="Current_Renewal__c" value={opportunity.Current_Renewal__c} />
              </div>
            </div>

            {/* Stage Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Stage Tracking</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">Created By</p>
                  <p className="font-medium text-slate-900">{opportunity.CreatedBy?.Name}, {formatDate(opportunity.CreatedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Last Modified By</p>
                  <p className="font-medium text-slate-900">{opportunity.LastModifiedBy?.Name}, {formatDate(opportunity.LastModifiedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Probability (%)</p>
                  <p className="font-medium text-slate-900">{opportunity.Probability}%</p>
                </div>
                {opportunity.Application_In_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Application In Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Application_In_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Contracts_In_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Contracts In Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Contracts_In_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Application_Missing_Info_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Application Missing Info Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Application_Missing_Info_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Renewal_Prospecting_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Renewal Prospecting Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Renewal_Prospecting_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Underwriting_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Underwriting Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Underwriting_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Funded_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Funded Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Funded_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Approved_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Approved Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Approved_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Declined_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Declined Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Declined_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {opportunity.Contracts_Out_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Contracts Out Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(opportunity.Contracts_Out_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

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

            {/* Opportunity Owner Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Opportunity Owner</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-[#08708E]">{opportunity.Owner?.Name}</p>
              </div>
            </div>

            {/* Close Date */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Close Date</h3>
              <p className="text-lg font-bold text-slate-900">{formatDate(opportunity.CloseDate)}</p>
            </div>

            {/* Amount */}
            {opportunity.Amount && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Amount</h3>
                <p className="text-2xl font-bold text-[#08708E]">{formatCurrency(opportunity.Amount)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}