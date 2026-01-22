import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreateTaskModal({ isOpen, onClose, session, repsData, onSuccess }) {
  const [formData, setFormData] = useState({ Subject: '', Description: '', Priority: 'Normal', Status: 'Not Started', ActivityDate: '', OwnerId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Subject || !formData.OwnerId) {
      alert('Subject and Owner are required');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSalesforceAdminTask', { data: formData, token: session.token, instanceUrl: session.instanceUrl });
      onSuccess?.();
      onClose();
      setFormData({ Subject: '', Description: '', Priority: 'Normal', Status: 'Not Started', ActivityDate: '', OwnerId: '' });
    } catch (error) {
      console.error('Create task error:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label><Input id="subject" value={formData.Subject} onChange={(e) => setFormData({ ...formData, Subject: e.target.value })} placeholder="Task subject" required /></div>
          <div><Label htmlFor="owner">Owner <span className="text-red-500">*</span></Label><Select value={formData.OwnerId} onValueChange={(val) => setFormData({ ...formData, OwnerId: val })} required><SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger><SelectContent>{repsData?.map(rep => (<SelectItem key={rep.userId} value={rep.userId}>{rep.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="priority">Priority</Label><Select value={formData.Priority} onValueChange={(val) => setFormData({ ...formData, Priority: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" value={formData.ActivityDate} onChange={(e) => setFormData({ ...formData, ActivityDate: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} rows={4} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}