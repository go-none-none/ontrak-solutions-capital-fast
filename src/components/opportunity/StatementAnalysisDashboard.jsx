import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatementAnalysisDashboard({ statements }) {
  if (!statements || statements.length === 0) {
    return null;
  }

  // Calculate aggregates
  const stats = {
    totalStatements: statements.length,
    avgDailyBalance: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Average_Daily_Balance__c) || 0), 0) / statements.length,
    avgDeposits: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Deposit_Amount__c) || 0), 0) / statements.length,
    avgWithdrawals: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Total_Withdrawals__c) || 0), 0) / statements.length,
    avgDepositCount: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Deposit_Count__c) || 0), 0) / statements.length,
    avgWithdrawalCount: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Withdrawals_Count__c) || 0), 0) / statements.length,
    avgNsfs: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__NSFs__c) || 0), 0) / statements.length,
    avgNegativeDays: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Negative_Days__c) || 0), 0) / statements.length,
    totalTransactions: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Transactions_Count__c) || 0), 0),
  };

  // Timeline data for charts
  const timelineData = statements.map(s => ({
    name: s.csbs__Ending_Date__c ? new Date(s.csbs__Ending_Date__c).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
    balance: parseFloat(s.csbs__Average_Daily_Balance__c) || 0,
    deposits: parseFloat(s.csbs__Deposit_Amount__c) || 0,
    withdrawals: parseFloat(s.csbs__Total_Withdrawals__c) || 0,
    nsfs: parseFloat(s.csbs__NSFs__c) || 0,
    negativeDays: parseFloat(s.csbs__Negative_Days__c) || 0,
  }));

  const riskData = [
    { name: 'Healthy', value: statements.filter(s => (s.csbs__NSFs__c || 0) === 0 && (s.csbs__Negative_Days__c || 0) < 5).length },
    { name: 'Moderate Risk', value: statements.filter(s => ((s.csbs__NSFs__c || 0) > 0 || (s.csbs__Negative_Days__c || 0) >= 5) && (s.csbs__NSFs__c || 0) < 3).length },
    { name: 'High Risk', value: statements.filter(s => (s.csbs__NSFs__c || 0) >= 3).length },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">Statements Analyzed</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalStatements}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-700 font-medium">Avg Daily Balance</p>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgDailyBalance)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-700 font-medium">Avg Deposits</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.avgDeposits)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-700 font-medium">Avg Withdrawals</p>
          <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.avgWithdrawals)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-medium">Avg NSFs</p>
          <p className="text-2xl font-bold text-purple-900">{stats.avgNsfs.toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
          <p className="text-xs text-pink-700 font-medium">Avg Negative Days</p>
          <p className="text-2xl font-bold text-pink-900">{stats.avgNegativeDays.toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <p className="text-xs text-indigo-700 font-medium">Avg Deposits (Count)</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.avgDepositCount.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
          <p className="text-xs text-cyan-700 font-medium">Avg Withdrawals (Count)</p>
          <p className="text-2xl font-bold text-cyan-900">{stats.avgWithdrawalCount.toFixed(0)}</p>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Daily Balance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} name="Avg Daily Balance" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Deposits vs Withdrawals */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Deposits vs Withdrawals</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Health</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Risk Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total NSF Count</span>
              <span className="font-semibold text-slate-900">{statements.reduce((sum, s) => sum + (parseFloat(s.csbs__NSFs__c) || 0), 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total Negative Days</span>
              <span className="font-semibold text-slate-900">{statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Negative_Days__c) || 0), 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total Transactions</span>
              <span className="font-semibold text-slate-900">{stats.totalTransactions.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Healthy Periods</span>
              <span className="font-semibold text-green-600">{riskData[0]?.value || 0} of {stats.totalStatements}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Transaction Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="nsfs" fill="#ef4444" name="NSFs" />
            <Bar dataKey="negativeDays" fill="#f59e0b" name="Negative Days" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}