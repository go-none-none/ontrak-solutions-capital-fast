import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function TransactionTable({ transactions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = transactions.filter(txn => {
    const matchSearch = txn.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || txn.category === categoryFilter;
    const matchType = typeFilter === 'all' || txn.type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const categoryColors = {
    mca: 'bg-red-100 text-red-800',
    payroll: 'bg-blue-100 text-blue-800',
    rent: 'bg-purple-100 text-purple-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    insurance: 'bg-green-100 text-green-800',
    loan_payment: 'bg-orange-100 text-orange-800',
    vendor_payment: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="mca">MCA</SelectItem>
            <SelectItem value="payroll">Payroll</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="loan_payment">Loan Payment</SelectItem>
            <SelectItem value="vendor_payment">Vendor Payment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="debit">Debits</SelectItem>
            <SelectItem value="credit">Credits</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-3 font-semibold text-slate-700">Date</th>
              <th className="text-left p-3 font-semibold text-slate-700">Description</th>
              <th className="text-left p-3 font-semibold text-slate-700">Category</th>
              <th className="text-right p-3 font-semibold text-slate-700">Amount</th>
              <th className="text-center p-3 font-semibold text-slate-700">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((txn, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-600">{formatDate(txn.transaction_date)}</td>
                  <td className="p-3 text-slate-900 max-w-xs truncate">{txn.description}</td>
                  <td className="p-3">
                    <Badge className={categoryColors[txn.category] || categoryColors.other}>
                      {txn.category?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className={`p-3 text-right font-semibold ${
                    txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(txn.amount))}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      txn.type === 'credit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}
    </div>
  );
}