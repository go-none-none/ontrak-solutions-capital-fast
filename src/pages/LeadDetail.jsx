import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Edit, Loader2, Check, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';
import EmailClientCard from '../components/rep/EmailClientCard.jsx';

export default function LeadDetail() {
  const [session, setSession] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [openSections, setOpenSections] = useState({
    contact: true,
    owner1: false,
    owner2: false,
    financial: false,
    business: false,
    references: false
  });

  const bankStatementFields = [
    { label: 'Bank Statement - Month 1', field: 'Bank_Statement_Month_1__c' },
    { label: 'Bank Statement - Month 2', field: 'Bank_Statement_Month_2__c' },
    { label: 'Bank Statement - Month 3', field: 'Bank_Statement_Month_3__c' },
    { label: 'Bank Statement - Month 4', field: 'Bank_Statement_Month_4__c' }
  ];

  const stages = [
    { label: 'New', status: 'Open - Not Contacted' },
    { label: 'Contacted', status: 'Working - Contacted' },
    { label: 'App Out', status: 'Working - Application Out' },
    { label: 'Missing Info', status: 'Application Missing Info' },
    { label: 'Converted', status: 'Converted' }
  ];

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    setSession(JSON.parse(sessionData));
    loadLead(JSON.parse(sessionData));
  }, []);

  const loadLead = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const leadId = urlParams.get('id');

      const response = await base44.functions.invoke('getSalesforceRecord', {
        recordId: leadId,
        recordType: 'Lead',
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });

      setLead(response.data.record);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (lead.Status === newStatus) return;
    
    setUpdatingStatus(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: lead.Id,
        data: { Status: newStatus },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadLead(session);
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFieldEdit = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

  const handleFieldSave = async (field) => {
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: lead.Id,
        data: { [field]: editValues[field] },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      await loadLead(session);
      setEditing({ ...editing, [field]: false });
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const EditableField = ({ label, field, value, type = 'text', multiline = false }) => {
    const isEditing = editing[field];
    const displayValue = isEditing ? editValues[field] : value;

    return (
      <div>
        <p className="text-slate-500 text-xs mb-1">{label}</p>
        {isEditing ? (
          <div className="flex items-start gap-2">
            {multiline ? (
              <Textarea
                value={displayValue || ''}
                onChange={(e) => handleFieldEdit(field, e.target.value)}
                className="text-sm"
                rows={3}
              />
            ) : (
              <Input
                type={type}
                value={displayValue || ''}
                onChange={(e) => handleFieldEdit(field, e.target.value)}
                className="h-8 text-sm"
              />
            )}
            <Button size="sm" variant="ghost" onClick={() => handleFieldSave(field)} className="mt-1">
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing({ ...editing, [field]: false })} className="mt-1">
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <p className="font-medium text-slate-900">{value || <span className="text-slate-400 text-sm">Not set - Click to add</span>}</p>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
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

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.status === lead?.Status);
    return index >= 0 ? index : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#08708E] animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Lead not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('RepPortal')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{lead.Name}</h1>
              <p className="text-sm text-slate-600">{lead.Company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stage Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Lead Stage</h3>
              <div className="flex justify-between items-center mb-3">
                {stages.map((stage, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStatusChange(stage.status)}
                    disabled={updatingStatus}
                    className={`flex flex-col items-center flex-1 transition-all ${
                      updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      idx <= getCurrentStageIndex() 
                        ? 'bg-[#08708E] text-white shadow-lg' 
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}>
                      {idx < getCurrentStageIndex() ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-xs text-slate-600 mt-2 text-center">{stage.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {stages.map((_, idx) => (
                  <div key={idx} className={`h-2 flex-1 rounded transition-all ${
                    idx <= getCurrentStageIndex() ? 'bg-[#08708E]' : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            </div>

            {/* Bank Statements Checklist - Only show when Application Missing Info */}
            {lead.Status === 'Application Missing Info' && (
              <Collapsible defaultOpen={true}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-amber-200">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-amber-50">
                    <h2 className="text-lg font-semibold text-amber-900">Bank Statements Check List</h2>
                    <ChevronDown className="w-5 h-5 transition-transform" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-3">
                      {bankStatementFields.map(({ label, field }) => (
                        <div key={field} className="flex items-center justify-between p-3 border-b border-slate-200 last:border-0">
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={lead[field] || false}
                              onChange={async (e) => {
                                try {
                                  await base44.functions.invoke('updateSalesforceRecord', {
                                    objectType: 'Lead',
                                    recordId: lead.Id,
                                    data: { [field]: e.target.checked },
                                    token: session.token,
                                    instanceUrl: session.instanceUrl
                                  });
                                  await loadLead(session);
                                } catch (error) {
                                  console.error('Update error:', error);
                                }
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditValues({ ...editValues, [field]: lead[field] || false });
                                setEditing({ ...editing, [field]: true });
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Contact Info - Always Open */}
            <Collapsible open={openSections.contact} onOpenChange={(val) => setOpenSections({...openSections, contact: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Contact & Basic Info</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableField label="Company" field="Company" value={lead.Company} />
                    <EditableField label="Email" field="Email" value={lead.Email} type="email" />
                    <EditableField label="Phone" field="Phone" value={lead.Phone} />
                    <EditableField label="Mobile" field="MobilePhone" value={lead.MobilePhone} />
                    <EditableField label="Title" field="Title" value={lead.Title} />
                    <EditableField label="Lead Source" field="LeadSource" value={lead.LeadSource} />
                    <EditableField label="Industry" field="Industry" value={lead.Industry} />
                    <EditableField label="Status" field="Status" value={lead.Status} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Owner 1 */}
            <Collapsible open={openSections.owner1} onOpenChange={(val) => setOpenSections({...openSections, owner1: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Owner 1</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.owner1 ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableField label="Name" field="Name" value={lead.Name} />
                    <EditableField label="Ownership %" field="Ownership__c" value={lead.Ownership__c} />
                    <EditableField label="Birthdate" field="Birthdate__c" value={lead.Birthdate__c} type="date" />
                    <EditableField label="SSN" field="Social_Security_Number__c" value={lead.Social_Security_Number__c} />
                    <EditableField label="Credit Score" field="Credit_Score__c" value={lead.Credit_Score__c} />
                    <EditableField label="Home Address" field="Home_Address_Street__c" value={lead.Home_Address_Street__c} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Owner 2 */}
            <Collapsible open={openSections.owner2} onOpenChange={(val) => setOpenSections({...openSections, owner2: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Owner 2</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.owner2 ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableField label="First Name" field="Owner_2_First_Name__c" value={lead.Owner_2_First_Name__c} />
                    <EditableField label="Last Name" field="Owner_2_Last_Name__c" value={lead.Owner_2_Last_Name__c} />
                    <EditableField label="Ownership %" field="Owner_2_Ownership__c" value={lead.Owner_2_Ownership__c} />
                    <EditableField label="Mobile" field="Owner_2_Mobile__c" value={lead.Owner_2_Mobile__c} />
                    <EditableField label="Email" field="Owner_2_Email__c" value={lead.Owner_2_Email__c} type="email" />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Financial */}
            <Collapsible open={openSections.financial} onOpenChange={(val) => setOpenSections({...openSections, financial: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Financial Information</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.financial ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableField label="Amount Requested" field="Amount_Requested__c" value={lead.Amount_Requested__c} />
                    <EditableField label="Use of Proceeds" field="Use_of_Proceeds__c" value={lead.Use_of_Proceeds__c} />
                    <EditableField label="Monthly Revenue" field="Estimated_Monthly_Revenue__c" value={lead.Estimated_Monthly_Revenue__c} />
                    <EditableField label="Annual Revenue" field="Annual_Revenue__c" value={lead.Annual_Revenue__c} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Business */}
            <Collapsible open={openSections.business} onOpenChange={(val) => setOpenSections({...openSections, business: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Business Information</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.business ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableField label="Federal Tax ID" field="Federal_Tax_ID__c" value={lead.Federal_Tax_ID__c} />
                    <EditableField label="Entity Type" field="Entity_Type__c" value={lead.Entity_Type__c} />
                    <EditableField label="Business Start Date" field="Business_Start_Date__c" value={lead.Business_Start_Date__c} type="date" />
                    <EditableField label="State of Incorporation" field="State_of_Incorporation__c" value={lead.State_of_Incorporation__c} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* References */}
            <Collapsible open={openSections.references} onOpenChange={(val) => setOpenSections({...openSections, references: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">References & Lenders</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.references ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Trade References</p>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <EditableField label="Reference 1" field="Business_Trade_Reference_1__c" value={lead.Business_Trade_Reference_1__c} />
                        <EditableField label="Reference 2" field="Business_Trade_Reference_2__c" value={lead.Business_Trade_Reference_2__c} />
                        <EditableField label="Reference 3" field="Business_Trade_Reference_3__c" value={lead.Business_Trade_Reference_3__c} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Existing Lenders</p>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <EditableField label="Lender 1" field="Lender_Name_1__c" value={lead.Lender_Name_1__c} />
                        <EditableField label="Lender 2" field="Lender_Name_2__c" value={lead.Lender_Name_2__c} />
                        <EditableField label="Lender 3" field="Lender_Name_3__c" value={lead.Lender_Name_3__c} />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Email Client */}
            <EmailClientCard
              recipientEmail={lead.Email}
              recipientName={lead.Name}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
            />

            {/* Activity & Files */}
            <ActivityTimeline
              key={refreshKey}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
              onActivityAdded={() => setRefreshKey(prev => prev + 1)}
            />
            <FileManager
              key={refreshKey}
              recordId={lead.Id}
              session={session}
              onFileUploaded={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DialpadWidget
              phoneNumber={lead.MobilePhone || lead.Phone}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
              onCallCompleted={() => setRefreshKey(prev => prev + 1)}
            />

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Amount Requested</p>
                  <p className="text-xl font-bold text-[#08708E]">${lead.Amount_Requested__c ? parseFloat(lead.Amount_Requested__c).toLocaleString() : '0'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Lead Owner</p>
                  <p className="font-medium text-slate-900">{lead.Owner?.Name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Status</p>
                  <p className="font-medium text-slate-900">{lead.Status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}