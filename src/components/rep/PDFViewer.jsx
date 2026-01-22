import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PDFViewer({ file, session, isOpen, onClose }) {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadPDF();
    } else {
      setPdfData(null);
      setError(null);
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
      const dataUrl = `data:application/pdf;base64,${base64}`;
      
      setPdfData(dataUrl);
    } catch (error) {
      console.error('PDF load error:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfData) {
      const a = document.createElement('a');
      a.href = pdfData;
      a.download = `${file.ContentDocument.Title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    setPdfData(null);
    setError(null);
    onClose();
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
          <DialogTitle className="text-base font-semibold">{file.ContentDocument.Title}</DialogTitle>
          <div className="flex gap-2">
            {pdfData && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
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
          
          {pdfData && !loading && !error && (
            <iframe
              src={`${pdfData}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}