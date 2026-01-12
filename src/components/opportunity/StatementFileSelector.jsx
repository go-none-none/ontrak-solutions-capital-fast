import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function StatementFileSelector({ recordId, session, onParse, isParsing }) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [recordId]);

  const loadFiles = async () => {
    try {
      const response = await base44.functions.invoke('getSalesforceFiles', {
        recordId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      // Filter for PDF files - check both Title and FileExtension
      const pdfFiles = (response.data.files || []).filter(f => {
        const title = f.ContentDocument?.Title || f.Title || '';
        const ext = f.ContentDocument?.FileExtension || f.FileExtension || '';
        return title.toLowerCase().endsWith('.pdf') || ext.toLowerCase() === 'pdf';
      });
      
      console.log('Loaded files:', response.data.files?.length, 'PDF files:', pdfFiles.length);
      setFiles(pdfFiles);
    } catch (error) {
      console.error('Load files error:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleParse = () => {
    const selectedFilesData = files
      .filter(f => {
        const fileId = f.ContentDocumentId || f.Id;
        return selectedFiles.includes(fileId);
      })
      .map(f => {
        const fileId = f.ContentDocumentId || f.Id;
        const fileName = f.ContentDocument?.Title || f.Title;
        return {
          Id: String(fileId),
          Title: String(fileName),
          VersionId: f.ContentDocument?.LatestPublishedVersionId || f.VersionId
        };
      });
    onParse(selectedFilesData);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#08708E] mr-2" />
          <span className="text-slate-600">Loading files...</span>
        </div>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">No PDF Files Found</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Upload bank statement PDFs to the Files & Attachments section to parse them.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Select Bank Statements to Parse</h3>
      
      <div className="space-y-3 mb-4">
        {files.map((file) => {
          const fileId = file.ContentDocumentId || file.Id;
          const fileName = file.ContentDocument?.Title || file.Title;
          const fileSize = file.ContentDocument?.ContentSize || file.ContentSize;
          
          return (
            <div key={fileId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                id={fileId}
                checked={selectedFiles.includes(fileId)}
                onCheckedChange={() => toggleFile(fileId)}
              />
              <FileText className="w-4 h-4 text-slate-400" />
              <label htmlFor={fileId} className="flex-1 cursor-pointer">
                <p className="text-sm font-medium text-slate-900">{fileName}</p>
                <p className="text-xs text-slate-500">
                  {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                </p>
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleParse}
          disabled={selectedFiles.length === 0 || isParsing}
          className="flex-1"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Parsing...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Parse {selectedFiles.length} Statement{selectedFiles.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}