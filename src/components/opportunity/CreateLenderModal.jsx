import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreateLenderModal({ isOpen, onClose, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    csbs__Active__c: false,
    Phone: '',
    Fax: '',
    Website: '',
    csbs__Trading_Center__c: false,
    Email__c: '',
    csbs__Leads_from_API__c: false,
    csbs__Leads_to_API__c: false,
    csbs__Application_Industry__c: false,
    BillingStreet: '',
    BillingCity: '',
    BillingState: '',
    BillingPostalCode: '',
    BillingCountry: '',
    ShippingStreet: '',
    ShippingCity: '',
    ShippingState: '',
    ShippingPostalCode: '',
    ShippingCountry: '',
    csbs__Minimum_Credit_Score__c: '',
    csbs__Maximum_Negative_Days__c: '',
    csbs__Minimum_Monthly_Deposit_Count__c: '',
    csbs__Minimum_Max__c: '',
    csbs__Minimum_Monthly_Deposit_Amount__c: '',
    csbs__Maximum_Open_Calc_Balance__c: '',
    csbs__Minimum_Monthly_Balance__c: '',
    csbs__Minimum_NSF_Tolerance__c: '',
    csbs__Individual_Details__c: '',
    csbs__Minimum_Offer_Amount__c: '',
    csbs__Options__c: '',
    csbs__Whitelist_Offer_Industries__c: '',
    csbs__Net_Offer_Percentage__c: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name.trim()) {
      alert('Account Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createSalesforceLender', {
        data: formData,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      onSuccess(response.data.id);
      onClose();
    } catch (error) {
      console.error('Create lender error:', error);
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
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Account Record Type</Label>
                <Input value="Lender" disabled className="bg-slate-50" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.csbs__Active__c}
                  onCheckedChange={(checked) => setFormData({ ...formData, csbs__Active__c: checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">Active Lender</Label>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.Phone}
                  onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.Fax}
                  onChange={(e) => setFormData({ ...formData, Fax: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.Website}
                  onChange={(e) => setFormData({ ...formData, Website: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trading"
                  checked={formData.csbs__Trading_Center__c}
                  onCheckedChange={(checked) => setFormData({ ...formData, csbs__Trading_Center__c: checked })}
                />
                <Label htmlFor="trading" className="cursor-pointer">Trading Center</Label>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.Email__c}
                  onChange={(e) => setFormData({ ...formData, Email__c: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadsFromApi"
                  checked={formData.csbs__Leads_from_API__c}
                  onCheckedChange={(checked) => setFormData({ ...formData, csbs__Leads_from_API__c: checked })}
                />
                <Label htmlFor="leadsFromApi" className="cursor-pointer">Leads from API</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadsToApi"
                  checked={formData.csbs__Leads_to_API__c}
                  onCheckedChange={(checked) => setFormData({ ...formData, csbs__Leads_to_API__c: checked })}
                />
                <Label htmlFor="leadsToApi" className="cursor-pointer">Leads to API</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Checkbox
                  id="appIndustry"
                  checked={formData.csbs__Application_Industry__c}
                  onCheckedChange={(checked) => setFormData({ ...formData, csbs__Application_Industry__c: checked })}
                />
                <Label htmlFor="appIndustry" className="cursor-pointer">Application Industry</Label>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Address Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingStreet">Billing Address</Label>
                <Textarea
                  id="billingStreet"
                  value={formData.BillingStreet}
                  onChange={(e) => setFormData({ ...formData, BillingStreet: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="shippingStreet">Shipping Address</Label>
                <Textarea
                  id="shippingStreet"
                  value={formData.ShippingStreet}
                  onChange={(e) => setFormData({ ...formData, ShippingStreet: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="billingCity">Billing City</Label>
                <Input
                  id="billingCity"
                  value={formData.BillingCity}
                  onChange={(e) => setFormData({ ...formData, BillingCity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingCity">Shipping City</Label>
                <Input
                  id="shippingCity"
                  value={formData.ShippingCity}
                  onChange={(e) => setFormData({ ...formData, ShippingCity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="billingState">Billing State/Province</Label>
                <Input
                  id="billingState"
                  value={formData.BillingState}
                  onChange={(e) => setFormData({ ...formData, BillingState: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingState">Shipping State/Province</Label>
                <Input
                  id="shippingState"
                  value={formData.ShippingState}
                  onChange={(e) => setFormData({ ...formData, ShippingState: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="billingZip">Billing Zip/Postal Code</Label>
                <Input
                  id="billingZip"
                  value={formData.BillingPostalCode}
                  onChange={(e) => setFormData({ ...formData, BillingPostalCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingZip">Shipping Zip/Postal Code</Label>
                <Input
                  id="shippingZip"
                  value={formData.ShippingPostalCode}
                  onChange={(e) => setFormData({ ...formData, ShippingPostalCode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="billingCountry">Billing Country</Label>
                <Input
                  id="billingCountry"
                  value={formData.BillingCountry}
                  onChange={(e) => setFormData({ ...formData, BillingCountry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingCountry">Shipping Country</Label>
                <Input
                  id="shippingCountry"
                  value={formData.ShippingCountry}
                  onChange={(e) => setFormData({ ...formData, ShippingCountry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Lender Criteria */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Lender Criteria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minCredit">Minimum Credit Score</Label>
                <Input
                  id="minCredit"
                  type="number"
                  value={formData.csbs__Minimum_Credit_Score__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Credit_Score__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maxNegDays">Maximum Negative Days</Label>
                <Input
                  id="maxNegDays"
                  type="number"
                  value={formData.csbs__Maximum_Negative_Days__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Maximum_Negative_Days__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="minDepCount">Minimum Monthly Deposit Count</Label>
                <Input
                  id="minDepCount"
                  type="number"
                  value={formData.csbs__Minimum_Monthly_Deposit_Count__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Monthly_Deposit_Count__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="minMax">Minimum Max</Label>
                <Input
                  id="minMax"
                  type="number"
                  value={formData.csbs__Minimum_Max__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Max__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="minDepAmt">Minimum Monthly Deposit Amount</Label>
                <Input
                  id="minDepAmt"
                  type="number"
                  value={formData.csbs__Minimum_Monthly_Deposit_Amount__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Monthly_Deposit_Amount__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maxOpenBal">Maximum Open Calc Balance</Label>
                <Input
                  id="maxOpenBal"
                  type="number"
                  value={formData.csbs__Maximum_Open_Calc_Balance__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Maximum_Open_Calc_Balance__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="minMonthBal">Minimum Monthly Balance</Label>
                <Input
                  id="minMonthBal"
                  type="number"
                  value={formData.csbs__Minimum_Monthly_Balance__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Monthly_Balance__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="minNSF">Minimum NSF Tolerance</Label>
                <Input
                  id="minNSF"
                  type="number"
                  value={formData.csbs__Minimum_NSF_Tolerance__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_NSF_Tolerance__c: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="individualDetails">Individual Details</Label>
                <Input
                  id="individualDetails"
                  value={formData.csbs__Individual_Details__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Individual_Details__c: e.target.value })}
                  placeholder="Available"
                />
              </div>
              <div>
                <Label htmlFor="minOfferAmt">Minimum Offer Amount</Label>
                <Input
                  id="minOfferAmt"
                  type="number"
                  value={formData.csbs__Minimum_Offer_Amount__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Minimum_Offer_Amount__c: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="options">Options</Label>
                <Textarea
                  id="options"
                  value={formData.csbs__Options__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Options__c: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="whitelistIndustries">Whitelist Offer Industries</Label>
                <Input
                  id="whitelistIndustries"
                  value={formData.csbs__Whitelist_Offer_Industries__c}
                  onChange={(e) => setFormData({ ...formData, csbs__Whitelist_Offer_Industries__c: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Net Offer % */}
          <div>
            <Label htmlFor="netOffer">Net Offer %</Label>
            <Input
              id="netOffer"
              type="number"
              step="0.01"
              value={formData.csbs__Net_Offer_Percentage__c}
              onChange={(e) => setFormData({ ...formData, csbs__Net_Offer_Percentage__c: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}