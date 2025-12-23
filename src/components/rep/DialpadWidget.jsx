import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DialpadWidget({ phoneNumber, recordId, recordType, session, onCallCompleted }) {
  const [showDisposition, setShowDisposition] = useState(false);
  const [disposition, setDisposition] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCall = () => {
    if (!phoneNumber) {
      alert('No phone number available');
      return;
    }
    // Open Dialpad desktop app to make a call
    window.location.href = `callto:${phoneNumber.replace(/\D/g, '')}`;
  };

  const handleSMS = () => {
    if (!phoneNumber) {
      alert('No phone number available');
      return;
    }
    // Open Dialpad desktop app with SMS to this number
    window.location.href = `sms:${phoneNumber.replace(/\D/g, '')}`;
  };

  const handleLogCall = () => {
    setShowDisposition(true);
  };

  const handleSaveDisposition = async () => {
    if (!disposition) {
      alert('Please select a disposition');
      return;
    }

    setSaving(true);
    try {
      await base44.functions.invoke('createSalesforceActivity', {
        recordId,
        recordType,
        subject: `Call - ${disposition}`,
        description: notes || `Called ${phoneNumber}`,
        status: 'Completed',
        activityType: 'Task',
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setShowDisposition(false);
      setDisposition('');
      setNotes('');
      
      if (onCallCompleted) onCallCompleted();
    } catch (error) {
      console.error('Disposition error:', error);
      alert('Failed to save call log');
    } finally {
      setSaving(false);
    }
  };

  if (showDisposition) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#08708E]">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-slate-900">Call Disposition</h3>
        </div>
        
        <div className="space-y-3">
          <Select value={disposition} onValueChange={setDisposition}>
            <SelectTrigger>
              <SelectValue placeholder="Select disposition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Connected">Connected</SelectItem>
              <SelectItem value="Voicemail">Left Voicemail</SelectItem>
              <SelectItem value="No Answer">No Answer</SelectItem>
              <SelectItem value="Busy">Busy</SelectItem>
              <SelectItem value="Wrong Number">Wrong Number</SelectItem>
              <SelectItem value="Callback Requested">Callback Requested</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="Appointment Set">Appointment Set</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Call notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSaveDisposition}
              disabled={saving || !disposition}
              className="flex-1 bg-[#08708E] hover:bg-[#065a72]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisposition(false);
                setDisposition('');
                setNotes('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl p-6 shadow-sm text-white">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-5 h-5" />
        <h3 className="font-semibold">Quick Call</h3>
      </div>
      
      {phoneNumber ? (
        <>
          <p className="text-white/80 text-sm mb-4">{phoneNumber}</p>
          <div className="flex gap-2 mb-2">
            <Button
              onClick={handleCall}
              className="flex-1 bg-white text-[#08708E] hover:bg-white/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleSMS}
              className="flex-1 bg-white text-[#08708E] hover:bg-white/90"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS
            </Button>
          </div>
          <Button
            onClick={handleLogCall}
            variant="outline"
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            size="sm"
          >
            Log Call
          </Button>
        </>
      ) : (
        <p className="text-white/60 text-sm">No phone number available</p>
      )}
    </div>
  );
}