import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MultiSelect } from '@/components/ui/multi-select';

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

const INDUSTRIES = ['Agriculture and Landscaping', 'Apparel and Accessories', 'Automotive/Bicycle', 'Auto Repair Shops / Car Dealerships', 'Bars / Nightclubs / Breweries', 'Beauty Salon / Spa', 'Building Materials', 'Business Services', 'Cleaning Services / Janitorial Services', 'Construction', 'Convenience Stores / Gas Stations', 'Courier Services', 'Dental Practices', 'Electronics', 'Fitness Studios / Gyms / Personal Training', 'General Merchandise', 'Grocery and Baked Goods', 'Health Services', 'Home Furnishing', 'Home Improvement / Contractors / Handyman Services', 'Hotel, Motel, and Lodging', 'IT / Tech Support Companies', 'Landscaping / Lawn Care Services', 'Laundry and Garment Services', 'Manufacturing', 'Marketing / Advertising Agencies', 'Medical Offices / Urgent Care Clinics', 'Moving Companies', 'Online Retailers / E-Commerce', 'Recreation', 'Restaurant/Bar', 'Restaurants / Cafes / Food Trucks', 'Retail Store', 'Staffing Agencies', 'Travel Agencies / Tour Operators', 'Trucking / Delivery Services', 'Veterinary Clinic', 'Wholesale'];

export default function CreateLenderModal({ isOpen, onClose, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: '', csbs__Active__c: false, csbs__Tier__c: '', csbs__Tier_Position__c: '', csbs__Priority_Lender__c: false, Phone: '', Fax: '', Website: '', csbs__Email__c: '', csbs__Emails_to_CC__c: '', csbs__Emails_to_BCC__c: '', csbs__Application_Industry__c: false, BillingStreet: '', BillingCity: '', BillingState: '', BillingPostalCode: '', BillingCountry: '', ShippingStreet: '', ShippingCity: '', ShippingState: '', ShippingPostalCode: '', ShippingCountry: '', csbs__Minimum_Credit_Score__c: '', csbs__Maximum_Negative_Days__c: '', csbs__Minimum_Monthly_Deposit_Count__c: '', csbs__Maximum_NSFs__c: '', csbs__Minimum_Monthly_Deposit_Amount__c: '', csbs__Minimum_Average_Daily_Balance__c: '', csbs__Minimum_Months_in_Business__c: '', csbs__Restricted_States__c: [], csbs__Maximum_Offer_Amount__c: '', csbs__Restricted_Industries__c: [], csbs__Net_Offer_Percentage__c: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name.trim()) {
      alert('Account Name is required');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        csbs__Restricted_States__c: formData.csbs__Restricted_States__c?.length > 0 
          ? formData.csbs__Restricted_States__c.join(';') 
          : '',
        csbs__Restricted_Industries__c: formData.csbs__Restricted_Industries__c?.length > 0 
          ? formData.csbs__Restricted_Industries__c.join(';') 
          : ''
      };

      const response = await base44.functions.invoke('createSalesforceLender', {
        data: dataToSend,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      onSuccess(response.data.id);
      onClose();
    } catch (error) {
      alert('Failed to create lender: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Account: Lender</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label><Input id="name" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required /></div>
              <div><Label>Account Record Type</Label><Input value="Lender" disabled className="bg-slate-50" /></div>
              <div className="flex items-center space-x-2"><Checkbox id="active" checked={formData.csbs__Active__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Active__c: checked })} /><Label htmlFor="active" className="cursor-pointer">Active Lender</Label></div>
              <div><Label htmlFor="tier">Tier</Label><Input id="tier" value={formData.csbs__Tier__c} onChange={(e) => setFormData({ ...formData, csbs__Tier__c: e.target.value })} /></div>
              <div><Label htmlFor="tierPos">Tier Position</Label><Input id="tierPos" value={formData.csbs__Tier_Position__c} onChange={(e) => setFormData({ ...formData, csbs__Tier_Position__c: e.target.value })} /></div>
              <div className="flex items-center space-x-2"><Checkbox id="priority" checked={formData.csbs__Priority_Lender__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Priority_Lender__c: checked })} /><Label htmlFor="priority" className="cursor-pointer">Priority Lender</Label></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} /></div>
              <div><Label htmlFor="fax">Fax</Label><Input id="fax" value={formData.Fax} onChange={(e) => setFormData({ ...formData, Fax: e.target.value })} /></div>
              <div><Label htmlFor="website">Website</Label><Input id="website" value={formData.Website} onChange={(e) => setFormData({ ...formData, Website: e.target.value })} /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.csbs__Email__c} onChange={(e) => setFormData({ ...formData, csbs__Email__c: e.target.value })} /></div>
              <div><Label htmlFor="emailsCC">Emails to CC</Label><Input id="emailsCC" value={formData.csbs__Emails_to_CC__c} onChange={(e) => setFormData({ ...formData, csbs__Emails_to_CC__c: e.target.value })} /></div>
              <div><Label htmlFor="emailsBCC">Emails to BCC</Label><Input id="emailsBCC" value={formData.csbs__Emails_to_BCC__c} onChange={(e) => setFormData({ ...formData, csbs__Emails_to_BCC__c: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Billing Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="billingStreet">Street</Label><Textarea id="billingStreet" value={formData.BillingStreet} onChange={(e) => setFormData({ ...formData, BillingStreet: e.target.value })} rows={2} /></div>
              <div><Label htmlFor="billingCity">City</Label><Input id="billingCity" value={formData.BillingCity} onChange={(e) => setFormData({ ...formData, BillingCity: e.target.value })} /></div>
              <div><Label htmlFor="billingState">State</Label><Input id="billingState" value={formData.BillingState} onChange={(e) => setFormData({ ...formData, BillingState: e.target.value })} /></div>
              <div><Label htmlFor="billingZip">Zip Code</Label><Input id="billingZip" value={formData.BillingPostalCode} onChange={(e) => setFormData({ ...formData, BillingPostalCode: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Lender Criteria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="minCredit">Minimum Credit Score</Label><Input id="minCredit" type="number" value={formData.csbs__Minimum_Credit_Score__c} onChange={(e) => setFormData({ ...formData, csbs__Minimum_Credit_Score__c: e.target.value })} /></div>
              <div><Label htmlFor="maxNegDays">Maximum Negative Days</Label><Input id="maxNegDays" type="number" value={formData.csbs__Maximum_Negative_Days__c} onChange={(e) => setFormData({ ...formData, csbs__Maximum_Negative_Days__c: e.target.value })} /></div>
              <div><Label htmlFor="minDepCount">Minimum Monthly Deposit Count</Label><Input id="minDepCount" type="number" value={formData.csbs__Minimum_Monthly_Deposit_Count__c} onChange={(e) => setFormData({ ...formData, csbs__Minimum_Monthly_Deposit_Count__c: e.target.value })} /></div>
              <div><Label htmlFor="maxNSFs">Maximum NSFs</Label><Input id="maxNSFs" type="number" value={formData.csbs__Maximum_NSFs__c} onChange={(e) => setFormData({ ...formData, csbs__Maximum_NSFs__c: e.target.value })} /></div>
              <div><Label htmlFor="restrictedStates">Restricted States</Label><MultiSelect options={US_STATES} value={formData.csbs__Restricted_States__c} onChange={(value) => setFormData({ ...formData, csbs__Restricted_States__c: value })} placeholder="Select states..." /></div>
              <div><Label htmlFor="restrictedIndustries">Restricted Industries</Label><MultiSelect options={INDUSTRIES} value={formData.csbs__Restricted_Industries__c} onChange={(value) => setFormData({ ...formData, csbs__Restricted_Industries__c: value })} placeholder="Select industries..." /></div>
            </div>
          </div>

          <div>
            <Label htmlFor="netOffer">Net Offer %</Label>
            <Input id="netOffer" type="number" step="0.01" value={formData.csbs__Net_Offer_Percentage__c} onChange={(e) => setFormData({ ...formData, csbs__Net_Offer_Percentage__c: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}