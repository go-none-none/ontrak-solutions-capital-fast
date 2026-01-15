import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Upload, Loader2, Download, Eye, X, CheckSquare, Square, Trash2, Edit2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PDFViewer from './PDFViewer';

export default function FileManager({ recordId, session, onFileUploaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
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
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Data = await base64Promise;

      await base44.functions.invoke('uploadSalesforceFile', {
        fileName: file.name,
        fileData: base64Data,
        recordId: recordId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
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

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(f => f.ContentDocumentId));
    }
  };

  const downloadSelectedFiles = async () => {
    for (const fileId of selectedFiles) {
      const file = files.find(f => f.ContentDocumentId === fileId);
      if (file) {
        const doc = file.ContentDocument;
        const link = document.createElement('a');
        link.href = `${session.instanceUrl}/sfc/servlet.shepherd/document/download/${fileId}`;
        link.download = `${doc.Title}.${doc.FileExtension}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleDeleteFile = async (contentDocumentId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(contentDocumentId);
    try {
      await base44.functions.invoke('deleteSalesforceFile', {
        contentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadFiles();
      if (onFileUploaded) onFileUploaded();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const handleRenameFile = async (contentDocumentId, currentTitle) => {
    setRenamingId(contentDocumentId);
    setNewTitle(currentTitle);
  };

  const submitRename = async (contentDocumentId, currentTitle) => {
    if (!newTitle.trim() || newTitle === currentTitle) {
      setRenamingId(null);
      setNewTitle('');
      return;
    }

    try {
      await base44.functions.invoke('renameSalesforceFile', {
        contentDocumentId,
        newTitle: newTitle.trim(),
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadFiles();
      setRenamingId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename file');
    }
  };

  return (
    <>
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Files & Attachments</h2>
        <div className="flex gap-2">
          {selectedFiles.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={downloadSelectedFiles}
            >
              <Download className="w-4 h-4 mr-2" />
              Download ({selectedFiles.length})
            </Button>
          )}
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

      {files.length > 0 && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
          <Checkbox
            checked={selectedFiles.length === files.length}
            onCheckedChange={toggleSelectAll}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm text-slate-700 cursor-pointer">
            Select All ({files.length})
          </label>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
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
                  <Checkbox
                    checked={selectedFiles.includes(file.ContentDocumentId)}
                    onCheckedChange={() => toggleFileSelection(file.ContentDocumentId)}
                  />
                  <div className="w-10 h-10 rounded-lg bg-[#08708E]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingId === file.ContentDocumentId ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm font-medium mb-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename(file.ContentDocumentId, doc.Title);
                          if (e.key === 'Escape') {
                            setRenamingId(null);
                            setNewTitle('');
                          }
                        }}
                      />
                    ) : (
                      <p className="font-medium text-slate-900 truncate">{doc.Title}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {formatFileSize(doc.ContentSize)} • {formatDate(doc.CreatedDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {renamingId === file.ContentDocumentId ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => submitRename(file.ContentDocumentId, doc.Title)}
                        title="Confirm rename"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setRenamingId(null);
                          setNewTitle('');
                        }}
                        title="Cancel"
                        className="text-slate-600 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRenameFile(file.ContentDocumentId, doc.Title)}
                        title="Rename file"
                      >
                        <Edit2 className="w-4 h-4" />
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewFile(file)}
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFile(file.ContentDocumentId, doc.Title)}
                        disabled={deleting === file.ContentDocumentId}
                        title="Delete file"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === file.ContentDocumentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <PDFViewer 
        file={viewingFile}
        session={session}
        isOpen={!!viewingFile}
        onClose={closeViewer}
      />
    </div>
    </>
  );
}