import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';

export default function ImageViewer({ file, session, isOpen, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      loadImage();
    }
  }, [isOpen, file]);

  const loadImage = async () => {
    setLoading(true);
    try {
      const imageUrl = `${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`;
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Load image error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
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
              <Button
                size="sm"
                variant="outline"
                onClick={downloadImage}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
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
          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={doc.Title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-slate-500">Failed to load image</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}