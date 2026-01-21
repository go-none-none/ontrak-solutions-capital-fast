import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Loader2, ChevronDown, CheckCircle2, XCircle, Zap, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../components/context/NotificationContext';

import FileManager from '../components/rep/FileManager.jsx';
import EditableField from '../components/rep/EditableField.jsx';
import CommunicationCard from '../components/rep/CommunicationCard.jsx';
import RepPortalHeader from '../components/rep/RepPortalHeader';
import ActivityPanel from '../components/rep/ActivityPanel';
import NewStatementModal from '../components/opportunity/NewStatementModal';
import ViewStatementModal from '../components/opportunity/ViewStatementModal';
import NewDebtModal from '../components/opportunity/NewDebtModal';
import SubmissionDetailsModal from '../components/opportunity/SubmissionDetailsModal';
import SubmitToLendersModal from '../components/opportunity/SubmitToLendersModal';
import RecordHistoryModal from '../components/rep/RecordHistoryModal';
import NewOfferModal from '../components/opportunity/NewOfferModal';
import NewCommissionModal from '../components/opportunity/NewCommissionModal';
import StatementAnalysisDashboard from '../components/opportunity/StatementAnalysisDashboard';
import StatementPdfViewer from '../components/opportunity/StatementPdfViewer';
import OfferProposalModal from '../components/opportunity/OfferProposalModal';
import CreateLenderModal from '../components/opportunity/CreateLenderModal';

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
  const [stagePicklistValues, setStagePicklistValues] = useState([]);
  const [declineReasonPicklistValues, setDeclineReasonPicklistValues] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [statements, setStatements] = useState([]);
  const [debt, setDebt] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showNewStatement, setShowNewStatement] = useState(false);
  const [viewingStatement, setViewingStatement] = useState(null);
  const [editingStatement, setEditingStatement] = useState(null);
  const [fileToParseStatement, setFileToParseStatement] = useState(null);
  const [showNewDebt, setShowNewDebt] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNewOffer, setShowNewOffer] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showNewCommission, setShowNewCommission] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [previewingStatement, setPreviewingStatement] = useState(null);
  const [fileManagerFiles, setFileManagerFiles] = useState([]);
  const [viewingStatementPdf, setViewingStatementPdf] = useState(null);
  const [statementPdfs, setStatementPdfs] = useState({});
  const [showOfferProposal, setShowOfferProposal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showCreateLender, setShowCreateLender] = useState(false);
  const communicationCardRef = React.useRef(null);

  const openPdfViewer = async (url) => {
    const proxyUrl = `/api/apps/6932157da76cc7fc545d1203/functions/proxyPdf?url=${encodeURIComponent(url)}`;
    window.open(proxyUrl, '_blank');
  };

  const { removeNotification, notifications } = useContext(NotificationContext);

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
    loadPicklistValues(session);
  }, []);

  // Clear notifications for this record on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('id');
    if (oppId && notifications.length > 0) {
      notifications.forEach(notif => {
        if ((notif.recordId === oppId && notif.recordType === 'Opportunity') || (notif.link && notif.link.includes(oppId))) {
          removeNotification(notif.id);
        }
      });
    }
  }, [notifications, removeNotification]);

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
      
      // Load related records
      loadRelatedRecords(sessionData, oppId);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedRecords = async (sessionData, oppId) => {
    setLoadingRelated(true);
    try {
      const [submissionsRes, offersRes, statementsRes, debtRes, commissionsRes] = await Promise.all([
        base44.functions.invoke('getOpportunitySubmissions', {
          opportunityId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getOpportunityOffers', {
          opportunityId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getOpportunityStatements', {
          opportunityId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getOpportunityDebt', {
          opportunityId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getOpportunityCommissions', {
          opportunityId: oppId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);

      setSubmissions(submissionsRes.data.submissions || []);
      setOffers(offersRes.data.offers || []);
      // Sort statements by ending date, oldest first
      const sortedStatements = (statementsRes.data.statements || []).sort((a, b) => {
        const dateA = new Date(a.csbs__Ending_Date__c || 0);
        const dateB = new Date(b.csbs__Ending_Date__c || 0);
        return dateA - dateB;
      });
      setStatements(sortedStatements);
      setDebt(debtRes.data.debt || []);
      setCommissions(commissionsRes.data.commissions || []);
      
      // Load PDF URLs and timestamps from Base44
      if (sortedStatements.length > 0) {
        const pdfRecords = await base44.entities.StatementPdf.list();
        const pdfMap = {};
        const timestampMap = {};
        pdfRecords.forEach(record => {
          pdfMap[record.salesforce_statement_id] = record.pdf_url;
          timestampMap[record.salesforce_statement_id] = record.created_date;
        });
        setStatementPdfs(pdfMap);
        // Store timestamps in statements
        const statementsWithTimestamps = sortedStatements.map(stmt => ({
          ...stmt,
          pdfCreatedDate: timestampMap[stmt.Id]
        }));
        setStatements(statementsWithTimestamps);
      }
    } catch (error) {
      console.error('Load related records error:', error);
    } finally {
      setLoadingRelated(false);
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
    
    // Find the correct "Declined" stage value from picklist
    const declinedStageValue = stagePicklistValues.find(v => 
      v.toLowerCase().includes('declined') || v.toLowerCase().includes('closed')
    ) || 'Closed - Declined';
    
    console.log('Using stage value:', declinedStageValue);
    console.log('Using decline reason:', selectedDeclinedReason);
    
    setUpdatingStatus(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Opportunity',
        recordId: opportunity.Id,
        data: { 
          StageName: declinedStageValue,
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
      console.error('Error details:', error.response?.data);
      alert(`Failed to update status: ${error.response?.data?.details?.[0]?.message || error.message}`);
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

  const loadPicklistValues = async (sessionData) => {
    try {
      const [stageResponse, declineReasonResponse] = await Promise.all([
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'Opportunity',
          fieldName: 'StageName',
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'Opportunity',
          fieldName: 'csbs__Stage_Detail__c',
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);
      
      console.log('Stage picklist values:', stageResponse.data.values);
      console.log('Decline reason picklist values:', declineReasonResponse.data.values);
      
      setStagePicklistValues(stageResponse.data.values || []);
      setDeclineReasonPicklistValues(declineReasonResponse.data.values || []);
    } catch (error) {
      console.error('Load picklist values error:', error);
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

  const handleDeleteRecord = async (objectType, recordId, recordName) => {
    if (!confirm(`Are you sure you want to delete ${recordName}?`)) {
      return;
    }

    setDeletingRecord(recordId);
    try {
      await base44.functions.invoke('deleteSalesforceRecord', {
        objectType,
        recordId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      const urlParams = new URLSearchParams(window.location.search);
      const oppId = urlParams.get('id');
      loadRelatedRecords(session, oppId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete record');
    } finally {
      setDeletingRecord(null);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <RepPortalHeader
        isAdmin={session?.isAdmin || false}
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
        isAdminPortal={window.location.pathname.includes('AdminPipeline') || sessionStorage.getItem('fromAdminPortal') === 'true'}
        session={session}
      />

      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{opportunity.Name}</h1>
                      <p className="text-xs sm:text-sm text-slate-600 truncate">{opportunity.Account?.Name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {session?.isAdmin && (
                        <Button 
                          onClick={() => setShowHistory(true)} 
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          History
                        </Button>
                      )}
                      <Badge className={`${stageColors[opportunity.StageName] || 'bg-slate-100 text-slate-800'} text-xs sm:text-sm whitespace-nowrap`}>
                        {opportunity.StageName}
                      </Badge>
                    </div>
                  </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!opportunity.StageName?.includes('Declined') ? (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Opportunity Stage</h3>
            <div className="flex justify-between items-start mb-3 gap-0.5 sm:gap-1 flex-wrap">
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
                    className={`flex flex-col items-center flex-1 min-w-0 transition-all ${
                      updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all flex-shrink-0 ${
                      isFunded
                        ? 'bg-green-600 text-white shadow-lg'
                        : isActive
                        ? 'bg-orange-600 text-white shadow-lg' 
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}>
                      {isFunded ? (
                        <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5" />
                      ) : idx < currentStageIndex ? (
                        <CheckCircle2 className="w-3 h-3 md:w-5 md:h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-[9px] md:text-xs text-slate-600 mt-1 md:mt-2 text-center leading-tight h-[20px] md:h-[24px] flex items-start justify-center">{stage.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-0.5 md:gap-1 mb-4">
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
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-xs sm:text-sm w-full sm:w-auto"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
                      {declineReasonPicklistValues.length > 0 ? (
                        declineReasonPicklistValues.map(value => (
                          <SelectItem key={value} value={value}>{value}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Credit">Credit</SelectItem>
                          <SelectItem value="NSFs">NSFs</SelectItem>
                          <SelectItem value="Low Revenue">Low Revenue</SelectItem>
                          <SelectItem value="Time In Business">Time In Business</SelectItem>
                          <SelectItem value="Industry">Industry</SelectItem>
                          <SelectItem value="Existing Debt">Existing Debt</SelectItem>
                          <SelectItem value="Customer Declined">Customer Declined</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-6 max-w-full">
          {/* Main Column */}
          <div className="lg:col-span-2 min-w-0 overflow-x-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Mobile Dropdown */}
              <div className="md:hidden">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full bg-white border-2 border-slate-300 shadow-md h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="details">Details</SelectItem>
                    <SelectItem value="submissions">Submissions</SelectItem>
                    <SelectItem value="offers">Offers</SelectItem>
                    <SelectItem value="statements">Statements</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                    <SelectItem value="commissions">Commissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden md:block bg-white p-3 rounded-xl shadow-md border-2 border-slate-300">
                <TabsList className="bg-slate-100 p-1 rounded-lg grid grid-cols-6 gap-1 w-full">
                  <TabsTrigger value="details" className="text-sm px-4 whitespace-nowrap">Details</TabsTrigger>
                  <TabsTrigger value="submissions" className="text-sm px-4 whitespace-nowrap">Submissions</TabsTrigger>
                  <TabsTrigger value="offers" className="text-sm px-4 whitespace-nowrap">Offers</TabsTrigger>
                  <TabsTrigger value="statements" className="text-sm px-4 whitespace-nowrap">Statements</TabsTrigger>
                  <TabsTrigger value="debt" className="text-sm px-4 whitespace-nowrap">Debt</TabsTrigger>
                  <TabsTrigger value="commissions" className="text-sm px-4 whitespace-nowrap">Commissions</TabsTrigger>
                </TabsList>
              </div>

              {/* Submissions Tab */}
              <TabsContent value="submissions" className="space-y-4">
               <div className="flex justify-end gap-2 mb-3">
                 <Button
                   onClick={() => setShowCreateLender(true)}
                   variant="outline"
                   className="text-sm w-full sm:w-auto"
                 >
                   Add Lender
                 </Button>
                 <Button
                   onClick={() => setShowSubmitModal(true)}
                   className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
                 >
                   Submit
                 </Button>
               </div>
                {loadingRelated ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-slate-600">
                    No submissions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map(sub => (
                      <div 
                        key={sub.Id} 
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            <p className="font-semibold text-slate-900">{sub.csbs__Lender__r?.Name || 'Unknown Lender'}</p>
                            <p className="text-xs text-slate-500">{sub.Name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{sub.csbs__Status__c || 'Pending'}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingRecord === sub.Id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord('csbs__Submission__c', sub.Id, sub.Name);
                              }}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {sub.csbs__Type__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Type</p>
                              <p className="font-medium">{sub.csbs__Type__c}</p>
                            </div>
                          )}
                          {sub.csbs__API_Lender_Status__c && (
                            <div>
                              <p className="text-slate-500 text-xs">API Status</p>
                              <p className="font-medium">{sub.csbs__API_Lender_Status__c}</p>
                            </div>
                          )}
                          {(sub.csbs__Min_Term__c || sub.csbs__Max_Term__c) && (
                            <div>
                              <p className="text-slate-500 text-xs">Term Range</p>
                              <p className="font-medium">{sub.csbs__Min_Term__c || 0} - {sub.csbs__Max_Term__c || 0} months</p>
                            </div>
                          )}
                        </div>
                        {sub.csbs__Notes__c && (
                          <p className="text-sm text-slate-600 mt-3 pt-3 border-t">{sub.csbs__Notes__c}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Offers Tab */}
              <TabsContent value="offers" className="space-y-4">
               <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mb-3">
                 <Button
                   onClick={() => setShowOfferProposal(true)}
                   variant="outline"
                   className="text-sm w-full sm:w-auto"
                 >
                   Offer Proposal
                 </Button>
                 <Button
                   onClick={() => setShowNewOffer(true)}
                   className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
                 >
                   + New Offer
                 </Button>
               </div>
                {loadingRelated ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  </div>
                ) : offers.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-slate-600">
                    No offers found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offers.map(offer => (
                      <div 
                        key={offer.Id} 
                        className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${offer.csbs__Selected__c ? 'ring-2 ring-green-500' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setEditingOffer(offer)}
                          >
                            <p className="font-semibold text-slate-900">{offer.csbs__Lender__c || 'Unknown Lender'}</p>
                            <p className="text-xs text-slate-500">{offer.Name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {offer.csbs__Selected__c && <Badge className="bg-green-600">Selected</Badge>}
                            {offer.csbs__Accepted_with_Lender__c && <Badge className="bg-blue-600">Accepted</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingRecord === offer.Id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord('csbs__Offer__c', offer.Id, offer.Name);
                              }}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Funded</p>
                            <p className="font-bold text-orange-600">{formatCurrency(offer.csbs__Funded__c)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Payment</p>
                            <p className="font-medium">{formatCurrency(offer.csbs__Payment_Amount__c)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Term</p>
                            <p className="font-medium">{offer.csbs__Term__c} mo</p>
                          </div>
                          {offer.csbs__Factor_Rate__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Factor</p>
                              <p className="font-medium">{offer.csbs__Factor_Rate__c}</p>
                            </div>
                          )}
                          {offer.csbs__Product__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Product</p>
                              <p className="font-medium">{offer.csbs__Product__c}</p>
                            </div>
                          )}
                          {offer.csbs__Payment_Frequency__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Frequency</p>
                              <p className="font-medium">{offer.csbs__Payment_Frequency__c}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Statements Tab */}
              <TabsContent value="statements" className="space-y-4">
               <div className="flex justify-end mb-3">
                 <Button
                   onClick={() => setShowNewStatement(true)}
                   className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
                 >
                   + New Statement
                 </Button>
               </div>
                {loadingRelated ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  </div>
                ) : statements.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-slate-600">
                    No statements found
                  </div>
                ) : (
                  <div className="space-y-6">
                    <StatementAnalysisDashboard statements={statements} />
                    <div className="space-y-3">
                    {statements.map(stmt => (
                      <div 
                        key={stmt.Id} 
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setViewingStatement(stmt)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                           <p className="font-semibold text-slate-900">{stmt.csbs__Bank_Name__c || 'Unknown Bank'}</p>
                           <div className="flex items-center gap-2 mt-1">
                             <p className="text-xs text-slate-500">{stmt.csbs__Account_No__c}</p>
                             <p className="text-xs text-slate-400">•</p>
                             <p className="text-xs text-slate-400">{stmt.pdfCreatedDate ? formatDateTime(stmt.pdfCreatedDate) : formatDateTime(stmt.created_date)}</p>
                           </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                             {statementPdfs[stmt.Id] && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => openPdfViewer(statementPdfs[stmt.Id])}
                                 className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                 title="View PDF"
                               >
                                 <Eye className="w-4 h-4" />
                               </Button>
                             )}
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setPreviewingStatement(stmt)}
                               className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                               title="View parsed data"
                             >
                               <Zap className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setEditingStatement(stmt)}
                               className="h-8 px-2"
                             >
                               Edit
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               disabled={deletingRecord === stmt.Id}
                               onClick={() => handleDeleteRecord('csbs__Statement__c', stmt.Id, stmt.Name)}
                               className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                             >
                               Delete
                             </Button>
                             {stmt.csbs__Reconciled__c && <Badge className="bg-green-600">Reconciled</Badge>}
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Period</p>
                            <p className="font-medium text-xs sm:text-sm">{formatDate(stmt.csbs__Starting_Date__c)} - {formatDate(stmt.csbs__Ending_Date__c)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Avg Daily Balance</p>
                            <p className="font-medium">{formatCurrency(stmt.csbs__Average_Daily_Balance__c)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Deposits</p>
                            <p className="font-medium">{formatCurrency(stmt.csbs__Deposit_Amount__c)} ({stmt.csbs__Deposit_Count__c})</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">NSFs</p>
                            <p className="font-medium text-red-600">{stmt.csbs__NSFs__c || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                    </div>
                    )}
                    </TabsContent>

                    {/* Debt Tab */}
              <TabsContent value="debt" className="space-y-4">
               <div className="flex justify-end mb-3">
                 <Button
                   onClick={() => setShowNewDebt(true)}
                   className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
                 >
                   + New Debt
                 </Button>
               </div>
                {loadingRelated ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  </div>
                ) : debt.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-slate-600">
                    No debt records found
                  </div>
                ) : (
                   <div className="space-y-3">
                     {debt.map(d => (
                       <div 
                         key={d.Id} 
                         className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => setEditingDebt(d)}
                       >
                         <div className="flex items-start justify-between mb-3">
                           <div 
                             className="flex-1 cursor-pointer"
                             onClick={() => setEditingDebt(d)}
                           >
                             <p className="font-semibold text-slate-900">{d.csbs__Lender__c || d.csbs__Creditor__r?.Name || 'Unknown'}</p>
                             <p className="text-xs text-slate-500">{d.Name}</p>
                           </div>
                           <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                             {d.csbs__Open_Position__c && <Badge className="bg-orange-600">Open</Badge>}
                             <Button
                               variant="ghost"
                               size="sm"
                               disabled={deletingRecord === d.Id}
                               onClick={() => handleDeleteRecord('csbs__Debt__c', d.Id, d.Name)}
                               className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                             >
                               Delete
                             </Button>
                           </div>
                         </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Balance</p>
                            <p className="font-bold text-slate-900">{formatCurrency(d.csbs__Balance__c)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Payment</p>
                            <p className="font-medium">{formatCurrency(d.csbs__Payment__c)} {d.csbs__Frequency__c ? `(${d.csbs__Frequency__c})` : ''}</p>
                          </div>
                          {d.csbs__Type__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Type</p>
                              <p className="font-medium">{d.csbs__Type__c}</p>
                            </div>
                          )}
                          {d.csbs__Estimated_Monthly_MCA_Amount__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Est. Monthly MCA</p>
                              <p className="font-medium">{formatCurrency(d.csbs__Estimated_Monthly_MCA_Amount__c)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Commissions Tab */}
              <TabsContent value="commissions" className="space-y-4">
               <div className="flex justify-end mb-3">
                 <Button
                   onClick={() => setShowNewCommission(true)}
                   className="bg-orange-600 hover:bg-orange-700 text-sm w-full sm:w-auto"
                 >
                   + New Commission
                 </Button>
               </div>
                {loadingRelated ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  </div>
                ) : commissions.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-slate-600">
                    No commissions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commissions.map(comm => (
                      <div 
                        key={comm.Id} 
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setEditingCommission(comm)}
                          >
                            <p className="font-semibold text-slate-900">{comm.csbs__Account__r?.Name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{comm.Name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{comm.csbs__Status__c || 'Pending'}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingRecord === comm.Id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRecord('csbs__Commission__c', comm.Id, comm.Name);
                              }}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Amount</p>
                            <p className="font-bold text-green-600">{formatCurrency(comm.csbs__Amount__c)}</p>
                          </div>
                          {comm.csbs__Type__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Type</p>
                              <p className="font-medium">{comm.csbs__Type__c}</p>
                            </div>
                          )}
                          {comm.csbs__Date_Due__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Date Due</p>
                              <p className="font-medium">{formatDate(comm.csbs__Date_Due__c)}</p>
                            </div>
                          )}
                          {comm.csbs__Date_Paid__c && (
                            <div>
                              <p className="text-slate-500 text-xs">Date Paid</p>
                              <p className="font-medium text-green-600">{formatDate(comm.csbs__Date_Paid__c)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

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
                  statements={statements}
                  onFileUploaded={() => setRefreshKey(prev => prev + 1)}
                  onParseFile={(file) => {
                    setFileToParseStatement(file);
                    setShowNewStatement(true);
                  }}
                  onFilesLoaded={(files) => setFileManagerFiles(files)}
                />
              </TabsContent>


            </Tabs>
          </div>

          {/* Sidebar */}
           <div className="space-y-6">
            {/* Key Info & Contact Information Combined */}
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
                {contactRoles.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Contacts</h4>
                    <div className="space-y-3">
                      {contactRoles.map(role => (
                        <div key={role.Id} className="border-b border-slate-100 pb-3 last:border-0">
                          <button
                            onClick={() => navigate(createPageUrl('ContactDetail') + `?id=${role.ContactId}`)}
                            className="font-medium text-orange-600 hover:underline text-left"
                          >
                            {role.Contact?.Name}
                          </button>
                          {role.Role && <p className="text-xs text-slate-500 mb-2">{role.Role}</p>}
                          {role.Contact?.Email && (
                            <button 
                              onClick={() => communicationCardRef.current?.scrollIntoView({ behavior: 'smooth' })}
                              className="text-sm text-orange-600 hover:underline block text-left"
                            >
                              {role.Contact.Email}
                            </button>
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
              </div>
            </div>

            {/* Communication Card - Email & SMS */}
            <div ref={communicationCardRef}>
              <CommunicationCard
                recipientEmail={contactRoles[0]?.Contact?.Email || opportunity.Account?.Email__c}
                recipientName={contactRoles[0]?.Contact?.Name || opportunity.Account?.Name}
                phoneNumber={contactRoles[0]?.Contact?.MobilePhone || contactRoles[0]?.Contact?.Phone}
                recordId={opportunity.Id}
                recordType="Opportunity"
                session={session}
                smsColor="bg-orange-600"
                firstName={contactRoles[0]?.Contact?.FirstName || opportunity.Account?.Name?.split(' ')[0]}
              />
            </div>

              {/* Activity Timeline */}
              <ActivityPanel
              recordId={opportunity.Id}
              recordType="Opportunity"
              session={session}
              />


              </div>
        </div>
      </div>

      {/* New Statement Modal */}
      <NewStatementModal
        isOpen={showNewStatement}
        onClose={() => {
          setShowNewStatement(false);
          setFileToParseStatement(null);
        }}
        opportunityId={opportunity.Id}
        session={session}
        fileToProcess={fileToParseStatement}
        availableFiles={fileManagerFiles}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
          setFileToParseStatement(null);
        }}
      />

      {/* View Statement Modal */}
      <ViewStatementModal
        isOpen={!!viewingStatement}
        onClose={() => setViewingStatement(null)}
        statement={viewingStatement}
      />

      {/* Statement Data Preview Modal */}
      {previewingStatement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Parsed Data Preview</h3>
              <button
                onClick={() => setPreviewingStatement(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Bank Name</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Bank_Name__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Account No</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Account_No__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Account Title</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Account_Title__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Company</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Company__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Starting Date</p>
                  <p className="text-slate-900">{formatDate(previewingStatement.csbs__Starting_Date__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Ending Date</p>
                  <p className="text-slate-900">{formatDate(previewingStatement.csbs__Ending_Date__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Starting Balance</p>
                  <p className="text-slate-900">{formatCurrency(previewingStatement.csbs__Starting_Balance__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Ending Balance</p>
                  <p className="text-slate-900">{formatCurrency(previewingStatement.csbs__Ending_Balance__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Avg Daily Balance</p>
                  <p className="text-slate-900">{formatCurrency(previewingStatement.csbs__Average_Daily_Balance__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Deposit Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Deposit_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Deposit Amount</p>
                  <p className="text-slate-900">{formatCurrency(previewingStatement.csbs__Deposit_Amount__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Withdrawals Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Withdrawals_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Total Withdrawals</p>
                  <p className="text-slate-900">{formatCurrency(previewingStatement.csbs__Total_Withdrawals__c) || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Transactions Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Transactions_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">NSFs</p>
                  <p className="text-slate-900">{previewingStatement.csbs__NSFs__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Negative Days</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Negative_Days__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Fraud Score</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Fraud_Score__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Reconciled</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Reconciled__c ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setPreviewingStatement(null)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Statement Modal */}
      <NewStatementModal
        isOpen={!!editingStatement}
        onClose={() => setEditingStatement(null)}
        opportunityId={opportunity.Id}
        session={session}
        statement={editingStatement}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
          setEditingStatement(null);
        }}
      />

      {/* New Debt Modal */}
      <NewDebtModal
        isOpen={showNewDebt}
        onClose={() => setShowNewDebt(false)}
        opportunityId={opportunity.Id}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Edit Debt Modal */}
      <NewDebtModal
        isOpen={!!editingDebt}
        onClose={() => setEditingDebt(null)}
        opportunityId={opportunity.Id}
        session={session}
        debt={editingDebt}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
          setEditingDebt(null);
        }}
      />

      {/* Submission Details Modal */}
      <SubmissionDetailsModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Submit to Lenders Modal */}
      <SubmitToLendersModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        opportunity={opportunity}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Record History Modal */}
      <RecordHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        recordId={opportunity?.Id}
        session={session}
      />

      {/* New Offer Modal */}
      <NewOfferModal
        isOpen={showNewOffer}
        onClose={() => setShowNewOffer(false)}
        opportunityId={opportunity.Id}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Edit Offer Modal */}
      <NewOfferModal
        isOpen={!!editingOffer}
        onClose={() => setEditingOffer(null)}
        opportunityId={opportunity.Id}
        session={session}
        offer={editingOffer}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
          setEditingOffer(null);
        }}
      />

      {/* New Commission Modal */}
      <NewCommissionModal
        isOpen={showNewCommission}
        onClose={() => setShowNewCommission(false)}
        opportunityId={opportunity.Id}
        accountId={opportunity.AccountId}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Edit Commission Modal */}
      <NewCommissionModal
        isOpen={!!editingCommission}
        onClose={() => setEditingCommission(null)}
        opportunityId={opportunity.Id}
        accountId={opportunity.AccountId}
        session={session}
        commission={editingCommission}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
          setEditingCommission(null);
        }}
      />

      {/* Statement PDF Viewer */}
      <StatementPdfViewer
        statement={viewingStatementPdf}
        session={session}
        isOpen={!!viewingStatementPdf}
        onClose={() => setViewingStatementPdf(null)}
      />

      {/* Offer Proposal Modal */}
      <OfferProposalModal
        isOpen={showOfferProposal}
        onClose={() => setShowOfferProposal(false)}
        offers={offers}
        contactEmail={contactRoles[0]?.Contact?.Email || opportunity.Account?.Email__c}
        opportunity={opportunity}
        session={session}
        onSuccess={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const oppId = urlParams.get('id');
          loadRelatedRecords(session, oppId);
        }}
      />

      {/* Create Lender Modal */}
      <CreateLenderModal
        isOpen={showCreateLender}
        onClose={() => setShowCreateLender(false)}
        session={session}
        onSuccess={() => {
          setShowCreateLender(false);
        }}
      />

      </div>
      );
      }