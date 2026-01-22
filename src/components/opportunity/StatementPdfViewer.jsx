import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Eye, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StatementPdfViewer({ statement, session }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (statement?.csbs__Source_File_ID__c && session) {
      loadPdfUrl();
    }
  }, [statement, session]);

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

  if (!statement?.csbs__Source_File_ID__c) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          No statement PDF available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Statement PDF</CardTitle>
        <div className="flex gap-2">
          {pdfUrl && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <a href={pdfUrl} download={`statement-${statement.Name}.pdf`}>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </a>
            </>
          )}
        </div>
      </CardHeader>
      {loading && (
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </CardContent>
      )}
    </Card>
  );
}