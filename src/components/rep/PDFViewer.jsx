import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, AlertCircle } from 'lucide-react';

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
      // Direct fetch to avoid base44 auth check
      const response = await fetch('/api/apps/6932157da76cc7fc545d1203/functions/getSalesforceFileContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentDocumentId: file.ContentDocumentId,
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const data = await response.json();

      if (!data || !data.file) {
        throw new Error('No file content received');
      }

      // Create blob from base64
      const base64 = data.file;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfData(url);
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
      a.download = file.ContentDocument.Title + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
    }
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