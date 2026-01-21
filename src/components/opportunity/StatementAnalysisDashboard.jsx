import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Activity, Calendar, CreditCard, BarChart3 } from 'lucide-react';

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
    totalDeposits: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Deposit_Amount__c) || 0), 0),
    totalWithdrawals: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Total_Withdrawals__c) || 0), 0),
    totalNsfs: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__NSFs__c) || 0), 0),
    totalNegativeDays: statements.reduce((sum, s) => sum + (parseFloat(s.csbs__Negative_Days__c) || 0), 0),
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

  const getHealthScore = () => {
    const healthyCount = riskData[0]?.value || 0;
    const totalCount = stats.totalStatements;
    return ((healthyCount / totalCount) * 100).toFixed(0);
  };

  const healthScore = getHealthScore();
  const isHealthy = healthScore >= 70;

  return (
    <div className="space-y-6">
      {/* Hero Stats - Key Metrics */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Account Health Score</p>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-bold">{healthScore}%</p>
              <p className="text-orange-100 mb-2">{isHealthy ? 'Healthy' : 'Needs Attention'}</p>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${isHealthy ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {isHealthy ? <TrendingUp className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-orange-100 text-xs mb-1">Periods</p>
            <p className="text-2xl font-bold">{stats.totalStatements}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-orange-100 text-xs mb-1">Avg Balance</p>
            <p className="text-lg font-bold">{formatCurrency(stats.avgDailyBalance)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-orange-100 text-xs mb-1">Total Deposits</p>
            <p className="text-lg font-bold">{formatCurrency(stats.totalDeposits)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-semibold">+{stats.avgDepositCount.toFixed(0)}/mo</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Deposits</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.avgDeposits)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-semibold">-{stats.avgWithdrawalCount.toFixed(0)}/mo</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Withdrawals</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.avgWithdrawals)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-semibold">{stats.totalNsfs} total</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg NSFs</p>
          <p className="text-2xl font-bold text-slate-900">{stats.avgNsfs.toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-semibold">{stats.totalNegativeDays} total</span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Negative Days</p>
          <p className="text-2xl font-bold text-slate-900">{stats.avgNegativeDays.toFixed(1)}</p>
        </div>
      </div>

      {/* Comprehensive Banking Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-slate-900">Banking Activity Summary</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">Total Transactions</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.totalTransactions.toFixed(0)}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-medium">Total Deposits</p>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalDeposits)}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <p className="text-xs text-rose-700 font-medium">Total Withdrawals</p>
            </div>
            <p className="text-2xl font-bold text-rose-900">{formatCurrency(stats.totalWithdrawals)}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <p className="text-xs text-indigo-700 font-medium">Net Cash Flow</p>
            </div>
            <p className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.totalDeposits - stats.totalWithdrawals)}</p>
          </div>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-slate-900">Daily Balance Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timelineData}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} stroke="#64748b" />
            <YAxis style={{ fontSize: '12px' }} stroke="#64748b" />
            <Tooltip 
              formatter={(value) => formatCurrency(value)} 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              name="Avg Daily Balance"
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#balanceGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Deposits vs Withdrawals */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-slate-900">Deposits vs Withdrawals</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} stroke="#64748b" />
            <YAxis style={{ fontSize: '12px' }} stroke="#64748b" />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
            <Legend />
            <Bar dataKey="deposits" fill="#10b981" name="Deposits" radius={[8, 8, 0, 0]} />
            <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-slate-900">Account Health Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-slate-900">Risk Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-red-700 font-medium">Total NSF Count</span>
                <span className="text-2xl font-bold text-red-900">{stats.totalNsfs}</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.totalNsfs / (stats.totalStatements * 5)) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-amber-700 font-medium">Total Negative Days</span>
                <span className="text-2xl font-bold text-amber-900">{stats.totalNegativeDays}</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.totalNegativeDays / (stats.totalStatements * 10)) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700 font-medium">Healthy Periods</span>
                <span className="text-2xl font-bold text-green-900">{riskData[0]?.value || 0} / {stats.totalStatements}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators Over Time */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-slate-900">Risk Indicators Over Time</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} stroke="#64748b" />
            <YAxis style={{ fontSize: '12px' }} stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <Legend />
            <Bar dataKey="nsfs" fill="#ef4444" name="NSFs" radius={[8, 8, 0, 0]} />
            <Bar dataKey="negativeDays" fill="#f59e0b" name="Negative Days" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}