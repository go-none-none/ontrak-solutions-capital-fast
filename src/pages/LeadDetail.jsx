import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Building2, Edit, Loader2, CheckCircle2, User, DollarSign, FileText, Calendar, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline.jsx';
import FileManager from '../components/rep/FileManager.jsx';
import DialpadWidget from '../components/rep/DialpadWidget.jsx';
import EditLeadModal from '../components/rep/EditLeadModal.jsx';

export default function LeadDetail() {
  const [session, setSession] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
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

  const handleUpdate = async (updates) => {
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        recordId: lead.Id,
        recordType: 'Lead',
        updates,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      await loadLead(session);
      setEditMode(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update lead');
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

  const handleDocCheckbox = async (field, value) => {
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Lead',
        recordId: lead.Id,
        data: { [field]: value },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      await loadLead(session);
    } catch (error) {
      console.error('Checkbox update error:', error);
    }
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
            <Button onClick={() => setEditMode(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
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

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#08708E]" />
                Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {lead.Phone && (
                  <div>
                    <p className="text-slate-500 mb-1">Phone</p>
                    <a href={`tel:${lead.Phone}`} className="font-medium text-[#08708E] hover:underline">{lead.Phone}</a>
                  </div>
                )}
                {lead.MobilePhone && (
                  <div>
                    <p className="text-slate-500 mb-1">Mobile</p>
                    <a href={`tel:${lead.MobilePhone}`} className="font-medium text-[#08708E] hover:underline">{lead.MobilePhone}</a>
                  </div>
                )}
                {lead.Email && (
                  <div>
                    <p className="text-slate-500 mb-1">Email</p>
                    <a href={`mailto:${lead.Email}`} className="font-medium text-[#08708E] hover:underline">{lead.Email}</a>
                  </div>
                )}
                {lead.Website && (
                  <div>
                    <p className="text-slate-500 mb-1">Website</p>
                    <a href={lead.Website} target="_blank" rel="noopener noreferrer" className="font-medium text-[#08708E] hover:underline">{lead.Website}</a>
                  </div>
                )}
                {lead.Fax && (
                  <div>
                    <p className="text-slate-500 mb-1">Fax</p>
                    <p className="font-medium text-slate-900">{lead.Fax}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner 1 Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#08708E]" />
                Owner Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Name</p>
                  <p className="font-medium text-slate-900">{lead.Name}</p>
                </div>
                {lead.Title && (
                  <div>
                    <p className="text-slate-500 mb-1">Title</p>
                    <p className="font-medium text-slate-900">{lead.Title}</p>
                  </div>
                )}
                {lead.Birthdate__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Birthdate</p>
                    <p className="font-medium text-slate-900">{lead.Birthdate__c}</p>
                  </div>
                )}
                {lead.Social_Security_Number__c && (
                  <div>
                    <p className="text-slate-500 mb-1">SSN</p>
                    <p className="font-medium text-slate-900">***-**-{lead.Social_Security_Number__c.slice(-4)}</p>
                  </div>
                )}
                {lead.Ownership__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Ownership %</p>
                    <p className="font-medium text-slate-900">{lead.Ownership__c}%</p>
                  </div>
                )}
                {lead.Credit_Score__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Credit Score</p>
                    <p className="font-medium text-slate-900">{lead.Credit_Score__c}</p>
                  </div>
                )}
                {lead.Home_Address_Street__c && (
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-1">Home Address</p>
                    <p className="font-medium text-slate-900">
                      {lead.Home_Address_Street__c}
                      {lead.Home_Address_City__c && `, ${lead.Home_Address_City__c}`}
                      {lead.Home_Address_State__c && `, ${lead.Home_Address_State__c}`}
                      {lead.Home_Address_Zip_Code__c && ` ${lead.Home_Address_Zip_Code__c}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner 2 Information */}
            {lead.Owner_2_First_Name__c && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#08708E]" />
                  Owner 2 Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Name</p>
                    <p className="font-medium text-slate-900">{lead.Owner_2_First_Name__c} {lead.Owner_2_Last_Name__c}</p>
                  </div>
                  {lead.Owner_2_Title__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Title</p>
                      <p className="font-medium text-slate-900">{lead.Owner_2_Title__c}</p>
                    </div>
                  )}
                  {lead.Owner_2_Birthday__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Birthday</p>
                      <p className="font-medium text-slate-900">{lead.Owner_2_Birthday__c}</p>
                    </div>
                  )}
                  {lead.Owner_2_Social_Security_Number__c && (
                    <div>
                      <p className="text-slate-500 mb-1">SSN</p>
                      <p className="font-medium text-slate-900">***-**-{lead.Owner_2_Social_Security_Number__c.slice(-4)}</p>
                    </div>
                  )}
                  {lead.Owner_2_Ownership__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Ownership %</p>
                      <p className="font-medium text-slate-900">{lead.Owner_2_Ownership__c}%</p>
                    </div>
                  )}
                  {lead.Owner_2_Credit_Score__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Credit Score</p>
                      <p className="font-medium text-slate-900">{lead.Owner_2_Credit_Score__c}</p>
                    </div>
                  )}
                  {lead.Owner_2_Mobile__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Mobile</p>
                      <a href={`tel:${lead.Owner_2_Mobile__c}`} className="font-medium text-[#08708E] hover:underline">{lead.Owner_2_Mobile__c}</a>
                    </div>
                  )}
                  {lead.Owner_2_Email__c && (
                    <div>
                      <p className="text-slate-500 mb-1">Email</p>
                      <a href={`mailto:${lead.Owner_2_Email__c}`} className="font-medium text-[#08708E] hover:underline">{lead.Owner_2_Email__c}</a>
                    </div>
                  )}
                  {lead.Owner_2_Home_Address_Street__c && (
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">Home Address</p>
                      <p className="font-medium text-slate-900">
                        {lead.Owner_2_Home_Address_Street__c}
                        {lead.Owner_2_Home_Address_City__c && `, ${lead.Owner_2_Home_Address_City__c}`}
                        {lead.Owner_2_Home_Address_State__c && `, ${lead.Owner_2_Home_Address_State__c}`}
                        {lead.Owner_2_Home_Address_Zip_Code__c && ` ${lead.Owner_2_Home_Address_Zip_Code__c}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#08708E]" />
                Business Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Company</p>
                  <p className="font-medium text-slate-900">{lead.Company}</p>
                </div>
                {lead.DBA__c && (
                  <div>
                    <p className="text-slate-500 mb-1">DBA</p>
                    <p className="font-medium text-slate-900">{lead.DBA__c}</p>
                  </div>
                )}
                {lead.Industry && (
                  <div>
                    <p className="text-slate-500 mb-1">Industry</p>
                    <p className="font-medium text-slate-900">{lead.Industry}</p>
                  </div>
                )}
                {lead.Entity_Type__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Entity Type</p>
                    <p className="font-medium text-slate-900">{lead.Entity_Type__c}</p>
                  </div>
                )}
                {lead.Federal_Tax_ID__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Federal Tax ID</p>
                    <p className="font-medium text-slate-900">{lead.Federal_Tax_ID__c}</p>
                  </div>
                )}
                {lead.State_of_Incorporation__c && (
                  <div>
                    <p className="text-slate-500 mb-1">State of Incorporation</p>
                    <p className="font-medium text-slate-900">{lead.State_of_Incorporation__c}</p>
                  </div>
                )}
                {lead.Business_Start_Date__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Business Start Date</p>
                    <p className="font-medium text-slate-900">{lead.Business_Start_Date__c}</p>
                  </div>
                )}
                {lead.Street && (
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-1">Business Address</p>
                    <p className="font-medium text-slate-900">
                      {lead.Street}
                      {lead.City && `, ${lead.City}`}
                      {lead.State && `, ${lead.State}`}
                      {lead.PostalCode && ` ${lead.PostalCode}`}
                    </p>
                  </div>
                )}
                {lead.Business_Location_Occupancy__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Location Occupancy</p>
                    <p className="font-medium text-slate-900">{lead.Business_Location_Occupancy__c}</p>
                  </div>
                )}
                {lead.Business_Location_Monthly_Payment__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Monthly Payment</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Business_Location_Monthly_Payment__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Landlord_Mortgagee_Name__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Landlord/Mortgagee</p>
                    <p className="font-medium text-slate-900">{lead.Landlord_Mortgagee_Name__c}</p>
                  </div>
                )}
                {lead.Landlord_Mortgagee_Phone__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Landlord Phone</p>
                    <p className="font-medium text-slate-900">{lead.Landlord_Mortgagee_Phone__c}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Seasonal Business</p>
                  <p className="font-medium text-slate-900">{lead.Seasonal_Business__c ? 'Yes' : 'No'}</p>
                </div>
                {lead.Seasonal_Peak_Months__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Peak Months</p>
                    <p className="font-medium text-slate-900">{lead.Seasonal_Peak_Months__c}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">E-Commerce</p>
                  <p className="font-medium text-slate-900">{lead.E_Commerce__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Franchise</p>
                  <p className="font-medium text-slate-900">{lead.Franchise__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Home-Based</p>
                  <p className="font-medium text-slate-900">{lead.Home_Based_Business__c ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#08708E]" />
                Financial Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {lead.Amount_Requested__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Amount Requested</p>
                    <p className="font-semibold text-[#08708E] text-lg">${parseFloat(lead.Amount_Requested__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Use_of_Proceeds__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Use of Proceeds</p>
                    <p className="font-medium text-slate-900">{lead.Use_of_Proceeds__c}</p>
                  </div>
                )}
                {lead.Estimated_Monthly_Revenue__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Monthly Revenue</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Estimated_Monthly_Revenue__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Annual_Revenue__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Annual Revenue</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Annual_Revenue__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Open_Balances__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Open Balances</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Open_Balances__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Current_Credit_Card_Processor__c && (
                  <div>
                    <p className="text-slate-500 mb-1">Credit Card Processor</p>
                    <p className="font-medium text-slate-900">{lead.Current_Credit_Card_Processor__c}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Open Bankruptcies</p>
                  <p className="font-medium text-slate-900">{lead.Open_Bankruptcies__c ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Judgements/Liens</p>
                  <p className="font-medium text-slate-900">{lead.Judgements_Liens__c ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* References & Lenders */}
            {(lead.Business_Trade_Reference_1__c || lead.Lender_Name_1__c) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#08708E]" />
                  References & Lenders
                </h2>
                <div className="space-y-4">
                  {lead.Business_Trade_Reference_1__c && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Trade References</p>
                      <div className="grid sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{lead.Business_Trade_Reference_1__c}</p>
                          {lead.Business_Trade_Reference_1_Phone__c && (
                            <p className="text-slate-600 text-xs">{lead.Business_Trade_Reference_1_Phone__c}</p>
                          )}
                        </div>
                        {lead.Business_Trade_Reference_2__c && (
                          <div>
                            <p className="font-medium text-slate-900">{lead.Business_Trade_Reference_2__c}</p>
                            {lead.Business_Trade_Reference_2_Phone__c && (
                              <p className="text-slate-600 text-xs">{lead.Business_Trade_Reference_2_Phone__c}</p>
                            )}
                          </div>
                        )}
                        {lead.Business_Trade_Reference_3__c && (
                          <div>
                            <p className="font-medium text-slate-900">{lead.Business_Trade_Reference_3__c}</p>
                            {lead.Business_Trade_Reference_3_Phone__c && (
                              <p className="text-slate-600 text-xs">{lead.Business_Trade_Reference_3_Phone__c}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {lead.Lender_Name_1__c && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Existing Lenders</p>
                      <div className="grid sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{lead.Lender_Name_1__c}</p>
                          {lead.Open_Balance_Amount_1__c && (
                            <p className="text-slate-600 text-xs">${parseFloat(lead.Open_Balance_Amount_1__c).toLocaleString()}</p>
                          )}
                        </div>
                        {lead.Lender_Name_2__c && (
                          <div>
                            <p className="font-medium text-slate-900">{lead.Lender_Name_2__c}</p>
                            {lead.Open_Balance_Amount_2__c && (
                              <p className="text-slate-600 text-xs">${parseFloat(lead.Open_Balance_Amount_2__c).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                        {lead.Lender_Name_3__c && (
                          <div>
                            <p className="font-medium text-slate-900">{lead.Lender_Name_3__c}</p>
                            {lead.Open_Balance_Amount_3__c && (
                              <p className="text-slate-600 text-xs">${parseFloat(lead.Open_Balance_Amount_3__c).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Document Tracking - Only for Missing Info status */}
            {lead.Status === 'Application Missing Info' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-amber-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Missing Documents
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <label className="text-sm text-slate-700 font-medium">Bank Statements</label>
                    <input
                      type="checkbox"
                      checked={lead.Bank_Statements_Received__c || false}
                      onChange={(e) => handleDocCheckbox('Bank_Statements_Received__c', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <label className="text-sm text-slate-700 font-medium">Tax Returns</label>
                    <input
                      type="checkbox"
                      checked={lead.Tax_Returns_Received__c || false}
                      onChange={(e) => handleDocCheckbox('Tax_Returns_Received__c', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <label className="text-sm text-slate-700 font-medium">Voided Check</label>
                    <input
                      type="checkbox"
                      checked={lead.Voided_Check_Received__c || false}
                      onChange={(e) => handleDocCheckbox('Voided_Check_Received__c', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <label className="text-sm text-slate-700 font-medium">Driver's License</label>
                    <input
                      type="checkbox"
                      checked={lead.Drivers_License_Received__c || false}
                      onChange={(e) => handleDocCheckbox('Drivers_License_Received__c', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Received (always visible) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Documents Received</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Bank Statements</span>
                  {lead.Bank_Statements_Received__c ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-slate-400 text-xs">Not received</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tax Returns</span>
                  {lead.Tax_Returns_Received__c ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-slate-400 text-xs">Not received</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Voided Check</span>
                  {lead.Voided_Check_Received__c ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-slate-400 text-xs">Not received</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Driver's License</span>
                  {lead.Drivers_License_Received__c ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-slate-400 text-xs">Not received</span>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#08708E]" />
                Timeline
              </h3>
              <div className="space-y-3 text-xs">
                {lead.Open_Not_Contacted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Open - Not Contacted</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Open_Not_Contacted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Working_Contacted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Working - Contacted</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Working_Contacted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Working_Application_Out_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Application Out</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Working_Application_Out_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Closed_Converted_Date_Time__c && (
                  <div>
                    <p className="text-slate-500">Converted</p>
                    <p className="font-medium text-slate-900">{new Date(lead.Closed_Converted_Date_Time__c).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Additional Info</h3>
              <div className="space-y-3 text-sm">
                {lead.LeadSource && (
                  <div>
                    <p className="text-slate-500">Lead Source</p>
                    <p className="font-medium text-slate-900">{lead.LeadSource}</p>
                  </div>
                )}
                {lead.Type__c && (
                  <div>
                    <p className="text-slate-500">Type</p>
                    <p className="font-medium text-slate-900">{lead.Type__c}</p>
                  </div>
                )}
                {lead.Call_Disposition__c && (
                  <div>
                    <p className="text-slate-500">Call Disposition</p>
                    <p className="font-medium text-slate-900">{lead.Call_Disposition__c}</p>
                  </div>
                )}
                {lead.Status_Detail__c && (
                  <div>
                    <p className="text-slate-500">Status Detail</p>
                    <p className="font-medium text-slate-900">{lead.Status_Detail__c}</p>
                  </div>
                )}
                {lead.Description && (
                  <div>
                    <p className="text-slate-500">Description</p>
                    <p className="font-medium text-slate-900">{lead.Description}</p>
                  </div>
                )}
                {lead.UTM_Source__c && (
                  <div>
                    <p className="text-slate-500">UTM Source</p>
                    <p className="font-medium text-slate-900">{lead.UTM_Source__c}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <EditLeadModal
          lead={lead}
          onSave={handleUpdate}
          onClose={() => setEditMode(false)}
        />
      )}
    </div>
  );
}