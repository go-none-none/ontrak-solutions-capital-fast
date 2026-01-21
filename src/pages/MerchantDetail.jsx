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
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={editData.Phone || ''} onChange={(e) => setEditData({ ...editData, Phone: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editData.Email__c || ''} onChange={(e) => setEditData({ ...editData, Email__c: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" value={editData.Website || ''} onChange={(e) => setEditData({ ...editData, Website: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <>
                      {merchant.Phone && <div className="flex items-center gap-3"><a href={`tel:${merchant.Phone}`} className="text-orange-600">{merchant.Phone}</a></div>}
                      {merchant.Email__c && <div className="flex items-center gap-3"><a href={`mailto:${merchant.Email__c}`} className="text-orange-600">{merchant.Email__c}</a></div>}
                      {merchant.Website && <div className="flex items-center gap-3"><a href={merchant.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600">{merchant.Website}</a></div>}
                    </>
                  )}
                </div>
              </div>

              {/* Business Address */}
              {isEditing ? (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Address</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="businessStreet">Street</Label>
                      <Textarea id="businessStreet" value={editData.BillingStreet || ''} onChange={(e) => setEditData({ ...editData, BillingStreet: e.target.value })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessCity">City</Label>
                        <Input id="businessCity" value={editData.BillingCity || ''} onChange={(e) => setEditData({ ...editData, BillingCity: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="businessState">State</Label>
                        <Input id="businessState" value={editData.BillingState || ''} onChange={(e) => setEditData({ ...editData, BillingState: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="businessZip">Zip</Label>
                        <Input id="businessZip" value={editData.BillingPostalCode || ''} onChange={(e) => setEditData({ ...editData, BillingPostalCode: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="businessCountry">Country</Label>
                        <Input id="businessCountry" value={editData.BillingCountry || ''} onChange={(e) => setEditData({ ...editData, BillingCountry: e.target.value })} />
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
                        <Label>Industry</Label>
                        <select value={editData.Industry || ''} onChange={(e) => setEditData({ ...editData, Industry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">Select Industry</option>
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Entity Type</Label>
                        <select value={editData.csbs__Entity_Type__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Entity_Type__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">Select Type</option>
                          {ENTITY_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Occupancy Type</Label>
                        <select value={editData.csbs__Occupancy_Type__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Occupancy_Type__c: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                          <option value="">Select Type</option>
                          {OCCUPANCY_TYPES.map(ot => <option key={ot} value={ot}>{ot}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>Annual Revenue</Label>
                        <Input type="number" value={editData.AnnualRevenue || ''} onChange={(e) => setEditData({ ...editData, AnnualRevenue: e.target.value })} />
                      </div>
                      <div>
                        <Label>Employees</Label>
                        <Input type="number" value={editData.NumberOfEmployees || ''} onChange={(e) => setEditData({ ...editData, NumberOfEmployees: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {merchant.Industry && (<div><p className="text-slate-500 text-xs mb-1">Industry</p><p className="font-medium">{merchant.Industry}</p></div>)}
                    {merchant.csbs__Entity_Type__c && (<div><p className="text-slate-500 text-xs mb-1">Entity Type</p><p className="font-medium">{merchant.csbs__Entity_Type__c}</p></div>)}
                    {merchant.csbs__Occupancy_Type__c && (<div><p className="text-slate-500 text-xs mb-1">Occupancy Type</p><p className="font-medium">{merchant.csbs__Occupancy_Type__c}</p></div>)}
                    {merchant.AnnualRevenue && (<div><p className="text-slate-500 text-xs mb-1">Annual Revenue</p><p className="font-medium">${Number(merchant.AnnualRevenue).toLocaleString()}</p></div>)}
                    {merchant.NumberOfEmployees && (<div><p className="text-slate-500 text-xs mb-1">Employees</p><p className="font-medium">{merchant.NumberOfEmployees}</p></div>)}
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