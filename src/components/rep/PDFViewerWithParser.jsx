import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, AlertCircle, FileSearch, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PDFViewerWithParser({ file, session, isOpen, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      loadPDF();
    } else {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setError(null);
      setParsedData(null);
    }
  }, [isOpen, file]);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', {
        contentDocumentId: file.ContentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (!response.data || !response.data.file) {
        throw new Error('No file content received');
      }

      const base64 = response.data.file;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfUrl(url);
    } catch (error) {
      console.error('PDF load error:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const parsePDFData = async () => {
    if (!file) return;
    
    setParsing(true);
    try {
      const response = await base44.functions.invoke('parseBankStatement', {
        contentDocumentId: file.ContentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setParsedData(response.data);
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse PDF: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  const handleClose = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setParsedData(null);
    onClose();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{file.ContentDocument.Title}</DialogTitle>
            <div className="flex gap-2">
              {pdfUrl && (
                <>
                  <Button variant="outline" size="sm" onClick={parsePDFData} disabled={parsing}>
                    {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSearch className="w-4 h-4 mr-2" />}
                    Parse Data
                  </Button>
                  <a href={pdfUrl} download={file.ContentDocument.Title}>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-auto bg-slate-100">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-[#08708E] animate-spin mb-4" />
                <p className="text-slate-600">Loading PDF...</p>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-slate-900 font-semibold mb-2">Failed to load PDF</p>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={loadPDF}>Try Again</Button>
              </div>
            )}
            
            {pdfUrl && !loading && !error && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            )}
          </div>

          {parsedData && (
            <div className="w-96 bg-white border-l overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Parsed Bank Data</h3>
              
              <div className="space-y-4">
                {parsedData.avgDailyBalance && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-slate-900">Avg Daily Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      ${parsedData.avgDailyBalance.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.totalDeposits && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <p className="font-semibold text-slate-900">Total Deposits</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      ${parsedData.totalDeposits.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.totalWithdrawals && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <p className="font-semibold text-slate-900">Total Withdrawals</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      ${parsedData.totalWithdrawals.toLocaleString()}
                    </p>
                  </div>
                )}

                {parsedData.lenderPayments && parsedData.lenderPayments.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-semibold text-slate-900 mb-3">Lender Payments</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {parsedData.lenderPayments.map((payment, idx) => (
                        <div key={idx} className="text-sm pb-2 border-b border-orange-100 last:border-0">
                          <p className="text-slate-600 text-xs mb-1">{payment.description}</p>
                          <p className="font-semibold text-orange-700">${payment.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.negativeBalances > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-semibold text-slate-900">Negative Balances</p>
                    <p className="text-2xl font-bold text-red-700">{parsedData.negativeBalances}</p>
                    <p className="text-xs text-slate-600 mt-1">Instances found</p>
                  </div>
                )}

                {!parsedData.avgDailyBalance && !parsedData.totalDeposits && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No financial data could be extracted from this document
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}