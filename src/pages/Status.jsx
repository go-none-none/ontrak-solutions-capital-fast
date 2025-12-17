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
  Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusTracker from '../components/status/StatusTracker';
import { createPageUrl } from '@/utils';

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const recordId = urlParams.get('rid');
        
        if (!recordId) {
          setError('No record ID provided');
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

            <div className="flex items-center gap-2 text-sm text-slate-600 mb-8">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {formatDate(data.lastModifiedDate)}</span>
            </div>

            <StatusTracker 
              recordType={data.recordType}
              status={data.status}
              stageName={data.stageName}
              stageDetail={data.stageDetail}
              recordId={data.id}
              businessName={data.businessName}
              lastName={data.lastName}
            />
          </motion.div>

          {/* Missing Documents Section */}
          {data.status === 'Application Missing Info' && data.bankStatementChecklist && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Documents Missing
                  </h3>
                  <p className="text-slate-600 mb-4">
                    We need the following documents to continue processing your application:
                  </p>
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <ul className="space-y-2">
                      {data.bankStatementChecklist.split('\n').map((item, index) => {
                        const trimmedItem = item.trim();
                        if (!trimmedItem) return null;
                        const isMissing = trimmedItem.includes('❌');
                        return (
                          <li key={index} className={`flex items-start gap-2 ${isMissing ? 'text-red-600' : 'text-green-600'} font-medium`}>
                            {trimmedItem}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <a href={uploadUrl}>
                    <Button className="bg-[#08708E] hover:bg-[#065a72] w-full sm:w-auto">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
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