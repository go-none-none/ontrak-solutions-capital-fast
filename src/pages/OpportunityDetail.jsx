import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Loader2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';

import FileManager from '../components/rep/FileManager.jsx';
import EditableField from '../components/rep/EditableField.jsx';
import EmailClientCard from '../components/rep/EmailClientCard.jsx';
import RepPortalHeader from '../components/rep/RepPortalHeader';

export default function OpportunityDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [contactRoles, setContactRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDeclinedReasons, setShowDeclinedReasons] = useState(false);
  const [selectedDeclinedReason, setSelectedDeclinedReason] = useState('');
  const [users, setUsers] = useState([]);
  const [changingOwner, setChangingOwner] = useState(false);
  const [showOwnerChange, setShowOwnerChange] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const session = JSON.parse(sessionData);
    setSession(session);
    loadOpportunity(session);
    loadUsers(session);
  }, []);

  const loadOpportunity = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const oppId = urlParams.get('id');

      const [oppResponse, contactRolesResponse] = await Promise.all([
        base44.functions.invoke('getSalesforceRecord', {
          recordId: oppId,
          recordType: 'Opportunity',
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getSalesforceContactRoles', {
          recordId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);

      setOpportunity(oppResponse.data.record);
      setContactRoles(contactRolesResponse.data.contactRoles || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStage) => {
    if (opportunity.StageName === newStage) return;
    
    if (newStage === 'Declined') {
      setShowDeclinedReasons(true);
      return;
    }
    
    setUpdatingStatus(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Opportunity',
        recordId: opportunity.Id,
        data: { StageName: newStage },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadOpportunity(session);
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeclinedWithReason = async () => {
    if (!selectedDeclinedReason) {
      alert('Please select a decline reason');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Opportunity',
        recordId: opportunity.Id,
        data: { 
          StageName: 'Closed - Declined',
          csbs__Stage_Detail__c: selectedDeclinedReason
        },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadOpportunity(session);
      setShowDeclinedReasons(false);
      setSelectedDeclinedReason('');
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const loadUsers = async (sessionData) => {
    try {
      const response = await base44.functions.invoke('getSalesforceUsers', {
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const handleFieldSave = async (field) => {
    try {
      setEditing({ ...editing, [field]: true });
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
      setEditing({ ...editing, [field]: false });
    }
  };

  const handleOwnerChange = async (newOwnerId) => {
    if (newOwnerId === opportunity.OwnerId) return;

    const newOwner = users.find(u => u.Id === newOwnerId);
    
    setChangingOwner(true);
    try {
      await base44.functions.invoke('updateRecordOwner', {
        recordId: opportunity.Id,
        objectType: 'Opportunity',
        ownerId: newOwnerId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setOpportunity({ 
        ...opportunity, 
        OwnerId: newOwnerId,
        Owner: { Id: newOwnerId, Name: newOwner?.Name || 'Unknown' }
      });
      setShowOwnerChange(false);
    } catch (error) {
      console.error('Change owner error:', error);
      alert('Failed to change owner');
    } finally {
      setChangingOwner(false);
    }
  };

  const EditableFieldWrapper = ({ label, field, value, disabled = false }) => {
    return (
      <EditableField
        label={label}
        field={field}
        value={value}
        editing={editing}
        editValues={editValues}
        disabled={disabled}
        onEdit={(field, value) => setEditValues({ ...editValues, [field]: value })}
        onSave={handleFieldSave}
        onCancel={(field) => setEditing({ ...editing, [field]: false })}
        onStartEdit={(field) => setEditing({ ...editing, [field]: true })}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
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
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
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
      <RepPortalHeader
        isAdmin={false}
        refreshing={false}
        onRefresh={() => loadOpportunity(session)}
        onLogout={() => {
          sessionStorage.removeItem('sfSession');
          window.location.reload();
        }}
        userName={session?.name}
        showCreateTask={false}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />

      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-slate-900">{opportunity.Name}</h1>
                      <p className="text-sm text-slate-600">{opportunity.Account?.Name}</p>
                    </div>
                    <Badge className={stageColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'}>
                      {opportunity.StageName}
                    </Badge>
                  </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!opportunity.StageName?.includes('Declined') ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Opportunity Stage</h3>
            <div className="flex justify-between items-center mb-3">
              {[
                { label: 'App In', name: 'Application In' },
                { label: 'Underwriting', name: 'Underwriting' },
                { label: 'Approved', name: 'Approved' },
                { label: 'Contracts Out', name: 'Contracts Out' },
                { label: 'Contracts In', name: 'Contracts In' },
                { label: 'Funded', name: 'Closed - Funded' }
              ].map((stage, idx) => {
                const stages = ['Application In', 'Underwriting', 'Approved', 'Contracts Out', 'Contracts In', 'Closed - Funded'];
                const currentStageIndex = stages.findIndex(s => s === opportunity.StageName);
                const isActive = idx <= currentStageIndex;
                const isFunded = opportunity.StageName === 'Closed - Funded' && stage.name === 'Closed - Funded';

                return (
                  <button
                    key={idx}
                    onClick={() => handleStatusChange(stage.name)}
                    disabled={updatingStatus}
                    className={`flex flex-col items-center flex-1 transition-all ${
                      updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      isFunded
                        ? 'bg-green-600 text-white shadow-lg'
                        : isActive
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}>
                      {isFunded ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : idx < currentStageIndex ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-xs text-slate-600 mt-2 text-center">{stage.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 mb-4">
              {[0,1,2,3,4,5].map((idx) => {
                const stages = ['Application In', 'Underwriting', 'Approved', 'Contracts Out', 'Contracts In', 'Closed - Funded'];
                const currentStageIndex = stages.findIndex(s => s === opportunity.StageName);
                return (
                  <div key={idx} className={`h-2 flex-1 rounded transition-all ${
                    idx <= currentStageIndex ? 'bg-orange-600' : 'bg-slate-200'
                  }`} />
                );
              })}
            </div>

            {/* Decline Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => handleStatusChange('Declined')}
                disabled={updatingStatus}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Mark as Declined
              </Button>
            </div>

            {/* Declined Reason Modal */}
            {showDeclinedReasons && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Decline Reason</h3>
                  <Select value={selectedDeclinedReason} onValueChange={setSelectedDeclinedReason}>
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Choose a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit">Credit</SelectItem>
                      <SelectItem value="NSFs">NSFs</SelectItem>
                      <SelectItem value="Low Revenue">Low Revenue</SelectItem>
                      <SelectItem value="Time In Business">Time In Business</SelectItem>
                      <SelectItem value="Industry">Industry</SelectItem>
                      <SelectItem value="Existing Debt">Existing Debt</SelectItem>
                      <SelectItem value="Customer Declined">Customer Declined</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        setShowDeclinedReasons(false);
                        setSelectedDeclinedReason('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleDeclinedWithReason}
                      disabled={!selectedDeclinedReason || updatingStatus}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decline'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-lg font-semibold text-red-800">{opportunity.StageName}</p>
              {opportunity.csbs__Stage_Detail__c && (
                <p className="text-sm text-red-600 mt-1">Reason: {opportunity.csbs__Stage_Detail__c}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-lg shadow-sm">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="statements">Statements</TabsTrigger>
                <TabsTrigger value="debt">Debt</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                {/* Basic Info */}
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Opportunity Information</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Opportunity Name" field="Name" value={opportunity.Name} />
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Opportunity Owner</p>
                          <p className="font-medium text-slate-900">{opportunity.Owner?.Name || 'Unknown'}</p>
                        </div>
                        <EditableFieldWrapper label="Account Name" field="AccountId" value={opportunity.Account?.Name} />
                        <EditableFieldWrapper label="Close Date" field="CloseDate" value={opportunity.CloseDate} />
                        <EditableFieldWrapper label="Type" field="Type" value={opportunity.Type} />
                        <EditableFieldWrapper label="Lead Source" field="LeadSource" value={opportunity.LeadSource} />
                        <EditableFieldWrapper label="Stage" field="StageName" value={opportunity.StageName} disabled={true} />
                        <EditableFieldWrapper label="ISO" field="csbs__ISO__c" value={opportunity.csbs__ISO__c} />
                        <EditableFieldWrapper label="Stage Detail" field="csbs__Stage_Detail__c" value={opportunity.csbs__Stage_Detail__c} />
                        <EditableFieldWrapper label="Line of Credit" field="csbs__Line_of_Credit__c" value={opportunity.csbs__Line_of_Credit__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Qualifying Information */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Qualifying Information</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Amount Requested" field="csbs__Amount_Requested__c" value={opportunity.csbs__Amount_Requested__c} />
                        <EditableFieldWrapper label="Months In Business" field="csbs__Months_In_Business__c" value={opportunity.csbs__Months_In_Business__c} />
                        <EditableFieldWrapper label="Use of Proceeds" field="csbs__Use_of_Proceeds__c" value={opportunity.csbs__Use_of_Proceeds__c} />
                        <EditableFieldWrapper label="Estimated Monthly Revenue $" field="csbs__Estimated_Monthly_Revenue__c" value={opportunity.csbs__Estimated_Monthly_Revenue__c} />
                        <EditableFieldWrapper label="Number of Terminals" field="csbs__Number_of_Terminals__c" value={opportunity.csbs__Number_of_Terminals__c} />
                        <EditableFieldWrapper label="Open Balances $" field="csbs__Open_Loan_Balances__c" value={opportunity.csbs__Open_Loan_Balances__c} />
                        <EditableFieldWrapper label="Current Credit Card Processor" field="csbs__Current_Credit_Card_Processor__c" value={opportunity.csbs__Current_Credit_Card_Processor__c} />
                        <EditableFieldWrapper label="Open Bankruptcies" field="csbs__Open_Bankruptcies__c" value={opportunity.csbs__Open_Bankruptcies__c} />
                        <EditableFieldWrapper label="# of Open Positions" field="csbs__Number_of_Open_Positions__c" value={opportunity.csbs__Number_of_Open_Positions__c} />
                        <EditableFieldWrapper label="Judgements / Liens" field="csbs__Judgements_Liens__c" value={opportunity.csbs__Judgements_Liens__c} />
                        <EditableFieldWrapper label="Estimated Monthly MCA Amount" field="csbs__Estimated_Monthly_MCA_Amount__c" value={opportunity.csbs__Estimated_Monthly_MCA_Amount__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Owners */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Owners</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Owner</p>
                          {opportunity.csbs__Owner__c ? (
                            <button
                              onClick={() => navigate(createPageUrl('ContactDetail') + `?id=${opportunity.csbs__Owner__c}`)}
                              className="text-orange-600 hover:underline font-medium"
                            >
                              {opportunity.csbs__Owner_Name__c || 'Unknown'}
                            </button>
                            ) : (
                            <p className="font-medium text-slate-900">{opportunity.csbs__Owner_Name__c || '-'}</p>
                            )}
                            </div>
                            <div>
                            <p className="text-slate-500 text-xs mb-1">Owner 2</p>
                            {opportunity.csbs__Owner_2__c ? (
                            <button
                              onClick={() => navigate(createPageUrl('ContactDetail') + `?id=${opportunity.csbs__Owner_2__c}`)}
                              className="text-orange-600 hover:underline font-medium"
                            >
                              {opportunity.csbs__Owner_2_Name__c || 'Unknown'}
                            </button>
                          ) : (
                            <p className="font-medium text-slate-900">{opportunity.csbs__Owner_2_Name__c || '-'}</p>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                
                {/* Financial Information */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Financial Information</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Avg Gross Monthly Sales" field="csbs__Avg_Gross_Monthly_Sales__c" value={opportunity.csbs__Avg_Gross_Monthly_Sales__c} />
                        <EditableFieldWrapper label="Avg Bank Deposits $" field="csbs__Avg_Bank_Deposits__c" value={opportunity.csbs__Avg_Bank_Deposits__c} />
                        <EditableFieldWrapper label="Avg Bank Deposits #" field="csbs__Avg_Bank_Deposits_Number__c" value={opportunity.csbs__Avg_Bank_Deposits_Number__c} />
                        <EditableFieldWrapper label="Avg Credit Card Volume" field="csbs__Avg_Credit_Card_Volume__c" value={opportunity.csbs__Avg_Credit_Card_Volume__c} />
                        <EditableFieldWrapper label="Avg Daily Balance" field="csbs__Avg_Daily_Balance__c" value={opportunity.csbs__Avg_Daily_Balance__c} />
                        <EditableFieldWrapper label="Avg Credit Card Batches" field="csbs__Avg_Credit_Card_Batches__c" value={opportunity.csbs__Avg_Credit_Card_Batches__c} />
                        <EditableFieldWrapper label="Avg NSFs" field="csbs__Avg_NSFs__c" value={opportunity.csbs__Avg_NSFs__c} />
                        <EditableFieldWrapper label="Avg Credit Card Transaction Amount" field="csbs__Avg_Credit_Card_Transaction_Amount__c" value={opportunity.csbs__Avg_Credit_Card_Transaction_Amount__c} />
                        <EditableFieldWrapper label="Avg Negative Days" field="csbs__Avg_Negative_Days__c" value={opportunity.csbs__Avg_Negative_Days__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                
                {/* Open Balances */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Open Balances</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Lender Name 1" field="Lender_Name_1__c" value={opportunity.Lender_Name_1__c} />
                        <EditableFieldWrapper label="Open Balance Amount 1" field="Open_Balance_Amount_1__c" value={opportunity.Open_Balance_Amount_1__c} />
                        <EditableFieldWrapper label="Lender Name 2" field="Lender_Name_2__c" value={opportunity.Lender_Name_2__c} />
                        <EditableFieldWrapper label="Open Balance Amount 2" field="Open_Balance_Amount_2__c" value={opportunity.Open_Balance_Amount_2__c} />
                        <EditableFieldWrapper label="Lender Name 3" field="Lender_Name_3__c" value={opportunity.Lender_Name_3__c} />
                        <EditableFieldWrapper label="Open Balance Amount 3" field="Open_Balance_Amount_3__c" value={opportunity.Open_Balance_Amount_3__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                
                {/* Funded Terms */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Funded Terms</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Funded Date" field="csbs__Funded_Date__c" value={opportunity.csbs__Funded_Date__c} />
                        <EditableFieldWrapper label="Selected Offer" field="csbs__Selected_Offer__c" value={opportunity.csbs__Selected_Offer__c} />
                        <EditableFieldWrapper label="Lender" field="csbs__Lender__c" value={opportunity.csbs__Lender__c} />
                        <EditableFieldWrapper label="Buy Rate" field="csbs__Buy_Rate__c" value={opportunity.csbs__Buy_Rate__c} />
                        <EditableFieldWrapper label="Funded" field="csbs__Funded__c" value={opportunity.csbs__Funded__c} />
                        <EditableFieldWrapper label="Factor Rate" field="csbs__Factor_Rate__c" value={opportunity.csbs__Factor_Rate__c} />
                        <EditableFieldWrapper label="Payoff" field="csbs__Payoff__c" value={opportunity.csbs__Payoff__c} />
                        <EditableFieldWrapper label="Product" field="csbs__Product__c" value={opportunity.csbs__Product__c} />
                        <EditableFieldWrapper label="Net Funded" field="csbs__Net_Funded__c" value={opportunity.csbs__Net_Funded__c} />
                        <EditableFieldWrapper label="Payment Amount" field="csbs__Payment_Amount__c" value={opportunity.csbs__Payment_Amount__c} />
                        <EditableFieldWrapper label="Term" field="csbs__Term__c" value={opportunity.csbs__Term__c} />
                        <EditableFieldWrapper label="Payment Frequency" field="csbs__Payment_Frequency__c" value={opportunity.csbs__Payment_Frequency__c} />
                        <EditableFieldWrapper label="Payback" field="csbs__Payback__c" value={opportunity.csbs__Payback__c} />
                        <EditableFieldWrapper label="Payment Method" field="csbs__Payment_Method__c" value={opportunity.csbs__Payment_Method__c} />
                        <EditableFieldWrapper label="Holdback %" field="csbs__Holdback_Percentage__c" value={opportunity.csbs__Holdback_Percentage__c} />
                        <EditableFieldWrapper label="Commission $" field="csbs__Commission_Amount__c" value={opportunity.csbs__Commission_Amount__c} />
                        <EditableFieldWrapper label="Commission %" field="csbs__Commission_Percentage__c" value={opportunity.csbs__Commission_Percentage__c} />
                        <EditableFieldWrapper label="Origination Fee $" field="csbs__Origination_Fee_Amount__c" value={opportunity.csbs__Origination_Fee_Amount__c} />
                        <EditableFieldWrapper label="Origination Fee %" field="csbs__Origination_Fee_Percentage__c" value={opportunity.csbs__Origination_Fee_Percentage__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                
                {/* Renewal Forecasting */}
                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Renewal Forecasting</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableFieldWrapper label="Estimated Paid In %" field="csbs__Estimated_Paid_In_Percentage__c" value={opportunity.csbs__Estimated_Paid_In_Percentage__c} />
                        <EditableFieldWrapper label="60% Paid In" field="csbs__Sixty_Percent_Paid_In__c" value={opportunity.csbs__Sixty_Percent_Paid_In__c} />
                        <EditableFieldWrapper label="20% Paid In" field="csbs__Twenty_Percent_Paid_In__c" value={opportunity.csbs__Twenty_Percent_Paid_In__c} />
                        <EditableFieldWrapper label="80% Paid In" field="csbs__Eighty_Percent_Paid_In__c" value={opportunity.csbs__Eighty_Percent_Paid_In__c} />
                        <EditableFieldWrapper label="40% Paid In" field="csbs__Fourty_Percent_Paid_In__c" value={opportunity.csbs__Fourty_Percent_Paid_In__c} />
                        <EditableFieldWrapper label="100% Paid In" field="csbs__One_Hundred_Percent_Paid_In__c" value={opportunity.csbs__One_Hundred_Percent_Paid_In__c} />
                        <EditableFieldWrapper label="Renewal Status" field="csbs__Renewal_Status__c" value={opportunity.csbs__Renewal_Status__c} />
                        <EditableFieldWrapper label="Previous Funding" field="csbs__Previous_Funding__c" value={opportunity.csbs__Previous_Funding__c} />
                        <EditableFieldWrapper label="Renewal Status Notes" field="csbs__Renewal_Status_Notes__c" value={opportunity.csbs__Renewal_Status_Notes__c} />
                        <EditableFieldWrapper label="Next Funding" field="csbs__Next_Funding__c" value={opportunity.csbs__Next_Funding__c} />
                        <EditableFieldWrapper label="Originating Opportunity" field="csbs__Originating_Opportunity__c" value={opportunity.csbs__Originating_Opportunity__c} />
                        <EditableFieldWrapper label="Current Renewal" field="csbs__Current_Renewal__c" value={opportunity.csbs__Current_Renewal__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>



                {/* Files */}
                <FileManager
                  key={refreshKey}
                  recordId={opportunity.Id}
                  session={session}
                  onFileUploaded={() => setRefreshKey(prev => prev + 1)}
                />
              </TabsContent>


            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Email Client */}
            <EmailClientCard
              recipientEmail={contactRoles[0]?.Contact?.Email || opportunity.Account?.Email__c}
              recipientName={contactRoles[0]?.Contact?.Name || opportunity.Account?.Name}
              recordId={opportunity.Id}
              recordType="Opportunity"
              session={session}
            />

            {/* Contact Roles */}
            {contactRoles.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {contactRoles.map(role => (
                    <div key={role.Id} className="border-b border-slate-100 pb-3 last:border-0">
                      <p className="font-medium text-slate-900">{role.Contact?.Name}</p>
                      {role.Role && <p className="text-xs text-slate-500 mb-2">{role.Role}</p>}
                      {role.Contact?.Email && (
                        <a href={`mailto:${role.Contact.Email}`} className="text-sm text-orange-600 hover:underline block">
                          {role.Contact.Email}
                        </a>
                      )}
                      {role.Contact?.Phone && (
                        <a href={`tel:${role.Contact.Phone}`} className="text-sm text-orange-600 hover:underline block">
                          {role.Contact.Phone}
                        </a>
                      )}
                      {role.Contact?.MobilePhone && (
                        <a href={`tel:${role.Contact.MobilePhone}`} className="text-sm text-orange-600 hover:underline block">
                          Mobile: {role.Contact.MobilePhone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Key Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Amount</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(opportunity.Amount)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Close Date</p>
                  <p className="font-medium text-slate-900">{formatDate(opportunity.CloseDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Probability</p>
                  <p className="font-medium text-slate-900">{opportunity.Probability}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Owner</p>
                  {!showOwnerChange ? (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{opportunity.Owner?.Name || 'Unknown'}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOwnerChange(true)}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        value={opportunity.OwnerId}
                        onValueChange={handleOwnerChange}
                        disabled={changingOwner}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {changingOwner ? 'Changing...' : 'Select new owner'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.Id} value={user.Id}>
                              {user.Name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOwnerChange(false)}
                        className="w-full text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}