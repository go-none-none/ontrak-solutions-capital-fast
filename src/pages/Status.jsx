import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  TrendingUp,
  Check
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StatusTracker from '../components/status/StatusTracker';
import FileUploadSection from '../components/status/FileUploadSection';
import { createPageUrl } from '@/utils';

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const fileInputRef = React.useRef(null);

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

  useEffect(() => {
    fetchStatus();
  }, []);

  // Trigger confetti when opportunity is funded
  useEffect(() => {
    if (data && (data.stageName?.toLowerCase() === 'funded' || data.stageName?.toLowerCase() === 'closed - funded')) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#08708E]" />
      </div>
    );
  }

  const recordId = new URLSearchParams(window.location.search).get('rid');

  if (!recordId && !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Application Found</h2>
            <p className="text-slate-600 mb-8">We couldn't find your application. Let's get started!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="bg-[#08708E] hover:bg-[#065a73] text-white px-8 py-2 rounded-lg"
                onClick={() => window.location.href = createPageUrl('Home')}
              >
                Start Quick Form
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-2 rounded-lg"
                onClick={() => window.location.href = createPageUrl('Home')}
              >
                Return Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-900">Error Loading Application</h2>
            </div>
            <p className="text-slate-600 mb-8">{error}</p>
            <Button 
              className="bg-[#08708E] hover:bg-[#065a73] text-white"
              onClick={() => window.location.href = createPageUrl('Home')}
            >
              Return Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12">
      <section className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Your Application Status
          </h1>
          <p className="text-xl text-slate-600">
            Track your funding journey with us
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Business Information */}
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm mb-2">Business Name</p>
                  <h2 className="text-2xl font-bold text-slate-900">{data.accountName || 'N/A'}</h2>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-2">Contact Person</p>
                  <h3 className="text-2xl font-bold text-slate-900">{data.contactName || 'N/A'}</h3>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            {data && <StatusTracker data={data} />}
          </motion.div>

          {/* Offer Details */}
          {data?.recordType === 'Opportunity' && data?.offerAmount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-[#08708E]" />
                  <h3 className="text-xl font-bold text-slate-900">Offer Amount</h3>
                </div>
                <p className="text-3xl font-bold text-[#08708E]">
                  ${data.offerAmount?.toLocaleString() || 'N/A'}
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-[#08708E]" />
                  <h3 className="text-xl font-bold text-slate-900">Term</h3>
                </div>
                <p className="text-3xl font-bold text-[#08708E]">
                  {data.term || 'N/A'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Application Confirmation */}
          {data?.recordType === 'Opportunity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Application Received</h3>
                  <p className="text-slate-600">
                    Thank you for submitting your application! Our team is reviewing your information and will be in touch shortly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dynamic Form Sections */}
          {data?.recordType === 'Opportunity' && (
            <>
              {/* Jotform - Application Not Yet Sent */}
              {data.applicationSentDate === null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.13 }}
                  className="bg-white rounded-3xl shadow-xl p-8"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Complete Your Application</h3>
                  <div id="jotform_container"></div>
                  <script>
                    {`
                      (function(){
                        var d = document.createElement('div');
                        d.innerHTML = '<iframe allow="payment" src="https://form.jotform.com/232451906980968?opportunityId=${data.id}" frameborder="0" style="min-width: 100%; height: 500px; border: none;" scrolling="no"></iframe>';
                        document.getElementById('jotform_container').appendChild(d.firstChild);
                      }());
                    `}
                  </script>
                </motion.div>
              )}

              {/* Jotform - Application Sent but Not Completed */}
              {data.applicationSentDate !== null && !data.applicationCompletedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.13 }}
                  className="bg-white rounded-3xl shadow-xl p-8"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Complete Your Application</h3>
                  <div id="jotform_container"></div>
                  <script>
                    {`
                      (function(){
                        var d = document.createElement('div');
                        d.innerHTML = '<iframe allow="payment" src="https://form.jotform.com/232451906980968?opportunityId=${data.id}" frameborder="0" style="min-width: 100%; height: 500px; border: none;" scrolling="no"></iframe>';
                        document.getElementById('jotform_container').appendChild(d.firstChild);
                      }());
                    `}
                  </script>
                </motion.div>
              )}

              {/* Jotform - Missing Documents */}
              {data.missingDocumentsIdentified && !data.missingDocumentsUploadedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.13 }}
                  className="bg-white rounded-3xl shadow-xl p-8"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Upload Missing Documents</h3>
                  <div id="jotform_missing_docs_container"></div>
                  <script>
                    {`
                      (function(){
                        var d = document.createElement('div');
                        d.innerHTML = '<iframe allow="payment" src="https://form.jotform.com/232451933651961?opportunityId=${data.id}" frameborder="0" style="min-width: 100%; height: 500px; border: none;" scrolling="no"></iframe>';
                        document.getElementById('jotform_missing_docs_container').appendChild(d.firstChild);
                      }());
                    `}
                  </script>
                </motion.div>
              )}
            </>
          )}

          {/* File Upload Section - Hide when Funded or Closed - Funded */}
          {!(data.stageName?.toLowerCase() === 'funded' || data.stageName?.toLowerCase() === 'closed - funded') && (data.recordType === 'Opportunity' || 
             (data.recordType === 'Lead' && data.status?.toLowerCase() === 'application missing info')) && (
             <FileUploadSection key={fileUploadKey} recordId={recordId} showActions={false} />
           )}

           {/* Start New Application Card - Show when Funded */}
           {(data.stageName?.toLowerCase() === 'funded' || data.stageName?.toLowerCase() === 'closed - funded') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-green-300 rounded-3xl shadow-xl p-8 mb-6"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-200 rounded-full p-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-3">Congratulations!</h3>
                  <p className="text-green-600 mb-6">Your application has been funded!</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.location.href = createPageUrl('Home')}
                  >
                    Start a New Application
                  </Button>
                </div>
              </motion.div>
            )}

           {/* Next Steps - Hide when Funded */}
           {!(data.stageName?.toLowerCase() === 'funded' || data.stageName?.toLowerCase() === 'closed - funded') && (
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
           )}
        </div>
      </section>
    </div>
  );
}