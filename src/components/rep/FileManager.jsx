import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Upload, Loader2, Download, Eye, X, CheckSquare, Square, Trash2, Edit2, Sparkles, Zap } from 'lucide-react';
import PDFViewer from './PDFViewer';
import ImageViewer from './ImageViewer';
import { base44 } from '@/api/base44Client';

export default function FileManager({ recordId, session, onFileUploaded, onParseFile, statements = [], onFilesLoaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [previewingStatement, setPreviewingStatement] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, [recordId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/apps/6932157da76cc7fc545d1203/functions/getSalesforceFiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      });
      const data = await response.json();
      const sfFiles = data.files || [];
      
      // Load temp files from localStorage
      const tempFiles = JSON.parse(localStorage.getItem(`temp_files_${recordId}`) || '[]');
      
      // Combine SF files with temp files
      const combinedFiles = [
        ...tempFiles.map(tf => ({
          ContentDocumentId: tf.id,
          ContentDocument: {
            Title: tf.name.replace(/\.[^/.]+$/, ''),
            FileExtension: tf.name.split('.').pop(),
            ContentSize: tf.size,
            CreatedDate: tf.uploadedAt
          },
          isTemp: true,
          tempUrl: tf.url
        })),
        ...sfFiles
      ];
      
      setFiles(combinedFiles);
      
      // Get unparsed PDFs and notify parent
      const unparsedPdfs = combinedFiles.filter(file => {
        const isPdf = file.ContentDocument?.FileExtension?.toLowerCase() === 'pdf';
        const hasStatement = statements.some(stmt => stmt.csbs__Source_File_ID__c === file.ContentDocumentId);
        return isPdf && !hasStatement;
      });
      onFilesLoaded?.(unparsedPdfs);
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
      // Upload to Base44 storage only (not Salesforce yet)
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      
      // Store file metadata in temp storage (will link to SF when statement is saved)
      const tempFiles = JSON.parse(localStorage.getItem(`temp_files_${recordId}`) || '[]');
      tempFiles.push({
        id: `temp_${Date.now()}`,
        name: file.name,
        url: uploadResponse.file_url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });
      localStorage.setItem(`temp_files_${recordId}`, JSON.stringify(tempFiles));
      
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
    if (file.isTemp) {
      window.open(file.tempUrl, '_blank');
      return;
    }
    
    const doc = file.ContentDocument;
    const ext = doc.FileExtension?.toLowerCase();
    const isPdf = ext === 'pdf' || doc.Title?.toLowerCase().endsWith('.pdf');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    
    if (isPdf) {
      // For PDFs, fetch and open in new tab directly (more reliable than iframe)
      try {
        const response = await fetch('/api/apps/6932157da76cc7fc545d1203/functions/getSalesforceFileContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentDocumentId: file.ContentDocumentId,
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
        window.open(url, '_blank');
        
        // Cleanup after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error('PDF open error:', error);
        alert('Failed to open PDF. Please try downloading it instead.');
      }
    } else if (isImage) {
      setViewingImage(file);
    } else {
      window.open(`${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`, '_blank');
    }
  };

  const closeViewer = () => {
    setViewingFile(null);
  };

  const closeImageViewer = () => {
    setViewingImage(null);
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

  const handleDeleteFile = async (file, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
      return;
    }

    const contentDocumentId = file.ContentDocumentId;
    setDeleting(contentDocumentId);
    try {
      if (file.isTemp) {
        // Remove from localStorage
        const tempFiles = JSON.parse(localStorage.getItem(`temp_files_${recordId}`) || '[]');
        const filtered = tempFiles.filter(tf => tf.id !== contentDocumentId);
        localStorage.setItem(`temp_files_${recordId}`, JSON.stringify(filtered));
      } else {
        // Delete from Salesforce
        await fetch('/api/apps/6932157da76cc7fc545d1203/functions/deleteSalesforceFile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentDocumentId,
            token: session.token,
            instanceUrl: session.instanceUrl
          })
        });
      }
      
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
      await fetch('/api/apps/6932157da76cc7fc545d1203/functions/renameSalesforceFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentDocumentId,
          newTitle: newTitle.trim(),
          token: session.token,
          instanceUrl: session.instanceUrl
        })
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
                className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
              >
                {/* Top Section: Checkbox, Icon, and File Name */}
                <div className="flex items-center gap-3 mb-3">
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
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename(file.ContentDocumentId, doc.Title);
                          if (e.key === 'Escape') {
                            setRenamingId(null);
                            setNewTitle('');
                          }
                        }}
                      />
                    ) : (
                      <p className="font-medium text-slate-900 text-sm" title={`${doc.Title}.${doc.FileExtension}`}>
                        {doc.Title}.{doc.FileExtension}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Bottom Section: File Info and Actions */}
                <div className="flex items-center justify-between gap-2 pl-14">
                  <p className="text-xs text-slate-500">
                    {formatFileSize(doc.ContentSize)} • {formatDate(doc.CreatedDate)}
                  </p>
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewFile(file)}
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {doc.FileExtension?.toLowerCase() === 'pdf' && (() => {
                          const matchingStatement = statements.find(stmt => stmt.csbs__Source_File_ID__c === file.ContentDocumentId);
                          return matchingStatement ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setPreviewingStatement(matchingStatement)}
                              title="View parsed data"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          ) : null;
                        })()
                      }
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`;
                          link.download = `${doc.Title}.${doc.FileExtension}`;
                          link.click();
                        }}
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFile(file, doc.Title)}
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
      <ImageViewer 
      file={viewingImage}
      session={session}
      isOpen={!!viewingImage}
      onClose={closeImageViewer}
      />

      {/* Statement Data Preview Modal */}
      {previewingStatement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Parsed Data</h3>
              <button
                onClick={() => setPreviewingStatement(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Bank Name</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Bank_Name__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Account No</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Account_No__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Account Title</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Account_Title__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Company</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Company__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Starting Date</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Starting_Date__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Ending Date</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Ending_Date__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Starting Balance</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Starting_Balance__c ? `$${Number(previewingStatement.csbs__Starting_Balance__c).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Ending Balance</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Ending_Balance__c ? `$${Number(previewingStatement.csbs__Ending_Balance__c).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Avg Daily Balance</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Average_Daily_Balance__c ? `$${Number(previewingStatement.csbs__Average_Daily_Balance__c).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Deposit Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Deposit_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Deposit Amount</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Deposit_Amount__c ? `$${Number(previewingStatement.csbs__Deposit_Amount__c).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Withdrawals Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Withdrawals_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Total Withdrawals</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Total_Withdrawals__c ? `$${Number(previewingStatement.csbs__Total_Withdrawals__c).toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Transactions Count</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Transactions_Count__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">NSFs</p>
                  <p className="text-slate-900">{previewingStatement.csbs__NSFs__c || '—'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Negative Days</p>
                  <p className="text-slate-900">{previewingStatement.csbs__Negative_Days__c || '—'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setPreviewingStatement(null)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}