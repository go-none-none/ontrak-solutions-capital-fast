import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function TaskDetailsModal({ task, isOpen, onClose, session, onUpdate }) {
  const [formData, setFormData] = useState(task || {});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('updateSalesforceTask', { taskId: task.Id, updates: formData, token: session.token, instanceUrl: session.instanceUrl });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <div><Label>Subject</Label><Input value={formData.Subject} onChange={(e) => setFormData({ ...formData, Subject: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label><Select value={formData.Status} onValueChange={(val) => setFormData({ ...formData, Status: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Not Started">Not Started</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Waiting">Waiting</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select></div>
              <div><Label>Priority</Label><Select value={formData.Priority} onValueChange={(val) => setFormData({ ...formData, Priority: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{task.Subject}</h3>
              {task.Description && <p className="text-slate-600 mt-2">{task.Description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Status</p>
                <p className="font-medium text-slate-900">{task.Status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Flag className="w-3 h-3" />Priority</p>
                <p className="font-medium text-slate-900">{task.Priority}</p>
              </div>
              {task.ActivityDate && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Due Date</p>
                  <p className="font-medium text-slate-900">{format(new Date(task.ActivityDate), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">Edit</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}