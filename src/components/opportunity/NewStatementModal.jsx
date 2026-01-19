import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function NewStatementModal({ isOpen, onClose, opportunityId, session, onSuccess, statement = null, fileToProcess = null, availableFiles = [] }) {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [isParsed, setIsParsed] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  
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

  const parseExistingFile = async (file) => {
    setParsingFile(true);
    try {
      const response = await fetch('/api/apps/6932157da76cc7fc545d1203/functions/getSalesforceFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentDocumentId: file.ContentDocumentId,
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      const data = await response.json();
      const base64Data = data.file;

      // Create File from base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pdfFile = new File([bytes], file.ContentDocument.Title + '.pdf', { type: 'application/pdf' });

      const uploadResponse = await base44.integrations.Core.UploadFile({ file: pdfFile });
      const fileUrl = uploadResponse.file_url;

      setFormData(prev => ({ ...prev, csbs__Source_File_ID__c: file.ContentDocumentId }));
      
      const parseResponse = await base44.functions.invoke('parseBankStatement', { fileUrl });
      
      if (parseResponse.data.success && parseResponse.data.data) {
        const p = parseResponse.data.data;
        setFormData(prev => ({
          ...prev,
          bankName: p.bank_name || prev.bankName,
          accountNo: p.account_number || prev.accountNo,
          accountTitle: p.account_title || prev.accountTitle,
          company: p.company || prev.company,
          startingDate: p.starting_date || prev.startingDate,
          endingDate: p.ending_date || prev.endingDate,
          startingBalance: p.starting_balance || prev.startingBalance,
          endingBalance: p.ending_balance || prev.endingBalance,
          avgDailyBalance: p.average_daily_balance || prev.avgDailyBalance,
          depositAmount: p.deposit_amount || prev.depositAmount,
          depositCount: p.deposit_count || prev.depositCount,
          withdrawalsCount: p.withdrawals_count || prev.withdrawalsCount,
          totalWithdrawals: p.total_withdrawals || prev.totalWithdrawals,
          transactionsCount: p.transactions_count || prev.transactionsCount,
          nsfs: p.nsf_count || prev.nsfs,
          negativeDays: p.negative_days || prev.negativeDays,
          notes: (p.notes || prev.notes).slice(0, 255)
        }));
        setIsParsed(true);
        alert('✅ Statement parsed successfully! All data extracted and populated. Please review.');
      } else {
        throw new Error('Failed to parse statement');
      }
    } catch (error) {
      console.error('File parse error:', error);
      alert('Failed to parse statement. Please fill manually.');
    } finally {
      setParsingFile(false);
    }
  };

  const parseSelectedFiles = async () => {
    if (selectedFileIds.length === 0) return;
    setParsingFile(true);
    
    try {
      for (const fileId of selectedFileIds) {
        const file = availableFiles.find(f => f.ContentDocumentId === fileId);
        if (file) {
          await parseExistingFile(file);
        }
      }
      alert(`✅ ${selectedFileIds.length} statement(s) parsed successfully!`);
      setSelectedFileIds([]);
    } catch (error) {
      console.error('Batch parse error:', error);
    } finally {
      setParsingFile(false);
    }
  };

  useEffect(() => {
    if (fileToProcess && isOpen) {
      parseExistingFile(fileToProcess);
    }
  }, [fileToProcess, isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    await proceedWithParsing(file, null);
  };

  const proceedWithParsing = async (file, fileContentDocumentId = null) => {
    setUploadingFile(true);
    setParsingFile(true);

    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;

      if (fileContentDocumentId) {
        setFormData(prev => ({ ...prev, csbs__Source_File_ID__c: fileContentDocumentId }));
      }
      
      const parseResponse = await base44.functions.invoke('parseBankStatement', { fileUrl });
      
      if (parseResponse.data.success && parseResponse.data.data) {
        const p = parseResponse.data.data;

        setFormData(prev => ({
          ...prev,
          bankName: p.bank_name || prev.bankName,
          accountNo: p.account_number || prev.accountNo,
          accountTitle: p.account_title || prev.accountTitle,
          company: p.company || prev.company,
          startingDate: p.starting_date || prev.startingDate,
          endingDate: p.ending_date || prev.endingDate,
          startingBalance: p.starting_balance || prev.startingBalance,
          endingBalance: p.ending_balance || prev.endingBalance,
          avgDailyBalance: p.average_daily_balance || prev.avgDailyBalance,
          depositAmount: p.deposit_amount || prev.depositAmount,
          depositCount: p.deposit_count || prev.depositCount,
          withdrawalsCount: p.withdrawals_count || prev.withdrawalsCount,
          totalWithdrawals: p.total_withdrawals || prev.totalWithdrawals,
          transactionsCount: p.transactions_count || prev.transactionsCount,
          nsfs: p.nsf_count || prev.nsfs,
          negativeDays: p.negative_days || prev.negativeDays,
          notes: (p.notes || prev.notes).slice(0, 255)
        }));
        setIsParsed(true);
        
        alert('✅ Statement parsed successfully! All data extracted and populated. Please review.');
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
          <>
            {availableFiles.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-purple-900 mb-4">Select PDFs to Parse</h3>
                <div className="space-y-2 mb-4">
                  {availableFiles.map(file => (
                    <div key={file.ContentDocumentId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                      <Checkbox
                        id={`file-${file.ContentDocumentId}`}
                        checked={selectedFileIds.includes(file.ContentDocumentId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFileIds([...selectedFileIds, file.ContentDocumentId]);
                          } else {
                            setSelectedFileIds(selectedFileIds.filter(id => id !== file.ContentDocumentId));
                          }
                        }}
                      />
                      <label htmlFor={`file-${file.ContentDocumentId}`} className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium text-slate-900">{file.ContentDocument.Title}</p>
                        <p className="text-xs text-slate-500">PDF • {formatFileSize(file.ContentDocument.ContentSize)}</p>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedFileIds.length > 0 && (
                  <Button
                    onClick={parseSelectedFiles}
                    disabled={parsingFile}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {parsingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing {selectedFileIds.length}...
                      </>
                    ) : (
                      <>Parse {selectedFileIds.length} Selected PDF{selectedFileIds.length !== 1 ? 's' : ''}</>
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className={`border-2 rounded-xl p-6 shadow-sm ${isParsed ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'}`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isParsed ? 'bg-green-600' : 'bg-blue-600'}`}>
                  {isParsed ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1 ${isParsed ? 'text-green-900' : 'text-blue-900'}`}>
                    {isParsed ? '✓ Statement Parsed Successfully' : 'AI-Powered Statement Parser'}
                  </h3>
                  <p className={`text-sm mb-4 ${isParsed ? 'text-green-700' : 'text-blue-700'}`}>
                    {isParsed ? 'All data has been extracted. Review and edit below as needed.' : 'Upload your PDF bank statement and let AI extract all the data automatically'}
                  </p>
                  {!isParsed && (
                    <div className="flex items-center gap-3">
                      <label 
                        htmlFor="statement-upload" 
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Choose PDF File
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                        id="statement-upload"
                      />
                      {parsingFile && (
                        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Analyzing statement with AI...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {isParsed && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-green-900 mb-4">Extracted Data Preview</h3>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-green-700 font-medium">Bank Name</p>
                <p className="text-slate-900">{formData.bankName || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Account No</p>
                <p className="text-slate-900">{formData.accountNo || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Account Title</p>
                <p className="text-slate-900">{formData.accountTitle || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Company</p>
                <p className="text-slate-900">{formData.company || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Starting Date</p>
                <p className="text-slate-900">{formData.startingDate || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Ending Date</p>
                <p className="text-slate-900">{formData.endingDate || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Starting Balance</p>
                <p className="text-slate-900">{formData.startingBalance ? `$${Number(formData.startingBalance).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Ending Balance</p>
                <p className="text-slate-900">{formData.endingBalance ? `$${Number(formData.endingBalance).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Reconciled</p>
                <p className="text-slate-900">{formData.reconciled ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Unreconciled End Balance</p>
                <p className="text-slate-900">{formData.unreconciledEndBalance ? `$${Number(formData.unreconciledEndBalance).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Avg Daily Balance</p>
                <p className="text-slate-900">{formData.avgDailyBalance ? `$${Number(formData.avgDailyBalance).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Deposit Count</p>
                <p className="text-slate-900">{formData.depositCount || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Deposit Amount</p>
                <p className="text-slate-900">{formData.depositAmount ? `$${Number(formData.depositAmount).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Withdrawals Count</p>
                <p className="text-slate-900">{formData.withdrawalsCount || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Total Withdrawals</p>
                <p className="text-slate-900">{formData.totalWithdrawals ? `$${Number(formData.totalWithdrawals).toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Transactions Count</p>
                <p className="text-slate-900">{formData.transactionsCount || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Min Resolution</p>
                <p className="text-slate-900">{formData.minResolution || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Max Resolution</p>
                <p className="text-slate-900">{formData.maxResolution || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">NSFs</p>
                <p className="text-slate-900">{formData.nsfs || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Negative Days</p>
                <p className="text-slate-900">{formData.negativeDays || '—'}</p>
              </div>
              <div>
                <p className="text-green-700 font-medium">Fraud Score</p>
                <p className="text-slate-900">{formData.fraudScore || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-green-700 font-medium">Fraud Reasons</p>
                <p className="text-slate-900">{formData.fraudReasons || '—'}</p>
              </div>
              <div className="col-span-4">
                <p className="text-green-700 font-medium">Notes</p>
                <p className="text-slate-900">{formData.notes || '—'}</p>
              </div>
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