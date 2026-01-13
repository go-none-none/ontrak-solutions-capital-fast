import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreateTaskModal({ isOpen, onClose, session, onSuccess, repsData }) {
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [formData, setFormData] = useState({
    assignedTo: session?.userId || '',
    subject: '',
    dueDate: '',
    priority: 'Normal',
    status: 'Not Started',
    relatedToId: '',
    relatedToType: '',
    description: ''
  });
  const [relatedRecords, setRelatedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRecords = async (query) => {
    if (!query.trim() || query.length < 2) {
      setRelatedRecords([]);
      return;
    }

    setLoadingRecords(true);
    try {
      const response = await base44.functions.invoke('searchSalesforceRecords', {
        query,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      
      const records = [];
      response.data.leads?.forEach(lead => {
        records.push({ id: lead.Id, name: lead.Name, type: 'Lead' });
      });
      response.data.opportunities?.forEach(opp => {
        records.push({ id: opp.Id, name: opp.Name, type: 'Opportunity' });
      });
      setRelatedRecords(records);
    } catch (error) {
      console.error('Error searching records:', error);
      setRelatedRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assignedTo || !formData.subject) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSalesforceAdminTask', {
        assignedTo: formData.assignedTo,
        subject: formData.subject,
        dueDate: formData.dueDate || null,
        priority: formData.priority,
        status: formData.status,
        relatedToId: formData.relatedToId || null,
        relatedToType: formData.relatedToType || null,
        description: formData.description,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setFormData({
        assignedTo: '',
        subject: '',
        dueDate: '',
        priority: 'Normal',
        status: 'Not Started',
        relatedToId: '',
        relatedToType: '',
        description: ''
      });
      setRelatedRecords([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Assign a new task to a rep</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Assign To <span className="text-red-500">*</span>
              </label>
              <Input
                value={session?.name || ''}
                disabled
                className="bg-slate-50 text-slate-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
              <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Follow up with client"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Waiting">Waiting</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Related To</label>
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={
                  !formData.assignedTo 
                    ? "Select rep first" 
                    : relatedRecords.length === 0 
                      ? "No records available" 
                      : "Search leads or opportunities..."
                }
                disabled={!formData.assignedTo || relatedRecords.length === 0}
              />
              {showDropdown && relatedRecords.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {relatedRecords
                    .filter(r => 
                      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.type.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(record => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            relatedToId: record.id,
                            relatedToType: record.type
                          });
                          setSearchTerm(`${record.name} (${record.type})`);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <p className="font-medium text-slate-900">{record.name}</p>
                        <p className="text-xs text-slate-500">{record.type}</p>
                      </button>
                    ))}
                  {relatedRecords.filter(r => 
                    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.type.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-slate-500">
                      No matches found
                    </div>
                  )}
                </div>
              )}
            </div>
            {formData.relatedToId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, relatedToId: '', relatedToType: '' });
                  setSearchTerm('');
                }}
                className="text-xs text-slate-500 hover:text-slate-700 mt-1"
              >
                Clear selection
              </button>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#08708E]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}