import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewDebtModal({ isOpen, onClose, opportunityId, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingPicklists, setLoadingPicklists] = useState(true);
  const [typePicklist, setTypePicklist] = useState([]);
  const [frequencyPicklist, setFrequencyPicklist] = useState([]);
  const [formData, setFormData] = useState({
    lender: '',
    creditorId: '',
    type: '',
    balance: '',
    payment: '',
    frequency: '',
    estimatedMonthlyMCA: '',
    openPosition: false,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPicklists();
    }
  }, [isOpen]);

  const loadPicklists = async () => {
    setLoadingPicklists(true);
    try {
      const [typeRes, frequencyRes] = await Promise.all([
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Debt__c',
          fieldName: 'csbs__Type__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Debt__c',
          fieldName: 'csbs__Frequency__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]);

      setTypePicklist(typeRes.data.values || []);
      setFrequencyPicklist(frequencyRes.data.values || []);
    } catch (error) {
      console.error('Load picklists error:', error);
    } finally {
      setLoadingPicklists(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.functions.invoke('createSalesforceDebt', {
        opportunityId,
        debtData: formData,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      onSuccess();
      onClose();
      setFormData({
        lender: '',
        creditorId: '',
        type: '',
        balance: '',
        payment: '',
        frequency: '',
        estimatedMonthlyMCA: '',
        openPosition: false,
        notes: ''
      });
    } catch (error) {
      console.error('Create debt error:', error);
      alert('Failed to create debt: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Debt</DialogTitle>
        </DialogHeader>

        {loadingPicklists ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lender">Lender Name</Label>
                <Input
                  id="lender"
                  value={formData.lender}
                  onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                  placeholder="Enter lender name"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typePicklist.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="payment">Payment</Label>
                <Input
                  id="payment"
                  type="number"
                  step="0.01"
                  value={formData.payment}
                  onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyPicklist.map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedMonthlyMCA">Estimated Monthly MCA Amount</Label>
                <Input
                  id="estimatedMonthlyMCA"
                  type="number"
                  step="0.01"
                  value={formData.estimatedMonthlyMCA}
                  onChange={(e) => setFormData({ ...formData, estimatedMonthlyMCA: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Checkbox
                  id="openPosition"
                  checked={formData.openPosition}
                  onCheckedChange={(checked) => setFormData({ ...formData, openPosition: checked })}
                />
                <Label htmlFor="openPosition" className="cursor-pointer">Open Position</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Debt'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}