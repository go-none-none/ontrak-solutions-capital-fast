import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, X, Minimize2, Maximize2, User, Building, Loader2, PhoneCall, AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function MiniDialer({ session }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loadingClientId, setLoadingClientId] = useState(true);
  
  // Dialpad State
  const [dialpadClientId, setDialpadClientId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialpadUserId, setDialpadUserId] = useState(null);
  
  // Salesforce Data State
  const [matchedRecord, setMatchedRecord] = useState(null);
  const [multipleMatches, setMultipleMatches] = useState([]);
  const [showMatchSelection, setShowMatchSelection] = useState(false);
  const [searchingRecord, setSearchingRecord] = useState(false);
  
  // Manual Dial
  const [manualNumber, setManualNumber] = useState('');

  // 1. Setup CTI - Get Client ID
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await base44.functions.invoke('getDialpadClientId');
        if (response.data?.clientId) {
          setDialpadClientId(response.data.clientId);
        } else {
          console.warn("Dialpad Client ID not found.");
        }
      } catch (error) {
        console.error("Failed to fetch Dialpad Client ID:", error);
      } finally {
        setLoadingClientId(false);
      }
    };
    fetchClientId();
  }, []);

  // 2. Message Listener (Incoming from Dialpad)
  useEffect(() => {
    const handleMessage = async (event) => {
      // Security check: Allowed Origins
      if (event.origin !== 'https://dialpad.com') return;
      
      const message = event.data;
      if (!message || message.api !== 'opencti_dialpad' || message.version !== '1.0') return;

      console.log('[Dialpad CTI Event]', message.method, message.payload);

      switch (message.method) {
        case 'user_authentication':
          setIsAuthenticated(message.payload?.user_authenticated || false);
          setDialpadUserId(message.payload?.user_id || null);
          break;
          
        case 'call_ringing':
          if (message.payload?.state === 'on') {
            // Auto-open dialer
            if (!isOpen) setIsOpen(true);
            
            // Screen Pop logic
            const incomingNumber = message.payload.external_number; // E.164
            if (incomingNumber) {
              await searchRecords(incomingNumber);
            }
          }
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, session]); // Dependencies for searchRecords context if needed

  // 3. Enable Current Tab (Outgoing to Dialpad)
  // This should be called when the iframe loads or when the dialer is opened
  useEffect(() => {
    if (isOpen && dialpadClientId && iframeRef.current) {
      // Give the iframe a moment to be ready in the DOM
      const timer = setTimeout(() => {
        postToDialpad('enable_current_tab');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dialpadClientId]);

  // Helper to send messages to Dialpad
  const postToDialpad = (method, payload = null) => {
    if (iframeRef.current?.contentWindow) {
      const message = {
        api: 'opencti_dialpad',
        version: '1.0',
        method: method
      };
      if (payload) {
        message.payload = payload;
      }
      
      console.log('[Dialpad CTI Send]', method, payload);
      iframeRef.current.contentWindow.postMessage(message, 'https://dialpad.com');
    }
  };

  // 4. Initiate Call (Outgoing to Dialpad)
  const initiateCall = (phoneNumber) => {
    if (!phoneNumber) return;
    
    // Clean and ensure E.164 format roughly (Dialpad expects E.164)
    // Assuming US numbers for simplicity if no + prefix, but standardizing is safer
    let formattedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (!formattedNumber.startsWith('+') && formattedNumber.startsWith('1')) {
      formattedNumber = '+' + formattedNumber;
    } else if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+1' + formattedNumber; // Default to US +1
    }

    // Search for record first (Screen Pop for outbound)
    searchRecords(formattedNumber);

    postToDialpad('initiate_call', {
      enable_current_tab: true,
      phone_number: formattedNumber
      // custom_data: '...' // Optional
    });
  };

  // Salesforce Record Matching
  const searchRecords = async (phoneNumber) => {
    if (!phoneNumber || !session) return;
    
    setSearchingRecord(true);
    // Clear previous matches while searching
    setMatchedRecord(null); 
    setMultipleMatches([]);
    setShowMatchSelection(false);

    try {
      const cleanNumber = phoneNumber.replace(/[^\d]/g, ''); // Digits only for backend search
      const response = await base44.functions.invoke('matchPhoneToRecord', {
        phoneNumber: cleanNumber,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      const matches = response.data?.matches || [];

      if (matches.length === 1) {
        setMatchedRecord(matches[0]);
      } else if (matches.length > 1) {
        setMultipleMatches(matches);
        setShowMatchSelection(true);
      }
    } catch (error) {
      console.error('Record search failed:', error);
    } finally {
      setSearchingRecord(false);
    }
  };

  // Navigation / Screen Pop
  const handleScreenPop = (record) => {
    if (record.type === 'Lead') {
      navigate(createPageUrl('LeadDetail') + `?id=${record.Id}`);
    } else if (record.type === 'Opportunity') {
      navigate(createPageUrl('OpportunityDetail') + `?id=${record.Id}`);
    } else if (record.type === 'Contact') {
       // navigate(createPageUrl('ContactDetail') + `?id=${record.Id}`);
       console.log("Navigating to contact", record);
    }
    // Close match selection if it was open
    setShowMatchSelection(false);
  };

  const handleManualDial = () => {
    if (manualNumber) {
      initiateCall(manualNumber);
      setManualNumber('');
    }
  };

  // --- Render Helpers ---

  if (loadingClientId) return null; // Or a small loading indicator

  return (
    <>
      {/* 1. Minimized / Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#08708E] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#065a72] transition-colors"
        >
          <Phone className="w-6 h-6" />
        </motion.button>
      )}

      {/* 2. Main CTI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? 'w-72' : 'w-[400px]' // Width matching typical CTI
            }`}
          >
            {/* Header */}
            <div className="bg-[#08708E] p-3 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-semibold text-sm">Dialpad</span>
                {isAuthenticated && (
                  <div className="w-2 h-2 rounded-full bg-green-400" title="Connected" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Minimized Content */}
            {isMinimized ? (
              <div className="p-4 text-center bg-slate-50">
                <p className="text-sm text-slate-600">
                  {isAuthenticated ? 'Ready to make calls' : 'Please log in'}
                </p>
              </div>
            ) : (
              // Expanded Content
              <div className="flex flex-col h-[600px]"> {/* Fixed height for CTI */}
                
                {/* A. Not Configured Warning */}
                {!dialpadClientId && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
                    <p className="text-sm text-slate-700 font-medium">Configuration Missing</p>
                    <p className="text-xs text-slate-500 mt-1">DIALPAD_CLIENT_ID secret is not set.</p>
                  </div>
                )}

                {/* B. Main Interface */}
                {dialpadClientId && (
                  <>
                    {/* B1. Matched Record Banner (Screen Pop) */}
                    {matchedRecord && (
                      <div className="bg-green-50 border-b border-green-200 p-3 shrink-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
                            Matched Record
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleScreenPop(matchedRecord)}
                          >
                            View Record
                          </Button>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                             {matchedRecord.type === 'Lead' ? <User className="w-4 h-4 text-green-700"/> : <Building className="w-4 h-4 text-green-700"/>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">{matchedRecord.Name}</p>
                            <p className="text-xs text-slate-600 truncate">{matchedRecord.Company || matchedRecord.Account?.Name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* B2. Searching Indicator */}
                    {searchingRecord && (
                      <div className="bg-blue-50 p-2 text-center border-b border-blue-100">
                        <span className="text-xs text-blue-600 flex items-center justify-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Looking up record...
                        </span>
                      </div>
                    )}

                    {/* B3. Manual Dial Input */}
                    <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Phone number..." 
                          className="h-9 text-sm bg-white"
                          value={manualNumber}
                          onChange={(e) => setManualNumber(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualDial()}
                        />
                        <Button 
                          size="sm" 
                          className="h-9 px-3 bg-[#08708E] hover:bg-[#065a72]"
                          onClick={handleManualDial}
                          disabled={!manualNumber}
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* B4. The Iframe */}
                    <div className="flex-1 bg-white relative">
                      <iframe
                        ref={iframeRef}
                        src={`https://dialpad.com/apps/${dialpadClientId}`}
                        title="Dialpad"
                        allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
                        sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
                        frameBorder="0"
                        className="w-full h-full absolute inset-0"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Multiple Matches Selection Modal */}
      <AnimatePresence>
        {showMatchSelection && multipleMatches.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg max-w-sm w-full overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Multiple Records Found</h3>
                <p className="text-xs text-slate-500">Select which record is calling</p>
              </div>
              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                {multipleMatches.map((record) => (
                  <button
                    key={record.Id}
                    onClick={() => handleScreenPop(record)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {record.type === 'Lead' ? <User className="w-4 h-4 text-slate-500"/> : <Building className="w-4 h-4 text-slate-500"/>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{record.Name}</p>
                      <p className="text-xs text-slate-500 truncate">{record.Company || record.Account?.Name}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
                <Button variant="ghost" size="sm" onClick={() => setShowMatchSelection(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}