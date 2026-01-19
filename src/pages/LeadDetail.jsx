import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Loader2, CheckCircle2, ChevronDown, XCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../components/context/NotificationContext';

import FileManager from '../components/rep/FileManager.jsx';
import EditableField from '../components/rep/EditableField.jsx';
import CommunicationCard from '../components/rep/CommunicationCard.jsx';
import RepPortalHeader from '../components/rep/RepPortalHeader';
import ActivityPanel from '../components/rep/ActivityPanel';
import RecordHistoryModal from '../components/rep/RecordHistoryModal';

export default function LeadDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [converting, setConverting] = useState(false);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState([]);
  const [changingOwner, setChangingOwner] = useState(false);
  const [showOwnerChange, setShowOwnerChange] = useState(false);
  const [dispositionOptions, setDispositionOptions] = useState([]);
  const [updatingDisposition, setUpdatingDisposition] = useState(false);
  const [showDispositionChange, setShowDispositionChange] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [updatingQuickStatus, setUpdatingQuickStatus] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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

  const { removeNotification, notifications } = useContext(NotificationContext);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const session = JSON.parse(sessionData);
    setSession(session);
    loadLead(session);
    loadUsers(session);
    loadDispositionOptions(session);
  }, []);

  // Clear notifications for this record on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('id');
    if (leadId && notifications.length > 0) {
      notifications.forEach(notif => {
        if ((notif.recordId === leadId && notif.recordType === 'Lead') || (notif.link && notif.link.includes(leadId))) {
          removeNotification(notif.id);
        }
      });
    }
  }, [notifications, removeNotification]);

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

  const loadDispositionOptions = async (sessionData) => {
    try {
      const response = await base44.functions.invoke('getSalesforcePicklistValues', {
        objectType: 'Lead',
        fieldName: 'Call_Disposition__c',
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });
      setDispositionOptions(response.data.values || []);
    } catch (error) {
      console.error('Load disposition options error:', error);
    }
  };

  const handleDispositionChange = async (newDisposition) => {
    if (newDisposition === lead.Call_Disposition__c) return;
    
    setUpdatingDisposition(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: lead.Id,
        data: { Call_Disposition__c: newDisposition },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      setLead({ ...lead, Call_Disposition__c: newDisposition });
      setShowDispositionChange(false);
    } catch (error) {
      console.error('Disposition update error:', error);
      alert('Failed to update call disposition');
    } finally {
      setUpdatingDisposition(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    if (newStatus === lead.Status) return;
    
    setUpdatingQuickStatus(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: lead.Id,
        data: { Status: newStatus },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadLead(session);
      setShowStatusChange(false);
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingQuickStatus(false);
    }
  };

  const handleFieldSave = async (field) => {
    try {
      setEditing({ ...editing, [field]: true });
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
      setEditing({ ...editing, [field]: false });
    }
  };

  const handleOwnerChange = async (newOwnerId) => {
    if (newOwnerId === lead.OwnerId) return;

    const newOwner = users.find(u => u.Id === newOwnerId);
    
    setChangingOwner(true);
    try {
      await base44.functions.invoke('updateRecordOwner', {
        recordId: lead.Id,
        objectType: 'Lead',
        ownerId: newOwnerId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setLead({ 
        ...lead, 
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

  const handleConvertLead = async () => {
    if (!confirm('Are you sure you want to convert this lead to an opportunity? This action cannot be undone.')) {
      return;
    }

    setConverting(true);
    try {
      const response = await base44.functions.invoke('convertLead', {
        leadId: lead.Id,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (response.data.success && response.data.opportunityId) {
        navigate(createPageUrl('OpportunityDetail') + `?id=${response.data.opportunityId}`);
      } else {
        alert('Lead converted successfully');
        navigate(createPageUrl('RepPortal'));
      }
    } catch (error) {
      console.error('Convert lead error:', error);
      alert('Failed to convert lead: ' + (error.message || 'Unknown error'));
    } finally {
      setConverting(false);
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
      <RepPortalHeader
        isAdmin={session?.isAdmin || false}
        refreshing={false}
        onRefresh={() => loadLead(session)}
        onLogout={() => {
          sessionStorage.removeItem('sfSession');
          window.location.reload();
        }}
        userName={session?.name}
        showCreateTask={false}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        isAdminPortal={window.location.pathname.includes('AdminPipeline') || sessionStorage.getItem('fromAdminPortal') === 'true'}
      />

      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{lead.Name}</h1>
              <p className="text-sm text-slate-600">{lead.Company}</p>
            </div>
            <div className="flex gap-2">
              {session?.isAdmin && (
                <Button 
                  onClick={() => setShowHistory(true)} 
                  variant="outline"
                  size="sm"
                >
                  History
                </Button>
              )}
              {!lead.IsConverted && (
                <Button 
                  onClick={handleConvertLead} 
                  disabled={converting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {converting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Convert to Opportunity
                </Button>
              )}
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
            {lead.Status !== 'Closed - Not Converted' ? (
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
                <div className="flex gap-1 mb-4">
                  {stages.map((_, idx) => (
                    <div key={idx} className={`h-2 flex-1 rounded transition-all ${
                      idx <= getCurrentStageIndex() ? 'bg-[#08708E]' : 'bg-slate-200'
                    }`} />
                  ))}
                </div>
                
                {/* Not Converted Button */}
                <div className="flex justify-center pt-2 border-t">
                  <Button
                    onClick={() => handleStatusChange('Closed - Not Converted')}
                    disabled={updatingStatus}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    Mark as Not Converted
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-lg font-semibold text-red-800">{lead.Status}</p>
                </div>
              </div>
            )}

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
                    <EditableFieldWrapper label="Company" field="Company" value={lead.Company} />
                    <EditableFieldWrapper label="Email" field="Email" value={lead.Email} />
                    <EditableFieldWrapper label="Phone" field="Phone" value={lead.Phone} />
                    <EditableFieldWrapper label="Mobile" field="MobilePhone" value={lead.MobilePhone} />
                    <EditableFieldWrapper label="Title" field="Title" value={lead.Title} />
                    <EditableFieldWrapper label="Lead Source" field="LeadSource" value={lead.LeadSource} />
                    <EditableFieldWrapper label="Industry" field="Industry" value={lead.Industry} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Owner 1 */}
            <Collapsible open={openSections.owner1} onOpenChange={(val) => setOpenSections({...openSections, owner1: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Owner Information</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.owner1 ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableFieldWrapper label="Name" field="Name" value={lead.Name} />
                    <EditableFieldWrapper label="Title" field="Title" value={lead.Title} />
                    <EditableFieldWrapper label="Birthdate" field="csbs__Birthdate__c" value={lead.csbs__Birthdate__c} />
                    <EditableFieldWrapper label="Social Security Number" field="csbs__Social_Security_Number_Unencrypted__c" value={lead.csbs__Social_Security_Number_Unencrypted__c} />
                    <EditableFieldWrapper label="Ownership %" field="csbs__Ownership_Percentage__c" value={lead.csbs__Ownership_Percentage__c} />
                    <EditableFieldWrapper label="Credit Score" field="csbs__CreditScore__c" value={lead.csbs__CreditScore__c} />
                    <EditableFieldWrapper label="Application Federal Tax Id" field="csbs__Application_Federal_Tax_Id__c" value={lead.csbs__Application_Federal_Tax_Id__c} />
                    <EditableFieldWrapper label="Application SSN" field="csbs__Application_SSN__c" value={lead.csbs__Application_SSN__c} />
                    <EditableFieldWrapper label="Application Owner 2 SSN" field="csbs__Application_Owner_2_SSN__c" value={lead.csbs__Application_Owner_2_SSN__c} />
                    <EditableFieldWrapper label="Mobile" field="MobilePhone" value={lead.MobilePhone} />
                    <EditableFieldWrapper label="Email" field="Email" value={lead.Email} />
                    <EditableFieldWrapper label="Home Address Street" field="csbs__Home_Address_Street__c" value={lead.csbs__Home_Address_Street__c} />
                    <EditableFieldWrapper label="Home Address City" field="csbs__Home_Address_City__c" value={lead.csbs__Home_Address_City__c} />
                    <EditableFieldWrapper label="Home Address State" field="csbs__Home_Address_State__c" value={lead.csbs__Home_Address_State__c} />
                    <EditableFieldWrapper label="Home Address Zip Code" field="csbs__Home_Address_Zip_Code__c" value={lead.csbs__Home_Address_Zip_Code__c} />
                    <EditableFieldWrapper label="Home Address Country" field="csbs__Home_Address_Country__c" value={lead.csbs__Home_Address_Country__c} />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Owner 2 */}
            <Collapsible open={openSections.owner2} onOpenChange={(val) => setOpenSections({...openSections, owner2: val})}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Owner 2 Information</h2>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.owner2 ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid sm:grid-cols-2 gap-4 text-sm">
                    <EditableFieldWrapper label="Owner 2 First Name" field="csbs__Owner_2_First_Name__c" value={lead.csbs__Owner_2_First_Name__c} />
                    <EditableFieldWrapper label="Owner 2 Last Name" field="csbs__Owner_2_Last_Name__c" value={lead.csbs__Owner_2_Last_Name__c} />
                    <EditableFieldWrapper label="Owner 2 Title" field="csbs__Owner_2_Title__c" value={lead.csbs__Owner_2_Title__c} />
                    <EditableFieldWrapper label="Owner 2 Birthday" field="csbs__Owner_2_Birthday__c" value={lead.csbs__Owner_2_Birthday__c} />
                    <EditableFieldWrapper label="Owner 2 Social Security Number" field="csbs__Owner_2_Social_Security_Number__c" value={lead.csbs__Owner_2_Social_Security_Number__c} />
                    <EditableFieldWrapper label="Owner 2 Ownership %" field="csbs__Owner_2_Ownership__c" value={lead.csbs__Owner_2_Ownership__c} />
                    <EditableFieldWrapper label="Owner 2 Credit Score" field="csbs__Owner_2_CreditScore__c" value={lead.csbs__Owner_2_CreditScore__c} />
                    <EditableFieldWrapper label="Owner 2 Mobile" field="csbs__Owner_2_Mobile__c" value={lead.csbs__Owner_2_Mobile__c} />
                    <EditableFieldWrapper label="Owner 2 Email" field="csbs__Owner_2_Email__c" value={lead.csbs__Owner_2_Email__c} />
                    <EditableFieldWrapper label="Owner 2 Home Address Street" field="csbs__Owner_2_Home_Address_Street__c" value={lead.csbs__Owner_2_Home_Address_Street__c} />
                    <EditableFieldWrapper label="Owner 2 Home Address City" field="csbs__Owner_2_Home_Address_City__c" value={lead.csbs__Owner_2_Home_Address_City__c} />
                    <EditableFieldWrapper label="Owner 2 Home Address State" field="csbs__Owner_2_Home_Address_State__c" value={lead.csbs__Owner_2_Home_Address_State__c} />
                    <EditableFieldWrapper label="Owner 2 Home Address Zip Code" field="csbs__Owner_2_Home_Address_Zip_Code__c" value={lead.csbs__Owner_2_Home_Address_Zip_Code__c} />
                    <EditableFieldWrapper label="Owner 2 Home Address Country" field="csbs__Owner_2_Home_Address_Country__c" value={lead.csbs__Owner_2_Home_Address_Country__c} />
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
                    <EditableFieldWrapper label="Amount Requested" field="csbs__Amount_Requested__c" value={lead.csbs__Amount_Requested__c} />
                    <EditableFieldWrapper label="Use of Proceeds" field="csbs__Use_of_Proceeds__c" value={lead.csbs__Use_of_Proceeds__c} />
                    <EditableFieldWrapper label="Monthly Revenue" field="csbs__Estimated_Monthly_Revenue__c" value={lead.csbs__Estimated_Monthly_Revenue__c} />
                    <EditableFieldWrapper label="Annual Revenue" field="AnnualRevenue" value={lead.AnnualRevenue} />
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
                    <EditableFieldWrapper label="Application Industry" field="csbs__Application_Industry__c" value={lead.csbs__Application_Industry__c} />
                    <EditableFieldWrapper label="Industry" field="Industry" value={lead.Industry} />
                    <EditableFieldWrapper label="Entity Type" field="csbs__Entity_Type__c" value={lead.csbs__Entity_Type__c} />
                    <EditableFieldWrapper label="Federal Tax ID" field="csbs__Federal_Tax_ID_Unencrypted__c" value={lead.csbs__Federal_Tax_ID_Unencrypted__c} />
                    <EditableFieldWrapper label="State of Incorporation" field="csbs__State_of_Incorporation__c" value={lead.csbs__State_of_Incorporation__c} />
                    <EditableFieldWrapper label="Business Start Date" field="csbs__Business_Start_Date_Current_Ownership__c" value={lead.csbs__Business_Start_Date_Current_Ownership__c} />
                    <EditableFieldWrapper label="Seasonal Business" field="csbs__Seasonal_Business__c" value={lead.csbs__Seasonal_Business__c} />
                    <EditableFieldWrapper label="Seasonal Peak Months" field="csbs__Seasonal_Peak_Months__c" value={lead.csbs__Seasonal_Peak_Months__c} />
                    <EditableFieldWrapper label="E-Commerce" field="csbs__E_Commerce__c" value={lead.csbs__E_Commerce__c} />
                    <EditableFieldWrapper label="Franchise" field="csbs__Franchise__c" value={lead.csbs__Franchise__c} />
                    <EditableFieldWrapper label="Home-Based Business" field="csbs__Home_Based_Business__c" value={lead.csbs__Home_Based_Business__c} />
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
                        <EditableFieldWrapper label="Reference 1" field="csbs__Business_Trade_Reference_1__c" value={lead.csbs__Business_Trade_Reference_1__c} />
                        <EditableFieldWrapper label="Reference 2" field="csbs__Business_Trade_Reference_2__c" value={lead.csbs__Business_Trade_Reference_2__c} />
                        <EditableFieldWrapper label="Reference 3" field="csbs__Business_Trade_Reference_3__c" value={lead.csbs__Business_Trade_Reference_3__c} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Existing Lenders</p>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <EditableFieldWrapper label="Lender 1" field="Lender_Name_1__c" value={lead.Lender_Name_1__c} />
                        <EditableFieldWrapper label="Lender 2" field="Lender_Name_2__c" value={lead.Lender_Name_2__c} />
                        <EditableFieldWrapper label="Lender 3" field="Lender_Name_3__c" value={lead.Lender_Name_3__c} />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Files */}
            <FileManager
              key={refreshKey}
              recordId={lead.Id}
              session={session}
              onFileUploaded={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Sidebar */}
           <div className="space-y-6">
            {/* Communication Card - Email & SMS */}
            <CommunicationCard
              recipientEmail={lead.Email}
              recipientName={lead.Name}
              phoneNumber={lead.MobilePhone || lead.Phone}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
              smsColor="bg-[#08708E]"
              firstName={lead.FirstName}
            />

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-slate-900">{lead.Name}</p>
                  <p className="text-xs text-slate-500 mb-2">{lead.Title || 'Contact'}</p>
                </div>
                {lead.Email && (
                  <a href={`mailto:${lead.Email}`} className="text-sm text-[#08708E] hover:underline block">
                    {lead.Email}
                  </a>
                )}
                {lead.Phone && (
                  <a href={`tel:${lead.Phone}`} className="text-sm text-[#08708E] hover:underline block">
                    {lead.Phone}
                  </a>
                )}
                {lead.MobilePhone && (
                  <a href={`tel:${lead.MobilePhone}`} className="text-sm text-[#08708E] hover:underline block">
                    Mobile: {lead.MobilePhone}
                  </a>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <ActivityPanel
              recordId={lead.Id}
              recordType="Lead"
              session={session}
            />

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Amount Requested</p>
                  <p className="text-xl font-bold text-[#08708E]">${lead.csbs__Amount_Requested__c ? parseFloat(lead.csbs__Amount_Requested__c).toLocaleString() : '0'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Lead Owner</p>
                  {!showOwnerChange ? (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{lead.Owner?.Name || 'Unknown'}</p>
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
                        value={lead.OwnerId}
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
                <div>
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  {!showStatusChange ? (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{lead.Status}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusChange(true)}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        value={lead.Status}
                        onValueChange={handleQuickStatusChange}
                        disabled={updatingQuickStatus}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {updatingQuickStatus ? 'Updating...' : 'Select status'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open - Not Contacted">Open - Not Contacted</SelectItem>
                          <SelectItem value="Working - Contacted">Working - Contacted</SelectItem>
                          <SelectItem value="Working - Application Out">Working - Application Out</SelectItem>
                          <SelectItem value="Application Missing Info">Application Missing Info</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Closed - Not Converted">Closed - Not Converted</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStatusChange(false)}
                        className="w-full text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Call Disposition</p>
                  {!showDispositionChange ? (
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{lead.Call_Disposition__c || 'Not set'}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDispositionChange(true)}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        value={lead.Call_Disposition__c || ''}
                        onValueChange={handleDispositionChange}
                        disabled={updatingDisposition}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {updatingDisposition ? 'Updating...' : 'Select disposition'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {dispositionOptions.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDispositionChange(false)}
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

      <RecordHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        recordId={lead?.Id}
        session={session}
      />
    </div>
  );
}