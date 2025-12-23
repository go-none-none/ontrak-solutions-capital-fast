import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Building2, Edit, Loader2, CheckCircle2 } from 'lucide-react';
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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {lead.Phone && (
                  <a href={`tel:${lead.Phone}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-[#08708E] flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{lead.Phone}</p>
                    </div>
                  </a>
                )}
                {lead.Email && (
                  <a href={`mailto:${lead.Email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-[#08708E] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{lead.Email}</p>
                    </div>
                  </a>
                )}
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

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                {lead.LeadSource && (
                  <div>
                    <p className="text-slate-500">Source</p>
                    <p className="font-medium text-slate-900">{lead.LeadSource}</p>
                  </div>
                )}
                {lead.Title && (
                  <div>
                    <p className="text-slate-500">Title</p>
                    <p className="font-medium text-slate-900">{lead.Title}</p>
                  </div>
                )}
                {lead.Industry && (
                  <div>
                    <p className="text-slate-500">Industry</p>
                    <p className="font-medium text-slate-900">{lead.Industry}</p>
                  </div>
                )}
                {lead.Monthly_Revenue__c && (
                  <div>
                    <p className="text-slate-500">Monthly Revenue</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Monthly_Revenue__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Funding_Amount_Requested__c && (
                  <div>
                    <p className="text-slate-500">Funding Requested</p>
                    <p className="font-medium text-slate-900">${parseFloat(lead.Funding_Amount_Requested__c).toLocaleString()}</p>
                  </div>
                )}
                {lead.Time_in_Business__c && (
                  <div>
                    <p className="text-slate-500">Time in Business</p>
                    <p className="font-medium text-slate-900">{lead.Time_in_Business__c}</p>
                  </div>
                )}
                {lead.Use_of_Funds__c && (
                  <div>
                    <p className="text-slate-500">Use of Funds</p>
                    <p className="font-medium text-slate-900">{lead.Use_of_Funds__c}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Missing Documents */}
            {lead.Status === 'Application Missing Info' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Missing Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={lead.Bank_Statements_Received__c || false}
                      onChange={async (e) => {
                        await base44.functions.invoke('updateSalesforceRecord', {
                          objectType: 'Lead',
                          recordId: lead.Id,
                          data: { Bank_Statements_Received__c: e.target.checked },
                          token: session.token,
                          instanceUrl: session.instanceUrl
                        });
                        loadLead(session);
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">Bank Statements</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={lead.Tax_Returns_Received__c || false}
                      onChange={async (e) => {
                        await base44.functions.invoke('updateSalesforceRecord', {
                          objectType: 'Lead',
                          recordId: lead.Id,
                          data: { Tax_Returns_Received__c: e.target.checked },
                          token: session.token,
                          instanceUrl: session.instanceUrl
                        });
                        loadLead(session);
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">Tax Returns</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={lead.Voided_Check_Received__c || false}
                      onChange={async (e) => {
                        await base44.functions.invoke('updateSalesforceRecord', {
                          objectType: 'Lead',
                          recordId: lead.Id,
                          data: { Voided_Check_Received__c: e.target.checked },
                          token: session.token,
                          instanceUrl: session.instanceUrl
                        });
                        loadLead(session);
                      }}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">Voided Check</label>
                  </div>
                </div>
              </div>
            )}
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