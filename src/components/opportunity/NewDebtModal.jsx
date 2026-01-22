import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CreateLenderModal from './CreateLenderModal';

export default function NewDebtModal({ isOpen, onClose, opportunityId, session, onSuccess, debt }) {
  const [loading, setLoading] = useState(false);
  const [loadingPicklists, setLoadingPicklists] = useState(true);
  const [typePicklist, setTypePicklist] = useState([]);
  const [frequencyPicklist, setFrequencyPicklist] = useState([]);
  const [lenders, setLenders] = useState([]);
  const [showCreateLender, setShowCreateLender] = useState(false);
  const [formData, setFormData] = useState({
    creditorId: '',
    balance: '',
    lender: '',
    estimatedMonthlyMCA: '',
    openPosition: false,
    notes: '',
    type: '',
    payment: '',
    frequency: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPicklists();
      if (debt) {
        setFormData({
          creditorId: debt.csbs__Creditor__c || '',
          balance: debt.csbs__Balance__c || '',
          lender: debt.csbs__Lender__c || '',
          estimatedMonthlyMCA: debt.csbs__Estimated_Monthly_MCA_Amount__c || '',
          openPosition: debt.csbs__Open_Position__c || false,
          notes: debt.csbs__Notes__c || '',
          type: debt.csbs__Type__c || '',
          payment: debt.csbs__Payment__c || '',
          frequency: debt.csbs__Frequency__c || ''
        });
      }
    }
  }, [isOpen, debt]);

  const loadPicklists = async () => {
    setLoadingPicklists(true);
    try {
      const [typeRes, frequencyRes, lendersRes] = await Promise.all([
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
        }),
        base44.functions.invoke('getSalesforceLenders', {
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]);

      setTypePicklist(typeRes.data.values || []);
      setFrequencyPicklist(frequencyRes.data.values || []);
      setLenders(lendersRes.data.lenders || []);
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
      if (debt) {
        // Update existing debt
        await base44.functions.invoke('updateSalesforceRecord', {
          objectType: 'csbs__Debt__c',
          recordId: debt.Id,
          data: {
            csbs__Creditor__c: formData.creditorId,
            csbs__Balance__c: formData.balance,
            csbs__Lender__c: formData.lender,
            csbs__Estimated_Monthly_MCA_Amount__c: formData.estimatedMonthlyMCA,
            csbs__Open_Position__c: formData.openPosition,
            csbs__Notes__c: formData.notes,
            csbs__Type__c: formData.type,
            csbs__Payment__c: formData.payment,
            csbs__Frequency__c: formData.frequency
          },
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      } else {
        // Create new debt
        await base44.functions.invoke('createSalesforceDebt', {
          opportunityId,
          debtData: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }

      onSuccess();
      
      if (!debt && !e.nativeEvent.submitter.name.includes('new')) {
        onClose();
      } else if (debt) {
        onClose();
      }
      
      setFormData({
        creditorId: '',
        balance: '',
        lender: '',
        estimatedMonthlyMCA: '',
        openPosition: false,
        notes: '',
        type: '',
        payment: '',
        frequency: ''
      });
    } catch (error) {
      console.error('Debt operation error:', error);
      alert('Failed to save debt: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{debt ? 'Edit Debt' : 'New Debt'}</DialogTitle>
        </DialogHeader>

        {loadingPicklists ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b">Information</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="creditor">Creditor</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.creditorId}
                        onValueChange={(value) => setFormData({ ...formData, creditorId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="--None--" />
                        </SelectTrigger>
                        <SelectContent>
                          {lenders.map(lender => (
                            <SelectItem key={lender.Id} value={lender.Id}>{lender.Name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowCreateLender(true)}
                        title="Create New Lender"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="balance">Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lender">Lender</Label>
                    <Input
                      id="lender"
                      value={formData.lender}
                      onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimatedMonthlyMCA">Estimated Monthly MCA Amount</Label>
                    <Input
                      id="estimatedMonthlyMCA"
                      type="number"
                      step="0.01"
                      value={formData.estimatedMonthlyMCA}
                      onChange={(e) => setFormData({ ...formData, estimatedMonthlyMCA: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="openPosition"
                      checked={formData.openPosition}
                      onCheckedChange={(checked) => setFormData({ ...formData, openPosition: checked })}
                    />
                    <Label htmlFor="openPosition" className="cursor-pointer">Open Position</Label>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-red-600">*Opportunity</Label>
                    <div className="px-3 py-2 bg-slate-50 border rounded text-sm text-slate-600">
                      Auto-filled
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="--None--" />
                      </SelectTrigger>
                      <SelectContent>
                        {typePicklist.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment">Payment</Label>
                    <Input
                      id="payment"
                      type="number"
                      step="0.01"
                      value={formData.payment}
                      onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="--None--" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyPicklist.map(freq => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              {!debt && (
                <Button type="submit" name="saveNew" disabled={loading} variant="outline">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save & New'}
                </Button>
              )}
              <Button type="submit" name="save" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>

      <CreateLenderModal
        isOpen={showCreateLender}
        onClose={() => setShowCreateLender(false)}
        session={session}
        onSuccess={(newLenderId) => {
          setFormData({ ...formData, creditorId: newLenderId });
          loadPicklists();
          setShowCreateLender(false);
        }}
      />
    </Dialog>
  );
}