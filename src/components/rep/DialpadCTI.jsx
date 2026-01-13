import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DialpadCTI({ clientId }) {
  const iframeRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for messages from Dialpad
    const handleMessage = (event) => {
      if (event.origin !== 'https://dialpad.com') return;
      
      const message = event.data;
      if (message.api === 'opencti_dialpad' && message.version === '1.0') {
        console.log('Dialpad message received:', message);
        
        if (message.method === 'user_authentication') {
          setIsAuthenticated(message.payload.user_authenticated);
          console.log('User authenticated:', message.payload.user_authenticated);
        } else if (message.method === 'call_ringing') {
          console.log('Call ringing:', message.payload);
          // Auto-expand when call is ringing
          if (message.payload.state === 'on') {
            setIsMinimized(false);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Enable the current tab once iframe is loaded
    if (iframeRef.current) {
      setTimeout(() => {
        iframeRef.current.contentWindow.postMessage({
          api: 'opencti_dialpad',
          version: '1.0',
          method: 'enable_current_tab'
        }, '*');
      }, 2000);
    }
  }, []);

  // Make initiateCall function available globally
  useEffect(() => {
    window.dialpadInitiateCall = (phoneNumber) => {
      if (iframeRef.current) {
        console.log('Initiating call to:', phoneNumber);
        // Clean phone number - remove spaces, dashes, parentheses
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
        
        iframeRef.current.contentWindow.postMessage({
          api: 'opencti_dialpad',
          version: '1.0',
          method: 'initiate_call',
          payload: {
            phone_number: cleanNumber
          }
        }, '*');
        setIsMinimized(false); // Expand when initiating call
      }
    };

    return () => {
      delete window.dialpadInitiateCall;
    };
  }, []);

  if (!clientId) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? 'w-16 h-16' : 'w-[400px] h-[600px]'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-[#08708E] px-3 py-2 flex items-center justify-between">
          <span className="text-white text-sm font-semibold">
            {isMinimized ? 'CTI' : 'Dialpad CTI'}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Iframe */}
        {!isMinimized && (
          <iframe
            ref={iframeRef}
            src={`https://dialpad.com/apps/${clientId}`}
            title="Dialpad CTI"
            allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
            sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
            className="flex-1 w-full border-0"
          />
        )}
      </div>


    </div>
  );
}