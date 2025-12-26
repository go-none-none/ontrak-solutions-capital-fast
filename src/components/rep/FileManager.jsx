import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, Download, Eye, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PDFViewer from './PDFViewer';

export default function FileManager({ recordId, session, onFileUploaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, [recordId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSalesforceFiles', {
        recordId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Load files error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recordId', recordId);
      formData.append('token', session.token);
      formData.append('instanceUrl', session.instanceUrl);

      await base44.functions.invoke('uploadSalesforceFile', formData);
      
      await loadFiles();
      if (onFileUploaded) onFileUploaded();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (extension) => {
    return FileText;
  };

  const handleViewFile = (file) => {
    const doc = file.ContentDocument;
    const isPdf = doc.FileExtension?.toLowerCase() === 'pdf';
    
    if (isPdf) {
      setViewingFile(file);
    } else {
      // Download non-PDF files
      window.open(`${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`, '_blank');
    }
  };

  const closeViewer = () => {
    setViewingFile(null);
  };

  return (
    <>
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Files & Attachments</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-[#08708E] animate-spin mx-auto" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No files attached</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, i) => {
            const doc = file.ContentDocument;
            const Icon = getFileIcon(doc.FileExtension);
            
            return (
              <motion.div
                key={file.ContentDocumentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#08708E]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#08708E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{doc.Title}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(doc.ContentSize)} • {formatDate(doc.CreatedDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewFile(file)}
                    title="View file"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <a
                    href={`${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`}
                    download
                    title="Download file"
                  >
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{viewingFile.ContentDocument.Title}</h3>
              <Button variant="ghost" size="icon" onClick={closeViewer}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              {loadingFile ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-[#08708E] animate-spin" />
                </div>
              ) : fileContent?.objectUrl ? (
                viewingFile.ContentDocument.FileExtension?.toLowerCase() === 'pdf' ? (
                  <div className="w-full h-full flex flex-col bg-slate-100">
                    <object
                      data={fileContent.objectUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      className="flex-1"
                      style={{ minHeight: '70vh' }}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <p className="text-slate-600 mb-4">Unable to display PDF in browser.</p>
                        <a 
                          href={fileContent.objectUrl} 
                          download={viewingFile.ContentDocument.Title}
                          className="px-4 py-2 bg-[#08708E] text-white rounded-lg hover:bg-[#065a72]"
                        >
                          Download PDF
                        </a>
                      </div>
                    </object>
                  </div>
                ) : fileContent.contentType?.startsWith('image/') ? (
                  <img
                    src={fileContent.objectUrl}
                    alt={viewingFile.ContentDocument.Title}
                    className="max-w-full max-h-full mx-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Preview not available for this file type</p>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}