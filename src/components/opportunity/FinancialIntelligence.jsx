import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FinancialIntelligence({ opportunityId, session }) {
  const [analysis, setAnalysis] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [opportunityId]);

  const loadAnalysis = async () => {
    try {
      const [analysisData, transactionData] = await Promise.all([
        base44.entities.FinancialAnalysis.filter({ opportunity_id: opportunityId }),
        base44.entities.BankTransaction.filter({ opportunity_id: opportunityId })
      ]);

      setAnalysis(analysisData[0] || null);
      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    setParsing(true);
    try {
      await base44.functions.invoke('parseBankStatements', {
        opportunityId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      await loadAnalysis();
    } catch (error) {
      console.error('Parse error:', error);
      alert('Failed to parse statements');
    } finally {
      setParsing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#08708E]" />
      </div>
    );
  }

  if (!analysis || analysis.parsing_status === 'pending') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Financial Intelligence
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Parse bank statements to extract financial insights and auto-populate opportunity fields.
          </p>
          <Button onClick={handleParse} disabled={parsing}>
            {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Parse Bank Statements
          </Button>
        </div>
      </Card>
    );
  }

  if (analysis.parsing_status === 'processing') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#08708E] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Processing Bank Statements
          </h3>
          <p className="text-sm text-slate-600">
            Parsing {analysis.pdf_count} PDFs and extracting transactions...
          </p>
        </div>
      </Card>
    );
  }

  if (analysis.parsing_status === 'failed') {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Parsing Failed
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {analysis.error_message || 'Unknown error'}
          </p>
          <Button onClick={handleParse} disabled={parsing} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Financial Intelligence</h3>
          <p className="text-sm text-slate-600">
            {analysis.total_transactions} transactions from {analysis.pdf_count} statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!analysis.verified && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              Review Required
            </Badge>
          )}
          <Button onClick={handleParse} disabled={parsing} variant="outline" size="sm">
            {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Re-parse
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Deposits</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.total_deposits)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(analysis.total_withdrawals)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${analysis.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(analysis.net_cash_flow)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#08708E]" />
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-600 mb-1">NSF Count</p>
            <p className="text-lg font-semibold text-slate-900">{analysis.nsf_count || 0}</p>
          </div>
          <div>
            <p className="text-slate-600 mb-1">Negative Days</p>
            <p className="text-lg font-semibold text-slate-900">{analysis.negative_days_count || 0}</p>
          </div>
          <div>
            <p className="text-slate-600 mb-1">Date Range</p>
            <p className="text-lg font-semibold text-slate-900">
              {analysis.date_range_start ? new Date(analysis.date_range_start).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-slate-600 mb-1">Statements</p>
            <p className="text-lg font-semibold text-slate-900">{analysis.pdf_count}</p>
          </div>
        </div>
      </Card>

      {/* Transaction Table Preview */}
      <Card className="p-4">
        <h4 className="font-semibold text-slate-900 mb-4">Recent Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-medium text-slate-600">Date</th>
                <th className="text-left py-2 px-2 font-medium text-slate-600">Description</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Debit</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Credit</th>
                <th className="text-right py-2 px-2 font-medium text-slate-600">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                  <td className="py-2 px-2">{tx.description}</td>
                  <td className="py-2 px-2 text-right text-red-600">
                    {tx.debit > 0 ? formatCurrency(tx.debit) : ''}
                  </td>
                  <td className="py-2 px-2 text-right text-green-600">
                    {tx.credit > 0 ? formatCurrency(tx.credit) : ''}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {tx.balance > 0 ? formatCurrency(tx.balance) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All {transactions.length} Transactions
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}