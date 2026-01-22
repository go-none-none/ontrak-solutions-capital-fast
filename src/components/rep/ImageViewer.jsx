import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageViewer({ file, session, isOpen, onClose }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (isOpen && file && session) {
      loadImage();
    }
  }, [isOpen, file, session]);

  const loadImage = async () => {
    setLoading(true);
    setZoom(100);
    try {
      const url = `${session.instanceUrl}/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`;
      setImageUrl(url);
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 sticky top-0">
          <h2 className="font-semibold text-slate-900">
            {file?.ContentDocument?.Title}.{file?.ContentDocument?.FileExtension}
          </h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2 py-2">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-100 overflow-auto max-h-[calc(90vh-150px)]">
          {loading ? (
            <p className="text-slate-500">Loading image...</p>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={file?.ContentDocument?.Title} 
              style={{ maxWidth: '100%', width: `${zoom}%` }}
              className="object-contain"
            />
          ) : (
            <p className="text-slate-500">Unable to load image</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}