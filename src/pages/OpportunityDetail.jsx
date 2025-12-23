import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Edit, Loader2, Check, X, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';
import EmailClientCard from '../components/rep/EmailClientCard.jsx';

export default function OpportunityDetail() {
  const [session, setSession] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [contactRoles, setContactRoles] = useState([]);
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
                        <EditableField label="Opportunity Name" field="Name" value={opportunity.Name} />
                        <EditableField label="Account Name" field="AccountId" value={opportunity.Account?.Name} />
                        <EditableField label="Amount" field="Amount" value={formatCurrency(opportunity.Amount)} />
                        <EditableField label="Close Date" field="CloseDate" value={formatDate(opportunity.CloseDate)} type="date" />
                        <EditableField label="Stage" field="StageName" value={opportunity.StageName} />
                        <EditableField label="Stage Detail" field="Stage_Detail__c" value={opportunity.Stage_Detail__c} />
                        <EditableField label="Type" field="Type" value={opportunity.Type} />
                        <EditableField label="Lead Source" field="LeadSource" value={opportunity.LeadSource} />
                        <EditableField label="ISO" field="ISO__c" value={opportunity.ISO__c} />
                        <EditableField label="Line of Credit" field="Line_of_Credit__c" value={opportunity.Line_of_Credit__c} />
                        {opportunity.Description && (
                          <div className="col-span-2">
                            <p className="text-slate-500 text-xs mb-1">Description</p>
                            <p className="font-medium text-slate-900">{opportunity.Description}</p>
                          </div>
                        )}
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
                        <EditableField label="Amount Requested" field="Amount_Requested__c" value={formatCurrency(opportunity.Amount_Requested__c)} />
                        <EditableField label="Months In Business" field="Months_In_Business__c" value={opportunity.Months_In_Business__c} />
                        <EditableField label="Use of Proceeds" field="Use_of_Proceeds__c" value={opportunity.Use_of_Proceeds__c} />
                        <EditableField label="Estimated Monthly Revenue" field="Estimated_Monthly_Revenue__c" value={formatCurrency(opportunity.Estimated_Monthly_Revenue__c)} />
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
                        <EditableField label="Owner 1" field="Owner__c" value={opportunity.Owner__c} />
                        <EditableField label="Owner 2" field="Owner_2__c" value={opportunity.Owner_2__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Email Client */}
                <EmailClientCard
                  recipientEmail={contactRoles[0]?.Contact?.Email || opportunity.Account?.Email__c}
                  recipientName={contactRoles[0]?.Contact?.Name || opportunity.Account?.Name}
                  recordId={opportunity.Id}
                  recordType="Opportunity"
                  session={session}
                />

                {/* Activity & Files */}
                <ActivityTimeline
                  key={refreshKey}
                  recordId={opportunity.Id}
                  recordType="Opportunity"
                  session={session}
                  onActivityAdded={() => setRefreshKey(prev => prev + 1)}
                />
                <FileManager
                  key={refreshKey}
                  recordId={opportunity.Id}
                  session={session}
                  onFileUploaded={() => setRefreshKey(prev => prev + 1)}
                />
              </TabsContent>

              {/* Submissions Tab */}
              <TabsContent value="submissions" className="space-y-4">
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Submission Information</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableField label="Lender" field="Lender__c" value={opportunity.Lender__c} />
                        <EditableField label="Product" field="Product__c" value={opportunity.Product__c} />
                        <EditableField label="Selected Offer" field="Selected_Offer__c" value={opportunity.Selected_Offer__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>

              {/* Offers Tab */}
              <TabsContent value="offers" className="space-y-4">
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Offer Details</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableField label="Funded" field="Funded__c" value={formatCurrency(opportunity.Funded__c)} />
                        <EditableField label="Net Funded" field="Net_Funded__c" value={formatCurrency(opportunity.Net_Funded__c)} />
                        <EditableField label="Buy Rate" field="Buy_Rate__c" value={opportunity.Buy_Rate__c} />
                        <EditableField label="Factor Rate" field="Factor_Rate__c" value={opportunity.Factor_Rate__c} />
                        <EditableField label="Payback" field="Payback__c" value={formatCurrency(opportunity.Payback__c)} />
                        <EditableField label="Payment Amount" field="Payment_Amount__c" value={formatCurrency(opportunity.Payment_Amount__c)} />
                        <EditableField label="Term" field="Term__c" value={opportunity.Term__c} />
                        <EditableField label="Payment Frequency" field="Payment_Frequency__c" value={opportunity.Payment_Frequency__c} />
                        <EditableField label="Payment Method" field="Payment_Method__c" value={opportunity.Payment_Method__c} />
                        <EditableField label="Holdback %" field="Holdback__c" value={opportunity.Holdback__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>

              {/* Statements Tab */}
              <TabsContent value="statements" className="space-y-4">
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Financial Statements</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableField label="Avg Gross Monthly Sales" field="Avg_Gross_Monthly_Sales__c" value={formatCurrency(opportunity.Avg_Gross_Monthly_Sales__c)} />
                        <EditableField label="Avg Bank Deposits $" field="Avg_Bank_Deposits__c" value={formatCurrency(opportunity.Avg_Bank_Deposits__c)} />
                        <EditableField label="Avg Bank Deposits #" field="Avg_Bank_Deposits_Count__c" value={opportunity.Avg_Bank_Deposits_Count__c} />
                        <EditableField label="Avg Credit Card Volume" field="Avg_Credit_Card_Volume__c" value={formatCurrency(opportunity.Avg_Credit_Card_Volume__c)} />
                        <EditableField label="Avg Daily Balance" field="Avg_Daily_Balance__c" value={formatCurrency(opportunity.Avg_Daily_Balance__c)} />
                        <EditableField label="Avg Credit Card Batches" field="Avg_Credit_Card_Batches__c" value={opportunity.Avg_Credit_Card_Batches__c} />
                        <EditableField label="Avg NSFs" field="Avg_NSFs__c" value={opportunity.Avg_NSFs__c} />
                        <EditableField label="Avg Negative Days" field="Avg_Negative_Days__c" value={opportunity.Avg_Negative_Days__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>

              {/* Debt Tab */}
              <TabsContent value="debt" className="space-y-4">
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Existing Debt</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0">
                        <div className="grid sm:grid-cols-3 gap-6 text-sm">
                          <div className="space-y-3">
                            <EditableField label="Lender Name 1" field="Lender_Name_1__c" value={opportunity.Lender_Name_1__c} />
                            <EditableField label="Open Balance 1" field="Open_Balance_Amount_1__c" value={formatCurrency(opportunity.Open_Balance_Amount_1__c)} />
                          </div>
                          <div className="space-y-3">
                            <EditableField label="Lender Name 2" field="Lender_Name_2__c" value={opportunity.Lender_Name_2__c} />
                            <EditableField label="Open Balance 2" field="Open_Balance_Amount_2__c" value={formatCurrency(opportunity.Open_Balance_Amount_2__c)} />
                          </div>
                          <div className="space-y-3">
                            <EditableField label="Lender Name 3" field="Lender_Name_3__c" value={opportunity.Lender_Name_3__c} />
                            <EditableField label="Open Balance 3" field="Open_Balance_Amount_3__c" value={formatCurrency(opportunity.Open_Balance_Amount_3__c)} />
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <EditableField label="Payoff" field="Payoff__c" value={formatCurrency(opportunity.Payoff__c)} />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>

              {/* Commissions Tab */}
              <TabsContent value="commissions" className="space-y-4">
                <Collapsible defaultOpen={true}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Commission Details</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableField label="Commission $" field="Commission__c" value={formatCurrency(opportunity.Commission__c)} />
                        <EditableField label="Commission %" field="Commission_Percentage__c" value={opportunity.Commission_Percentage__c} />
                        <EditableField label="Origination Fee $" field="Origination_Fee__c" value={formatCurrency(opportunity.Origination_Fee__c)} />
                        <EditableField label="Origination Fee %" field="Origination_Fee_Percentage__c" value={opportunity.Origination_Fee_Percentage__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                <Collapsible defaultOpen={false}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                      <h2 className="text-lg font-semibold text-slate-900">Renewal Tracking</h2>
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                        <EditableField label="20% Paid In" field="X20_Paid_In__c" value={formatDate(opportunity.X20_Paid_In__c)} type="date" />
                        <EditableField label="40% Paid In" field="X40_Paid_In__c" value={formatDate(opportunity.X40_Paid_In__c)} type="date" />
                        <EditableField label="60% Paid In" field="X60_Paid_In__c" value={formatDate(opportunity.X60_Paid_In__c)} type="date" />
                        <EditableField label="80% Paid In" field="X80_Paid_In__c" value={formatDate(opportunity.X80_Paid_In__c)} type="date" />
                        <EditableField label="100% Paid In" field="X100_Paid_In__c" value={formatDate(opportunity.X100_Paid_In__c)} type="date" />
                        <EditableField label="Renewal Status" field="Renewal_Status__c" value={opportunity.Renewal_Status__c} />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </TabsContent>
            </Tabs>
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
                        <a href={`mailto:${role.Contact.Email}`} className="text-sm text-[#08708E] hover:underline block">
                          {role.Contact.Email}
                        </a>
                      )}
                      {role.Contact?.Phone && (
                        <a href={`tel:${role.Contact.Phone}`} className="text-sm text-[#08708E] hover:underline block">
                          {role.Contact.Phone}
                        </a>
                      )}
                      {role.Contact?.MobilePhone && (
                        <a href={`tel:${role.Contact.MobilePhone}`} className="text-sm text-slate-600 hover:underline block">
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
                  <p className="text-2xl font-bold text-[#08708E]">{formatCurrency(opportunity.Amount)}</p>
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
                  <p className="font-medium text-slate-900">{opportunity.Owner?.Name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}