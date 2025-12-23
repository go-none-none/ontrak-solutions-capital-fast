import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Building2, Edit, Save, X, Loader2 } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState(0);

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

  const statusColors = {
    'Open - Not Contacted': 'bg-blue-100 text-blue-800',
    'Working - Contacted': 'bg-yellow-100 text-yellow-800',
    'Working - Application Out': 'bg-purple-100 text-purple-800',
    'Application Missing Info': 'bg-orange-100 text-orange-800',
    'Converted': 'bg-green-100 text-green-800',
    'Closed - Not Converted': 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
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
            <div className="flex items-center gap-3">
              <Badge className={statusColors[lead.Status] || 'bg-slate-100 text-slate-800'}>
                {lead.Status}
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