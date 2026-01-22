import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STAGES = ['Application In', 'Underwriting', 'Approved', 'Contracts Out', 'Contracts In', 'Closed - Funded', 'Declined'];

export default function EditOpportunityModal({ isOpen, onClose, opportunity, session, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        Name: opportunity.Name || '',
        Amount: opportunity.Amount || '',
        StageName: opportunity.StageName || 'Application In',
        Description: opportunity.Description || '',
        CloseDate: opportunity.CloseDate || ''
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name) {
      alert('Opportunity name is required');
      return;
    }

    setLoading(true);
    try {
      if (opportunity?.Id) {
        await base44.functions.invoke('updateSalesforceRecord', {
          objectType: 'Opportunity',
          recordId: opportunity.Id,
          data: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      alert('Failed to save opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Name <span className="text-red-500">*</span></Label><Input id="name" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="amount">Amount</Label><Input id="amount" type="number" step="0.01" value={formData.Amount} onChange={(e) => setFormData({ ...formData, Amount: e.target.value })} /></div>
            <div><Label htmlFor="stage">Stage</Label><Select value={formData.StageName} onValueChange={(val) => setFormData({ ...formData, StageName: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STAGES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <div><Label htmlFor="closeDate">Close Date</Label><Input id="closeDate" type="date" value={formData.CloseDate} onChange={(e) => setFormData({ ...formData, CloseDate: e.target.value })} /></div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} rows={4} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}