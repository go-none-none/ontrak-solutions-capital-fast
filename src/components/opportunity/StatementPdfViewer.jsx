import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X } from 'lucide-react';

export default function StatementPdfViewer({ statement, session, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (isOpen && statement?.csbs__Source_File_ID__c) {
      loadPDF();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, statement]);

  const loadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apps/6932157da76cc7fc545d1203/functions/getSalesforceFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentDocumentId: statement.csbs__Source_File_ID__c,
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      const data = await response.json();
      const base64 = data.file;
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

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${statement.csbs__Bank_Name__c || 'Statement'}_${statement.csbs__Ending_Date__c || ''}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {statement?.csbs__Bank_Name__c || 'Bank Statement'} - {statement?.csbs__Ending_Date__c}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {pdfUrl && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button onClick={handleClose} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-600">
              <p className="text-lg font-semibold mb-2">Failed to load PDF</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </object>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}