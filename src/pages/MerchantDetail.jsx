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

const SEASONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ENTITY_TYPES = ['Sole Proprietor', 'Partnership', 'LLC', 'Corporation', 'S-Corporation', 'Non-Profit'];

const OCCUPANCY_TYPES = ['Owned', 'Leased', 'Month-to-Month', 'Home-Based'];

const TAX_LIEN_BALANCE = ['None', '$1-$2,500', '$2,501-$5,000', '$5,001-$10,000', '$10,001+'];

const INDUSTRIES = [
  'Agriculture and Landscaping', 'Apparel and Accessories', 'Automotive/Bicycle', 'Auto Repair Shops / Car Dealerships',
  'Bars / Nightclubs / Breweries', 'Beauty Salon / Spa', 'Building Materials', 'Business Services',
  'Cleaning Services / Janitorial Services', 'Construction', 'Convenience Stores / Gas Stations', 'Courier Services',
  'Dental Practices', 'Electronics', 'Fitness Studios / Gyms / Personal Training', 'General Merchandise',
  'Grocery and Baked Goods', 'Health Services', 'Home Furnishing', 'Home Improvement / Contractors / Handyman Services',
  'Hotel, Motel, and Lodging', 'IT / Tech Support Companies', 'Landscaping / Lawn Care Services', 'Laundry and Garment Services',
  'Manufacturing', 'Marketing / Advertising Agencies', 'Medical Offices / Urgent Care Clinics', 'Moving Companies',
  'Online Retailers / E-Commerce', 'Recreation', 'Restaurant/Bar', 'Restaurants / Cafes / Food Trucks',
  'Retail Store', 'Staffing Agencies', 'Travel Agencies / Tour Operators', 'Trucking / Delivery Services', 'Veterinary Clinic', 'Wholesale'
];

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
      const dataToSend = {
        ...editData,
        csbs__Seasonal_Peak_Months__c: Array.isArray(editData.csbs__Seasonal_Peak_Months__c)
          ? editData.csbs__Seasonal_Peak_Months__c.join(';')
          : editData.csbs__Seasonal_Peak_Months__c || ''
      };

      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Account',
        recordId: merchant.Id,
        data: dataToSend,
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

  const toggleSeason = (season) => {
    const seasons = Array.isArray(editData.csbs__Seasonal_Peak_Months__c) 
      ? editData.csbs__Seasonal_Peak_Months__c 
      : (editData.csbs__Seasonal_Peak_Months__c || '').split(';').filter(s => s);
    
    setEditData({
      ...editData,
      csbs__Seasonal_Peak_Months__c: seasons.includes(season)
        ? seasons.filter(s => s !== season)
        : [...seasons, season]
    });
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
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="dba">DBA</Label>
                        <Input id="dba" value={editData.csbs__DBA__c || ''} onChange={(e) => setEditData({ ...editData, csbs__DBA__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={editData.Phone || ''} onChange={(e) => setEditData({ ...editData, Phone: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editData.csbs__Email__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Email__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="additionalPhone">Additional Phone</Label>
                        <Input id="additionalPhone" value={editData.csbs__Additional_Phone__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Additional_Phone__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" value={editData.Website || ''} onChange={(e) => setEditData({ ...editData, Website: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="fax">Fax</Label>
                        <Input id="fax" value={editData.Fax || ''} onChange={(e) => setEditData({ ...editData, Fax: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <>
                      {merchant.csbs__DBA__c && <div className="text-sm"><p className="text-slate-500 text-xs mb-1">DBA</p><p>{merchant.csbs__DBA__c}</p></div>}
                      {merchant.Phone && <div><a href={`tel:${merchant.Phone}`} className="text-orange-600">{merchant.Phone}</a></div>}
                      {merchant.csbs__Email__c && <div><a href={`mailto:${merchant.csbs__Email__c}`} className="text-orange-600">{merchant.csbs__Email__c}</a></div>}
                      {merchant.csbs__Additional_Phone__c && <div className="text-slate-600">{merchant.csbs__Additional_Phone__c}</div>}
                      {merchant.Website && <div><a href={merchant.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600">{merchant.Website}</a></div>}
                      {merchant.Fax && <div><span className="text-slate-600">Fax: {merchant.Fax}</span></div>}
                    </>
                  )}
                </div>
              </div>

              {/* Address */}
              {isEditing ? (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing Address</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="billingStreet">Street</Label>
                      <Textarea id="billingStreet" value={editData.BillingStreet || ''} onChange={(e) => setEditData({ ...editData, BillingStreet: e.target.value })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billingCity">City</Label>
                        <Input id="billingCity" value={editData.BillingCity || ''} onChange={(e) => setEditData({ ...editData, BillingCity: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="billingState">State</Label>
                        <Input id="billingState" value={editData.BillingState || ''} onChange={(e) => setEditData({ ...editData, BillingState: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="billingZip">Zip</Label>
                        <Input id="billingZip" value={editData.BillingPostalCode || ''} onChange={(e) => setEditData({ ...editData, BillingPostalCode: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="billingCountry">Country</Label>
                        <Input id="billingCountry" value={editData.BillingCountry || ''} onChange={(e) => setEditData({ ...editData, BillingCountry: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                (merchant.BillingStreet || merchant.BillingCity) && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
                    <div className="space-y-2 text-sm text-slate-600">
                      {merchant.BillingStreet && <p>{merchant.BillingStreet}</p>}
                      {(merchant.BillingCity || merchant.BillingState || merchant.BillingPostalCode) && (
                        <p>{[merchant.BillingCity, merchant.BillingState, merchant.BillingPostalCode].filter(Boolean).join(', ')}</p>
                      )}
                      {merchant.BillingCountry && <p>{merchant.BillingCountry}</p>}
                    </div>
                  </div>
                )
              )}

              {/* Business Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <select
                          id="industry"
                          value={editData.Industry || ''}
                          onChange={(e) => setEditData({ ...editData, Industry: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md"
                        >
                          <option value="">Select Industry</option>
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="businessStartDate">Business Start Date</Label>
                        <Input
                          id="businessStartDate"
                          type="date"
                          value={editData.csbs__Business_Start_Date__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Business_Start_Date__c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entityType">Entity Type</Label>
                        <select
                          id="entityType"
                          value={editData.csbs__Entity_Type__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Entity_Type__c: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md"
                        >
                          <option value="">Select Entity Type</option>
                          {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="typeOfBusiness">Type of Business</Label>
                        <Input
                          id="typeOfBusiness"
                          value={editData.csbs__Type_of_Business__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Type_of_Business__c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="productServiceSold">Product/Service Sold</Label>
                        <Input
                          id="productServiceSold"
                          value={editData.csbs__Product_Service_Sold__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Product_Service_Sold__c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="numLocations">Number of Locations</Label>
                        <Input
                          id="numLocations"
                          type="number"
                          value={editData.csbs__Number_of_Locations__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Number_of_Locations__c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="federalTaxId">Federal Tax ID</Label>
                        <Input
                          id="federalTaxId"
                          value={editData.csbs__Federal_Tax_ID_Unencrypted__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__Federal_Tax_ID_Unencrypted__c: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="stateOfIncorporation">State of Incorporation</Label>
                        <select
                          id="stateOfIncorporation"
                          value={editData.csbs__State_of_Incorporation__c || ''}
                          onChange={(e) => setEditData({ ...editData, csbs__State_of_Incorporation__c: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md"
                        >
                          <option value="">Select State</option>
                          {US_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="franchise" checked={editData.csbs__Franchise__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Franchise__c: checked })} />
                        <Label htmlFor="franchise" className="cursor-pointer">Franchise</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="homeBased" checked={editData.csbs__Home_Based_Business__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Home_Based_Business__c: checked })} />
                        <Label htmlFor="homeBased" className="cursor-pointer">Home-Based Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="seasonal" checked={editData.csbs__Seasonal_Business__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Seasonal_Business__c: checked })} />
                        <Label htmlFor="seasonal" className="cursor-pointer">Seasonal Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="ecommerce" checked={editData.csbs__E_Commerce__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__E_Commerce__c: checked })} />
                        <Label htmlFor="ecommerce" className="cursor-pointer">E-Commerce</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="taxLienPlan" checked={editData.csbs__Open_Tax_Lien_Payment_Plan__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Open_Tax_Lien_Payment_Plan__c: checked })} />
                        <Label htmlFor="taxLienPlan" className="cursor-pointer">Open Tax Lien Payment Plan</Label>
                      </div>
                    </div>

                    {/* Seasonal Months */}
                    {editData.csbs__Seasonal_Business__c && (
                      <div>
                        <Label className="mb-2 block">Seasonal Peak Months</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {SEASONS.map(season => (
                            <div key={season} className="flex items-center space-x-2">
                              <Checkbox
                                id={season}
                                checked={(Array.isArray(editData.csbs__Seasonal_Peak_Months__c) ? editData.csbs__Seasonal_Peak_Months__c : (editData.csbs__Seasonal_Peak_Months__c || '').split(';')).includes(season)}
                                onCheckedChange={() => toggleSeason(season)}
                              />
                              <Label htmlFor={season} className="cursor-pointer text-sm">{season}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tax Lien Balance */}
                    <div>
                      <Label htmlFor="taxLienBalance">Open Tax Liens Balance</Label>
                      <select
                        id="taxLienBalance"
                        value={editData.csbs__Open_Tax_Liens_Balance__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Open_Tax_Liens_Balance__c: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md"
                      >
                        <option value="">Select Balance</option>
                        {TAX_LIEN_BALANCE.map(bal => <option key={bal} value={bal}>{bal}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {merchant.Industry && <div><p className="text-slate-500 text-xs mb-1">Industry</p><p className="font-medium">{merchant.Industry}</p></div>}
                    {merchant.csbs__Business_Start_Date__c && <div><p className="text-slate-500 text-xs mb-1">Business Start Date</p><p className="font-medium">{merchant.csbs__Business_Start_Date__c}</p></div>}
                    {merchant.csbs__Entity_Type__c && <div><p className="text-slate-500 text-xs mb-1">Entity Type</p><p className="font-medium">{merchant.csbs__Entity_Type__c}</p></div>}
                    {merchant.csbs__Type_of_Business__c && <div><p className="text-slate-500 text-xs mb-1">Type of Business</p><p className="font-medium">{merchant.csbs__Type_of_Business__c}</p></div>}
                    {merchant.csbs__Product_Service_Sold__c && <div><p className="text-slate-500 text-xs mb-1">Product/Service Sold</p><p className="font-medium">{merchant.csbs__Product_Service_Sold__c}</p></div>}
                    {merchant.csbs__Number_of_Locations__c && <div><p className="text-slate-500 text-xs mb-1">Number of Locations</p><p className="font-medium">{merchant.csbs__Number_of_Locations__c}</p></div>}
                    {merchant.csbs__Federal_Tax_ID_Unencrypted__c && <div><p className="text-slate-500 text-xs mb-1">Federal Tax ID</p><p className="font-medium">{merchant.csbs__Federal_Tax_ID_Unencrypted__c}</p></div>}
                    {merchant.csbs__State_of_Incorporation__c && <div><p className="text-slate-500 text-xs mb-1">State of Incorporation</p><p className="font-medium">{merchant.csbs__State_of_Incorporation__c}</p></div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Business Flags</h3>
            <div className="space-y-3 text-sm">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="franchise" checked={editData.csbs__Franchise__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Franchise__c: checked })} />
                    <Label htmlFor="franchise" className="cursor-pointer text-sm">Franchise</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="homeBased" checked={editData.csbs__Home_Based_Business__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Home_Based_Business__c: checked })} />
                    <Label htmlFor="homeBased" className="cursor-pointer text-sm">Home-Based Business</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="seasonal" checked={editData.csbs__Seasonal_Business__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Seasonal_Business__c: checked })} />
                    <Label htmlFor="seasonal" className="cursor-pointer text-sm">Seasonal Business</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="ecommerce" checked={editData.csbs__E_Commerce__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__E_Commerce__c: checked })} />
                    <Label htmlFor="ecommerce" className="cursor-pointer text-sm">E-Commerce</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="taxLienPlan" checked={editData.csbs__Open_Tax_Lien_Payment_Plan__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Open_Tax_Lien_Payment_Plan__c: checked })} />
                    <Label htmlFor="taxLienPlan" className="cursor-pointer text-sm">Open Tax Lien Payment Plan</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {merchant.csbs__Franchise__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Franchise</p></div>}
                  {merchant.csbs__Home_Based_Business__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Home-Based Business</p></div>}
                  {merchant.csbs__Seasonal_Business__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Seasonal Business</p></div>}
                  {merchant.csbs__E_Commerce__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>E-Commerce</p></div>}
                  {merchant.csbs__Open_Tax_Lien_Payment_Plan__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Open Tax Lien Payment Plan</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}