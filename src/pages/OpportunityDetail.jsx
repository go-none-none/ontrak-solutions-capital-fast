import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Calendar, Edit, Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import ActivityTimeline from '../components/rep/ActivityTimeline';
import FileManager from '../components/rep/FileManager';
import DialpadWidget from '../components/rep/DialpadWidget';
import EditOpportunityModal from '../components/rep/EditOpportunityModal';

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
    'Closed - Declined': 'bg-red-100 text-red-800'
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h2>
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

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                {opportunity.Type && (
                  <div>
                    <p className="text-slate-500">Type</p>
                    <p className="font-medium text-slate-900">{opportunity.Type}</p>
                  </div>
                )}
                {opportunity.LeadSource && (
                  <div>
                    <p className="text-slate-500">Lead Source</p>
                    <p className="font-medium text-slate-900">{opportunity.LeadSource}</p>
                  </div>
                )}
                {opportunity.NextStep && (
                  <div>
                    <p className="text-slate-500">Next Step</p>
                    <p className="font-medium text-slate-900">{opportunity.NextStep}</p>
                  </div>
                )}
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