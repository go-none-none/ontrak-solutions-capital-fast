import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { FileText, Upload, Loader2, Download, Eye, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FileManager({ recordId, session, onFileUploaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
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

  const handleViewFile = async (file) => {
    const doc = file.ContentDocument;
    const isPdf = doc.FileExtension?.toLowerCase() === 'pdf';
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(doc.FileExtension?.toLowerCase());
    
    if (!isPdf && !isImage) {
      // Download non-viewable files
      window.open(`${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`, '_blank');
      return;
    }

    setViewingFile(file);
    setLoadingFile(true);
    
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', {
        contentDocumentId: file.ContentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (!response.data || !response.data.file) {
        throw new Error('No file content received');
      }

      // Convert base64 to blob and create object URL
      const base64Content = response.data.file;
      const mimeType = response.data.mimeType || 'application/octet-stream';

      // Decode base64 to binary
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);

      console.log('PDF blob created:', { size: blob.size, type: blob.type, url: objectUrl });
      setFileContent({ objectUrl, contentType: mimeType });
    } catch (error) {
      console.error('Error loading file:', error);
      alert(`Failed to load file: ${error.message}`);
      setViewingFile(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const closeViewer = () => {
    if (fileContent?.objectUrl) {
      URL.revokeObjectURL(fileContent.objectUrl);
    }
    setViewingFile(null);
    setFileContent(null);
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
                  <object
                    data={fileContent.objectUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                  >
                    <embed
                      src={fileContent.objectUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-lg"
                    />
                  </object>
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