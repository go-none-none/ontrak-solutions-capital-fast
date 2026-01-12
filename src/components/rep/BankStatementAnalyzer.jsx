import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BankStatementSummary from './BankStatementSummary';
import TransactionTable from './TransactionTable';
import RecurringPatternsList from './RecurringPatternsList';

export default function BankStatementAnalyzer({ opportunityId }) {
  const [bankStatement, setBankStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dataVerified, setDataVerified] = useState(false);

  useEffect(() => {
    loadBankStatementData();
  }, [opportunityId]);

  const loadBankStatementData = async () => {
    setLoading(true);
    try {
      const [stmtRes, txnRes, pattRes] = await Promise.all([
        base44.entities.BankStatement.filter({ opportunity_id: opportunityId }, '-created_date', 1),
        base44.entities.Transaction.filter({ opportunity_id: opportunityId }, '-transaction_date', 1000),
        base44.entities.RecurringPattern.filter({ opportunity_id: opportunityId }, '-confidence_score', 100)
      ]);

      if (stmtRes.length > 0) {
        setBankStatement(stmtRes[0]);
        setDataVerified(stmtRes[0].data_verified || false);
      }
      setTransactions(txnRes);
      setPatterns(pattRes);
    } catch (error) {
      console.error('Error loading bank statement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      
      // Parse it
      await base44.functions.invoke('parseBankStatement', {
        fileUrl: uploadRes.file_url,
        opportunityId: opportunityId
      });

      // Reload data
      await loadBankStatementData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload and parse statement');
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyData = async () => {
    if (!bankStatement) return;
    setVerifying(true);
    try {
      await base44.entities.BankStatement.update(bankStatement.id, {
        data_verified: true
      });
      setDataVerified(true);
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify data');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#08708E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Bank Statements</h3>
        <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#08708E] transition-colors">
          <div className="text-center">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Upload Bank Statement</p>
            <p className="text-xs text-slate-500">PDF format, any bank</p>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Verification Banner */}
      {bankStatement && !dataVerified && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Parsed data review required. Please verify the extracted information before proceeding.
            <Button
              size="sm"
              onClick={handleVerifyData}
              disabled={verifying}
              className="ml-2 bg-amber-600 hover:bg-amber-700"
            >
              {verifying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
              Confirm Data
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Verified Badge */}
      {bankStatement && dataVerified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Data verified by {bankStatement.verified_by} on {new Date(bankStatement.verified_date).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {bankStatement && (
        <>
          <BankStatementSummary bankStatement={bankStatement} />
          <TransactionTable transactions={transactions} />
          <RecurringPatternsList patterns={patterns} />
        </>
      )}

      {!bankStatement && (
        <div className="text-center py-12 text-slate-500">
          <p>No bank statements uploaded yet</p>
        </div>
      )}
    </div>
  );
}