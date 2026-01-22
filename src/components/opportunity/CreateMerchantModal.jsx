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
const SEASONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ENTITY_TYPES = ['Sole Proprietor', 'Partnership', 'LLC', 'Corporation', 'S-Corporation', 'Non-Profit'];
const OCCUPANCY_TYPES = ['Owned', 'Leased', 'Month-to-Month', 'Home-Based'];
const TAX_LIEN_BALANCE = ['None', '$1-$2,500', '$2,501-$5,000', '$5,001-$10,000', '$10,001+'];
const INDUSTRIES = ['Agriculture and Landscaping', 'Apparel and Accessories', 'Automotive/Bicycle', 'Auto Repair Shops / Car Dealerships', 'Bars / Nightclubs / Breweries', 'Beauty Salon / Spa', 'Building Materials', 'Business Services', 'Cleaning Services / Janitorial Services', 'Construction', 'Convenience Stores / Gas Stations', 'Courier Services', 'Dental Practices', 'Electronics', 'Fitness Studios / Gyms / Personal Training', 'General Merchandise', 'Grocery and Baked Goods', 'Health Services', 'Home Furnishing', 'Home Improvement / Contractors / Handyman Services', 'Hotel, Motel, and Lodging', 'IT / Tech Support Companies', 'Landscaping / Lawn Care Services', 'Laundry and Garment Services', 'Manufacturing', 'Marketing / Advertising Agencies', 'Medical Offices / Urgent Care Clinics', 'Moving Companies', 'Online Retailers / E-Commerce', 'Recreation', 'Restaurant/Bar', 'Restaurants / Cafes / Food Trucks', 'Retail Store', 'Staffing Agencies', 'Travel Agencies / Tour Operators', 'Trucking / Delivery Services', 'Veterinary Clinic', 'Wholesale'];

export default function CreateMerchantModal({ isOpen, onClose, session, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: '', csbs__DBA__c: '', Phone: '', csbs__Email__c: '', csbs__Additional_Phone__c: '', Website: '', Fax: '', Description: '', BillingStreet: '', BillingCity: '', BillingState: '', BillingPostalCode: '', BillingCountry: '', csbs__Application_Industry__c: '', csbs__Business_Start_Date__c: '', Industry: '', csbs__Seasonal_Peak_Months__c: [], csbs__Entity_Type__c: '', csbs__Franchise__c: false, csbs__Type_of_Business__c: '', csbs__Home_Based_Business__c: false, csbs__Product_Service_Sold__c: '', csbs__Number_of_Locations__c: '', csbs__Federal_Tax_ID_Unencrypted__c: '', csbs__Open_Tax_Lien_Payment_Plan__c: false, csbs__State_of_Incorporation__c: '', csbs__Open_Tax_Liens_Balance__c: '', csbs__Seasonal_Business__c: false, csbs__E_Commerce__c: false, csbs__Business_Location_Occupancy__c: '', csbs__Business_Location_Monthly_Payment__c: '', csbs__Landlord_Mortgagee_Name__c: '', csbs__Landlord_Mortgagee_Phone__c: '', csbs__Business_Trade_Reference_1__c: '', csbs__Business_Trade_Reference_1_Phone__c: '', csbs__Business_Trade_Reference_2__c: '', csbs__Business_Trade_Reference_2_Phone__c: '', csbs__Business_Trade_Reference_3__c: '', csbs__Business_Trade_Reference_3_Phone__c: '', csbs__Business_Trade_Reference_Contact_Acct1__c: '', csbs__Business_Trade_Reference_Contact_Acct_2__c: '', csbs__Business_Trade_Reference_Contact_Acct_3__c: '', csbs__UTM_Source__c: '', csbs__UTM_Campaign__c: '', csbs__UTM_Content__c: '', csbs__UTM_Term__c: '', csbs__UTM_Medium__c: ''
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
        csbs__Seasonal_Peak_Months__c: formData.csbs__Seasonal_Peak_Months__c?.length > 0 
          ? formData.csbs__Seasonal_Peak_Months__c.join(';') 
          : ''
      };

      const response = await base44.functions.invoke('createSalesforceMerchant', {
        data: dataToSend,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      onSuccess(response.data.id);
      onClose();
    } catch (error) {
      console.error('Create merchant error:', error);
      alert('Failed to create merchant: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleSeason = (season) => {
    setFormData({
      ...formData,
      csbs__Seasonal_Peak_Months__c: formData.csbs__Seasonal_Peak_Months__c.includes(season)
        ? formData.csbs__Seasonal_Peak_Months__c.filter(s => s !== season)
        : [...formData.csbs__Seasonal_Peak_Months__c, season]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Account: Merchant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label><Input id="name" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required /></div>
              <div><Label>Account Record Type</Label><Input value="Merchant" disabled className="bg-slate-50" /></div>
              <div><Label htmlFor="dba">DBA</Label><Input id="dba" value={formData.csbs__DBA__c} onChange={(e) => setFormData({ ...formData, csbs__DBA__c: e.target.value })} /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.csbs__Email__c} onChange={(e) => setFormData({ ...formData, csbs__Email__c: e.target.value })} /></div>
              <div><Label htmlFor="additionalPhone">Additional Phone</Label><Input id="additionalPhone" value={formData.csbs__Additional_Phone__c} onChange={(e) => setFormData({ ...formData, csbs__Additional_Phone__c: e.target.value })} /></div>
              <div><Label htmlFor="website">Website</Label><Input id="website" value={formData.Website} onChange={(e) => setFormData({ ...formData, Website: e.target.value })} /></div>
              <div><Label htmlFor="fax">Fax</Label><Input id="fax" value={formData.Fax} onChange={(e) => setFormData({ ...formData, Fax: e.target.value })} /></div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} rows={3} />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Address Information</h3>
            <div className="space-y-3">
              <div><Label htmlFor="billingStreet">Billing Address</Label><Textarea id="billingStreet" value={formData.BillingStreet} onChange={(e) => setFormData({ ...formData, BillingStreet: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="billingCity">City</Label><Input id="billingCity" value={formData.BillingCity} onChange={(e) => setFormData({ ...formData, BillingCity: e.target.value })} /></div>
                <div><Label htmlFor="billingState">State</Label><select id="billingState" value={formData.BillingState} onChange={(e) => setFormData({ ...formData, BillingState: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md"><option value="">Select State</option>{US_STATES.map(state => <option key={state} value={state}>{state}</option>)}</select></div>
                <div><Label htmlFor="billingZip">Zip Code</Label><Input id="billingZip" value={formData.BillingPostalCode} onChange={(e) => setFormData({ ...formData, BillingPostalCode: e.target.value })} /></div>
                <div><Label htmlFor="billingCountry">Country</Label><Input id="billingCountry" value={formData.BillingCountry} onChange={(e) => setFormData({ ...formData, BillingCountry: e.target.value })} /></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Business Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="industry">Industry</Label><select id="industry" value={formData.Industry} onChange={(e) => setFormData({ ...formData, Industry: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md"><option value="">Select Industry</option>{INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}</select></div>
              <div><Label htmlFor="businessStartDate">Business Start Date</Label><Input id="businessStartDate" type="date" value={formData.csbs__Business_Start_Date__c} onChange={(e) => setFormData({ ...formData, csbs__Business_Start_Date__c: e.target.value })} /></div>
              <div><Label htmlFor="entityType">Entity Type</Label><select id="entityType" value={formData.csbs__Entity_Type__c} onChange={(e) => setFormData({ ...formData, csbs__Entity_Type__c: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md"><option value="">Select Entity Type</option>{ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
              <div><Label htmlFor="typeOfBusiness">Type of Business</Label><Input id="typeOfBusiness" value={formData.csbs__Type_of_Business__c} onChange={(e) => setFormData({ ...formData, csbs__Type_of_Business__c: e.target.value })} /></div>
              <div><Label htmlFor="productServiceSold">Product/Service Sold</Label><Input id="productServiceSold" value={formData.csbs__Product_Service_Sold__c} onChange={(e) => setFormData({ ...formData, csbs__Product_Service_Sold__c: e.target.value })} /></div>
              <div><Label htmlFor="numLocations">Number of Locations</Label><Input id="numLocations" type="number" value={formData.csbs__Number_of_Locations__c} onChange={(e) => setFormData({ ...formData, csbs__Number_of_Locations__c: e.target.value })} /></div>
              <div><Label htmlFor="federalTaxId">Federal Tax ID</Label><Input id="federalTaxId" value={formData.csbs__Federal_Tax_ID_Unencrypted__c} onChange={(e) => setFormData({ ...formData, csbs__Federal_Tax_ID_Unencrypted__c: e.target.value })} /></div>
              <div><Label htmlFor="stateOfIncorporation">State of Incorporation</Label><select id="stateOfIncorporation" value={formData.csbs__State_of_Incorporation__c} onChange={(e) => setFormData({ ...formData, csbs__State_of_Incorporation__c: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md"><option value="">Select State</option>{US_STATES.map(state => <option key={state} value={state}>{state}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2"><Checkbox id="franchise" checked={formData.csbs__Franchise__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Franchise__c: checked })} /><Label htmlFor="franchise" className="cursor-pointer">Franchise</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="homeBased" checked={formData.csbs__Home_Based_Business__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Home_Based_Business__c: checked })} /><Label htmlFor="homeBased" className="cursor-pointer">Home-Based Business</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="seasonal" checked={formData.csbs__Seasonal_Business__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Seasonal_Business__c: checked })} /><Label htmlFor="seasonal" className="cursor-pointer">Seasonal Business</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="ecommerce" checked={formData.csbs__E_Commerce__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__E_Commerce__c: checked })} /><Label htmlFor="ecommerce" className="cursor-pointer">E-Commerce</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="taxLienPlan" checked={formData.csbs__Open_Tax_Lien_Payment_Plan__c} onCheckedChange={(checked) => setFormData({ ...formData, csbs__Open_Tax_Lien_Payment_Plan__c: checked })} /><Label htmlFor="taxLienPlan" className="cursor-pointer">Open Tax Lien Payment Plan</Label></div>
            </div>
            {formData.csbs__Seasonal_Business__c && (
              <div>
                <Label className="mb-2 block">Seasonal Peak Months</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SEASONS.map(season => (
                    <div key={season} className="flex items-center space-x-2">
                      <Checkbox id={season} checked={formData.csbs__Seasonal_Peak_Months__c.includes(season)} onCheckedChange={() => toggleSeason(season)} />
                      <Label htmlFor={season} className="cursor-pointer text-sm">{season}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="taxLienBalance">Open Tax Liens Balance</Label>
              <select id="taxLienBalance" value={formData.csbs__Open_Tax_Liens_Balance__c} onChange={(e) => setFormData({ ...formData, csbs__Open_Tax_Liens_Balance__c: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md">
                <option value="">Select Balance</option>
                {TAX_LIEN_BALANCE.map(bal => <option key={bal} value={bal}>{bal}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Business Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="occupancy">Business Location Occupancy</Label><select id="occupancy" value={formData.csbs__Business_Location_Occupancy__c} onChange={(e) => setFormData({ ...formData, csbs__Business_Location_Occupancy__c: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-md"><option value="">Select Occupancy</option>{OCCUPANCY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
              <div><Label htmlFor="locationPayment">Business Location Monthly Payment</Label><Input id="locationPayment" type="number" step="0.01" value={formData.csbs__Business_Location_Monthly_Payment__c} onChange={(e) => setFormData({ ...formData, csbs__Business_Location_Monthly_Payment__c: e.target.value })} /></div>
              <div><Label htmlFor="landlordName">Landlord/Mortgagee Name</Label><Input id="landlordName" value={formData.csbs__Landlord_Mortgagee_Name__c} onChange={(e) => setFormData({ ...formData, csbs__Landlord_Mortgagee_Name__c: e.target.value })} /></div>
              <div><Label htmlFor="landlordPhone">Landlord/Mortgagee Phone</Label><Input id="landlordPhone" value={formData.csbs__Landlord_Mortgagee_Phone__c} onChange={(e) => setFormData({ ...formData, csbs__Landlord_Mortgagee_Phone__c: e.target.value })} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Business References</h3>
            {[1, 2, 3].map(num => (
              <div key={num} className="grid grid-cols-3 gap-4">
                <div><Label htmlFor={`ref${num}`}>Business Trade Reference {num}</Label><Input id={`ref${num}`} value={formData[`csbs__Business_Trade_Reference_${num}__c`]} onChange={(e) => setFormData({ ...formData, [`csbs__Business_Trade_Reference_${num}__c`]: e.target.value })} /></div>
                <div><Label htmlFor={`refPhone${num}`}>Phone</Label><Input id={`refPhone${num}`} value={formData[`csbs__Business_Trade_Reference_${num}_Phone__c`]} onChange={(e) => setFormData({ ...formData, [`csbs__Business_Trade_Reference_${num}_Phone__c`]: e.target.value })} /></div>
                <div><Label htmlFor={`refContact${num}`}>Contact/Acct #</Label><Input id={`refContact${num}`} value={formData[`csbs__Business_Trade_Reference_Contact_Acct${num === 1 ? '1' : num === 2 ? '_2' : '3'}__c`]} onChange={(e) => setFormData({ ...formData, [`csbs__Business_Trade_Reference_Contact_Acct${num === 1 ? '1' : num === 2 ? '_2' : '3'}__c`]: e.target.value })} /></div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Marketing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="utmSource">UTM Source</Label><Input id="utmSource" value={formData.csbs__UTM_Source__c} onChange={(e) => setFormData({ ...formData, csbs__UTM_Source__c: e.target.value })} /></div>
              <div><Label htmlFor="utmMedium">UTM Medium</Label><Input id="utmMedium" value={formData.csbs__UTM_Medium__c} onChange={(e) => setFormData({ ...formData, csbs__UTM_Medium__c: e.target.value })} /></div>
              <div><Label htmlFor="utmCampaign">UTM Campaign</Label><Input id="utmCampaign" value={formData.csbs__UTM_Campaign__c} onChange={(e) => setFormData({ ...formData, csbs__UTM_Campaign__c: e.target.value })} /></div>
              <div><Label htmlFor="utmContent">UTM Content</Label><Input id="utmContent" value={formData.csbs__UTM_Content__c} onChange={(e) => setFormData({ ...formData, csbs__UTM_Content__c: e.target.value })} /></div>
              <div><Label htmlFor="utmTerm">UTM Term</Label><Input id="utmTerm" value={formData.csbs__UTM_Term__c} onChange={(e) => setFormData({ ...formData, csbs__UTM_Term__c: e.target.value })} /></div>
            </div>
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