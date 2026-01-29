import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Calendar, 
  FileText, 
  Upload, 
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusTracker from '../components/status/StatusTracker';
import FileUploadSection from '../components/status/FileUploadSection';
import { createPageUrl } from '@/utils';

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const recordId = urlParams.get('rid');
        
        if (!recordId) {
          setLoading(false);
          return;
        }

        const response = await base44.functions.invoke('getSalesforceStatus', { recordId });
        
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setData(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    // Handle form when no record ID
    if (!data && isFlipped) {
      setTimeout(() => {
        const container = document.getElementById('jotform-container-norecord');
        if (container) {
          let iframeSrc = 'https://form.jotform.com/252957146872065';
          
          container.innerHTML = `
            <iframe
              id="JotFormIFrame-norecord"
              title="Application Form"
              allowtransparency="true"
              allow="geolocation; microphone; camera; fullscreen"
              src="${iframeSrc}"
              frameborder="0"
              style="min-width:100%;max-width:100%;height:539px;border:none;"
              scrolling="no"
            >
            </iframe>
          `;
          
          const script = document.createElement('script');
          script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
          script.onload = () => {
            if (window.jotformEmbedHandler) {
              window.jotformEmbedHandler("iframe[id='JotFormIFrame-norecord']", "https://form.jotform.com/");
            }
          };
          document.body.appendChild(script);
        }
      }, 100);
      return;
    }

    const status = data ? (data.recordType === 'Lead' ? data.status : data.stageName)?.toLowerCase() : '';
    const showApplicationForm = status === 'working - contacted' || status === 'working - application out';
    
    if (showApplicationForm && data) {
      const urlParams = new URLSearchParams(window.location.search);
      const repId = urlParams.get('repId') || data.ownerAlias;
      const recordId = urlParams.get('rid') || data.id;
      
      let iframeSrc = 'https://form.jotform.com/252957146872065';
      const params = [];
      if (repId) params.push(`rep=${encodeURIComponent(repId)}`);
      if (recordId) params.push(`rid=${encodeURIComponent(recordId)}`);
      if (data.businessName) params.push(`input_7=${encodeURIComponent(data.businessName)}`);
      if (data.firstName) params.push(`first_21=${encodeURIComponent(data.firstName)}`);
      if (data.lastName) params.push(`last_21=${encodeURIComponent(data.lastName)}`);
      if (data.phone) params.push(`input_14_full=${encodeURIComponent(data.phone)}`);
      if (data.email) params.push(`input_15=${encodeURIComponent(data.email)}`);
      
      if (params.length > 0) {
        iframeSrc += `?${params.join('&')}`;
      }
      
      const container = document.getElementById('jotform-container');
      if (container) {
        container.innerHTML = `
          <iframe
            id="JotFormIFrame-252957146872065"
            title="Application Form"
            allowtransparency="true"
            allow="geolocation; microphone; camera; fullscreen"
            src="${iframeSrc}"
            frameborder="0"
            style="min-width:100%;max-width:100%;height:539px;border:none;"
            scrolling="no"
          >
          </iframe>
        `;
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
        script.onload = () => {
          if (window.jotformEmbedHandler) {
            window.jotformEmbedHandler("iframe[id='JotFormIFrame-252957146872065']", "https://form.jotform.com/");
          }
        };
        document.body.appendChild(script);
        
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    }
  }, [data, isFlipped]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#08708E] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your application status...</p>
        </div>
      </div>
    );
  }

  // No record ID provided - show flip card
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <section className="relative h-[300px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Application Status
              </h1>
              <p className="text-white/70">
                Track your funding application in real-time
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 -mt-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{ perspective: '1000px' }}>
            <motion.div
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              style={{ 
                transformStyle: 'preserve-3d',
                position: 'relative',
                width: '100%'
              }}
            >
              {/* Front - No Application Found */}
              <motion.div
                style={{
                  backfaceVisibility: 'hidden',
                  position: isFlipped ? 'absolute' : 'relative',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
                className="bg-white rounded-3xl shadow-xl p-8 text-center"
              >
                <FileText className="w-16 h-16 text-[#08708E] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-3">No Application Found</h2>
                <p className="text-slate-600 mb-6">
                  We don't have a record for you yet. Start your funding application today and track it here!
                </p>
                <Button 
                  onClick={() => setIsFlipped(true)}
                  className="bg-[#08708E] hover:bg-[#065a72] px-8 py-6 text-lg"
                >
                  Start Your Application
                </Button>
              </motion.div>

              {/* Back - Application Form */}
              <motion.div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  position: !isFlipped ? 'absolute' : 'relative',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
                className="bg-white rounded-3xl shadow-xl p-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Complete Your Application</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsFlipped(false)}
                  >
                    Back
                  </Button>
                </div>
                <p className="text-slate-600 mb-6">Fill out the application below to get started with your funding request.</p>
                <div id="jotform-container-norecord">
                  <p style={{textAlign: 'center', padding: '40px', color: '#08708E', fontSize: '18px'}}>
                    Loading application form...
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unable to Load Status</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.href = createPageUrl('Contact')}
            className="bg-[#08708E] hover:bg-[#065a72]"
          >
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get('rid');
  const uploadUrl = `${createPageUrl('MissingDocs')}?id149=${recordId}&cn=${encodeURIComponent(data.businessName)}&ln=${encodeURIComponent(data.lastName || '')}`;

  // Show application form for early statuses
  const status = (data.recordType === 'Lead' ? data.status : data.stageName)?.toLowerCase();
  const showApplicationForm = status === 'working - contacted' || status === 'working - application out';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-[300px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Application Status
            </h1>
            <p className="text-white/70">
              Track your funding application in real-time
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Business Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-6"
          >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#08708E] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{data.businessName}</h2>
                    <p className="text-sm text-slate-500">Application ID: {data.id.slice(-8)}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Last Updated: {formatDate(data.lastModifiedDate)}</span>
                  </div>
                  {data.firstName && (
                    <div className="bg-gradient-to-r from-[#08708E]/10 to-cyan-50 border-l-4 border-[#08708E] rounded-r-lg p-4">
                      <p className="text-slate-700 font-medium">
                        {(() => {
                          const firstName = data.firstName;
                          const status = (data.recordType === 'Lead' ? data.status : data.stageName)?.toLowerCase();
                          
                          // Lead statuses
                          if (status === 'open - not contacted') {
                            return `${firstName}, thank you for your interest! We'll be reaching out to you shortly to discuss your funding needs.`;
                          } else if (status === 'working - contacted') {
                            return `${firstName}, great connecting with you! We're excited to help you with your funding application.`;
                          } else if (status === 'working - application out') {
                            return `${firstName}, we've sent your application. Please complete it at your earliest convenience so we can move forward!`;
                          } else if (status === 'application missing info') {
                            return `${firstName}, we're almost there! Just need a few more documents to move forward with your application.`;
                          } else if (status === 'converted') {
                            return `${firstName}, excellent news! Your application has been converted and is moving through our approval process.`;
                          }
                          
                          // Opportunity statuses
                          else if (status === 'application in') {
                            return `${firstName}, we received your application and our team is reviewing it now. We'll have an update for you soon!`;
                          } else if (status === 'underwriting') {
                            return `${firstName}, great news! Your application is currently being reviewed by our underwriting team.`;
                          } else if (status === 'approved') {
                            return `${firstName}, congratulations! Your application has been approved. We'll be sending your contracts shortly.`;
                          } else if (status === 'contracts out') {
                            return `${firstName}, your contracts are ready! Please review and sign them to proceed with funding.`;
                          } else if (status === 'contracts in' || status === 'renewal processing') {
                            return `${firstName}, we received your signed contracts. Your funding is being processed and will be on its way soon!`;
                          } else if (status === 'closed - funded' || status === 'funded') {
                            return `${firstName}, congratulations! Your funding has been successfully processed. Thank you for choosing OnTrak!`;
                          } else if (status === 'closed - declined' || status === 'declined') {
                            return `${firstName}, unfortunately we're unable to approve your application at this time. Please contact us to discuss alternative options.`;
                          }
                          
                          // Default fallback
                          else {
                            return `${firstName}, thank you for choosing OnTrak. We're working on your request!`;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>

                <StatusTracker 
                  recordType={data.recordType}
                  status={data.status}
                  stageName={data.stageName}
                  stageDetail={data.stageDetail}
                  recordId={data.id}
                  businessName={data.businessName}
                  lastName={data.lastName}
                  bankStatementChecklist={data.bankStatementChecklist}
                />
          </motion.div>

          {/* Offers - Show for Contracts Out or Contracts In (selected offers only) */}
          {data.recordType === 'Opportunity' && data.offers && data.offers.length > 0 && ['contracts out', 'contracts in'].includes(data.stageName?.toLowerCase()) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Your Selected Offer</h3>
              </div>
              <div className="grid gap-4">
                {data.offers.filter(o => o.csbs__Selected__c === true).map((offer) => (
                  <div 
                    key={offer.Id} 
                    className={`border rounded-xl p-6 transition-all ${
                      offer.csbs__Selected__c 
                        ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200' 
                        : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-slate-900">{offer.Name}</h4>
                          {offer.csbs__Selected__c && (
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{offer.csbs__Lender__c}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Funded Amount</p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${Number(offer.csbs__Funded__c || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Payment Amount</p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${Number(offer.csbs__Payment_Amount__c || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Term</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {offer.csbs__Term__c || '-'} {offer.csbs__Payment_Frequency__c?.toLowerCase() || 'months'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Application Form for Contact Initiated & Application Sent */}
          {showApplicationForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-xl p-8 mb-6"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Complete Your Application</h3>
              <p className="text-slate-600 mb-6">Fill out the application below to get started with your funding request.</p>
              <div id="jotform-container">
                <p style={{textAlign: 'center', padding: '40px', color: '#08708E', fontSize: '18px'}}>
                  Loading application form...
                </p>
              </div>
            </motion.div>
          )}

          {/* File Upload Section - Show for all Opportunities OR Leads with Missing Info status */}
          {(data.recordType === 'Opportunity' || 
            (data.recordType === 'Lead' && data.status?.toLowerCase() === 'application missing info')) && (
            <FileUploadSection recordId={recordId} showActions={false} />
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#08708E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700 font-medium">Keep an eye on your email</p>
                  <p className="text-sm text-slate-500">We'll notify you of any status changes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#08708E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700 font-medium">Respond promptly to requests</p>
                  <p className="text-sm text-slate-500">Quick responses help speed up the process</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#08708E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-700 font-medium">Questions? We're here to help</p>
                  <p className="text-sm text-slate-500">
                    Call us at <a href="tel:+13025205200" className="text-[#08708E] hover:underline">(302) 520-5200</a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}