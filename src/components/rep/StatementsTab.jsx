import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function StatementsTab({ statements }) {
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!statements || statements.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No statements found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statements.map((statement) => (
        <Card key={statement.Id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{statement.Name}</CardTitle>
                <div className="flex gap-2 mt-2 text-sm text-slate-600">
                  <span>{formatDate(statement.csbs__Starting_Date__c)}</span>
                  <span>→</span>
                  <span>{formatDate(statement.csbs__Ending_Date__c)}</span>
                </div>
              </div>
              {statement.csbs__Fraud_Score__c > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Fraud Score: {statement.csbs__Fraud_Score__c}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bank Info */}
              {(statement.csbs__Bank_Name__c || statement.csbs__Account_No__c) && (
                <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b">
                  {statement.csbs__Bank_Name__c && (
                    <div>
                      <span className="text-slate-600 block text-xs">Bank Name</span>
                      <span className="font-medium">{statement.csbs__Bank_Name__c}</span>
                    </div>
                  )}
                  {statement.csbs__Account_No__c && (
                    <div>
                      <span className="text-slate-600 block text-xs">Account No</span>
                      <span className="font-medium">{statement.csbs__Account_No__c}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Balances */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 block text-xs">Starting Balance</span>
                  <span className="font-semibold text-lg">{formatCurrency(statement.csbs__Starting_Balance__c)}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-xs">Ending Balance</span>
                  <span className="font-semibold text-lg text-[#08708E]">{formatCurrency(statement.csbs__Ending_Balance__c)}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-xs">Avg Daily Balance</span>
                  <span className="font-semibold text-lg">{formatCurrency(statement.csbs__Average_Daily_Balance__c)}</span>
                </div>
              </div>

              {/* Transactions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="text-slate-600 block text-xs">Deposits</span>
                    <div className="font-medium">{formatCurrency(statement.csbs__Deposit_Amount__c)}</div>
                    <span className="text-xs text-slate-500">({statement.csbs__Deposit_Count__c || 0} txns)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="text-slate-600 block text-xs">Withdrawals</span>
                    <div className="font-medium">{formatCurrency(statement.csbs__Total_Withdrawals__c)}</div>
                    <span className="text-xs text-slate-500">({statement.csbs__Withdrawals_Count__c || 0} txns)</span>
                  </div>
                </div>
                {statement.csbs__NSFs__c > 0 && (
                  <div>
                    <span className="text-slate-600 block text-xs">NSFs</span>
                    <Badge variant="destructive">{statement.csbs__NSFs__c}</Badge>
                  </div>
                )}
                {statement.csbs__Negative_Days__c > 0 && (
                  <div>
                    <span className="text-slate-600 block text-xs">Negative Days</span>
                    <Badge variant="destructive">{statement.csbs__Negative_Days__c}</Badge>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {statement.csbs__Notes__c && (
                <div className="pt-4 border-t">
                  <span className="text-slate-600 block mb-1 text-xs">Notes:</span>
                  <p className="text-slate-700 text-sm">{statement.csbs__Notes__c}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}