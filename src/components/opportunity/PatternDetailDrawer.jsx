import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Save, CheckCircle, XCircle, AlertTriangle, Edit } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PatternDetailDrawer({ pattern, transactions, isOpen, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description_pattern: pattern?.description_pattern || '',
    category: pattern?.category || 'other',
    frequency: pattern?.frequency || 'irregular',
    rep_notes: pattern?.rep_notes || ''
  });

  if (!isOpen || !pattern) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const patternTransactions = transactions.filter(t => t.recurring_group_id === pattern.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.RecurringPattern.update(pattern.id, {
        ...formData,
        verified: true
      });
      onUpdate();
      setEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (verified) => {
    setSaving(true);
    try {
      await base44.entities.RecurringPattern.update(pattern.id, {
        verified: verified
      });
      onUpdate();
    } catch (error) {
      console.error('Verify error:', error);
      alert('Failed to update verification');
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceExplanation = () => {
    const score = pattern.confidence_score;
    const reasons = [];

    if (pattern.is_mca) {
      reasons.push('Contains MCA/lender keywords');
    }
    if (pattern.frequency === 'daily') {
      reasons.push('Daily frequency pattern detected');
    }
    if (pattern.transaction_count >= 10) {
      reasons.push(`High occurrence count (${pattern.transaction_count})`);
    }
    if (pattern.avg_amount > 100 && pattern.avg_amount < 5000) {
      reasons.push('Amount in typical MCA range');
    }

    if (score >= 75) {
      return { level: 'High', color: 'text-green-600', reasons };
    } else if (score >= 50) {
      return { level: 'Medium', color: 'text-yellow-600', reasons };
    } else {
      return { level: 'Low', color: 'text-red-600', reasons };
    }
  };

  const confidenceInfo = getConfidenceExplanation();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">Pattern Details</h2>
            <p className="text-sm text-slate-600 mt-1">{pattern.description_pattern}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Verification Status */}
          <Card className={`p-4 ${pattern.verified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {pattern.verified ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Verified Pattern</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Requires Verification</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {!pattern.verified && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleVerify(false)} disabled={saving}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleVerify(true)} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  </>
                )}
                {pattern.verified && (
                  <Button size="sm" variant="outline" onClick={() => handleVerify(false)} disabled={saving}>
                    Unverify
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Confidence Indicator */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Confidence Assessment</h3>
              <Badge className={`${confidenceInfo.level === 'High' ? 'bg-green-100 text-green-800' : confidenceInfo.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {confidenceInfo.level} ({pattern.confidence_score}%)
              </Badge>
            </div>
            <ul className="space-y-1 text-sm">
              {confidenceInfo.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </Card>

          {/* Pattern Details */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Pattern Information</h3>
              {!editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                  <Input
                    value={formData.description_pattern}
                    onChange={(e) => setFormData({...formData, description_pattern: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mca_lender">MCA/Lender</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                        <SelectItem value="rent_lease">Rent/Lease</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="transfers">Transfers</SelectItem>
                        <SelectItem value="bank_fees">Bank Fees</SelectItem>
                        <SelectItem value="subscriptions">Subscriptions</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Frequency</label>
                    <Select value={formData.frequency} onValueChange={(val) => setFormData({...formData, frequency: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="irregular">Irregular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                  <Textarea
                    value={formData.rep_notes}
                    onChange={(e) => setFormData({...formData, rep_notes: e.target.value})}
                    placeholder="Add notes about this pattern..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <span className="flex items-center"><span className="animate-spin mr-2">⏳</span>Saving...</span> : <><Save className="w-4 h-4 mr-1" />Save Changes</>}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Category</p>
                  <p className="font-medium capitalize">{pattern.category?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-600">Frequency</p>
                  <p className="font-medium capitalize">{pattern.frequency}</p>
                </div>
                <div>
                  <p className="text-slate-600">Transaction Count</p>
                  <p className="font-medium">{pattern.transaction_count}</p>
                </div>
                <div>
                  <p className="text-slate-600">Total Amount</p>
                  <p className="font-medium">{formatCurrency(pattern.total_amount)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Average Amount</p>
                  <p className="font-medium">{formatCurrency(pattern.avg_amount)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Amount Range</p>
                  <p className="font-medium">{formatCurrency(pattern.min_amount)} - {formatCurrency(pattern.max_amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-600">Notes</p>
                  <p className="font-medium">{pattern.rep_notes || 'No notes'}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Underlying Transactions */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Underlying Transactions ({patternTransactions.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {patternTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                    <p className="text-slate-600 text-xs">{tx.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{formatCurrency(tx.debit > 0 ? tx.debit : tx.credit)}</p>
                    {tx.is_anomaly && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 text-xs">
                        Anomaly
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}