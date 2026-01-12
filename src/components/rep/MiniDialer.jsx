import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Phone, X, Minimize2, Maximize2, User, Building } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function MiniDialer({ session }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [matchedRecord, setMatchedRecord] = useState(null);
  const [multipleMatches, setMultipleMatches] = useState([]);
  const [showMatchSelection, setShowMatchSelection] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialpadUserId, setDialpadUserId] = useState(null);
  const [dialpadClientId, setDialpadClientId] = useState(null);

  // Listen for messages from Dialpad iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== 'https://dialpad.com') return;
      
      const message = event.data;
      if (message.api !== 'opencti_dialpad' || message.version !== '1.0') return;

      // Handle authentication status
      if (message.method === 'user_authentication') {
        setIsAuthenticated(message.payload.user_authenticated);
        setDialpadUserId(message.payload.user_id);
      }

      // Handle incoming call
      if (message.method === 'call_ringing' && message.payload.state === 'on') {
        const phoneNumber = message.payload.external_number;
        await searchRecords(phoneNumber);
        
        // Auto-open dialer on incoming call
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  // Load Dialpad client ID
  useEffect(() => {
    const loadClientId = async () => {
      try {
        const response = await base44.functions.invoke('getDialpadClientId');
        setDialpadClientId(response.data.clientId);
      } catch (error) {
        console.error('Failed to load Dialpad client ID:', error);
      }
    };
    loadClientId();
  }, []);

  // Enable current tab on load
  useEffect(() => {
    if (iframeRef.current && isOpen && dialpadClientId) {
      setTimeout(() => {
        iframeRef.current.contentWindow.postMessage({
          api: 'opencti_dialpad',
          version: '1.0',
          method: 'enable_current_tab'
        }, 'https://dialpad.com');
      }, 1000);
    }
  }, [isOpen, dialpadClientId]);

  // Search for matching records
  const searchRecords = async (phoneNumber) => {
    if (!phoneNumber) return;
    
    try {
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
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
    }
  };

  // Initiate call through Dialpad iframe
  const handleInitiateCall = (phoneNumber) => {
    if (!iframeRef.current) return;
    
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    const formattedNumber = cleanNumber.startsWith('1') ? `+${cleanNumber}` : `+1${cleanNumber}`;
    
    // Search for matching record
    searchRecords(formattedNumber);
    
    // Send message to Dialpad iframe
    iframeRef.current.contentWindow.postMessage({
      api: 'opencti_dialpad',
      version: '1.0',
      method: 'initiate_call',
      payload: {
        enable_current_tab: true,
        phone_number: formattedNumber
      }
    }, 'https://dialpad.com');
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

  return (
    <>
      {!isOpen ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <Phone className="w-6 h-6" />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden ${
            isMinimized ? 'w-80' : 'w-[450px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#08708E] to-[#065a72] p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">Dialpad CTI</span>
              {isAuthenticated && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Connected</span>
              )}
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
            <div className="relative">
              {/* Matched Record Screen Pop */}
              {matchedRecord && (
                <div className="absolute top-0 left-0 right-0 bg-green-50 border-b-2 border-green-200 p-3 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-green-700">MATCHED RECORD</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleScreenPop(matchedRecord)}
                      className="h-6 text-xs hover:bg-green-100"
                    >
                      Open Record →
                    </Button>
                  </div>
                  <div className="flex items-start gap-2">
                    {matchedRecord.type === 'Lead' ? (
                      <User className="w-4 h-4 text-slate-600 mt-0.5" />
                    ) : (
                      <Building className="w-4 h-4 text-slate-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{matchedRecord.Name}</p>
                      <p className="text-sm text-slate-600 truncate">
                        {matchedRecord.Company || matchedRecord.Account?.Name}
                      </p>
                      <p className="text-xs text-slate-500">{matchedRecord.type}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dialpad iframe */}
              {dialpadClientId ? (
                <iframe
                  ref={iframeRef}
                  src={`https://dialpad.com/apps/${dialpadClientId}`}
                  title="Dialpad CTI"
                  allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
                  sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
                  className={`w-full border-0 ${matchedRecord ? 'mt-[120px]' : ''}`}
                  style={{ height: '550px' }}
                />
              ) : (
                <div className="flex items-center justify-center" style={{ height: '550px' }}>
                  <p className="text-slate-500">Loading Dialpad...</p>
                </div>
              )}
            </div>
          )}

          {isMinimized && (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-600">
                {isAuthenticated ? 'Dialpad Connected' : 'Click to expand'}
              </p>
            </div>
          )}
          </motion.div>
          )}

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