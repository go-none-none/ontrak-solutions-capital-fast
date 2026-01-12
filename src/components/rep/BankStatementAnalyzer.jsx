import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BankStatementSummary from './BankStatementSummary';
import TransactionTable from './TransactionTable';
import RecurringPatternsList from './RecurringPatternsList';

export default function BankStatementAnalyzer({ opportunityId, session }) {
  const [bankStatement, setBankStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dataVerified, setDataVerified] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState('');

  useEffect(() => {
    loadData();
  }, [opportunityId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stmtRes, txnRes, pattRes, filesRes] = await Promise.all([
        base44.entities.BankStatement.filter({ opportunity_id: opportunityId }, '-created_date', 1),
        base44.entities.Transaction.filter({ opportunity_id: opportunityId }, '-transaction_date', 1000),
        base44.entities.RecurringPattern.filter({ opportunity_id: opportunityId }, '-confidence_score', 100),
        base44.functions.invoke('getSalesforceFiles', {
          recordId: opportunityId,
          token: session?.token,
          instanceUrl: session?.instanceUrl
        })
      ]);

      if (stmtRes.length > 0) {
        setBankStatement(stmtRes[0]);
        setDataVerified(stmtRes[0].data_verified || false);
      }
      setTransactions(txnRes);
      setPatterns(pattRes);
      
      const pdfFiles = filesRes.data?.files?.filter(f => f.FileExtension?.toLowerCase() === 'pdf') || [];
      setFiles(filesRes.data?.files || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParseFile = async () => {
    if (!selectedFileId) return;
    
    const file = files.find(f => f.Id === selectedFileId);
    if (!file) return;

    setParsing(true);
    try {
      // Get file content URL
      const contentRes = await base44.functions.invoke('getSalesforceFileContent', {
        fileId: selectedFileId,
        token: session?.token,
        instanceUrl: session?.instanceUrl
      });
      
      // Parse it
      await base44.functions.invoke('parseBankStatement', {
        fileUrl: contentRes.data.contentUrl,
        opportunityId: opportunityId
      });

      // Reload data
      await loadData();
      setSelectedFileId('');
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse statement');
    } finally {
      setParsing(false);
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

  const pdfFiles = files.filter(f => f.FileExtension?.toLowerCase() === 'pdf');

  return (
    <div className="space-y-6">
      {/* File Selection Section */}
      {!bankStatement && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Bank Statement</h3>
          {pdfFiles.length > 0 ? (
            <div className="space-y-3">
              <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a PDF statement..." />
                </SelectTrigger>
                <SelectContent>
                  {pdfFiles.map(file => (
                    <SelectItem key={file.Id} value={file.Id}>
                      {file.Title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleParseFile}
                disabled={!selectedFileId || parsing}
                className="w-full bg-[#08708E] hover:bg-[#065a75]"
              >
                {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Parse Statement
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No PDF files found. Upload statements to the Files section first.</p>
          )}
        </div>
      )}

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