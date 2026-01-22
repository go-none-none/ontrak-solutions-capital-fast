import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SendEmailModal({ isOpen, onClose, recipientEmail, recipientName, subject, session, onSuccess }) {
  const [formData, setFormData] = useState({ to: recipientEmail || '', subject: subject || '', body: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.to || !formData.subject || !formData.body) {
      alert('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('sendClientEmail', { to: formData.to, subject: formData.subject, body: formData.body, token: session?.token, instanceUrl: session?.instanceUrl });
      onSuccess?.();
      onClose();
      setFormData({ to: '', subject: '', body: '' });
    } catch (error) {
      console.error('Email send error:', error);
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>To</Label><Input type="email" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} required /></div>
          <div><Label>Subject</Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required /></div>
          <div><Label>Message</Label><Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={8} required className="font-mono text-sm" /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Send Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}