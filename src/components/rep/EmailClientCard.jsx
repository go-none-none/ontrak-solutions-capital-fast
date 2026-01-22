import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from 'lucide-react';
import SendEmailModal from './SendEmailModal';

export default function EmailClientCard({ recipientEmail, recipientName, session, onMessageSent, color = 'bg-blue-600' }) {
  const [showModal, setShowModal] = useState(false);

  if (!recipientEmail) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Mail className="w-5 h-5" />
          No email available
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${color} text-white p-6 rounded-2xl shadow-sm`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Email
        </h3>
        <p className="text-sm mb-4 opacity-90">{recipientEmail}</p>
        <a href={`mailto:${recipientEmail}`} target="_blank" rel="noopener noreferrer" className="inline-block mb-3">
          <Button className="bg-white text-slate-900 hover:bg-slate-100 mr-2">Open Email Client</Button>
        </a>
        <Button onClick={() => setShowModal(true)} variant="outline" className="border-white text-white hover:bg-white/10">Compose</Button>
      </div>
      <SendEmailModal isOpen={showModal} onClose={() => setShowModal(false)} recipientEmail={recipientEmail} recipientName={recipientName} session={session} onSuccess={onMessageSent} />
    </>
  );
}