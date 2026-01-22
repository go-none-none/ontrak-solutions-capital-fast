import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PDFViewer({ file, session, isOpen, onClose }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file && session) {
      loadPdf();
    }
  }, [isOpen, file, session]);

  const loadPdf = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 sticky top-0">
          <h2 className="font-semibold text-slate-900">
            {file?.ContentDocument?.Title}.{file?.ContentDocument?.FileExtension}
          </h2>
          <div className="flex gap-2">
            {pdfUrl && (
              <a href={pdfUrl} download={`${file?.ContentDocument?.Title}.pdf`}>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative bg-slate-100">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-slate-500">Loading PDF...</p>
            </div>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-96 border-0" title="PDF Viewer" />
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-500">
              Unable to load PDF
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}