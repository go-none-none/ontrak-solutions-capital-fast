import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, History } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RecordHistoryModal({ isOpen, onClose, recordId, session }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && recordId && session) {
      fetchHistory();
    }
  }, [isOpen, recordId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [historyResponse, activitiesResponse] = await Promise.all([
        base44.functions.invoke('getSalesforceRecordHistory', { recordId, token: session.token, instanceUrl: session.instanceUrl }),
        base44.functions.invoke('getSalesforceActivities', { recordId, recordType: recordId.startsWith('006') ? 'Opportunity' : recordId.startsWith('00Q') ? 'Lead' : 'Contact', token: session.token, instanceUrl: session.instanceUrl })
      ]);
      setHistory({ ...historyResponse.data, activities: activitiesResponse.data.activities || [] });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record History</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : history ? (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">System Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500 text-xs">Created By</p><p className="font-medium text-slate-900">{history.record.createdBy}</p><p className="text-xs text-slate-500">{formatDate(history.record.createdDate)}</p></div>
                <div><p className="text-slate-500 text-xs">Last Modified By</p><p className="font-medium text-green-600">{history.record.lastModifiedBy}</p><p className="text-xs text-slate-500">{formatDate(history.record.lastModifiedDate)}</p></div>
              </div>
            </div>

            {history.stageHistory && history.stageHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Stage History ({history.stageHistory.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.stageHistory.map((change, idx) => (
                    <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><span className="font-semibold text-orange-900">{change.oldValue || '(None)'} → {change.newValue}</span></div>
                        <p className="text-xs text-orange-700">{formatDate(change.changedDate)}</p>
                      </div>
                      <p className="text-xs text-orange-600">Changed by {change.changedBy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.fieldHistory.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Field Changes ({history.fieldHistory.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.fieldHistory.map((change, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">{change.field}</p>
                        <p className="text-xs text-slate-500">{formatDate(change.changedDate)}</p>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">By {change.changedBy}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><p className="text-xs text-slate-500">Old</p><p className="font-medium text-red-600">{change.oldValue || '(empty)'}</p></div>
                        <div><p className="text-xs text-slate-500">New</p><p className="font-medium text-green-600">{change.newValue || '(empty)'}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.activities && history.activities.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Activities ({history.activities.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.activities.map((activity, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-900">{activity.type === 'email' ? '📧' : activity.type === 'call' ? '📞' : activity.type === 'sms' ? '💬' : '📝'} {activity.subject || activity.type}</p>
                        <p className="text-xs text-slate-500">{formatDate(activity.date)}</p>
                      </div>
                      <p className="text-xs text-slate-500">By {activity.who}</p>
                      {activity.description && (<p className="text-xs text-slate-600 mt-1">{activity.description}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}