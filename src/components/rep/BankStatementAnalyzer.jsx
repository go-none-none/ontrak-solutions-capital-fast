import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import BankStatementSummary from './BankStatementSummary';
import TransactionTable from './TransactionTable';
import RecurringPatternsList from './RecurringPatternsList';

export default function BankStatementAnalyzer({ recordId, session }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
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
      // Filter for PDF files only
      const pdfs = (response.data.files || []).filter(f => 
        f.FileType === 'PDF' || f.Title?.toLowerCase().endsWith('.pdf')
      );
      setPdfFiles(pdfs);
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

  const toggleFile = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleParseFiles = async () => {
    if (selectedFiles.size === 0) return;

    setParsing(true);
    const filesToParse = pdfFiles.filter(f => selectedFiles.has(f.Id));

    try {
      for (const file of filesToParse) {
        await base44.functions.invoke('parseBankStatement', {
          fileUrl: file.LatestPublishedVersionId,
          opportunityId: recordId
        });
      }
      setSelectedFiles(new Set());
      await loadParsedData();
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
      {pdfFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">PDF Bank Statements</h3>
          <div className="space-y-3 mb-4">
            {pdfFiles.map(file => (
              <label key={file.Id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={selectedFiles.has(file.Id)}
                  onCheckedChange={() => toggleFile(file.Id)}
                />
                <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.Title}</p>
                  <p className="text-xs text-slate-500">{new Date(file.CreatedDate).toLocaleDateString()}</p>
                </div>
              </label>
            ))}
          </div>
          <Button
            onClick={handleParseFiles}
            disabled={selectedFiles.size === 0 || parsing}
            className="w-full bg-[#08708E] hover:bg-[#065a72]"
          >
            {parsing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            {parsing ? 'Analyzing...' : `Analyze ${selectedFiles.size} ${selectedFiles.size === 1 ? 'Statement' : 'Statements'}`}
          </Button>
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
      {bankStatements.length === 0 && pdfFiles.length === 0 && (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No PDF files attached to this opportunity</p>
          <p className="text-sm text-slate-500">Attach bank statement PDFs to the Files section to analyze them</p>
        </div>
      )}
    </div>
  );
}