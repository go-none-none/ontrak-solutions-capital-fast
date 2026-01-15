import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, Loader2, Send, ArrowUp, ArrowDown, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CommunicationCard({ 
  recipientEmail, 
  recipientName, 
  phoneNumber,
  recordId, 
  recordType, 
  session,
  smsColor = 'bg-blue-600'
}) {
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [smsMessage, setSmsMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [smsHistory, setSmsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      loadSmsHistory();
    }
  }, [phoneNumber]);

  const loadSmsHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await base44.functions.invoke('getTwilioSmsHistory', {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setSmsHistory(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load SMS history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const response = await base44.functions.invoke('sendSalesforceEmail', {
        recipientEmail,
        recipientName,
        subject: emailData.subject,
        message: emailData.message,
        recordId,
        recordType,
        senderName: session.name,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (response.data?.success) {
        toast.success('Email sent successfully!');
        setEmailData({ subject: '', message: '' });
      } else {
        toast.error(response.data?.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await base44.functions.invoke('sendTwilioSMS', {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        message: smsMessage.trim(),
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      toast.success('SMS sent successfully');
      setSmsMessage('');
      await loadSmsHistory();
    } catch (error) {
      console.error('SMS error:', error);
      toast.error(error.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-green-600" title="Delivered" />;
      case 'sent':
        return <Check className="w-3 h-3 text-blue-600" title="Sent" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-600" title="Failed" />;
      case 'queued':
        return <Loader2 className="w-3 h-3 text-yellow-600 animate-spin" title="Sending" />;
      default:
        return null;
    }
  };

  const hasEmail = !!recipientEmail;
  const hasPhone = !!phoneNumber;

  if (!hasEmail && !hasPhone) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="w-full flex rounded-none bg-slate-100 p-0 h-auto">
          {hasEmail && (
            <TabsTrigger 
              value="email" 
              className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-orange-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
          )}
          {hasPhone && (
            <TabsTrigger 
              value="sms" 
              className={`flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:${smsColor.replace('bg-', 'border-')}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </TabsTrigger>
          )}
        </TabsList>

        {hasEmail && (
          <TabsContent value="email" className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">To:</label>
              <Input value={`${recipientName} <${recipientEmail}>`} disabled className="bg-slate-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subject:</label>
              <Input
                placeholder="Email subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Message:</label>
              <Textarea
                placeholder="Type your message here..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleSendEmail} 
              disabled={sending} 
              className="w-full bg-orange-600 hover:bg-orange-700"
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
          </TabsContent>
        )}

        {hasPhone && (
          <TabsContent value="sms" className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">To:</label>
              <Input value={phoneNumber} disabled className="bg-slate-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Message:</label>
              <Textarea
                placeholder="Type your message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleSendSMS} 
              disabled={sending || !smsMessage.trim()} 
              className={`w-full ${smsColor} hover:${smsColor.replace('600', '700')}`}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS
                </>
              )}
            </Button>

            {/* SMS History */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Conversation History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSmsHistory}
                  disabled={loadingHistory}
                  className="text-xs"
                >
                  {loadingHistory ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : smsHistory.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {smsHistory.map((msg, idx) => {
                    const isOutbound = msg.direction === 'outbound';
                    const senderName = isOutbound ? 'You' : (msg.senderName || recipientName);
                    return (
                      <div key={idx} className={`p-3 rounded-lg text-sm ${
                        isOutbound
                          ? 'bg-blue-50 border border-blue-200 ml-6' 
                          : 'bg-slate-50 border border-slate-200 mr-6'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {isOutbound ? (
                            <>
                              <ArrowUp className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-blue-900">Sent</span>
                              {msg.status && getStatusIcon(msg.status)}
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-3 h-3 text-slate-600 flex-shrink-0" />
                              <span className="font-medium text-slate-900">Received</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-start justify-between">
                          <span className={`text-xs font-medium ${isOutbound ? 'text-blue-600' : 'text-slate-600'}`}>
                            {senderName}
                          </span>
                          <span className="text-xs text-slate-500">{formatDate(msg.date)}</span>
                        </div>
                        <p className="text-slate-700 mt-2">{msg.body}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}