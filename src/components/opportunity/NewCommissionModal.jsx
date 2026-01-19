import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewCommissionModal({ isOpen, onClose, opportunityId, accountId, session, commission, onSuccess }) {
  const [step, setStep] = useState(1);
  const [recordTypes, setRecordTypes] = useState([]);
  const [selectedRecordType, setSelectedRecordType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRecordTypes, setLoadingRecordTypes] = useState(true);
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const [formData, setFormData] = useState({
    csbs__Amount__c: '',
    csbs__Status__c: 'Open',
    csbs__Type__c: '',
    csbs__Date_Due__c: '',
    csbs__Date_Paid__c: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadRecordTypes();
      loadPicklists();
      
      // If editing, populate form
      if (commission) {
        setSelectedRecordType(commission.RecordTypeId);
        setFormData({
          csbs__Amount__c: commission.csbs__Amount__c || '',
          csbs__Status__c: commission.csbs__Status__c || 'Open',
          csbs__Type__c: commission.csbs__Type__c || '',
          csbs__Date_Due__c: commission.csbs__Date_Due__c || '',
          csbs__Date_Paid__c: commission.csbs__Date_Paid__c || ''
        });
        setStep(2); // Skip record type selection when editing
      }
    } else {
      resetForm();
    }
  }, [isOpen, commission]);

  const loadRecordTypes = async () => {
    setLoadingRecordTypes(true);
    try {
      const response = await base44.functions.invoke('getCommissionRecordTypes', {
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setRecordTypes(response.data.recordTypes || []);
    } catch (error) {
      console.error('Load record types error:', error);
    } finally {
      setLoadingRecordTypes(false);
    }
  };

  const loadPicklists = async () => {
    try {
      const [statusRes, typeRes] = await Promise.all([
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Commission__c',
          fieldName: 'csbs__Status__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Commission__c',
          fieldName: 'csbs__Type__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]);
      
      setStatusOptions(statusRes.data.values || ['Open', 'Paid', 'Cancelled']);
      setTypeOptions(typeRes.data.values || []);
    } catch (error) {
      console.error('Load picklists error:', error);
      setStatusOptions(['Open', 'Paid', 'Cancelled']);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedRecordType('');
    setFormData({
      csbs__Amount__c: '',
      csbs__Status__c: 'Open',
      csbs__Type__c: '',
      csbs__Date_Due__c: '',
      csbs__Date_Paid__c: ''
    });
  };

  const handleSubmit = async () => {
    if (!commission && !selectedRecordType) {
      alert('Please select a record type');
      return;
    }

    if (!formData.csbs__Amount__c) {
      alert('Amount is required');
      return;
    }

    setLoading(true);
    try {
      if (commission) {
        // Update existing commission
        await base44.functions.invoke('updateSalesforceRecord', {
          objectType: 'csbs__Commission__c',
          recordId: commission.Id,
          data: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      } else {
        // Create new commission
        await base44.functions.invoke('createSalesforceCommission', {
          opportunityId,
          accountId,
          recordTypeId: selectedRecordType,
          commissionData: formData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Commission error:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to ${commission ? 'update' : 'create'} commission: ${error.response?.data?.details?.[0]?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{commission ? 'Edit Commission' : 'New Commission'}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            {loadingRecordTypes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600">Select a record type to continue</p>
                <div className="space-y-2">
                  {recordTypes.map(rt => (
                    <label
                      key={rt.Id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRecordType === rt.Id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recordType"
                        value={rt.Id}
                        checked={selectedRecordType === rt.Id}
                        onChange={(e) => setSelectedRecordType(e.target.value)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="font-medium text-slate-900">{rt.Name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedRecordType}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Information Section */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status *</Label>
                  <Select 
                    value={formData.csbs__Status__c} 
                    onValueChange={(value) => setFormData({...formData, csbs__Status__c: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Detail Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-900 mb-3">Detail</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.csbs__Amount__c}
                    onChange={(e) => setFormData({...formData, csbs__Amount__c: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.csbs__Type__c} 
                    onValueChange={(value) => setFormData({...formData, csbs__Type__c: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--None--" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>--None--</SelectItem>
                      {typeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Due</Label>
                  <Input
                    type="date"
                    value={formData.csbs__Date_Due__c}
                    onChange={(e) => setFormData({...formData, csbs__Date_Due__c: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Date Paid</Label>
                  <Input
                    type="date"
                    value={formData.csbs__Date_Paid__c}
                    onChange={(e) => setFormData({...formData, csbs__Date_Paid__c: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              {!commission && <Button variant="outline" onClick={() => setStep(1)}>Back</Button>}
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : commission ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}