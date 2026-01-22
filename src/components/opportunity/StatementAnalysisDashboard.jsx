import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle, DollarSign, Calendar } from 'lucide-react';

export default function StatementAnalysisDashboard({ statements = [] }) {
  if (statements.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center text-slate-500">
        <p>No statements available for analysis</p>
      </div>
    );
  }

  const latestStatement = statements[0];
  
  const calculateTrends = () => {
    if (statements.length < 2) return null;
    
    const current = statements[0];
    const previous = statements[1];
    
    const currentAvg = Number(current.csbs__Average_Daily_Balance__c) || 0;
    const previousAvg = Number(previous.csbs__Average_Daily_Balance__c) || 0;
    const trend = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg * 100).toFixed(1) : 0;
    
    return { trend, isPositive: Number(trend) >= 0 };
  };

  const trends = calculateTrends();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Average Daily Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${Number(latestStatement.csbs__Average_Daily_Balance__c || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            {trends && (
              <div className={`text-sm mt-2 ${trends.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                <TrendingUp className="w-4 h-4" />
                {trends.isPositive ? '+' : ''}{trends.trend}% from previous
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-900">
              {latestStatement.csbs__Starting_Date__c && `${new Date(latestStatement.csbs__Starting_Date__c).toLocaleDateString()} - ${new Date(latestStatement.csbs__Ending_Date__c).toLocaleDateString()}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Deposits</p>
              <p className="text-lg font-semibold text-slate-900">{latestStatement.csbs__Deposit_Count__c || 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Deposit Amount</p>
              <p className="text-lg font-semibold text-green-600">${Number(latestStatement.csbs__Deposit_Amount__c || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Withdrawals</p>
              <p className="text-lg font-semibold text-slate-900">{latestStatement.csbs__Withdrawals_Count__c || 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Total Withdrawn</p>
              <p className="text-lg font-semibold text-red-600">${Number(latestStatement.csbs__Total_Withdrawals__c || 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(latestStatement.csbs__NSFs__c || latestStatement.csbs__Negative_Days__c) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-4 h-4" />
              Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {latestStatement.csbs__NSFs__c && (
                <div>
                  <p className="text-sm text-yellow-800">NSF Events</p>
                  <p className="text-xl font-semibold text-yellow-900">{latestStatement.csbs__NSFs__c}</p>
                </div>
              )}
              {latestStatement.csbs__Negative_Days__c && (
                <div>
                  <p className="text-sm text-yellow-800">Negative Balance Days</p>
                  <p className="text-xl font-semibold text-yellow-900">{latestStatement.csbs__Negative_Days__c}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}