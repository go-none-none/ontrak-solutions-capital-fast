import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown, Pencil, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SubmissionDetailsModal({ isOpen, onClose, submission, session, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusPicklist, setStatusPicklist] = useState([]);
  const [typePicklist, setTypePicklist] = useState([]);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    if (submission) {
      setFormData({ csbs__Status__c: submission.csbs__Status__c || '', csbs__Status_Detail__c: submission.csbs__Status_Detail__c || '', csbs__Type__c: submission.csbs__Type__c || '', csbs__Notes__c: submission.csbs__Notes__c || '', csbs__Email__c: submission.csbs__Email__c || '', csbs__Email_to_CC__c: submission.csbs__Email_to_CC__c || '', csbs__Email_to_BCC__c: submission.csbs__Email_to_BCC__c || '' });
    }
  }, [submission]);

  useEffect(() => {
    if (isOpen && session) {
      loadPicklistValues();
    }
  }, [isOpen, session]);

  const loadPicklistValues = async () => {
    try {
      const [statusRes, typeRes] = await Promise.all([
        base44.functions.invoke('getSalesforcePicklistValues', { objectType: 'csbs__Submission__c', fieldName: 'csbs__Status__c', token: session.token, instanceUrl: session.instanceUrl }),
        base44.functions.invoke('getSalesforcePicklistValues', { objectType: 'csbs__Submission__c', fieldName: 'csbs__Type__c', token: session.token, instanceUrl: session.instanceUrl })
      ]);
      setStatusPicklist(statusRes.data.values || []);
      setTypePicklist(typeRes.data.values || []);
    } catch (error) {
      console.error('Error loading picklist values:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('updateSalesforceSubmission', { submissionId: submission.Id, data: formData, token: session.token, instanceUrl: session.instanceUrl });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to update submission');
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  const EditableField = ({ label, field, value, type = 'text', options = [] }) => {
    const isEditing = editingField === field;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-slate-500">{label}</Label>
          {!isEditing && (<button onClick={() => setEditingField(field)} className="text-slate-400 hover:text-slate-600"><Pencil className="w-3 h-3" /></button>)}
        </div>
        {isEditing ? (
          <div className="flex gap-1">
            {type === 'select' ? (
              <Select value={formData[field]} onValueChange={(val) => setFormData({ ...formData, [field]: val })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map(opt => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
            ) : type === 'textarea' ? (
              <Textarea value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} className="min-h-[80px]" />
            ) : (
              <Input type={type} value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} className="h-8" />
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingField(null)}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="font-medium text-slate-900">{value || '-'}</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Collapsible defaultOpen={true}>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Information</h3>
                <ChevronDown className="w-4 h-4 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-2 grid grid-cols-2 gap-4 text-sm bg-white">
                  <div><Label className="text-xs text-slate-500">Submission Id</Label><p className="font-medium text-slate-900">{submission.Name}</p></div>
                  <div><Label className="text-xs text-slate-500">Opportunity</Label><p className="font-medium text-slate-900">{submission.csbs__Opportunity__r?.Name || '-'}</p></div>
                  <EditableField label="Status" field="csbs__Status__c" value={formData.csbs__Status__c} type="select" options={statusPicklist} />
                  <EditableField label="Lender" field="csbs__Lender__c" value={submission.csbs__Lender__r?.Name || '-'} />
                  <div className="col-span-2"><EditableField label="Status Detail" field="csbs__Status_Detail__c" value={formData.csbs__Status_Detail__c} type="textarea" /></div>
                  <EditableField label="Type" field="csbs__Type__c" value={formData.csbs__Type__c} type="select" options={typePicklist} />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible defaultOpen={true}>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
                <ChevronDown className="w-4 h-4 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-2 bg-white">
                  <EditableField label="Notes" field="csbs__Notes__c" value={formData.csbs__Notes__c} type="textarea" />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible defaultOpen={false}>
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Email Information</h3>
                <ChevronDown className="w-4 h-4 transition-transform" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-2 grid grid-cols-2 gap-4 bg-white">
                  <EditableField label="Email" field="csbs__Email__c" value={formData.csbs__Email__c} type="email" />
                  <EditableField label="Email to CC" field="csbs__Email_to_CC__c" value={formData.csbs__Email_to_CC__c} />
                  <div className="col-span-2"><EditableField label="Email to BCC" field="csbs__Email_to_BCC__c" value={formData.csbs__Email_to_BCC__c} /></div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}