import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SMSWidget({ phoneNumber, recordId, recordType, session, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (showChat && phoneNumber) {
      loadMessages();
    }
  }, [showChat, phoneNumber]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('dialpadGetSMS', {
        phoneNumber
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await base44.functions.invoke('dialpadSendSMS', {
        phoneNumber,
        message: newMessage,
        recordId,
        recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setNewMessage('');
      loadMessages();
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!showChat) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 shadow-sm text-white">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">SMS</h3>
        </div>
        
        {phoneNumber ? (
          <>
            <p className="text-white/80 text-sm mb-4">{phoneNumber}</p>
            <Button
              onClick={() => setShowChat(true)}
              className="w-full bg-white text-purple-600 hover:bg-white/90"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Open SMS
            </Button>
          </>
        ) : (
          <p className="text-white/60 text-sm">No phone number available</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-slate-900">SMS</h3>
          <p className="text-xs text-slate-600">{phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadMessages}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(false)}
          >
            Close
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.direction === 'outbound'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.direction === 'outbound' ? 'text-white/70' : 'text-slate-500'
                  }`}>
                    {new Date(msg.date_created).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}