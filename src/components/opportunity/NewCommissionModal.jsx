import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewCommissionModal({ isOpen, onClose, opportunityId, session, onSuccess }) {
  const [formData, setFormData] = useState({ Amount: '', Commission_Percentage__c: '', Notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Amount) {
      alert('Commission amount is required');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSalesforceCommission', { opportunityId, commissionData: formData, token: session.token, instanceUrl: session.instanceUrl });
      onSuccess?.();
      onClose();
      setFormData({ Amount: '', Commission_Percentage__c: '', Notes: '' });
    } catch (error) {
      console.error('Error creating commission:', error);
      alert('Failed to create commission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Commission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Amount</Label><Input type="number" step="0.01" value={formData.Amount} onChange={(e) => setFormData({ ...formData, Amount: e.target.value })} placeholder="0.00" required /></div>
          <div><Label>Percentage</Label><Input type="number" step="0.01" value={formData.Commission_Percentage__c} onChange={(e) => setFormData({ ...formData, Commission_Percentage__c: e.target.value })} placeholder="0.00" /></div>
          <div><Label>Notes</Label><Textarea value={formData.Notes} onChange={(e) => setFormData({ ...formData, Notes: e.target.value })} rows={3} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}