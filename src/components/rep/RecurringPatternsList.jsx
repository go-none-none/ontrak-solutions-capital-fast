import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Repeat2 } from 'lucide-react';

export default function RecurringPatternsList({ patterns = [] }) {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <p className="text-slate-600">No recurring patterns detected</p>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(val);
  };

  const confidenceColor = (score) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Recurring Transactions</h3>
      <div className="space-y-3">
        {patterns.map((pattern, idx) => (
          <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900">{pattern.pattern_name}</h4>
                  {pattern.is_mca && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      MCA
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{pattern.description_keywords}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Frequency</p>
                    <p className="font-semibold text-slate-900 capitalize">{pattern.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Occurrences</p>
                    <p className="font-semibold text-slate-900">{pattern.occurrence_count}x</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Average</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(pattern.average_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(pattern.total_paid)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge className={confidenceColor(pattern.confidence_score)}>
                  {pattern.confidence_score}% confident
                </Badge>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  pattern.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {pattern.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}