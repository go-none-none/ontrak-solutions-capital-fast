import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import BankStatementSummary from './BankStatementSummary';
import TransactionTable from './TransactionTable';
import RecurringPatternsList from './RecurringPatternsList';

export default function BankStatementAnalyzer({ recordId, session }) {
  const [files, setFiles] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [bankStatements, setBankStatements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [activeStatement, setActiveStatement] = useState(null);

  useEffect(() => {
    loadFiles();
    loadParsedData();
  }, [recordId]);

  const loadFiles = async () => {
    try {
      const response = await base44.functions.invoke('getSalesforceFiles', {
        recordId: recordId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      const pdfFiles = (response.data.files || []).filter(f => 
        f.FileType === 'PDF' || f.Title?.toLowerCase().endsWith('.pdf')
      );
      setFiles(pdfFiles);
    } catch (error) {
      console.error('Load files error:', error);
    }
  };

  const loadParsedData = async () => {
    try {
      const stmtsRes = await base44.entities.BankStatement.filter(
        { opportunity_id: recordId },
        '-created_date',
        10
      );
      setBankStatements(stmtsRes);

      if (stmtsRes.length > 0) {
        const txnsRes = await base44.entities.Transaction.filter(
          { opportunity_id: recordId },
          'transaction_date',
          1000
        );
        setTransactions(txnsRes);

        const patternsRes = await base44.entities.RecurringPattern.filter(
          { opportunity_id: recordId },
          '-confidence_score',
          100
        );
        setPatterns(patternsRes);

        setActiveStatement(stmtsRes[0]);
      }
    } catch (error) {
      console.error('Load parsed data error:', error);
    }
  };

  const handleParseFile = async () => {
    if (!selectedFileUrl) return;

    setParsing(true);
    try {
      const response = await base44.functions.invoke('parseBankStatement', {
        fileUrl: selectedFileUrl,
        opportunityId: recordId
      });

      if (response.data.success) {
        setSelectedFileUrl(null);
        await loadParsedData();
      }
    } catch (error) {
      console.error('Parse error:', error);
      alert(`Parse failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setParsing(false);
    }
  };

  const activeTransactions = activeStatement
    ? transactions.filter(t => t.bank_statement_id === activeStatement.id)
    : [];
  const activePatterns = activeStatement
    ? patterns.filter(p => p.opportunity_id === recordId)
    : [];

  return (
    <div className="space-y-6">
      {/* File Selection & Parsing */}
      {files.length > 0 && bankStatements.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Parse Bank Statements</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select a file to analyze:</label>
              <select
                value={selectedFileUrl}
                onChange={(e) => setSelectedFileUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08708E]"
              >
                <option value="">Choose a PDF...</option>
                {files.map(file => (
                  <option key={file.Id} value={file.LatestPublishedVersionId}>
                    {file.Title}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleParseFile}
              disabled={!selectedFileUrl || parsing}
              className="bg-[#08708E] hover:bg-[#065a72] w-full"
            >
              {parsing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {parsing ? 'Analyzing...' : 'Analyze Bank Statement'}
            </Button>
          </div>
        </div>
      )}

      {/* Statement Selection */}
      {bankStatements.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Parsed Statements</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {bankStatements.map(stmt => (
              <Button
                key={stmt.id}
                variant={activeStatement?.id === stmt.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStatement(stmt)}
                className={activeStatement?.id === stmt.id ? 'bg-[#08708E]' : ''}
              >
                {stmt.bank_name} - {new Date(stmt.statement_start_date).toLocaleDateString()}
                {stmt.parsing_status === 'completed' && <CheckCircle2 className="w-3 h-3 ml-2" />}
                {stmt.parsing_status === 'failed' && <AlertCircle className="w-3 h-3 ml-2" />}
              </Button>
            ))}
          </div>

          {files.length > bankStatements.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFileUrl(null)}
              className="mb-6"
            >
              Parse Another File
            </Button>
          )}
        </div>
      )}

      {/* Summary */}
      {activeStatement && activeStatement.parsing_status === 'completed' && (
        <BankStatementSummary bankStatement={activeStatement} />
      )}

      {/* Recurring Patterns */}
      {activeStatement && activePatterns.length > 0 && (
        <RecurringPatternsList patterns={activePatterns} />
      )}

      {/* Transactions Table */}
      {activeStatement && activeTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Transactions</h3>
          <TransactionTable transactions={activeTransactions} />
        </div>
      )}

      {/* Empty State */}
      {bankStatements.length === 0 && files.length === 0 && (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No bank statement files attached</p>
          <p className="text-sm text-slate-500">Upload PDF bank statements in the Files section to analyze</p>
        </div>
      )}
    </div>
  );
}