import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, X, Minimize2, Maximize2, User, Building, Loader2, PhoneCall, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: Replace this with your actual Dialpad Client ID provided by Dialpad team
const DIALPAD_CLIENT_ID = 'YOUR_DIALPAD_CLIENT_ID';

export default function MiniDialer({ session }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialpadUserId, setDialpadUserId] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  
  // Record matching
  const [matchedRecord, setMatchedRecord] = useState(null);
  const [multipleMatches, setMultipleMatches] = useState([]);
  const [showMatchSelection, setShowMatchSelection] = useState(false);
  const [searchingRecord, setSearchingRecord] = useState(false);
  
  // Manual dial
  const [manualNumber, setManualNumber] = useState('');

  // Listen for messages from Dialpad iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      // Accept messages from Dialpad
      if (event.origin !== 'https://dialpad.com') return;
      
      const message = event.data;
      if (!message || message.api !== 'opencti_dialpad' || message.version !== '1.0') return;

      console.log('Dialpad Message:', message);

      // Handle authentication status
      if (message.method === 'user_authentication') {
        setIsAuthenticated(message.payload?.user_authenticated || false);
        setDialpadUserId(message.payload?.user_id || null);
        console.log('Dialpad auth state:', message.payload);
      }

      // Handle incoming call ringing
      if (message.method === 'call_ringing' && message.payload?.state === 'on') {
        const phoneNumber = message.payload.external_number;
        console.log('Incoming call from:', phoneNumber);
        
        // Auto-open dialer on incoming call
        if (!isOpen) {
          setIsOpen(true);
        }
        
        // Search for matching record
        if (phoneNumber) {
          await searchRecords(phoneNumber);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, session]);

  // Enable current tab when iframe loads
  const enableCurrentTab = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          api: 'opencti_dialpad',
          version: '1.0',
          method: 'enable_current_tab'
        }, 'https://dialpad.com');
        console.log('Sent enable_current_tab to Dialpad');
      } catch (error) {
        console.error('Error enabling current tab:', error);
      }
    }
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
    // Give the iframe a moment to initialize, then enable the tab
    setTimeout(enableCurrentTab, 1500);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  // Search for matching records in Salesforce
  const searchRecords = async (phoneNumber) => {
    if (!phoneNumber || !session) return;
    
    setSearchingRecord(true);
    try {
      // Clean the phone number
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      const response = await base44.functions.invoke('matchPhoneToRecord', {
        phoneNumber: cleanNumber,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      if (response.data?.matches && response.data.matches.length > 0) {
        if (response.data.matches.length === 1) {
          setMatchedRecord(response.data.matches[0]);
          setMultipleMatches([]);
          setShowMatchSelection(false);
        } else {
          setMultipleMatches(response.data.matches);
          setMatchedRecord(null);
          setShowMatchSelection(true);
        }
      } else {
        setMatchedRecord(null);
        setMultipleMatches([]);
      }
    } catch (error) {
      console.error('Record search error:', error);
      setMatchedRecord(null);
      setMultipleMatches([]);
    } finally {
      setSearchingRecord(false);
    }
  };

  // Initiate call through Dialpad iframe
  const initiateCall = (phoneNumber) => {
    if (!iframeRef.current?.contentWindow || !phoneNumber) return;
    
    // Clean and format the phone number to E.164
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.startsWith('1') ? `+${cleanNumber}` : `+1${cleanNumber}`;
    }
    
    console.log('Initiating call to:', cleanNumber);
    
    // Search for matching record
    searchRecords(cleanNumber);
    
    // Send message to Dialpad iframe
    try {
      iframeRef.current.contentWindow.postMessage({
        api: 'opencti_dialpad',
        version: '1.0',
        method: 'initiate_call',
        payload: {
          enable_current_tab: true,
          phone_number: cleanNumber
        }
      }, 'https://dialpad.com');
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  // Handle manual dial
  const handleManualDial = () => {
    if (manualNumber.trim()) {
      initiateCall(manualNumber);
      setManualNumber('');
    }
  };

  // Navigate to matched record
  const handleScreenPop = (record) => {
    if (record.type === 'Lead') {
      navigate(createPageUrl('LeadDetail') + `?id=${record.Id}`);
    } else if (record.type === 'Opportunity') {
      navigate(createPageUrl('OpportunityDetail') + `?id=${record.Id}`);
    } else if (record.type === 'Contact') {
      // Handle Contact if needed
      console.log('Contact record:', record);
    }
    setShowMatchSelection(false);
  };

  // Clear matched record
  const clearMatchedRecord = () => {
    setMatchedRecord(null);
    setMultipleMatches([]);
    setShowMatchSelection(false);
  };

  // Check if client ID is configured
  const isConfigured = DIALPAD_CLIENT_ID && DIALPAD_CLIENT_ID !== 'YOUR_DIALPAD_CLIENT_ID';

  return (
    <>
      {/* Floating Phone Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-full shadow-lg flex items-center justify-center text-white"
        >
          <Phone className="w-6 h-6" />
        </motion.button>
      )}

      {/* Mini Dialer Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80' : 'w-[420px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#08708E] to-[#065a72] p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="font-semibold text-sm">Dialpad CTI</span>
              {isAuthenticated && (
                <span className="text-xs bg-green-500/30 text-green-100 px-2 py-0.5 rounded-full">
                  Connected
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimized State */}
          {isMinimized && (
            <div className="p-4">
              <p className="text-sm text-slate-600 text-center">
                {isAuthenticated ? '✓ Dialpad Connected' : 'Click expand to use Dialpad'}
              </p>
            </div>
          )}

          {/* Expanded Content */}
          {!isMinimized && (
            <div className="relative">
              {/* Not Configured Warning */}
              {!isConfigured && (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Dialpad Not Configured</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Please update the <code className="bg-slate-100 px-1 rounded">DIALPAD_CLIENT_ID</code> in the MiniDialer component with your Dialpad Client ID.
                  </p>
                  <p className="text-xs text-slate-500">
                    Contact Dialpad support to get your CTI Client ID.
                  </p>
                </div>
              )}

              {/* Configured State */}
              {isConfigured && (
                <>
                  {/* Matched Record Banner */}
                  <AnimatePresence>
                    {matchedRecord && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-green-50 border-b border-green-200 overflow-hidden"
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                              Matched Record
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleScreenPop(matchedRecord)}
                                className="h-6 text-xs text-green-700 hover:bg-green-100"
                              >
                                Open →
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearMatchedRecord}
                                className="h-6 w-6 p-0 text-green-700 hover:bg-green-100"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                              {matchedRecord.type === 'Lead' ? (
                                <User className="w-4 h-4 text-green-700" />
                              ) : (
                                <Building className="w-4 h-4 text-green-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{matchedRecord.Name}</p>
                              <p className="text-sm text-slate-600 truncate">
                                {matchedRecord.Company || matchedRecord.Account?.Name || matchedRecord.Email}
                              </p>
                              <span className="inline-block text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded mt-1">
                                {matchedRecord.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Searching indicator */}
                  {searchingRecord && (
                    <div className="bg-blue-50 border-b border-blue-200 p-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-xs text-blue-700">Searching records...</span>
                    </div>
                  )}

                  {/* Quick Dial Input */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter phone number..."
                        value={manualNumber}
                        onChange={(e) => setManualNumber(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualDial()}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleManualDial}
                        disabled={!manualNumber.trim()}
                        className="bg-[#08708E] hover:bg-[#065a72] h-9 px-3"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Dialpad iframe */}
                  <div className="relative" style={{ height: '480px' }}>
                    {!iframeLoaded && !iframeError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-[#08708E] mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Loading Dialpad...</p>
                        </div>
                      </div>
                    )}
                    
                    {iframeError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <div className="text-center p-4">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Failed to load Dialpad</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIframeError(false);
                              setIframeLoaded(false);
                            }}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}

                    <iframe
                      ref={iframeRef}
                      src={`https://dialpad.com/apps/${DIALPAD_CLIENT_ID}`}
                      title="Dialpad CTI"
                      allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
                      sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      className="w-full h-full border-0"
                      style={{ 
                        visibility: iframeLoaded ? 'visible' : 'hidden',
                        minHeight: '480px'
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Multiple Matches Selection Modal */}
      <AnimatePresence>
        {showMatchSelection && multipleMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowMatchSelection(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Multiple Matches Found</h3>
              <p className="text-sm text-slate-600 mb-4">Select a record to view:</p>
              
              <div className="space-y-2">
                {multipleMatches.map((record, idx) => (
                  <button
                    key={record.Id || idx}
                    onClick={() => {
                      setMatchedRecord(record);
                      handleScreenPop(record);
                    }}
                    className="w-full text-left p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-[#08708E] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {record.type === 'Lead' ? (
                          <User className="w-5 h-5 text-slate-600" />
                        ) : (
                          <Building className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{record.Name}</p>
                        <p className="text-sm text-slate-600 truncate">
                          {record.Company || record.Account?.Name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {record.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {record.Phone || record.MobilePhone}
                          </span>
                        </div>
                      </div>
                    </div>
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