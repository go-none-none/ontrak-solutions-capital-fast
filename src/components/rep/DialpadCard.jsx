import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Phone, Send, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function DialpadCard({ phoneNumber, contactName, session }) {
  const [messages, setMessages] = useState([]);
  const [calls, setCalls] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('sms');
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && phoneNumber) {
      loadMessages();
      loadCalls();
    }
  }, [isConnected, phoneNumber]);

  const checkConnection = async () => {
    try {
      const response = await base44.functions.invoke('dialpadManagement', {
        action: 'checkConnection',
        sfUserId: session.userId
      });
      setIsConnected(response.data.connected || false);
    } catch (error) {
      console.error('Check connection error:', error);
      setIsConnected(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await base44.functions.invoke('dialpadManagement', {
        action: 'connect',
        sfUserId: session.userId
      });
      
      if (response.data.authUrl) {
        const authWindow = window.open(response.data.authUrl, '_blank', 'width=600,height=700');
        
        // Poll for connection
        const checkInterval = setInterval(async () => {
          await checkConnection();
          if (isConnected) {
            clearInterval(checkInterval);
            if (authWindow) authWindow.close();
            setConnecting(false);
          }
        }, 2000);

        setTimeout(() => {
          clearInterval(checkInterval);
          setConnecting(false);
        }, 60000);
      }
    } catch (error) {
      console.error('Connect error:', error);
      setConnecting(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('dialpadManagement', {
        action: 'getMessages',
        phoneNumber: phoneNumber,
        sfUserId: session.userId
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalls = async () => {
    try {
      const response = await base44.functions.invoke('dialpadManagement', {
        action: 'getCalls',
        phoneNumber: phoneNumber,
        sfUserId: session.userId
      });
      setCalls(response.data.calls || []);
    } catch (error) {
      console.error('Load calls error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await base44.functions.invoke('dialpadManagement', {
        action: 'sendMessage',
        phoneNumber: phoneNumber,
        message: newMessage,
        sfUserId: session.userId
      });
      
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCall = () => {
    const deepLink = `dialpad://call?number=${encodeURIComponent(phoneNumber)}`;
    window.location.href = deepLink;
    
    setTimeout(() => {
      loadCalls();
    }, 5000);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Dialpad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">Connect Dialpad to send SMS and view call history</p>
            <Button onClick={handleConnect} disabled={connecting} className="bg-purple-600">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Connect Dialpad
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Dialpad - {contactName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
          </TabsList>

          <TabsContent value="sms" className="space-y-4">
            <div className="flex justify-between items-center">
              <Button size="sm" variant="outline" onClick={loadMessages}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleCall} className="bg-green-600">
                <Phone className="w-4 h-4 mr-2" />
                Call via Dialpad App
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.direction === 'outbound'
                        ? 'bg-purple-100 ml-8'
                        : 'bg-slate-100 mr-8'
                    }`}
                  >
                    <p className="text-sm text-slate-900">{msg.text}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(msg.date_created), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No messages</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={sending} className="bg-purple-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="space-y-3">
            <Button size="sm" variant="outline" onClick={loadCalls}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {calls.map((call, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className={`w-4 h-4 ${call.direction === 'outbound' ? 'text-green-600' : 'text-blue-600'}`} />
                      <div>
                        <p className="font-medium text-sm">{call.direction === 'outbound' ? 'Outbound' : 'Inbound'}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(call.start_time), 'MMM d, h:mm a')} • {call.duration}s
                        </p>
                      </div>
                    </div>
                    {call.disposition && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {call.disposition}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {calls.length === 0 && (
                <p className="text-center text-slate-500 py-8">No call history</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}