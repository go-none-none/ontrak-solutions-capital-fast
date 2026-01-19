import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RecordHistory() {
  const [session, setSession] = useState(null);
  const [recordId, setRecordId] = useState('006Vz00000PoMRyIAN');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    }
  }, []);

  const fetchHistory = async () => {
    if (!session) {
      alert('No Salesforce session found. Please login first.');
      return;
    }

    setLoading(true);
    try {
      const [historyResponse, activitiesResponse] = await Promise.all([
        base44.functions.invoke('getSalesforceRecordHistory', {
          recordId,
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforceActivities', {
          recordId,
          recordType: recordId.startsWith('006') ? 'Opportunity' : recordId.startsWith('00Q') ? 'Lead' : 'Contact',
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]);

      setHistory({
        ...historyResponse.data,
        activities: activitiesResponse.data.activities || []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Record History Viewer</h1>
          
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Enter Record ID"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchHistory} disabled={loading || !session}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Fetch History
            </Button>
          </div>

          {!session && (
            <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No Salesforce session found. Please login via Rep Portal first.
            </p>
          )}
        </div>

        {history && (
          <div className="space-y-6">
            {/* System Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">System Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Object Type</p>
                  <p className="font-medium text-slate-900">{history.objectType}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Record ID</p>
                  <p className="font-medium text-slate-900">{history.record.id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Created By</p>
                  <p className="font-medium text-slate-900">{history.record.createdBy}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Created Date</p>
                  <p className="font-medium text-slate-900">{formatDate(history.record.createdDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Last Modified By</p>
                  <p className="font-medium text-green-600">{history.record.lastModifiedBy}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Last Modified Date</p>
                  <p className="font-medium text-green-600">{formatDate(history.record.lastModifiedDate)}</p>
                </div>
              </div>
            </div>

            {/* Field History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Field Change History ({history.fieldHistory.length} changes)
              </h2>
              
              {history.fieldHistory.length === 0 ? (
                <p className="text-slate-600 text-center py-8">
                  No field history available. Field history tracking may not be enabled for this object.
                </p>
              ) : (
                <div className="space-y-3">
                  {history.fieldHistory.map((change, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{change.field}</p>
                          <p className="text-xs text-slate-500">
                            Changed by {change.changedBy} • {formatDate(change.changedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Old Value</p>
                          <p className="text-sm font-medium text-red-600">
                            {change.oldValue || '(empty)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">New Value</p>
                          <p className="text-sm font-medium text-green-600">
                            {change.newValue || '(empty)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History */}
            {history.activities && history.activities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Activity History ({history.activities.length} activities)
                </h2>
                <div className="space-y-3">
                  {history.activities.map((activity, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {activity.type === 'email' ? '📧' : activity.type === 'call' ? '📞' : activity.type === 'sms' ? '💬' : '📝'}{' '}
                            {activity.subject || activity.type}
                          </p>
                          <p className="text-xs text-slate-500">
                            By {activity.who} • {formatDate(activity.date)}
                          </p>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-slate-600 mt-2">{activity.description}</p>
                      )}
                      {activity.status && (
                        <p className="text-xs text-slate-500 mt-1">Status: {activity.status}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}