import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BankStatementSummary({ bankStatement }) {
  if (!bankStatement) return null;

  const cards = [
    {
      label: 'Total Deposits',
      value: bankStatement.total_deposits,
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Total Withdrawals',
      value: bankStatement.total_withdrawals,
      icon: TrendingDown,
      color: 'red'
    },
    {
      label: 'Net Cash Flow',
      value: bankStatement.net_cash_flow,
      icon: DollarSign,
      color: bankStatement.net_cash_flow >= 0 ? 'green' : 'red'
    },
    {
      label: 'Avg Daily Balance',
      value: bankStatement.average_daily_balance,
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'NSF Count',
      value: bankStatement.nsf_count || 0,
      icon: AlertCircle,
      color: bankStatement.nsf_count > 0 ? 'red' : 'gray'
    },
    {
      label: 'MCA Payments',
      value: bankStatement.total_mca_payments,
      icon: AlertCircle,
      color: bankStatement.total_mca_payments > 0 ? 'orange' : 'gray'
    }
  ];

  const formatCurrency = (val) => {
    if (!val) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(val);
  };

  const colorClasses = {
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    gray: 'from-gray-400 to-gray-500'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Financial Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const bgColor = colorClasses[card.color];
          return (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.label.includes('Count') ? card.value : formatCurrency(card.value)}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}