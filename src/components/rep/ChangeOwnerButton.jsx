import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChangeOwnerButton({ record, recordType, session, onOwnerChanged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      loadUsers();
    }
  }, [isOpen]);

  const checkAdminStatus = async () => {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getSalesforceUsers', {
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOwner = async () => {
    if (!selectedUserId) return;

    setSaving(true);
    try {
      await base44.functions.invoke('changeRecordOwner', {
        recordId: record.Id,
        newOwnerId: selectedUserId,
        recordType: recordType,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setIsOpen(false);
      if (onOwnerChanged) onOwnerChanged();
    } catch (error) {
      console.error('Error changing owner:', error);
      alert('Failed to change owner: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;

  const selectedUser = users.find(u => u.Id === selectedUserId);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <UserCog className="w-4 h-4" />
        Change Owner
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change {recordType} Owner</DialogTitle>
            <DialogDescription>
              Assign this {recordType.toLowerCase()} to a different rep
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Current Owner</p>
              <p className="text-slate-900">{record.Owner?.Name || 'Unknown'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">New Owner</p>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.Id} value={user.Id}>
                        {user.Name} {user.Email ? `(${user.Email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedUser && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-2">
                  This {recordType.toLowerCase()} will be reassigned to:
                </p>
                <p className="font-semibold text-slate-900">{selectedUser.Name}</p>
                {selectedUser.Email && (
                  <p className="text-sm text-slate-600">{selectedUser.Email}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangeOwner} 
              disabled={!selectedUserId || saving}
              className="bg-[#08708E]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}