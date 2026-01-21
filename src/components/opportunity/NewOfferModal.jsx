import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewOfferModal({ isOpen, onClose, opportunityId, session, onSuccess, offer = null }) {
  const [step, setStep] = useState(1);
  const [recordType, setRecordType] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPicklists, setLoadingPicklists] = useState(true);
  
  const [productOptions, setProductOptions] = useState([]);
  const [paymentFrequencyOptions, setPaymentFrequencyOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

  const [formData, setFormData] = useState({
    csbs__Funded__c: '',
    csbs__Product__c: '',
    csbs__Buy_Rate__c: '',
    csbs__Payoff__c: '',
    csbs__Factor_Rate__c: '',
    csbs__Payment_Frequency__c: '',
    csbs__Payback__c: '',
    csbs__Payment_Amount__c: '',
    csbs__Term__c: '',
    csbs__Payment_Method__c: '',
    csbs__Holdback_Percentage__c: '',
    csbs__Selected__c: false,
    csbs__Origination_Fee_Percentage__c: '',
    csbs__Origination_Fee_Amount__c: '',
    csbs__Commission_Percentage__c: '',
    csbs__Commission_Amount__c: '',
    csbs__Draw_Fee_Percent__c: '',
    csbs__Draw_Fee_Amount__c: '',
    csbs__Notes__c: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
      loadPicklists();
      if (offer) {
        // Pre-populate form with offer data
        setStep(3);
        setSelectedSubmission(offer.csbs__Submission__c);
        setFormData({
          csbs__Funded__c: offer.csbs__Funded__c || '',
          csbs__Product__c: offer.csbs__Product__c || '',
          csbs__Buy_Rate__c: offer.csbs__Buy_Rate__c || '',
          csbs__Payoff__c: offer.csbs__Payoff__c || '',
          csbs__Factor_Rate__c: offer.csbs__Factor_Rate__c || '',
          csbs__Payment_Frequency__c: offer.csbs__Payment_Frequency__c || '',
          csbs__Payback__c: offer.csbs__Payback__c || '',
          csbs__Payment_Amount__c: offer.csbs__Payment_Amount__c || '',
          csbs__Term__c: offer.csbs__Term__c || '',
          csbs__Payment_Method__c: offer.csbs__Payment_Method__c || '',
          csbs__Holdback_Percentage__c: offer.csbs__Holdback_Percentage__c || '',
          csbs__Selected__c: offer.csbs__Selected__c || false,
          csbs__Origination_Fee_Percentage__c: offer.csbs__Origination_Fee_Percentage__c || '',
          csbs__Origination_Fee_Amount__c: offer.csbs__Origination_Fee_Amount__c || '',
          csbs__Commission_Percentage__c: offer.csbs__Commission_Percentage__c || '',
          csbs__Commission_Amount__c: offer.csbs__Commission_Amount__c || '',
          csbs__Draw_Fee_Percent__c: offer.csbs__Draw_Fee_Percent__c || '',
          csbs__Draw_Fee_Amount__c: offer.csbs__Draw_Fee_Amount__c || '',
          csbs__Notes__c: offer.csbs__Notes__c || ''
        });
      } else {
        // Reset form when opening for new offer
        resetForm();
      }
    }
  }, [isOpen, offer]);

  const resetForm = () => {
    setStep(1);
    setRecordType('');
    setSelectedSubmission('');
    setFormData({
      csbs__Funded__c: '',
      csbs__Product__c: '',
      csbs__Buy_Rate__c: '',
      csbs__Payoff__c: '',
      csbs__Factor_Rate__c: '',
      csbs__Payment_Frequency__c: '',
      csbs__Payback__c: '',
      csbs__Payment_Amount__c: '',
      csbs__Term__c: '',
      csbs__Payment_Method__c: '',
      csbs__Holdback_Percentage__c: '',
      csbs__Selected__c: false,
      csbs__Origination_Fee_Percentage__c: '',
      csbs__Origination_Fee_Amount__c: '',
      csbs__Commission_Percentage__c: '',
      csbs__Commission_Amount__c: '',
      csbs__Draw_Fee_Percent__c: '',
      csbs__Draw_Fee_Amount__c: '',
      csbs__Notes__c: ''
    });
  };

  const loadSubmissions = async () => {
    try {
      const response = await base44.functions.invoke('getOpportunitySubmissions', {
        opportunityId,
        token: session.token,
        instanceUrl: session.instanceUrl
      });
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Load submissions error:', error);
    }
  };

  const loadPicklists = async () => {
    setLoadingPicklists(true);
    try {
      const [productRes, frequencyRes, methodRes] = await Promise.all([
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Offer__c',
          fieldName: 'csbs__Product__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Offer__c',
          fieldName: 'csbs__Payment_Frequency__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        }),
        base44.functions.invoke('getSalesforcePicklistValues', {
          objectType: 'csbs__Offer__c',
          fieldName: 'csbs__Payment_Method__c',
          token: session.token,
          instanceUrl: session.instanceUrl
        })
      ]);

      setProductOptions(productRes.data.values || []);
      setPaymentFrequencyOptions(frequencyRes.data.values || []);
      setPaymentMethodOptions(methodRes.data.values || []);
    } catch (error) {
      console.error('Load picklists error:', error);
    } finally {
      setLoadingPicklists(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubmission && !offer) {
      alert('Please select a submission');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty string values - Salesforce doesn't like empty strings for numeric fields
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      if (offer) {
        // Update existing offer
        console.log('Updating offer:', offer.Id, 'with cleaned data:', cleanedData);
        await base44.functions.invoke('updateSalesforceRecord', {
          objectType: 'csbs__Offer__c',
          recordId: offer.Id,
          data: cleanedData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
        console.log('Update completed, refreshing data...');
      } else {
        // Create new offer
        await base44.functions.invoke('createSalesforceOffer', {
          opportunityId,
          submissionId: selectedSubmission,
          offerData: cleanedData,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }

      // Wait for success callback to complete before closing
      if (onSuccess) {
        await onSuccess();
      }
      
      // Small delay to ensure data is refreshed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onClose();
    } catch (error) {
      console.error('Save offer error:', error);
      alert(`Failed to ${offer ? 'update' : 'create'} offer: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer ? 'Edit Offer' : 'New Offer'}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Is this a Line of Credit or Standard?</Label>
              <Select value={recordType} onValueChange={setRecordType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="line_of_credit">Line of Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!recordType}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Select Submission / Lender</Label>
              <Select value={selectedSubmission} onValueChange={setSelectedSubmission}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose submission..." />
                </SelectTrigger>
                <SelectContent>
                  {submissions.map(sub => (
                    <SelectItem key={sub.Id} value={sub.Id}>
                      {sub.csbs__Lender__r?.Name || 'Unknown Lender'} - {sub.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedSubmission}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {loadingPicklists ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Funded</Label>
                    <Input
                      type="number"
                      value={formData.csbs__Funded__c}
                      onChange={(e) => setFormData({...formData, csbs__Funded__c: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Product</Label>
                    <Select 
                      value={formData.csbs__Product__c} 
                      onValueChange={(val) => setFormData({...formData, csbs__Product__c: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="--None--" />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Buy Rate</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.csbs__Buy_Rate__c}
                      onChange={(e) => setFormData({...formData, csbs__Buy_Rate__c: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Payoff</Label>
                    <Input
                      type="number"
                      value={formData.csbs__Payoff__c}
                      onChange={(e) => setFormData({...formData, csbs__Payoff__c: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Factor Rate</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.csbs__Factor_Rate__c}
                      onChange={(e) => setFormData({...formData, csbs__Factor_Rate__c: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Payback</Label>
                    <Input
                      type="number"
                      value={formData.csbs__Payback__c}
                      onChange={(e) => setFormData({...formData, csbs__Payback__c: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Payment Frequency</Label>
                    <Select 
                      value={formData.csbs__Payment_Frequency__c} 
                      onValueChange={(val) => setFormData({...formData, csbs__Payment_Frequency__c: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="--None--" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentFrequencyOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Amount</Label>
                    <Input
                      type="number"
                      value={formData.csbs__Payment_Amount__c}
                      onChange={(e) => setFormData({...formData, csbs__Payment_Amount__c: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Term</Label>
                    <Input
                      type="number"
                      value={formData.csbs__Term__c}
                      onChange={(e) => setFormData({...formData, csbs__Term__c: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select 
                      value={formData.csbs__Payment_Method__c} 
                      onValueChange={(val) => setFormData({...formData, csbs__Payment_Method__c: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="--None--" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodOptions.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Holdback %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.csbs__Holdback_Percentage__c}
                      onChange={(e) => setFormData({...formData, csbs__Holdback_Percentage__c: e.target.value})}
                    />
                  </div>
                </div>

                {/* Fees & Commission */}
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-semibold text-slate-900 mb-3">Fees & Commission</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Origination Fee %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.csbs__Origination_Fee_Percentage__c}
                        onChange={(e) => setFormData({...formData, csbs__Origination_Fee_Percentage__c: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Origination Fee $</Label>
                      <Input
                        type="number"
                        value={formData.csbs__Origination_Fee_Amount__c}
                        onChange={(e) => setFormData({...formData, csbs__Origination_Fee_Amount__c: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Commission %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.csbs__Commission_Percentage__c}
                        onChange={(e) => setFormData({...formData, csbs__Commission_Percentage__c: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Commission $</Label>
                      <Input
                        type="number"
                        value={formData.csbs__Commission_Amount__c}
                        onChange={(e) => setFormData({...formData, csbs__Commission_Amount__c: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Draw Fee %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.csbs__Draw_Fee_Percent__c}
                        onChange={(e) => setFormData({...formData, csbs__Draw_Fee_Percent__c: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Draw Fee $</Label>
                      <Input
                        type="number"
                        value={formData.csbs__Draw_Fee_Amount__c}
                        onChange={(e) => setFormData({...formData, csbs__Draw_Fee_Amount__c: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected & Notes */}
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="selected"
                    checked={formData.csbs__Selected__c}
                    onCheckedChange={(checked) => setFormData({...formData, csbs__Selected__c: checked})}
                  />
                  <Label htmlFor="selected" className="cursor-pointer">Mark as Selected Offer</Label>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.csbs__Notes__c}
                    onChange={(e) => setFormData({...formData, csbs__Notes__c: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {!offer && <Button variant="outline" onClick={() => setStep(2)}>Back</Button>}
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}