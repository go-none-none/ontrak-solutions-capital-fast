import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TwilioSMS({ phoneNumber, recordId, recordType, session }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSendSMS = async () => {
    if (!message.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a message');
      return;
    }

    setSending(true);
    setStatus(null);
    
    try {
      await base44.functions.invoke('sendTwilioSMS', {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        message: message.trim(),
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setStatus('success');
      setStatusMessage('SMS sent successfully');
      setMessage('');
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error('SMS error:', error);
      setStatus('error');
      setStatusMessage(error.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-sm text-white">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">Send SMS</h3>
      </div>
      <p className="text-white/80 text-sm mb-4">{phoneNumber}</p>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full p-3 rounded-lg text-slate-900 text-sm mb-3 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={sending}
      />

      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-100 text-sm mb-3">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-100 text-sm mb-3">
          <AlertCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      <Button
        onClick={handleSendSMS}
        disabled={sending || !message.trim()}
        className="w-full bg-white text-blue-700 hover:bg-white/90"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        Send SMS
      </Button>
    </div>
  );
}