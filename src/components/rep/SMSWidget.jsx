import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

export default function SMSWidget({ phoneNumber }) {
  const handleSMS = () => {
    if (!phoneNumber) {
      alert('No phone number available');
      return;
    }
    window.location.href = `sms:${phoneNumber.replace(/\D/g, '')}`;
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-sm text-white">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">Quick SMS</h3>
      </div>
      <p className="text-white/80 text-sm mb-4">{phoneNumber}</p>
      <Button
        onClick={handleSMS}
        className="w-full bg-white text-green-700 hover:bg-white/90"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Send SMS
      </Button>
    </div>
  );
}