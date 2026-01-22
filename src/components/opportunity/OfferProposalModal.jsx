import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OfferProposalModal({ isOpen, onClose, opportunityId, session, onSuccess }) {
  const [formData, setFormData] = useState({ Amount: '', Rate: '', Term: '', Notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Amount || !formData.Rate || !formData.Term) {
      alert('Amount, rate, and term are required');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSalesforceOffer', { opportunityId, offerData: formData, token: session.token, instanceUrl: session.instanceUrl });
      onSuccess?.();
      onClose();
      setFormData({ Amount: '', Rate: '', Term: '', Notes: '' });
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Loan Amount</Label><Input type="number" step="0.01" value={formData.Amount} onChange={(e) => setFormData({ ...formData, Amount: e.target.value })} placeholder="0.00" required /></div>
          <div><Label>Interest Rate (%)</Label><Input type="number" step="0.01" value={formData.Rate} onChange={(e) => setFormData({ ...formData, Rate: e.target.value })} placeholder="0.00" required /></div>
          <div><Label>Term (months)</Label><Input type="number" value={formData.Term} onChange={(e) => setFormData({ ...formData, Term: e.target.value })} placeholder="12" required /></div>
          <div><Label>Notes</Label><Textarea value={formData.Notes} onChange={(e) => setFormData({ ...formData, Notes: e.target.value })} rows={3} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}