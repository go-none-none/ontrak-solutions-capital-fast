import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Loader2, ChevronDown, X, Play, Pause } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PowerDialer({ records = [], session, onCallComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialing, setIsDialing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let interval;
    if (isDialing) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDialing]);

  const currentRecord = records[currentIndex];

  const handleDial = async () => {
    if (!currentRecord?.Phone && !currentRecord?.phone) {
      alert('No phone number available');
      return;
    }

    setIsDialing(true);
    try {
      const phoneNumber = currentRecord?.Phone || currentRecord?.phone;
      window.location.href = `tel:${phoneNumber}`;
    } catch (error) {
      console.error('Dial error:', error);
    }
  };

  const handleEndCall = () => {
    setIsDialing(false);
    setCallDuration(0);
    if (onCallComplete) {
      onCallComplete(currentRecord);
    }
    if (currentIndex < records.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < records.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!records || records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          <Phone className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p>No records to call</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          Power Dialer ({currentIndex + 1}/{records.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {currentRecord && (
          <>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-slate-900">{currentRecord.Name}</h3>
              <p className="text-sm text-slate-600">{currentRecord.Company || currentRecord.Industry}</p>
              <p className="text-lg font-mono text-blue-600 mt-2">{currentRecord.Phone || currentRecord.phone}</p>
              
              {showDetails && (
                <div className="mt-4 pt-4 border-t text-sm space-y-2">
                  {currentRecord.Email && <p><span className="text-slate-600">Email:</span> {currentRecord.Email}</p>}
                  {currentRecord.Status && <p><span className="text-slate-600">Status:</span> {currentRecord.Status}</p>}
                  {currentRecord.funding_amount_requested && <p><span className="text-slate-600">Amount:</span> ${Number(currentRecord.funding_amount_requested).toLocaleString()}</p>}
                </div>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showDetails ? 'Hide' : 'Show'} Details
                <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isDialing && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold text-green-600">{formatDuration(callDuration)}</p>
                <p className="text-sm text-green-600 mt-1">Call in progress</p>
              </div>
            )}

            <div className="flex gap-2">
              {!isDialing ? (
                <>
                  <Button
                    onClick={handleDial}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Dial
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEndCall}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    End Call
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}