import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ViewStatementModal({ isOpen, onClose, statement }) {
  if (!statement) return null;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Statement Details</DialogTitle>
            {statement.csbs__Reconciled__c && (
              <Badge className="bg-green-600">Reconciled</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">Bank Name</p><p className="font-medium text-slate-900">{statement.csbs__Bank_Name__c || '-'}</p></div>
              <div><p className="text-slate-500 mb-1">Account Number</p><p className="font-medium text-slate-900">{statement.csbs__Account_No__c || '-'}</p></div>
              <div><p className="text-slate-500 mb-1">Account Title</p><p className="font-medium text-slate-900">{statement.csbs__Account_Title__c || '-'}</p></div>
              <div><p className="text-slate-500 mb-1">Company</p><p className="font-medium text-slate-900">{statement.csbs__Company__c || '-'}</p></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Statement Period</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">Starting Date</p><p className="font-medium text-slate-900">{formatDate(statement.csbs__Starting_Date__c)}</p></div>
              <div><p className="text-slate-500 mb-1">Ending Date</p><p className="font-medium text-slate-900">{formatDate(statement.csbs__Ending_Date__c)}</p></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Balances</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">Starting Balance</p><p className="font-bold text-lg text-slate-900">{formatCurrency(statement.csbs__Starting_Balance__c)}</p></div>
              <div><p className="text-slate-500 mb-1">Ending Balance</p><p className="font-bold text-lg text-slate-900">{formatCurrency(statement.csbs__Ending_Balance__c)}</p></div>
              <div><p className="text-slate-500 mb-1">Average Daily Balance</p><p className="font-bold text-lg text-orange-600">{formatCurrency(statement.csbs__Average_Daily_Balance__c)}</p></div>
              {statement.csbs__Reconciled__c && (
                <div><p className="text-slate-500 mb-1">Unreconciled End Balance</p><p className="font-medium text-slate-900">{formatCurrency(statement.csbs__Unreconciled_End_Balance__c)}</p></div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Transactions</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">Deposit Count</p><p className="font-medium text-green-600">{statement.csbs__Deposit_Count__c || 0}</p></div>
              <div><p className="text-slate-500 mb-1">Deposit Amount</p><p className="font-medium text-green-600">{formatCurrency(statement.csbs__Deposit_Amount__c)}</p></div>
              <div><p className="text-slate-500 mb-1">Withdrawals Count</p><p className="font-medium text-red-600">{statement.csbs__Withdrawals_Count__c || 0}</p></div>
              <div><p className="text-slate-500 mb-1">Total Withdrawals</p><p className="font-medium text-red-600">{formatCurrency(statement.csbs__Total_Withdrawals__c)}</p></div>
              <div><p className="text-slate-500 mb-1">Total Transactions</p><p className="font-medium text-slate-900">{statement.csbs__Transactions_Count__c || 0}</p></div>
              {statement.csbs__Min_Resolution__c && (
                <div><p className="text-slate-500 mb-1">Min Resolution</p><p className="font-medium text-slate-900">{statement.csbs__Min_Resolution__c}</p></div>
              )}
              {statement.csbs__Max_Resolution__c && (
                <div><p className="text-slate-500 mb-1">Max Resolution</p><p className="font-medium text-slate-900">{statement.csbs__Max_Resolution__c}</p></div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Risk Indicators</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 mb-1">NSFs</p><p className={`font-bold text-lg ${statement.csbs__NSFs__c > 0 ? 'text-red-600' : 'text-green-600'}`}>{statement.csbs__NSFs__c || 0}</p></div>
              <div><p className="text-slate-500 mb-1">Negative Days</p><p className={`font-bold text-lg ${statement.csbs__Negative_Days__c > 0 ? 'text-red-600' : 'text-green-600'}`}>{statement.csbs__Negative_Days__c || 0}</p></div>
              {statement.csbs__Fraud_Score__c && (
                <div><p className="text-slate-500 mb-1">Fraud Score</p><p className="font-bold text-lg text-slate-900">{statement.csbs__Fraud_Score__c}</p></div>
              )}
              {statement.csbs__Fraud_Reasons__c && (
                <div className="col-span-2"><p className="text-slate-500 mb-1">Fraud Reasons</p><p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{statement.csbs__Fraud_Reasons__c}</p></div>
              )}
            </div>
          </div>

          {statement.csbs__Notes__c && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b">Notes</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{statement.csbs__Notes__c}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}