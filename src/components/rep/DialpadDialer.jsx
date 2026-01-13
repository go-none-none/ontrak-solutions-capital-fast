import React, { useEffect } from 'react';
import { Phone, X, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DialpadDialer({ isOpen, onClose, onInitiateCall }) {
  const openPowerDialer = () => {
    const dialerIframe = document.getElementById("dialpad-mini-dialer");
    if (dialerIframe) {
      dialerIframe.contentWindow.postMessage(
        {
          api: "opencti_dialpad",
          version: "1.0",
          method: "open_power_dialer",
          payload: {}
        },
        "https://dialpad.com"
      );
    }
  };
  useEffect(() => {
    // Listen for messages from Dialpad iframe
    const handleMessage = (event) => {
      if (event.origin !== "https://dialpad.com") return;

      const { api, method, payload } = event.data;

      if (api !== "opencti_dialpad") return;

      switch (method) {
        case "user_authentication":
          console.log("Dialpad: User authenticated");
          break;

        case "call_ringing":
          console.log("Dialpad: Incoming call", payload);
          break;

        case "hang_up_all_calls":
          console.log("Dialpad: Call ended");
          break;

        default:
          console.log("Dialpad event:", method, payload);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Function to initiate a call from outside the component
  useEffect(() => {
    if (onInitiateCall) {
      window.dialpadInitiateCall = (phoneNumber) => {
        const dialerIframe = document.getElementById("dialpad-mini-dialer");
        if (dialerIframe) {
          dialerIframe.contentWindow.postMessage(
            {
              api: "opencti_dialpad",
              version: "1.0",
              method: "initiate_call",
              payload: {
                phone_number: phoneNumber,
                enable_current_tab: false
              }
            },
            "https://dialpad.com"
          );
        }
      };
    }
  }, [onInitiateCall]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08708E] to-[#065a72] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-white" />
          <span className="font-semibold text-white">Dialpad</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={openPowerDialer}
            className="text-white hover:bg-white/20 h-8 px-2"
            title="Open Power Dialer"
          >
            <Zap className="w-4 h-4 mr-1" />
            <span className="text-xs">Power Dialer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialpad iframe */}
      <iframe
        id="dialpad-mini-dialer"
        src="https://dialpad.com/apps/a2bFGaaCr3j7UW9Sty8ETv5sz"
        title="Dialpad Mini Dialer"
        allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
        sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
        className="w-[400px] h-[520px] border-0"
      />
    </div>
  );
}