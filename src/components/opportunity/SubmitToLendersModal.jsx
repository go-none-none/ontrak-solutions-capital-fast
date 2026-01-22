import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SubmitToLendersModal({ isOpen, onClose, opportunityId, session, lenders = [], onSuccess }) {
  const [selectedLenders, setSelectedLenders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggleLender = (lenderId) => {
    setSelectedLenders(prev => 
      prev.includes(lenderId) 
        ? prev.filter(id => id !== lenderId)
        : [...prev, lenderId]
    );
  };

  const handleSubmit = async () => {
    if (selectedLenders.length === 0) {
      alert('Please select at least one lender');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSubmissions', { opportunityId, lenderIds: selectedLenders, token: session.token, instanceUrl: session.instanceUrl });
      onSuccess?.();
      onClose();
      setSelectedLenders([]);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit to lenders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit to Lenders</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {lenders.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No lenders available</p>
          ) : (
            lenders.map(lender => (
              <div key={lender.Id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <Checkbox
                  id={lender.Id}
                  checked={selectedLenders.includes(lender.Id)}
                  onCheckedChange={() => handleToggleLender(lender.Id)}
                />
                <Label htmlFor={lender.Id} className="cursor-pointer flex-1">
                  <p className="font-medium text-slate-900">{lender.Name}</p>
                  {lender.Phone && <p className="text-sm text-slate-600">{lender.Phone}</p>}
                </Label>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}