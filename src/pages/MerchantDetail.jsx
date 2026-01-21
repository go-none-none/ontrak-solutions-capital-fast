import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import RepPortalHeader from '../components/rep/RepPortalHeader';

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

const ENTITY_TYPES = ['Sole Proprietorship', 'Partnership', 'C Corporation', 'S Corporation', 'LLC', 'Non-Profit', 'Other'];

const OCCUPANCY_TYPES = ['Owned', 'Leased', 'Licensed', 'Virtual', 'Other'];

const INDUSTRIES = [
  'Agriculture and Landscaping', 'Apparel and Accessories', 'Automotive/Bicycle', 'Auto Repair Shops / Car Dealerships',
  'Bars / Nightclubs / Breweries', 'Beauty Salon / Spa', 'Beauty Salons / Barber Shops / Spas', 'Building Materials',
  'Business Services', 'Chiropractors / Physical Therapy Clinics', 'Cleaning Services / Janitorial Services', 'Clothing & Apparel Stores',
  'Construction', 'Convenience Stores / Gas Stations', 'Courier Services', 'Dental Practices', 'Electronics',
  'Fitness Studios / Gyms / Personal Training', 'Garden Store / Retail Nursery', 'General Merchandise', 'Grocery and Baked Goods',
  'Health Services', 'Home Furnishing', 'Home Improvement / Contractors / Handyman Services', 'Hotel, Motel, and Lodging',
  'Hotels / Motels / B&Bs', 'IT / Tech Support Companies', 'Landscaping / Lawn Care Services', 'Laundry and Garment Services',
  'Manufacturing', 'Marketing / Advertising Agencies', 'Medical Offices / Urgent Care Clinics', 'Moving Companies',
  'Online Retailers / E-Commerce', 'Recreation', 'Restaurant/Bar', 'Restaurants / Cafes / Food Trucks', 'Retail Store',
  'Specialty Retail Shops (Pet Stores, Hobby Shops, etc.)', 'Staffing Agencies', 'Subscription Box Companies',
  'Travel Agencies / Tour Operators', 'Travel and Transportation', 'Trucking / Delivery Services', 'Veterinary Clinic', 'Wholesale'
];

const TAX_LIEN_BALANCE_OPTIONS = ['None', 'Under $5,000', '$5,000 - $25,000', '$25,000 - $50,000', 'Over $50,000', 'Unknown'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const BUSINESS_TYPES = ['Retail', 'Service', 'Wholesale', 'Manufacturing', 'Online', 'Other'];

const COUNTRIES = ['United States', 'Canada', 'Mexico', 'Other'];

export default function MerchantDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
  }, []);

  useEffect(() => {
    if (session) {
      loadMerchant();
    }
  }, [session]);

  const loadMerchant = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const merchantId = urlParams.get('id');
      
      if (!merchantId) {
        setMerchant(null);
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('getSalesforceMerchant', {
        recordId: merchantId,
        token: session?.token,
        instanceUrl: session?.instanceUrl
      });

      setMerchant(response.data.record);
      setEditData(response.data.record);
    } catch (error) {
      console.error('Load error:', error);
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Account',
        recordId: merchant.Id,
        data: editData,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setMerchant(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Merchant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RepPortalHeader
        isAdmin={session?.isAdmin || false}
        refreshing={false}
        onRefresh={() => loadMerchant()}
        onLogout={() => {
          sessionStorage.removeItem('sfSession');
          window.location.reload();
        }}
        userName={session?.name}
        showCreateTask={false}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        session={session}
      />

      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{isEditing ? editData.Name : merchant.Name}</h1>
              {(isEditing ? editData.Industry : merchant.Industry) && <p className="text-sm text-slate-600">{isEditing ? editData.Industry : merchant.Industry}</p>}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditData(merchant); }} disabled={saving}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* Account Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="accountName">Account Name *</Label>
                        <Input id="accountName" value={editData.Name || ''} onChange={(e) => setEditData({ ...editData, Name: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="dba">DBA</Label>
                        <Input id="dba" value={editData.DBA__c || ''} onChange={(e) => setEditData({ ...editData, DBA__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={editData.Phone || ''} onChange={(e) => setEditData({ ...editData, Phone: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editData.Email__c || ''} onChange={(e) => setEditData({ ...editData, Email__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="additionalPhone">Additional Phone</Label>
                        <Input id="additionalPhone" value={editData.Phone_Additional__c || ''} onChange={(e) => setEditData({ ...editData, Phone_Additional__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" value={editData.Website || ''} onChange={(e) => setEditData({ ...editData, Website: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="fax">Fax</Label>
                        <Input id="fax" value={editData.Fax || ''} onChange={(e) => setEditData({ ...editData, Fax: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="originalISO">Original ISO</Label>
                        <Input id="originalISO" value={editData.Original_ISO__c || ''} onChange={(e) => setEditData({ ...editData, Original_ISO__c: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {editData.DBA__c && <div><p className="text-slate-500 text-xs mb-1">DBA</p><p className="font-medium">{editData.DBA__c}</p></div>}
                      {merchant.Phone && <div><a href={`tel:${merchant.Phone}`} className="text-orange-600">{merchant.Phone}</a></div>}
                      {merchant.Email__c && <div><a href={`mailto:${merchant.Email__c}`} className="text-orange-600">{merchant.Email__c}</a></div>}
                      {merchant.Phone_Additional__c && <div><a href={`tel:${merchant.Phone_Additional__c}`} className="text-orange-600">{merchant.Phone_Additional__c}</a></div>}
                      {merchant.Website && <div><a href={merchant.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600">{merchant.Website}</a></div>}
                      {merchant.Fax && <div><p className="text-slate-600">Fax: {merchant.Fax}</p></div>}
                      {merchant.Original_ISO__c && <div><p className="text-slate-500 text-xs mb-1">Original ISO</p><p className="font-medium">{merchant.Original_ISO__c}</p></div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
                <div className="space-y-3">
                  {isEditing ? (
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={editData.Description || ''} onChange={(e) => setEditData({ ...editData, Description: e.target.value })} rows={4} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">{merchant.Description || 'No description'}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Address Information</h2>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="billingStreet">Billing Street</Label>
                      <Textarea id="billingStreet" value={editData.BillingStreet || ''} onChange={(e) => setEditData({ ...editData, BillingStreet: e.target.value })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City</Label>
                        <Input id="billingCity" value={editData.BillingCity || ''} onChange={(e) => setEditData({ ...editData, BillingCity: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="billingState">State/Province</Label>
                        <select value={editData.BillingState || ''} onChange={(e) => setEditData({ ...editData, BillingState: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">Select State</option>
                          {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="billingZip">Zip/Postal Code</Label>
                        <Input id="billingZip" value={editData.BillingPostalCode || ''} onChange={(e) => setEditData({ ...editData, BillingPostalCode: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="billingCountry">Country</Label>
                        <select value={editData.BillingCountry || ''} onChange={(e) => setEditData({ ...editData, BillingCountry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">Select Country</option>
                          {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  (merchant.BillingStreet || merchant.BillingCity) && (
                    <div className="space-y-2 text-sm text-slate-600">
                      {merchant.BillingStreet && <p>{merchant.BillingStreet}</p>}
                      {(merchant.BillingCity || merchant.BillingState || merchant.BillingPostalCode) && (
                        <p>{[merchant.BillingCity, merchant.BillingState, merchant.BillingPostalCode].filter(Boolean).join(', ')}</p>
                      )}
                      {merchant.BillingCountry && <p>{merchant.BillingCountry}</p>}
                    </div>
                  )
                )}
              </div>

              {/* Business Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Application Industry</Label>
                        <select value={editData.Industry || ''} onChange={(e) => setEditData({ ...editData, Industry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Business Start Date</Label>
                        <Input id="startDate" type="date" value={editData.Business_Start_Date__c || ''} onChange={(e) => setEditData({ ...editData, Business_Start_Date__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Entity Type</Label>
                        <select value={editData.csbs__Entity_Type__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Entity_Type__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          {ENTITY_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Franchise</Label>
                        <select value={editData.Franchise__c || ''} onChange={(e) => setEditData({ ...editData, Franchise__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <Label>Type of Business</Label>
                        <Input id="typeOfBusiness" value={editData.Type_of_Business__c || ''} onChange={(e) => setEditData({ ...editData, Type_of_Business__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Home-Based Business</Label>
                        <select value={editData.Home_Based_Business__c || ''} onChange={(e) => setEditData({ ...editData, Home_Based_Business__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <Label>Product/Service Sold</Label>
                        <Input id="productService" value={editData.Product_Service_Sold__c || ''} onChange={(e) => setEditData({ ...editData, Product_Service_Sold__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Number of Locations</Label>
                        <Input id="numLocations" type="number" value={editData.Number_of_Locations__c || ''} onChange={(e) => setEditData({ ...editData, Number_of_Locations__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Federal Tax ID</Label>
                        <Input id="fedTaxId" value={editData.Federal_Tax_ID__c || ''} onChange={(e) => setEditData({ ...editData, Federal_Tax_ID__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>State of Incorporation</Label>
                        <select value={editData.State_of_Incorporation__c || ''} onChange={(e) => setEditData({ ...editData, State_of_Incorporation__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Open Tax Lien Payment Plan</Label>
                        <select value={editData.Open_Tax_Lien_Payment_Plan__c || ''} onChange={(e) => setEditData({ ...editData, Open_Tax_Lien_Payment_Plan__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <Label>Open Tax Liens Balance</Label>
                        <select value={editData.Open_Tax_Liens_Balance__c || ''} onChange={(e) => setEditData({ ...editData, Open_Tax_Liens_Balance__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          {TAX_LIEN_BALANCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Seasonal Business</Label>
                        <select value={editData.Seasonal_Business__c || ''} onChange={(e) => setEditData({ ...editData, Seasonal_Business__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <Label>E-Commerce</Label>
                        <select value={editData.E_Commerce__c || ''} onChange={(e) => setEditData({ ...editData, E_Commerce__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <Label>Business Location Occupancy</Label>
                        <select value={editData.csbs__Occupancy_Type__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Occupancy_Type__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">--None--</option>
                          {OCCUPANCY_TYPES.map(ot => <option key={ot} value={ot}>{ot}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Business Location Monthly Payment</Label>
                        <Input id="monthlyPayment" type="number" value={editData.Business_Location_Monthly_Payment__c || ''} onChange={(e) => setEditData({ ...editData, Business_Location_Monthly_Payment__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Landlord/Mortgagee Name</Label>
                        <Input id="landlordName" value={editData.Landlord_Mortgagee_Name__c || ''} onChange={(e) => setEditData({ ...editData, Landlord_Mortgagee_Name__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Landlord/Mortgagee Phone</Label>
                        <Input id="landlordPhone" value={editData.Landlord_Mortgagee_Phone__c || ''} onChange={(e) => setEditData({ ...editData, Landlord_Mortgagee_Phone__c: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {merchant.Industry && (<div><p className="text-slate-500 text-xs mb-1">Industry</p><p className="font-medium">{merchant.Industry}</p></div>)}
                    {merchant.Business_Start_Date__c && (<div><p className="text-slate-500 text-xs mb-1">Business Start Date</p><p className="font-medium">{merchant.Business_Start_Date__c}</p></div>)}
                    {merchant.csbs__Entity_Type__c && (<div><p className="text-slate-500 text-xs mb-1">Entity Type</p><p className="font-medium">{merchant.csbs__Entity_Type__c}</p></div>)}
                    {merchant.Franchise__c && (<div><p className="text-slate-500 text-xs mb-1">Franchise</p><p className="font-medium">{merchant.Franchise__c}</p></div>)}
                    {merchant.Type_of_Business__c && (<div><p className="text-slate-500 text-xs mb-1">Type of Business</p><p className="font-medium">{merchant.Type_of_Business__c}</p></div>)}
                    {merchant.Home_Based_Business__c && (<div><p className="text-slate-500 text-xs mb-1">Home-Based Business</p><p className="font-medium">{merchant.Home_Based_Business__c}</p></div>)}
                    {merchant.Product_Service_Sold__c && (<div><p className="text-slate-500 text-xs mb-1">Product/Service Sold</p><p className="font-medium">{merchant.Product_Service_Sold__c}</p></div>)}
                    {merchant.Number_of_Locations__c && (<div><p className="text-slate-500 text-xs mb-1">Number of Locations</p><p className="font-medium">{merchant.Number_of_Locations__c}</p></div>)}
                    {merchant.Federal_Tax_ID__c && (<div><p className="text-slate-500 text-xs mb-1">Federal Tax ID</p><p className="font-medium">{merchant.Federal_Tax_ID__c}</p></div>)}
                    {merchant.State_of_Incorporation__c && (<div><p className="text-slate-500 text-xs mb-1">State of Incorporation</p><p className="font-medium">{merchant.State_of_Incorporation__c}</p></div>)}
                    {merchant.Open_Tax_Lien_Payment_Plan__c && (<div><p className="text-slate-500 text-xs mb-1">Open Tax Lien Payment Plan</p><p className="font-medium">{merchant.Open_Tax_Lien_Payment_Plan__c}</p></div>)}
                    {merchant.Open_Tax_Liens_Balance__c && (<div><p className="text-slate-500 text-xs mb-1">Open Tax Liens Balance</p><p className="font-medium">{merchant.Open_Tax_Liens_Balance__c}</p></div>)}
                    {merchant.Seasonal_Business__c && (<div><p className="text-slate-500 text-xs mb-1">Seasonal Business</p><p className="font-medium">{merchant.Seasonal_Business__c}</p></div>)}
                    {merchant.E_Commerce__c && (<div><p className="text-slate-500 text-xs mb-1">E-Commerce</p><p className="font-medium">{merchant.E_Commerce__c}</p></div>)}
                    {merchant.Business_Location_Monthly_Payment__c && (<div><p className="text-slate-500 text-xs mb-1">Business Location Monthly Payment</p><p className="font-medium">${Number(merchant.Business_Location_Monthly_Payment__c).toLocaleString()}</p></div>)}
                    {merchant.Landlord_Mortgagee_Name__c && (<div><p className="text-slate-500 text-xs mb-1">Landlord/Mortgagee Name</p><p className="font-medium">{merchant.Landlord_Mortgagee_Name__c}</p></div>)}
                    {merchant.Landlord_Mortgagee_Phone__c && (<div><p className="text-slate-500 text-xs mb-1">Landlord/Mortgagee Phone</p><p className="font-medium">{merchant.Landlord_Mortgagee_Phone__c}</p></div>)}
                  </div>
                )}
              </div>

              {/* Business References */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business References</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Business Trade Reference 1</Label>
                        <Input id="ref1" value={editData.Business_Trade_Reference_1__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_1__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference 1 Phone</Label>
                        <Input id="ref1Phone" value={editData.Business_Trade_Reference_1_Phone__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_1_Phone__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference 2</Label>
                        <Input id="ref2" value={editData.Business_Trade_Reference_2__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_2__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference 2 Phone</Label>
                        <Input id="ref2Phone" value={editData.Business_Trade_Reference_2_Phone__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_2_Phone__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference 3</Label>
                        <Input id="ref3" value={editData.Business_Trade_Reference_3__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_3__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference 3 Phone</Label>
                        <Input id="ref3Phone" value={editData.Business_Trade_Reference_3_Phone__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_3_Phone__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference Contact/Acct #1</Label>
                        <Input id="refAcct1" value={editData.Business_Trade_Reference_Contact_Acct_1__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_Contact_Acct_1__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference Contact/Acct #2</Label>
                        <Input id="refAcct2" value={editData.Business_Trade_Reference_Contact_Acct_2__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_Contact_Acct_2__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Business Trade Reference Contact/Acct #3</Label>
                        <Input id="refAcct3" value={editData.Business_Trade_Reference_Contact_Acct_3__c || ''} onChange={(e) => setEditData({ ...editData, Business_Trade_Reference_Contact_Acct_3__c: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {merchant.Business_Trade_Reference_1__c && (<div><p className="text-slate-500 text-xs mb-1">Business Trade Reference 1</p><p className="font-medium">{merchant.Business_Trade_Reference_1__c}</p></div>)}
                    {merchant.Business_Trade_Reference_1_Phone__c && (<div><p className="text-slate-500 text-xs mb-1">Reference 1 Phone</p><p className="font-medium">{merchant.Business_Trade_Reference_1_Phone__c}</p></div>)}
                    {merchant.Business_Trade_Reference_2__c && (<div><p className="text-slate-500 text-xs mb-1">Business Trade Reference 2</p><p className="font-medium">{merchant.Business_Trade_Reference_2__c}</p></div>)}
                    {merchant.Business_Trade_Reference_2_Phone__c && (<div><p className="text-slate-500 text-xs mb-1">Reference 2 Phone</p><p className="font-medium">{merchant.Business_Trade_Reference_2_Phone__c}</p></div>)}
                    {merchant.Business_Trade_Reference_3__c && (<div><p className="text-slate-500 text-xs mb-1">Business Trade Reference 3</p><p className="font-medium">{merchant.Business_Trade_Reference_3__c}</p></div>)}
                    {merchant.Business_Trade_Reference_3_Phone__c && (<div><p className="text-slate-500 text-xs mb-1">Reference 3 Phone</p><p className="font-medium">{merchant.Business_Trade_Reference_3_Phone__c}</p></div>)}
                    {merchant.Business_Trade_Reference_Contact_Acct_1__c && (<div><p className="text-slate-500 text-xs mb-1">Reference Contact/Acct #1</p><p className="font-medium">{merchant.Business_Trade_Reference_Contact_Acct_1__c}</p></div>)}
                    {merchant.Business_Trade_Reference_Contact_Acct_2__c && (<div><p className="text-slate-500 text-xs mb-1">Reference Contact/Acct #2</p><p className="font-medium">{merchant.Business_Trade_Reference_Contact_Acct_2__c}</p></div>)}
                    {merchant.Business_Trade_Reference_Contact_Acct_3__c && (<div><p className="text-slate-500 text-xs mb-1">Reference Contact/Acct #3</p><p className="font-medium">{merchant.Business_Trade_Reference_Contact_Acct_3__c}</p></div>)}
                  </div>
                )}
              </div>

              {/* Marketing */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Marketing</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>UTM Source</Label>
                        <Input id="utmSource" value={editData.UTM_Source__c || ''} onChange={(e) => setEditData({ ...editData, UTM_Source__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>UTM Campaign</Label>
                        <Input id="utmCampaign" value={editData.UTM_Campaign__c || ''} onChange={(e) => setEditData({ ...editData, UTM_Campaign__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>UTM Content</Label>
                        <Input id="utmContent" value={editData.UTM_Content__c || ''} onChange={(e) => setEditData({ ...editData, UTM_Content__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>UTM Term</Label>
                        <Input id="utmTerm" value={editData.UTM_Term__c || ''} onChange={(e) => setEditData({ ...editData, UTM_Term__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>UTM Medium</Label>
                        <Input id="utmMedium" value={editData.UTM_Medium__c || ''} onChange={(e) => setEditData({ ...editData, UTM_Medium__c: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {merchant.UTM_Source__c && (<div><p className="text-slate-500 text-xs mb-1">UTM Source</p><p className="font-medium">{merchant.UTM_Source__c}</p></div>)}
                    {merchant.UTM_Campaign__c && (<div><p className="text-slate-500 text-xs mb-1">UTM Campaign</p><p className="font-medium">{merchant.UTM_Campaign__c}</p></div>)}
                    {merchant.UTM_Content__c && (<div><p className="text-slate-500 text-xs mb-1">UTM Content</p><p className="font-medium">{merchant.UTM_Content__c}</p></div>)}
                    {merchant.UTM_Term__c && (<div><p className="text-slate-500 text-xs mb-1">UTM Term</p><p className="font-medium">{merchant.UTM_Term__c}</p></div>)}
                    {merchant.UTM_Medium__c && (<div><p className="text-slate-500 text-xs mb-1">UTM Medium</p><p className="font-medium">{merchant.UTM_Medium__c}</p></div>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Business Flags</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="active" checked={editData.csbs__Active__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Active__c: checked })} />
                  <Label htmlFor="active" className="cursor-pointer text-sm">Active Merchant</Label>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {merchant.csbs__Active__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Active Merchant</p></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}