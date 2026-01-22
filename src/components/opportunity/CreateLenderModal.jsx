import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

export default function CreateLenderModal({ isOpen, onClose, session, onSuccess }) {
  const [formData, setFormData] = useState({ Name: '', Phone: '', Email: '', Website: '', csbs__Minimum_Credit_Score__c: '', csbs__Active_Lender__c: false, csbs__Priority_Lender__c: false, BillingStreet: '', BillingCity: '', BillingState: '', BillingPostalCode: '', BillingCountry: 'United States' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name) {
      alert('Lender Name is required');
      return;
    }

    setLoading(true);
    try {
      await base44.functions.invoke('createSalesforceAccount', { data: { ...formData, RecordTypeId: null, csbs__Active_Lender__c: formData.csbs__Active_Lender__c ? true : false, csbs__Priority_Lender__c: formData.csbs__Priority_Lender__c ? true : false }, token: session.token, instanceUrl: session.instanceUrl });
      onSuccess?.();
      onClose();
      setFormData({ Name: '', Phone: '', Email: '', Website: '', csbs__Minimum_Credit_Score__c: '', csbs__Active_Lender__c: false, csbs__Priority_Lender__c: false, BillingStreet: '', BillingCity: '', BillingState: '', BillingPostalCode: '', BillingCountry: 'United States' });
    } catch (error) {
      console.error('Create lender error:', error);
      alert('Failed to create lender');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lender</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Lender Name <span className="text-red-500">*</span></Label><Input value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required /></div>
              <div><Label>Phone</Label><Input value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Website</Label><Input value={formData.Website} onChange={(e) => setFormData({ ...formData, Website: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Address</h3>
            <div className="space-y-3">
              <div><Label>Street Address</Label><Input value={formData.BillingStreet} onChange={(e) => setFormData({ ...formData, BillingStreet: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={formData.BillingCity} onChange={(e) => setFormData({ ...formData, BillingCity: e.target.value })} /></div>
                <div><Label>State</Label><select value={formData.BillingState} onChange={(e) => setFormData({ ...formData, BillingState: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md"><option value="">Select State</option>{US_STATES.map(state => (<option key={state} value={state}>{state}</option>))}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Zip Code</Label><Input value={formData.BillingPostalCode} onChange={(e) => setFormData({ ...formData, BillingPostalCode: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={formData.BillingCountry} onChange={(e) => setFormData({ ...formData, BillingCountry: e.target.value })} /></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Lender Settings</h3>
            <div className="space-y-3">
              <div><Label>Minimum Credit Score</Label><Input type="number" value={formData.csbs__Minimum_Credit_Score__c} onChange={(e) => setFormData({ ...formData, csbs__Minimum_Credit_Score__c: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Checkbox id="active" checked={formData.csbs__Active_Lender__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Active_Lender__c: checked })} /><Label htmlFor="active" className="cursor-pointer">Active Lender</Label></div>
              <div className="flex items-center gap-2"><Checkbox id="priority" checked={formData.csbs__Priority_Lender__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Priority_Lender__c: checked })} /><Label htmlFor="priority" className="cursor-pointer">Priority Lender</Label></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Create Lender'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}