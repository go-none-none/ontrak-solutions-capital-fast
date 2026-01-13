import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, Trash2, FolderOpen, CheckCircle2, Circle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DocumentsDrawer({ isOpen, onClose, opportunityId, session }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [downloadingSelected, setDownloadingSelected] = useState(false);

  useEffect(() => {
    if (isOpen && opportunityId) {
      loadDocuments();
    }
  }, [isOpen, opportunityId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSalesforceFiles', {
        recordId: opportunityId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setDocuments(response.data.files || []);
    } catch (error) {
      console.error('Load documents error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (docId) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleDownload = async (fileId, fileName) => {
    setDownloading(fileId);
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', {
        fileId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      const blob = new Blob([response.data.content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedDocs.size === 0) {
      alert('Please select at least one document');
      return;
    }

    setDownloadingSelected(true);
    try {
      const selectedDocsList = documents.filter(d => selectedDocs.has(d.Id));
      let uploadedCount = 0;

      for (const doc of selectedDocsList) {
        try {
          const response = await base44.functions.invoke('getSalesforceFileContent', {
            fileId: doc.Id,
            token: session.token,
            instanceUrl: session.instanceUrl
          });

          const blob = new Blob([response.data.content], { type: 'application/pdf' });
          const file = new File([blob], doc.Title, { type: 'application/pdf' });

          const uploadResult = await base44.integrations.Core.UploadFile({ file });
          
          // Save to OpportunityDocument entity
          await base44.entities.OpportunityDocument.create({
            opportunityId,
            fileName: doc.Title,
            fileUrl: uploadResult.file_url,
            salesforceFileId: doc.Id,
            fileSize: doc.FileSize || 0
          });

          uploadedCount++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Failed to upload ${doc.Title}:`, error);
        }
      }

      alert(`Successfully saved ${uploadedCount} document(s) to your app`);
      setSelectedDocs(new Set());
      // Reload opportunity documents by triggering a refresh in parent
      window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: { opportunityId } }));
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to save documents');
    } finally {
      setDownloadingSelected(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeleting(fileId);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'ContentDocument',
        recordId: fileId,
        data: { IsDeleted: true },
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      setDocuments(documents.filter(d => d.Id !== fileId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Documents
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 max-w-2xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#08708E] animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No documents found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.Id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#08708E] transition-colors"
                  >
                    <button
                      onClick={() => toggleSelection(doc.Id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      {selectedDocs.has(doc.Id) ? (
                        <CheckCircle2 className="w-5 h-5 text-[#08708E] flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{doc.Title}</p>
                        <p className="text-xs text-slate-500">{doc.FileSize ? `${(doc.FileSize / 1024).toFixed(2)} KB` : 'PDF'}</p>
                      </div>
                    </button>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc.Id, doc.Title)}
                        disabled={downloading === doc.Id}
                        className="h-9 w-9"
                      >
                        {downloading === doc.Id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-slate-600 hover:text-[#08708E]" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.Id)}
                        disabled={deleting === doc.Id}
                        className="h-9 w-9"
                      >
                        {deleting === doc.Id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {documents.length > 0 && (
                <Button
                  onClick={handleDownloadSelected}
                  disabled={selectedDocs.size === 0 || downloadingSelected}
                  className="w-full bg-[#08708E] hover:bg-[#065a72]"
                >
                  {downloadingSelected ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Save to App ({selectedDocs.size})
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}