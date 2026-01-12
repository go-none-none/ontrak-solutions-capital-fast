import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, FileText, X } from 'lucide-react';

export default function TransactionTable({ transactions, onViewPDF }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mcaFilter, setMcaFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (search) {
      filtered = filtered.filter(tx =>
        tx.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tx => tx.category === categoryFilter);
    }

    // MCA filter
    if (mcaFilter === 'mca') {
      filtered = filtered.filter(tx => tx.is_mca);
    } else if (mcaFilter === 'non-mca') {
      filtered = filtered.filter(tx => !tx.is_mca);
    }

    // Amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      filtered = filtered.filter(tx => {
        const amount = tx.debit > 0 ? tx.debit : tx.credit;
        return amount >= min;
      });
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      filtered = filtered.filter(tx => {
        const amount = tx.debit > 0 ? tx.debit : tx.credit;
        return amount <= max;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'transaction_date') {
        aVal = new Date(a.transaction_date);
        bVal = new Date(b.transaction_date);
      } else if (sortField === 'amount') {
        aVal = a.debit > 0 ? a.debit : a.credit;
        bVal = b.debit > 0 ? b.debit : b.credit;
      } else if (sortField === 'description') {
        aVal = a.description?.toLowerCase() || '';
        bVal = b.description?.toLowerCase() || '';
      } else if (sortField === 'balance') {
        aVal = a.balance || 0;
        bVal = b.balance || 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, search, sortField, sortDirection, typeFilter, categoryFilter, mcaFilter, minAmount, maxAmount]);

  const activeFiltersCount = [
    search,
    typeFilter !== 'all',
    categoryFilter !== 'all',
    mcaFilter !== 'all',
    minAmount,
    maxAmount
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMcaFilter('all');
    setMinAmount('');
    setMaxAmount('');
  };

  const categories = [...new Set(transactions.filter(t => t.category).map(t => t.category))];

  return (
    <Card className="p-4">
      {/* Filters */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat?.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mcaFilter} onValueChange={setMcaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="MCA Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="mca">MCA Only</SelectItem>
              <SelectItem value="non-mca">Non-MCA</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600 mb-3">
        Showing {filteredAndSorted.length} of {transactions.length} transactions
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th 
                className="text-left py-2 px-2 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('transaction_date')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="text-left py-2 px-2 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center gap-1">
                  Description
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-left py-2 px-2 font-medium text-slate-600">Category</th>
              <th 
                className="text-right py-2 px-2 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Debit
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="text-right py-2 px-2 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Credit
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="text-right py-2 px-2 font-medium text-slate-600 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center justify-end gap-1">
                  Balance
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="text-center py-2 px-2 font-medium text-slate-600">PDF</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((tx, idx) => (
              <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 ${
                tx.is_mca ? 'bg-red-50' : ''
              }`}>
                <td className="py-2 px-2 whitespace-nowrap">
                  {new Date(tx.transaction_date).toLocaleDateString()}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {tx.description}
                    {tx.is_anomaly && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                        Anomaly
                      </Badge>
                    )}
                    {tx.is_mca && (
                      <Badge className="text-xs bg-red-600 text-white">
                        MCA
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2">
                  {tx.is_recurring && tx.category && (
                    <Badge variant="outline" className="text-xs">
                      {tx.category.replace('_', ' ')}
                    </Badge>
                  )}
                </td>
                <td className="py-2 px-2 text-right text-red-600 font-medium">
                  {tx.debit > 0 ? formatCurrency(tx.debit) : ''}
                </td>
                <td className="py-2 px-2 text-right text-green-600 font-medium">
                  {tx.credit > 0 ? formatCurrency(tx.credit) : ''}
                </td>
                <td className="py-2 px-2 text-right font-medium">
                  {tx.balance > 0 ? formatCurrency(tx.balance) : ''}
                </td>
                <td className="py-2 px-2 text-center">
                  {tx.pdf_filename && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewPDF && onViewPDF(tx.pdf_filename, tx.page_number)}
                      className="h-6 w-6 p-0"
                    >
                      <FileText className="w-4 h-4 text-[#08708E]" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-600">No transactions match your filters</p>
        </div>
      )}
    </Card>
  );
}