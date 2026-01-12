import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function RecurringPatternsTable({ patterns, transactions, onPatternClick }) {
  const [expandedPatterns, setExpandedPatterns] = useState(new Set());

  const togglePattern = (patternId) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(patternId)) {
      newExpanded.delete(patternId);
    } else {
      newExpanded.add(patternId);
    }
    setExpandedPatterns(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getCategoryColor = (category) => {
    const colors = {
      mca_lender: 'bg-red-100 text-red-800',
      payroll: 'bg-blue-100 text-blue-800',
      rent_lease: 'bg-purple-100 text-purple-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      transfers: 'bg-slate-100 text-slate-800',
      bank_fees: 'bg-orange-100 text-orange-800',
      subscriptions: 'bg-green-100 text-green-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      mca_lender: 'MCA/Lender',
      payroll: 'Payroll',
      rent_lease: 'Rent/Lease',
      utilities: 'Utilities',
      transfers: 'Transfers',
      bank_fees: 'Bank Fees',
      subscriptions: 'Subscriptions',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const getConfidenceBadge = (score) => {
    if (score >= 75) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />High</Badge>;
    } else if (score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Medium</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Low</Badge>;
    }
  };

  const getPatternTransactions = (patternId) => {
    return transactions.filter(t => t.recurring_group_id === patternId);
  };

  if (!patterns || patterns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No recurring patterns detected</p>
      </Card>
    );
  }

  // Sort MCA patterns first
  const sortedPatterns = [...patterns].sort((a, b) => {
    if (a.is_mca && !b.is_mca) return -1;
    if (!a.is_mca && b.is_mca) return 1;
    return b.total_amount - a.total_amount;
  });

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Pattern</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Category</th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">Frequency</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Avg Amount</th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Total</th>
              <th className="text-center py-3 px-4 font-medium text-slate-600">Count</th>
              <th className="text-center py-3 px-4 font-medium text-slate-600">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {sortedPatterns.map((pattern) => (
              <React.Fragment key={pattern.id}>
                <tr 
                  className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                    pattern.is_mca ? 'bg-red-50' : ''
                  }`}
                  onClick={() => togglePattern(pattern.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {expandedPatterns.has(pattern.id) ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{pattern.description_pattern}</p>
                        {pattern.is_mca && (
                          <Badge className="bg-red-600 text-white mt-1">MCA Detected</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getCategoryColor(pattern.category)}>
                      {getCategoryLabel(pattern.category)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 capitalize">{pattern.frequency}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(pattern.avg_amount)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(pattern.total_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">{pattern.transaction_count}</td>
                  <td className="py-3 px-4 text-center">{getConfidenceBadge(pattern.confidence_score)}</td>
                </tr>
                {expandedPatterns.has(pattern.id) && (
                  <tr>
                    <td colSpan="7" className="bg-slate-50 p-4">
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                          <div>
                            <p className="text-slate-600">First Occurrence</p>
                            <p className="font-medium">{new Date(pattern.first_occurrence).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Last Occurrence</p>
                            <p className="font-medium">{new Date(pattern.last_occurrence).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Amount Range</p>
                            <p className="font-medium">
                              {formatCurrency(pattern.min_amount)} - {formatCurrency(pattern.max_amount)}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Individual Transactions</p>
                          <div className="space-y-1">
                            {getPatternTransactions(pattern.id).map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                                <span>{new Date(tx.transaction_date).toLocaleDateString()}</span>
                                <span className="text-slate-600">{tx.description}</span>
                                <span className="font-medium">
                                  {formatCurrency(tx.debit > 0 ? tx.debit : tx.credit)}
                                </span>
                                {tx.is_anomaly && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 text-xs">
                                    Anomaly
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}