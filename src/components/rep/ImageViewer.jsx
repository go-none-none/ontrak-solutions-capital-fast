import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageViewer({ file, session, isOpen, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadImage();
    } else {
      setImageUrl(null);
      setError(null);
    }
  }, [isOpen, file]);

  const loadImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('getSalesforceFileContent', {
        contentDocumentId: file.ContentDocumentId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (!response.data || !response.data.file) {
        throw new Error('No file content received');
      }

      const base64 = response.data.file;
      const ext = file.ContentDocument.FileExtension?.toLowerCase();
      const mimeTypes = {
        'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml'
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;
      setImageUrl(dataUrl);
    } catch (error) {
      console.error('Load image error:', error);
      setError(error.message || 'Failed to load image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (file && session) {
      const doc = file.ContentDocument;
      const link = document.createElement('a');
      link.href = `${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`;
      link.download = `${doc.Title}.${doc.FileExtension}`;
      link.click();
    }
  };

  if (!file) return null;

  const doc = file.ContentDocument;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between w-full gap-4">
            <DialogTitle className="truncate">{doc.Title}</DialogTitle>
            <div className="flex gap-2">
              {imageUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex items-center justify-center p-4 overflow-auto max-h-[calc(90vh-80px)] bg-slate-50">
          {loading && (
            <div className="text-slate-500">Loading image...</div>
          )}
          
          {error && (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-slate-600">{error}</p>
            </div>
          )}
          
          {imageUrl && !loading && !error && (
            <motion.img
              src={imageUrl}
              alt={doc.Title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}