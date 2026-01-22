import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ViewStatementModal({ isOpen, onClose, statement, session }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (isOpen && statement?.csbs__Source_File_ID__c && session) {
      loadPdfUrl();
    }
  }, [isOpen, statement, session]);

  const loadPdfUrl = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', { contentDocumentId: statement.csbs__Source_File_ID__c, token: session.token, instanceUrl: session.instanceUrl });
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
      console.error('Error loading PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!statement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>View Statement</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-96 border border-slate-200 rounded-lg"
            title="Statement PDF"
          />
        ) : (
          <div className="text-center py-12 text-slate-600">
            <p>No PDF available for this statement</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
          <div><p className="text-slate-500 text-xs mb-1">Bank Name</p><p className="font-medium">{statement.csbs__Bank_Name__c || '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Account No</p><p className="font-medium">{statement.csbs__Account_No__c || '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Starting Date</p><p className="font-medium">{statement.csbs__Starting_Date__c || '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Ending Date</p><p className="font-medium">{statement.csbs__Ending_Date__c || '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Starting Balance</p><p className="font-medium">{statement.csbs__Starting_Balance__c ? `$${Number(statement.csbs__Starting_Balance__c).toLocaleString()}` : '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Ending Balance</p><p className="font-medium">{statement.csbs__Ending_Balance__c ? `$${Number(statement.csbs__Ending_Balance__c).toLocaleString()}` : '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Average Daily Balance</p><p className="font-medium">{statement.csbs__Average_Daily_Balance__c ? `$${Number(statement.csbs__Average_Daily_Balance__c).toLocaleString()}` : '-'}</p></div>
          <div><p className="text-slate-500 text-xs mb-1">Fraud Score</p><p className="font-medium">{statement.csbs__Fraud_Score__c || '-'}</p></div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {pdfUrl && (
            <Button onClick={() => window.open(pdfUrl, '_blank')} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}