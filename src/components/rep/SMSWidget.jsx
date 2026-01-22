import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SMSWidget({ phoneNumber, recipientName, session, onMessageSent, color = 'bg-blue-600' }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [smsHistory, setSmsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (phoneNumber && session) {
      loadSmsHistory();
    }
  }, [phoneNumber, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [smsHistory]);

  const loadSmsHistory = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getTwilioSmsHistory', { phoneNumber, token: session?.token, instanceUrl: session?.instanceUrl });
      setSmsHistory(response.data.messages || []);
    } catch (error) {
      console.error('Error loading SMS history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!message.trim() || !phoneNumber) return;

    setSending(true);
    try {
      const response = await base44.functions.invoke('sendTwilioSMS', { to: phoneNumber, message: message.trim(), token: session?.token, instanceUrl: session?.instanceUrl });
      
      if (response.data.success) {
        setSmsHistory(prev => [...prev, { body: message, from_number: '+1...', to: phoneNumber, date_sent: new Date().toISOString(), status: 'sent' }]);
        setMessage('');
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  if (!phoneNumber) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <AlertCircle className="w-5 h-5" />
          No phone number available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-96">
      <div className={`${color} text-white p-4 flex items-center gap-2`}>
        <MessageSquare className="w-5 h-5" />
        <div>
          <p className="font-semibold text-sm">SMS</p>
          <p className="text-xs opacity-90">{phoneNumber}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : smsHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No messages yet
          </div>
        ) : (
          <>
            {smsHistory.map((msg, idx) => {
              const isOutgoing = msg.from_number?.includes('+1');
              return (
                <div key={idx} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isOutgoing ? `${color} text-white` : 'bg-white text-slate-900 border border-slate-200'}`}>
                    <p className="break-words">{msg.body}</p>
                    <p className={`text-xs mt-1 ${isOutgoing ? 'opacity-75' : 'text-slate-500'}`}>
                      {new Date(msg.date_sent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendSms} className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <Input
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          className="text-sm"
        />
        <Button
          type="submit"
          disabled={sending || !message.trim()}
          className={`${color} hover:opacity-90 flex-shrink-0`}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}