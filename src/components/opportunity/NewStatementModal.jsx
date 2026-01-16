import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewStatementModal({ isOpen, onClose, opportunityId, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNo: '',
    accountTitle: '',
    startingDate: '',
    endingDate: '',
    startingBalance: '',
    endingBalance: '',
    avgDailyBalance: '',
    depositAmount: '',
    depositCount: '',
    totalWithdrawals: '',
    withdrawalsCount: '',
    nsfs: '',
    negativeDays: '',
    reconciled: false,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.functions.invoke('createSalesforceStatement', {
        opportunityId,
        statementData: formData,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      onSuccess();
      onClose();
      setFormData({
        bankName: '',
        accountNo: '',
        accountTitle: '',
        startingDate: '',
        endingDate: '',
        startingBalance: '',
        endingBalance: '',
        avgDailyBalance: '',
        depositAmount: '',
        depositCount: '',
        totalWithdrawals: '',
        withdrawalsCount: '',
        nsfs: '',
        negativeDays: '',
        reconciled: false,
        notes: ''
      });
    } catch (error) {
      console.error('Create statement error:', error);
      alert('Failed to create statement: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Bank Statement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Enter bank name"
              />
            </div>

            <div>
              <Label htmlFor="accountNo">Account Number</Label>
              <Input
                id="accountNo"
                value={formData.accountNo}
                onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                placeholder="Last 4 digits"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="accountTitle">Account Title</Label>
              <Input
                id="accountTitle"
                value={formData.accountTitle}
                onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                placeholder="Account holder name"
              />
            </div>

            <div>
              <Label htmlFor="startingDate">Starting Date</Label>
              <Input
                id="startingDate"
                type="date"
                value={formData.startingDate}
                onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endingDate">Ending Date</Label>
              <Input
                id="endingDate"
                type="date"
                value={formData.endingDate}
                onChange={(e) => setFormData({ ...formData, endingDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="startingBalance">Starting Balance</Label>
              <Input
                id="startingBalance"
                type="number"
                step="0.01"
                value={formData.startingBalance}
                onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="endingBalance">Ending Balance</Label>
              <Input
                id="endingBalance"
                type="number"
                step="0.01"
                value={formData.endingBalance}
                onChange={(e) => setFormData({ ...formData, endingBalance: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="avgDailyBalance">Average Daily Balance</Label>
              <Input
                id="avgDailyBalance"
                type="number"
                step="0.01"
                value={formData.avgDailyBalance}
                onChange={(e) => setFormData({ ...formData, avgDailyBalance: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="depositAmount">Total Deposits</Label>
              <Input
                id="depositAmount"
                type="number"
                step="0.01"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="depositCount">Deposit Count</Label>
              <Input
                id="depositCount"
                type="number"
                value={formData.depositCount}
                onChange={(e) => setFormData({ ...formData, depositCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="totalWithdrawals">Total Withdrawals</Label>
              <Input
                id="totalWithdrawals"
                type="number"
                step="0.01"
                value={formData.totalWithdrawals}
                onChange={(e) => setFormData({ ...formData, totalWithdrawals: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="withdrawalsCount">Withdrawals Count</Label>
              <Input
                id="withdrawalsCount"
                type="number"
                value={formData.withdrawalsCount}
                onChange={(e) => setFormData({ ...formData, withdrawalsCount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="nsfs">NSFs</Label>
              <Input
                id="nsfs"
                type="number"
                value={formData.nsfs}
                onChange={(e) => setFormData({ ...formData, nsfs: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="negativeDays">Negative Days</Label>
              <Input
                id="negativeDays"
                type="number"
                value={formData.negativeDays}
                onChange={(e) => setFormData({ ...formData, negativeDays: e.target.value })}
                placeholder="0"
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
                id="reconciled"
                checked={formData.reconciled}
                onCheckedChange={(checked) => setFormData({ ...formData, reconciled: checked })}
              />
              <Label htmlFor="reconciled" className="cursor-pointer">Reconciled</Label>
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
                'Create Statement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}