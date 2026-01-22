import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneOff, X, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PowerDialer({ phoneNumber, recordId, session, onCallComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callId, setCallId] = useState(null);
  const [disposition, setDisposition] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCall = async () => {
    if (!phoneNumber) return;
    setCalling(true);
    try {
      const response = await base44.functions.invoke('dialpadMakeCall', { phoneNumber: phoneNumber.replace(/\D/g, '') });
      setCallId(response.data.callId);
    } catch (error) {
      alert(`Failed to initiate call: ${error.response?.data?.error || error.message}`);
      setCalling(false);
    }
  };

  const handleSaveDisposition = async () => {
    if (!callId || !disposition) return;
    setSaving(true);
    try {
      await base44.functions.invoke('dialpadUpdateDisposition', { callId, disposition, notes, recordId, token: session.token, instanceUrl: session.instanceUrl });
      setIsOpen(false);
      setCalling(false);
      setCallId(null);
      setDisposition('');
      setNotes('');
      if (onCallComplete) onCallComplete();
    } catch (error) {
      alert('Failed to save disposition');
    } finally {
      setSaving(false);
    }
  };

  const handleEndCall = () => {
    setCalling(false);
    setCallId(null);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-orange-600 hover:bg-orange-700 gap-2" size="sm">
        <Phone className="w-4 h-4" />
        Power Dial
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => !calling && setIsOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Power Dialer</h3>
                <Button variant="ghost" size="icon" onClick={() => !calling && setIsOpen(false)} disabled={calling}><X className="w-5 h-5" /></Button>
              </div>

              {!calling ? (
                <div className="space-y-4">
                  <div><label className="text-sm font-medium text-slate-700 mb-2 block">Phone Number</label><Input value={phoneNumber} readOnly className="bg-slate-50" /></div>
                  <Button onClick={handleCall} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold gap-2"><Phone className="w-5 h-5" />Start Call</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><Phone className="w-10 h-10 text-white" /></div>
                    <p className="text-lg font-semibold text-slate-900 mb-1">Calling...</p>
                    <p className="text-sm text-slate-600">{phoneNumber}</p>
                  </div>

                  {callId && (
                    <>
                      <div className="space-y-3">
                        <div><label className="text-sm font-medium text-slate-700 mb-2 block">Call Disposition</label><Select value={disposition} onValueChange={setDisposition}><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger><SelectContent><SelectItem value="Connected">Connected</SelectItem><SelectItem value="Left Voicemail">Left Voicemail</SelectItem><SelectItem value="No Answer">No Answer</SelectItem><SelectItem value="Busy">Busy</SelectItem><SelectItem value="Wrong Number">Wrong Number</SelectItem><SelectItem value="Callback Requested">Callback Requested</SelectItem></SelectContent></Select></div>
                        <div><label className="text-sm font-medium text-slate-700 mb-2 block">Notes</label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add call notes..." rows={3} /></div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={handleEndCall} variant="outline" className="flex-1"><PhoneOff className="w-4 h-4 mr-2" />End Call</Button>
                        <Button onClick={handleSaveDisposition} disabled={!disposition || saving} className="flex-1 bg-orange-600 hover:bg-orange-700">
                          {saving ? (<Loader2 className="w-4 h-4 mr-2 animate-spin" />) : (<CheckCircle2 className="w-4 h-4 mr-2" />)}
                          Save & Complete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}