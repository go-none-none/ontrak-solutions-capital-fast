import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, X, Minimize2, Maximize2, PhoneCall, MessageSquare, 
  User, Building, Clock, Loader2, PhoneOff, Send, Search
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function MiniDialer({ session }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('dialer'); // dialer, sms, history
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [matchedRecord, setMatchedRecord] = useState(null);
  const [multipleMatches, setMultipleMatches] = useState([]);
  const [showMatchSelection, setShowMatchSelection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [smsHistory, setSmsHistory] = useState([]);
  const [dispositions, setDispositions] = useState([]);
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [showDisposition, setShowDisposition] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Check Dialpad connection
  const checkConnection = async () => {
    try {
      const response = await base44.functions.invoke('dialpadOAuth', {
        action: 'checkConnection'
      });
      setIsConnected(response.data.connected || false);
    } catch (error) {
      console.error('Check connection error:', error);
      setIsConnected(false);
    }
  };

  // Connect to Dialpad
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await base44.functions.invoke('dialpadOAuth', {
        action: 'getAuthUrl'
      });
      
      if (response.data.authUrl) {
        const authWindow = window.open(response.data.authUrl, 'dialpad-auth', 'width=600,height=700');
        
        // Poll for connection
        const checkInterval = setInterval(async () => {
          try {
            const connResponse = await base44.functions.invoke('dialpadOAuth', {
              action: 'checkConnection'
            });
            
            if (connResponse.data.connected) {
              clearInterval(checkInterval);
              setIsConnected(true);
              setConnecting(false);
              if (authWindow) authWindow.close();
            }
          } catch (error) {
            console.error('Poll error:', error);
          }
        }, 2000);

        // Stop polling after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          setConnecting(false);
        }, 120000);
      }
    } catch (error) {
      console.error('Connect error:', error);
      setConnecting(false);
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneInput = (value) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  // Search for matching records
  const searchRecords = async (number) => {
    if (!number) return;
    
    setLoading(true);
    try {
      const cleanNumber = number.replace(/\D/g, '');
      const response = await base44.functions.invoke('matchPhoneToRecord', {
        phoneNumber: cleanNumber,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (response.data.matches && response.data.matches.length > 0) {
        if (response.data.matches.length === 1) {
          setMatchedRecord(response.data.matches[0]);
          setMultipleMatches([]);
        } else {
          setMultipleMatches(response.data.matches);
          setShowMatchSelection(true);
        }
      } else {
        setMatchedRecord(null);
        setMultipleMatches([]);
      }
    } catch (error) {
      console.error('Record search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Make call
  const handleCall = async () => {
    if (!phoneNumber) return;

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    await searchRecords(cleanNumber);

    // Launch Dialpad
    const formattedNumber = cleanNumber.startsWith('1') ? `+${cleanNumber}` : `+1${cleanNumber}`;
    window.open(`dialpad://call/${formattedNumber}`, '_blank');
    
    setInCall(true);
    setCallDuration(0);
    
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Store timer ID
    window.callTimer = timer;
  };

  // End call
  const handleEndCall = () => {
    if (window.callTimer) {
      clearInterval(window.callTimer);
    }
    setInCall(false);
    setShowDisposition(true);
    loadDispositions();
  };

  // Load dispositions
  const loadDispositions = async () => {
    try {
      const response = await base44.functions.invoke('dialpadCalls', {
        action: 'getDispositions'
      });
      setDispositions(response.data.dispositions || []);
    } catch (error) {
      console.error('Load dispositions error:', error);
    }
  };

  // Save call log
  const handleSaveCallLog = async () => {
    if (!selectedDisposition || !matchedRecord) {
      alert('Please select a disposition');
      return;
    }

    try {
      await base44.functions.invoke('createSalesforceActivity', {
        recordId: matchedRecord.Id,
        recordType: matchedRecord.type,
        subject: `Call - ${selectedDisposition}`,
        description: callNotes,
        activityType: 'Task',
        status: 'Completed',
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setShowDisposition(false);
      setSelectedDisposition('');
      setCallNotes('');
      setCallDuration(0);
      alert('Call logged successfully');
    } catch (error) {
      console.error('Save call log error:', error);
      alert('Failed to save call log');
    }
  };

  // Send SMS
  const handleSendSMS = async () => {
    if (!phoneNumber || !smsMessage) {
      alert('Please enter phone number and message');
      return;
    }

    setLoading(true);
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      await base44.functions.invoke('dialpadAPI', {
        action: 'sendMessage',
        phoneNumber: `+1${cleanNumber}`,
        message: smsMessage
      });

      setSmsMessage('');
      alert('Message sent');
      loadSMSHistory(phoneNumber);
    } catch (error) {
      console.error('SMS error:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Load SMS history
  const loadSMSHistory = async (number) => {
    try {
      const cleanNumber = number.replace(/\D/g, '');
      const response = await base44.functions.invoke('dialpadAPI', {
        action: 'getMessages',
        phoneNumber: `+1${cleanNumber}`
      });
      setSmsHistory(response.data.messages || []);
    } catch (error) {
      console.error('Load SMS error:', error);
    }
  };

  // Load call history
  const loadCallHistory = async () => {
    try {
      const response = await base44.functions.invoke('dialpadCalls', {
        action: 'getCallHistory'
      });
      setCallHistory(response.data.calls || []);
    } catch (error) {
      console.error('Load calls error:', error);
    }
  };

  // Screen pop for matched record
  const handleScreenPop = (record) => {
    if (record.type === 'Lead') {
      navigate(createPageUrl('LeadDetail') + `?id=${record.Id}`);
    } else if (record.type === 'Opportunity') {
      navigate(createPageUrl('OpportunityDetail') + `?id=${record.Id}`);
    }
    setShowMatchSelection(false);
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && activeTab === 'history') {
      loadCallHistory();
    }
  }, [activeTab, isConnected]);

  useEffect(() => {
    if (isConnected && activeTab === 'sms' && phoneNumber) {
      loadSMSHistory(phoneNumber);
    }
  }, [activeTab, phoneNumber, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.callTimer) {
        clearInterval(window.callTimer);
      }
    };
  }, []);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
      >
        <Phone className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed ${isMinimized ? 'bottom-6 left-6' : 'bottom-6 left-6'} z-50 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 ${
          isMinimized ? 'w-80' : 'w-96'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#08708E] to-[#065a72] p-4 rounded-t-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Dialpad CTI</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="max-h-[600px] overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('dialer')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'dialer'
                    ? 'text-[#08708E] border-b-2 border-[#08708E]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PhoneCall className="w-4 h-4 inline mr-1" />
                Dialer
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'sms'
                    ? 'text-[#08708E] border-b-2 border-[#08708E]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                SMS
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-[#08708E] border-b-2 border-[#08708E]'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                History
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Connect Dialpad</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Connect your Dialpad account to make calls and send SMS
                  </p>
                  <Button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="bg-[#08708E] hover:bg-[#065a72]"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Dialpad'
                    )}
                  </Button>
                </div>
              ) : activeTab === 'dialer' && (
                <div className="space-y-4">
                  {showDisposition ? (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900">Call Disposition</h3>
                      <Select value={selectedDisposition} onValueChange={setSelectedDisposition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select disposition" />
                        </SelectTrigger>
                        <SelectContent>
                          {dispositions.map((disp) => (
                            <SelectItem key={disp.id} value={disp.name}>
                              {disp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Call notes..."
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveCallLog} className="flex-1 bg-[#08708E]">
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDisposition(false);
                            setSelectedDisposition('');
                            setCallNotes('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : inCall ? (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <PhoneCall className="w-10 h-10 text-green-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{formatDuration(callDuration)}</p>
                        <p className="text-slate-600">{phoneNumber}</p>
                      </div>
                      {matchedRecord && (
                        <div className="bg-slate-50 rounded-lg p-3 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            {matchedRecord.type === 'Lead' ? (
                              <User className="w-4 h-4 text-slate-600" />
                            ) : (
                              <Building className="w-4 h-4 text-slate-600" />
                            )}
                            <span className="text-xs text-slate-500">{matchedRecord.type}</span>
                          </div>
                          <p className="font-semibold text-slate-900">{matchedRecord.Name}</p>
                          <p className="text-sm text-slate-600">{matchedRecord.Company || matchedRecord.Account?.Name}</p>
                        </div>
                      )}
                      <Button
                        onClick={handleEndCall}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        End Call
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneInput(e.target.value)}
                          className="text-lg"
                        />
                        <Button
                          onClick={() => searchRecords(phoneNumber)}
                          variant="outline"
                          size="sm"
                          disabled={loading || !phoneNumber}
                          className="w-full"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Search className="w-4 h-4 mr-2" />
                          )}
                          Search Records
                        </Button>
                      </div>

                      {matchedRecord && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-green-700">MATCHED RECORD</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleScreenPop(matchedRecord)}
                              className="h-6 text-xs"
                            >
                              View Details →
                            </Button>
                          </div>
                          <p className="font-semibold text-slate-900">{matchedRecord.Name}</p>
                          <p className="text-sm text-slate-600">{matchedRecord.Company || matchedRecord.Account?.Name}</p>
                          <p className="text-xs text-slate-500 mt-1">{matchedRecord.type}</p>
                        </div>
                      )}

                      <Button
                        onClick={handleCall}
                        disabled={!phoneNumber || loading}
                        className="w-full bg-[#08708E] hover:bg-[#065a72] h-12 text-lg"
                      >
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Call
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* SMS Tab */}
              {isConnected && activeTab === 'sms' && (
                <div className="space-y-4">
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                  />
                  
                  {smsHistory.length > 0 && (
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                      {smsHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded ${
                            msg.direction === 'outbound' ? 'bg-blue-50 ml-4' : 'bg-slate-50 mr-4'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                  </div>
                  <Button
                    onClick={handleSendSMS}
                    disabled={!phoneNumber || !smsMessage || loading}
                    className="w-full bg-[#08708E]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </div>
              )}

              {/* History Tab */}
              {isConnected && activeTab === 'history' && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {callHistory.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No call history</p>
                  ) : (
                    callHistory.slice(0, 20).map((call, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setPhoneNumber(call.external_number || call.target?.number || '')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{call.external_number || call.target?.number}</p>
                            <p className="text-xs text-slate-500">
                              {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} • {call.duration}s
                            </p>
                          </div>
                          <p className="text-xs text-slate-400">
                            {new Date(call.start_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isMinimized && (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-600">Dialpad CTI Minimized</p>
          </div>
        )}
      </motion.div>

      {/* Multiple Matches Modal */}
      <AnimatePresence>
        {showMatchSelection && multipleMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMatchSelection(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Multiple Matches Found</h3>
              <p className="text-sm text-slate-600 mb-4">Select a record to open:</p>
              <div className="space-y-2">
                {multipleMatches.map((record, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMatchedRecord(record);
                      handleScreenPop(record);
                    }}
                    className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{record.Name}</p>
                    <p className="text-sm text-slate-600">{record.Company || record.Account?.Name}</p>
                    <p className="text-xs text-slate-500 mt-1">{record.type} • {record.Phone || record.MobilePhone}</p>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowMatchSelection(false)}
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}