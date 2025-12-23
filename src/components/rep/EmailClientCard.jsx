import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, Loader2, ChevronDown, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EmailClientCard({ recipientEmail, recipientName, recordId, recordType, session }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSend = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const response = await base44.functions.invoke('sendSalesforceEmail', {
        recipientEmail,
        recipientName,
        subject: formData.subject,
        message: formData.message,
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      console.log('Email send response:', response);

      if (response.data?.success) {
        toast.success('Email sent successfully!');
        setFormData({ subject: '', message: '' });
        setOpen(false);
      } else {
        console.error('Email send failed:', response.data);
        toast.error(response.data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!recipientEmail) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#08708E]" />
            <h2 className="text-lg font-semibold text-slate-900">Send Email</h2>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">To:</label>
              <Input value={`${recipientName} <${recipientEmail}>`} disabled className="bg-slate-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subject:</label>
              <Input
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Message:</label>
              <Textarea
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleSend} 
              disabled={sending} 
              className="w-full bg-[#08708E] hover:bg-[#065a72]"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}