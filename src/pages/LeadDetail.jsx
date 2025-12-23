import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Loader2, Check, X, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';

export default function LeadDetail() {
  const [session, setSession] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

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
          <div className="flex items-center gap-2">
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
          <div className="flex items-center justify-between">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Basic Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Company" field="Company" value={lead.Company} />
                <EditableField label="Title" field="Title" value={lead.Title} />
                <EditableField label="Email" field="Email" value={lead.Email} type="email" />
                <EditableField label="DBA" field="DBA__c" value={lead.DBA__c} />
                <EditableField label="Lead Source" field="LeadSource" value={lead.LeadSource} />
                <EditableField label="Website" field="Website" value={lead.Website} />
                <EditableField label="Fax" field="Fax" value={lead.Fax} />
                <EditableField label="Call Disposition" field="Call_Disposition__c" value={lead.Call_Disposition__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Lead Owner</p>
                  <p className="font-medium text-slate-900">{lead.Owner?.Name}</p>
                </div>
                <EditableField label="Type" field="Type__c" value={lead.Type__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Lead Status</p>
                  <p className="font-medium text-slate-900">{lead.Status}</p>
                </div>
                <EditableField label="Status Detail" field="Status_Detail__c" value={lead.Status_Detail__c} />
                <EditableField label="Phone" field="Phone" value={lead.Phone} />
                <EditableField label="Additional Phone" field="MobilePhone" value={lead.MobilePhone} />
                {lead.Street && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs mb-1">Address</p>
                    <p className="font-medium text-slate-900">
                      {lead.Street}, {lead.City}, {lead.State} {lead.PostalCode}
                    </p>
                  </div>
                )}
                {lead.Description && (
                  <div className="col-span-2">
                    <EditableField label="Description" field="Description" value={lead.Description} multiline />
                  </div>
                )}
              </div>
            </div>

            {/* Owner 1 Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Owner 1</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Name" field="Name" value={lead.Name} />
                <EditableField label="Title" field="Title" value={lead.Title} />
                <EditableField label="Birthdate" field="Birthdate__c" value={lead.Birthdate__c} type="date" />
                <EditableField label="Social Security Number" field="Social_Security_Number__c" value={lead.Social_Security_Number__c} />
                <EditableField label="Ownership %" field="Ownership__c" value={lead.Ownership__c} />
                <EditableField label="Credit Score" field="Credit_Score__c" value={lead.Credit_Score__c} />
                <EditableField label="Application Federal Tax Id" field="Application_Federal_Tax_Id__c" value={lead.Application_Federal_Tax_Id__c} />
                <EditableField label="Application SSN" field="Application_SSN__c" value={lead.Application_SSN__c} />
                <EditableField label="Mobile" field="MobilePhone" value={lead.MobilePhone} />
                <EditableField label="Email" field="Email" value={lead.Email} type="email" />
                <EditableField label="Home Address Street" field="Home_Address_Street__c" value={lead.Home_Address_Street__c} />
                <EditableField label="Home Address City" field="Home_Address_City__c" value={lead.Home_Address_City__c} />
                <EditableField label="Home Address State" field="Home_Address_State__c" value={lead.Home_Address_State__c} />
                <EditableField label="Home Address Zip Code" field="Home_Address_Zip_Code__c" value={lead.Home_Address_Zip_Code__c} />
                <EditableField label="Home Address Country" field="Home_Address_Country__c" value={lead.Home_Address_Country__c} />
              </div>
            </div>

            {/* Owner 2 Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Owner 2</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="First Name" field="Owner_2_First_Name__c" value={lead.Owner_2_First_Name__c} />
                <EditableField label="Last Name" field="Owner_2_Last_Name__c" value={lead.Owner_2_Last_Name__c} />
                <EditableField label="Title" field="Owner_2_Title__c" value={lead.Owner_2_Title__c} />
                <EditableField label="Birthday" field="Owner_2_Birthday__c" value={lead.Owner_2_Birthday__c} type="date" />
                <EditableField label="Social Security Number" field="Owner_2_Social_Security_Number__c" value={lead.Owner_2_Social_Security_Number__c} />
                <EditableField label="Ownership %" field="Owner_2_Ownership__c" value={lead.Owner_2_Ownership__c} />
                <EditableField label="Credit Score" field="Owner_2_Credit_Score__c" value={lead.Owner_2_Credit_Score__c} />
                <EditableField label="Application Owner 2 SSN" field="Application_Owner_2_SSN__c" value={lead.Application_Owner_2_SSN__c} />
                <EditableField label="Mobile" field="Owner_2_Mobile__c" value={lead.Owner_2_Mobile__c} />
                <EditableField label="Email" field="Owner_2_Email__c" value={lead.Owner_2_Email__c} type="email" />
                <EditableField label="Home Address Street" field="Owner_2_Home_Address_Street__c" value={lead.Owner_2_Home_Address_Street__c} />
                <EditableField label="Home Address City" field="Owner_2_Home_Address_City__c" value={lead.Owner_2_Home_Address_City__c} />
                <EditableField label="Home Address State" field="Owner_2_Home_Address_State__c" value={lead.Owner_2_Home_Address_State__c} />
                <EditableField label="Home Address Zip Code" field="Owner_2_Home_Address_Zip_Code__c" value={lead.Owner_2_Home_Address_Zip_Code__c} />
                <EditableField label="Home Address Country" field="Owner_2_Home_Address_Country__c" value={lead.Owner_2_Home_Address_Country__c} />
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Amount Requested" field="Amount_Requested__c" value={lead.Amount_Requested__c} />
                <EditableField label="Use of Proceeds" field="Use_of_Proceeds__c" value={lead.Use_of_Proceeds__c} />
                <EditableField label="Estimated Monthly Revenue $" field="Estimated_Monthly_Revenue__c" value={lead.Estimated_Monthly_Revenue__c} />
                <EditableField label="Annual Revenue" field="Annual_Revenue__c" value={lead.Annual_Revenue__c} />
                <EditableField label="Open Balances $" field="Open_Balances__c" value={lead.Open_Balances__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Open Bankruptcies</p>
                  <p className="font-medium text-slate-900">{lead.Open_Bankruptcies__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Judgements/Liens</p>
                  <p className="font-medium text-slate-900">{lead.Judgements_Liens__c ? 'Yes' : 'No'}</p>
                </div>
                <EditableField label="Current Credit Card Processor" field="Current_Credit_Card_Processor__c" value={lead.Current_Credit_Card_Processor__c} />
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="Application Industry" field="Application_Industry__c" value={lead.Application_Industry__c} />
                <EditableField label="Industry" field="Industry" value={lead.Industry} />
                <EditableField label="Entity Type" field="Entity_Type__c" value={lead.Entity_Type__c} />
                <EditableField label="Federal Tax ID" field="Federal_Tax_ID__c" value={lead.Federal_Tax_ID__c} />
                <EditableField label="State of Incorporation" field="State_of_Incorporation__c" value={lead.State_of_Incorporation__c} />
                <EditableField label="Business Start Date" field="Business_Start_Date__c" value={lead.Business_Start_Date__c} type="date" />
                <div>
                  <p className="text-slate-500 text-xs mb-1">Seasonal Business</p>
                  <p className="font-medium text-slate-900">{lead.Seasonal_Business__c ? 'Yes' : 'No'}</p>
                </div>
                <EditableField label="Seasonal Peak Months" field="Seasonal_Peak_Months__c" value={lead.Seasonal_Peak_Months__c} />
                <div>
                  <p className="text-slate-500 text-xs mb-1">E-Commerce</p>
                  <p className="font-medium text-slate-900">{lead.E_Commerce__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Franchise</p>
                  <p className="font-medium text-slate-900">{lead.Franchise__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Home-Based Business</p>
                  <p className="font-medium text-slate-900">{lead.Home_Based_Business__c ? 'Yes' : 'No'}</p>
                </div>
                <EditableField label="Business Location Occupancy" field="Business_Location_Occupancy__c" value={lead.Business_Location_Occupancy__c} />
                <EditableField label="Landlord/Mortgagee Name" field="Landlord_Mortgagee_Name__c" value={lead.Landlord_Mortgagee_Name__c} />
                <EditableField label="Business Location Monthly Payment" field="Business_Location_Monthly_Payment__c" value={lead.Business_Location_Monthly_Payment__c} />
                <EditableField label="Landlord/Mortgagee Phone" field="Landlord_Mortgagee_Phone__c" value={lead.Landlord_Mortgagee_Phone__c} />
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Business References</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <EditableField label="Business Trade Reference 1" field="Business_Trade_Reference_1__c" value={lead.Business_Trade_Reference_1__c} />
                  <EditableField label="Phone" field="Business_Trade_Reference_1_Phone__c" value={lead.Business_Trade_Reference_1_Phone__c} />
                </div>
                <div>
                  <EditableField label="Business Trade Reference 2" field="Business_Trade_Reference_2__c" value={lead.Business_Trade_Reference_2__c} />
                  <EditableField label="Phone" field="Business_Trade_Reference_2_Phone__c" value={lead.Business_Trade_Reference_2_Phone__c} />
                </div>
                <div>
                  <EditableField label="Business Trade Reference 3" field="Business_Trade_Reference_3__c" value={lead.Business_Trade_Reference_3__c} />
                  <EditableField label="Phone" field="Business_Trade_Reference_3_Phone__c" value={lead.Business_Trade_Reference_3_Phone__c} />
                </div>
              </div>
            </div>

            {/* Open Balances */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Lenders & Open Balances</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <EditableField label="Lender Name 1" field="Lender_Name_1__c" value={lead.Lender_Name_1__c} />
                  <EditableField label="Open Balance Amount 1" field="Open_Balance_Amount_1__c" value={lead.Open_Balance_Amount_1__c} />
                </div>
                <div>
                  <EditableField label="Lender Name 2" field="Lender_Name_2__c" value={lead.Lender_Name_2__c} />
                  <EditableField label="Open Balance Amount 2" field="Open_Balance_Amount_2__c" value={lead.Open_Balance_Amount_2__c} />
                </div>
                <div>
                  <EditableField label="Lender Name 3" field="Lender_Name_3__c" value={lead.Lender_Name_3__c} />
                  <EditableField label="Open Balance Amount 3" field="Open_Balance_Amount_3__c" value={lead.Open_Balance_Amount_3__c} />
                </div>
              </div>
            </div>

            {/* Stage Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Stage Tracking</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {lead.Open_Not_Contacted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Open - Not Contacted Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Open_Not_Contacted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Working_Contacted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Working - Contacted Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Working_Contacted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Working_Application_Out_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Working - Application Out Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Working_Application_Out_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Closed_Converted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Closed - Converted Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Closed_Converted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Closed_Not_Converted_Date_time__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Closed - Not Converted Date/Time</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Closed_Not_Converted_Date_time__c).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Marketing Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Marketing Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <EditableField label="UTM Source" field="UTM_Source__c" value={lead.UTM_Source__c} />
                <EditableField label="UTM Content" field="UTM_Content__c" value={lead.UTM_Content__c} />
                <EditableField label="UTM Medium" field="UTM_Medium__c" value={lead.UTM_Medium__c} />
                <EditableField label="UTM Campaign" field="UTM_Campaign__c" value={lead.UTM_Campaign__c} />
                <EditableField label="UTM Term" field="UTM_Term__c" value={lead.UTM_Term__c} />
              </div>
            </div>

            {/* Activity Timeline */}
            <ActivityTimeline
              key={refreshKey}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
              onActivityAdded={() => setRefreshKey(prev => prev + 1)}
            />

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
            {/* Dialpad Widget */}
            <DialpadWidget
              phoneNumber={lead.Phone}
              recordId={lead.Id}
              recordType="Lead"
              session={session}
              onCallCompleted={() => setRefreshKey(prev => prev + 1)}
            />

            {/* System Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-500">Created By</p>
                  <p className="font-medium text-slate-900">{lead.CreatedBy?.Name}</p>
                  <p className="text-slate-500">{new Date(lead.CreatedDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Modified By</p>
                  <p className="font-medium text-slate-900">{lead.LastModifiedBy?.Name}</p>
                  <p className="text-slate-500">{new Date(lead.LastModifiedDate).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}