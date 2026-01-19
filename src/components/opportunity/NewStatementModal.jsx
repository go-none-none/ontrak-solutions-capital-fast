import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewStatementModal({ isOpen, onClose, opportunityId, session, onSuccess, statement = null }) {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    accountNo: '',
    accountTitle: '',
    company: '',
    bankName: '',
    startingDate: '',
    startingBalance: '',
    endingDate: '',
    endingBalance: '',
    reconciled: false,
    unreconciledEndBalance: '',
    fraudScore: '',
    avgDailyBalance: '',
    depositCount: '',
    depositAmount: '',
    withdrawalsCount: '',
    totalWithdrawals: '',
    transactionsCount: '',
    minResolution: '',
    maxResolution: '',
    nsfs: '',
    negativeDays: '',
    fraudReasons: '',
    notes: ''
  });

  useEffect(() => {
    if (statement) {
      setFormData({
        accountNo: statement.csbs__Account_No__c || '',
        accountTitle: statement.csbs__Account_Title__c || '',
        company: statement.csbs__Company__c || '',
        bankName: statement.csbs__Bank_Name__c || '',
        startingDate: statement.csbs__Starting_Date__c || '',
        startingBalance: statement.csbs__Starting_Balance__c || '',
        endingDate: statement.csbs__Ending_Date__c || '',
        endingBalance: statement.csbs__Ending_Balance__c || '',
        reconciled: statement.csbs__Reconciled__c || false,
        unreconciledEndBalance: statement.csbs__Unreconciled_End_Balance__c || '',
        fraudScore: statement.csbs__Fraud_Score__c || '',
        avgDailyBalance: statement.csbs__Average_Daily_Balance__c || '',
        depositCount: statement.csbs__Deposit_Count__c || '',
        depositAmount: statement.csbs__Deposit_Amount__c || '',
        withdrawalsCount: statement.csbs__Withdrawals_Count__c || '',
        totalWithdrawals: statement.csbs__Total_Withdrawals__c || '',
        transactionsCount: statement.csbs__Transactions_Count__c || '',
        minResolution: statement.csbs__Min_Resolution__c || '',
        maxResolution: statement.csbs__Max_Resolution__c || '',
        nsfs: statement.csbs__NSFs__c || '',
        negativeDays: statement.csbs__Negative_Days__c || '',
        fraudReasons: statement.csbs__Fraud_Reasons__c || '',
        notes: statement.csbs__Notes__c || ''
      });
    }
  }, [statement]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploadingFile(true);
    setParsingFile(true);
    
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;
      
      const parseResponse = await base44.functions.invoke('parseBankStatement', { fileUrl });
      
      if (parseResponse.data.success && parseResponse.data.data) {
        const p = parseResponse.data.data;
        
        setFormData({
          ...formData,
          bankName: p.bank_name || formData.bankName,
          accountNo: p.account_number || formData.accountNo,
          startingDate: p.starting_date || formData.startingDate,
          endingDate: p.ending_date || formData.endingDate,
          avgDailyBalance: p.average_daily_balance || formData.avgDailyBalance,
          depositAmount: p.deposit_amount || formData.depositAmount,
          depositCount: p.deposit_count || formData.depositCount,
          nsfs: p.nsf_count || formData.nsfs,
          endingBalance: p.ending_balance || formData.endingBalance
        });
        
        alert('Statement parsed successfully! Review the filled data.');
      } else {
        throw new Error('Failed to parse statement');
      }
    } catch (error) {
      console.error('File upload/parse error:', error);
      alert('Failed to parse statement. Please fill manually.');
    } finally {
      setUploadingFile(false);
      setParsingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (statement) {
        await base44.functions.invoke('updateSalesforceStatement', {
          statementId: statement.Id,
          statementData: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      } else {
        await base44.functions.invoke('createSalesforceStatement', {
          opportunityId,
          statementData: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }

      onSuccess();
      
      if (!e.nativeEvent.submitter.name.includes('new')) {
        onClose();
      }
      
      setFormData({
        accountNo: '',
        accountTitle: '',
        company: '',
        bankName: '',
        startingDate: '',
        startingBalance: '',
        endingDate: '',
        endingBalance: '',
        reconciled: false,
        unreconciledEndBalance: '',
        fraudScore: '',
        avgDailyBalance: '',
        depositCount: '',
        depositAmount: '',
        withdrawalsCount: '',
        totalWithdrawals: '',
        transactionsCount: '',
        minResolution: '',
        maxResolution: '',
        nsfs: '',
        negativeDays: '',
        fraudReasons: '',
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
          <DialogTitle>{statement ? 'Edit Statement' : 'New Statement'}</DialogTitle>
        </DialogHeader>

        {!statement && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Upload Bank Statement</h3>
            <p className="text-sm text-blue-700 mb-3">Upload a PDF to automatically extract statement data</p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                className="text-sm"
                id="statement-upload"
              />
              {parsingFile && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Parsing statement...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b">Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountNo">Account No</Label>
                  <Input
                    id="accountNo"
                    value={formData.accountNo}
                    onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="accountTitle">Account Title</Label>
                  <Input
                    id="accountTitle"
                    value={formData.accountTitle}
                    onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
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
                  <Label htmlFor="startingBalance">Starting Balance</Label>
                  <Input
                    id="startingBalance"
                    type="number"
                    step="0.01"
                    value={formData.startingBalance}
                    onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
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
                  <Label htmlFor="endingBalance">Ending Balance</Label>
                  <Input
                    id="endingBalance"
                    type="number"
                    step="0.01"
                    value={formData.endingBalance}
                    onChange={(e) => setFormData({ ...formData, endingBalance: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reconciled"
                    checked={formData.reconciled}
                    onCheckedChange={(checked) => setFormData({ ...formData, reconciled: checked })}
                  />
                  <Label htmlFor="reconciled" className="cursor-pointer">Reconciled</Label>
                </div>

                <div>
                  <Label htmlFor="unreconciledEndBalance">Unreconciled End Balance</Label>
                  <Input
                    id="unreconciledEndBalance"
                    type="number"
                    step="0.01"
                    value={formData.unreconciledEndBalance}
                    onChange={(e) => setFormData({ ...formData, unreconciledEndBalance: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label>*Opportunity</Label>
                  <div className="px-3 py-2 bg-slate-50 border rounded text-sm text-slate-600">
                    Auto-filled
                  </div>
                </div>

                <div>
                  <Label htmlFor="avgDailyBalance">Average Daily Balance</Label>
                  <Input
                    id="avgDailyBalance"
                    type="number"
                    step="0.01"
                    value={formData.avgDailyBalance}
                    onChange={(e) => setFormData({ ...formData, avgDailyBalance: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="depositCount">Deposit Count</Label>
                  <Input
                    id="depositCount"
                    type="number"
                    value={formData.depositCount}
                    onChange={(e) => setFormData({ ...formData, depositCount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="depositAmount">Deposit Amount</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawalsCount">Withdrawals Count</Label>
                  <Input
                    id="withdrawalsCount"
                    type="number"
                    value={formData.withdrawalsCount}
                    onChange={(e) => setFormData({ ...formData, withdrawalsCount: e.target.value })}
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
                  />
                </div>

                <div>
                  <Label htmlFor="transactionsCount">Transactions Count</Label>
                  <Input
                    id="transactionsCount"
                    type="number"
                    value={formData.transactionsCount}
                    onChange={(e) => setFormData({ ...formData, transactionsCount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="minResolution">Min Resolution</Label>
                  <Input
                    id="minResolution"
                    type="number"
                    value={formData.minResolution}
                    onChange={(e) => setFormData({ ...formData, minResolution: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="maxResolution">Max Resolution</Label>
                  <Input
                    id="maxResolution"
                    type="number"
                    value={formData.maxResolution}
                    onChange={(e) => setFormData({ ...formData, maxResolution: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="nsfs">NSFs</Label>
                  <Input
                    id="nsfs"
                    type="number"
                    value={formData.nsfs}
                    onChange={(e) => setFormData({ ...formData, nsfs: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="negativeDays">Negative Days</Label>
                  <Input
                    id="negativeDays"
                    type="number"
                    value={formData.negativeDays}
                    onChange={(e) => setFormData({ ...formData, negativeDays: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fraud Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b">Fraud</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <Label htmlFor="fraudScore">Fraud Score</Label>
                <Input
                  id="fraudScore"
                  type="number"
                  value={formData.fraudScore}
                  onChange={(e) => setFormData({ ...formData, fraudScore: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="fraudReasons">Fraud Reasons</Label>
                <Textarea
                  id="fraudReasons"
                  value={formData.fraudReasons}
                  onChange={(e) => setFormData({ ...formData, fraudReasons: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" name="saveNew" disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save & New'}
            </Button>
            <Button type="submit" name="save" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}