import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';

export default function DebtTab({ debt }) {
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!debt || debt.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No debt records found</p>
      </div>
    );
  }

  const totalBalance = debt.reduce((sum, d) => sum + (d.csbs__Balance__c || 0), 0);
  const totalPayment = debt.reduce((sum, d) => sum + (d.csbs__Payment__c || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="text-sm text-red-700 mb-1">Total Balance</div>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="text-sm text-orange-700 mb-1">Total Monthly Payment</div>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(totalPayment)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Items */}
      {debt.map((item) => (
        <Card key={item.Id} className={`hover:shadow-md transition-shadow ${item.csbs__Open_Position__c ? 'border-orange-500 border-2' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{item.Name}</CardTitle>
                  {item.csbs__Open_Position__c && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Open Position
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {item.csbs__Type__c && (
                    <Badge variant="outline">{item.csbs__Type__c}</Badge>
                  )}
                  {item.csbs__Frequency__c && (
                    <Badge variant="secondary">{item.csbs__Frequency__c}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600 block text-xs">Balance</span>
                <span className="font-semibold text-lg text-red-600">{formatCurrency(item.csbs__Balance__c)}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-xs">Payment</span>
                <span className="font-semibold text-lg">{formatCurrency(item.csbs__Payment__c)}</span>
              </div>
              {item.csbs__Estimated_Monthly_MCA_Amount__c && (
                <div>
                  <span className="text-slate-600 block text-xs">Est. Monthly MCA</span>
                  <span className="font-semibold text-lg">{formatCurrency(item.csbs__Estimated_Monthly_MCA_Amount__c)}</span>
                </div>
              )}
            </div>
            
            {(item.csbs__Creditor__c || item.csbs__Lender__c) && (
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                {item.csbs__Creditor__c && (
                  <div>
                    <span className="text-slate-600 block text-xs">Creditor</span>
                    <span className="font-medium">{item.csbs__Creditor__c}</span>
                  </div>
                )}
                {item.csbs__Lender__c && (
                  <div>
                    <span className="text-slate-600 block text-xs">Lender</span>
                    <span className="font-medium">{item.csbs__Lender__c}</span>
                  </div>
                )}
              </div>
            )}

            {item.csbs__Notes__c && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-slate-600 block mb-1 text-xs">Notes:</span>
                <p className="text-slate-700 text-sm">{item.csbs__Notes__c}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}