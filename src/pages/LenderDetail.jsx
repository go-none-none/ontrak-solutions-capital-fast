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
import { MultiSelect } from '@/components/ui/multi-select';

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

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

export default function LenderDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [lender, setLender] = useState(null);
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
      loadLender();
    }
  }, [session]);

  const loadLender = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const lenderId = urlParams.get('id');
      
      if (!lenderId) {
        setLender(null);
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('getSalesforceLender', {
        recordId: lenderId,
        token: session?.token,
        instanceUrl: session?.instanceUrl
      });

      setLender(response.data.record);
      setEditData(response.data.record);
    } catch (error) {
      console.error('Load error:', error);
      setLender(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert arrays to semicolon-separated strings
      const dataToSend = {
        ...editData,
        csbs__Restricted_States__c: Array.isArray(editData.csbs__Restricted_States__c)
          ? editData.csbs__Restricted_States__c.join(';')
          : editData.csbs__Restricted_States__c || '',
        csbs__Restricted_Industries__c: Array.isArray(editData.csbs__Restricted_Industries__c)
          ? editData.csbs__Restricted_Industries__c.join(';')
          : editData.csbs__Restricted_Industries__c || ''
      };

      await base44.functions.invoke('updateSalesforceRecord', {
        objectType: 'Account',
        recordId: lender.Id,
        data: dataToSend,
        token: session.token,
        instanceUrl: session.instanceUrl
      });

      setLender(editData);
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

  if (!lender) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Lender not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RepPortalHeader
        isAdmin={session?.isAdmin || false}
        refreshing={false}
        onRefresh={() => loadLender()}
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
              <h1 className="text-2xl font-bold text-slate-900 truncate">{isEditing ? editData.Name : lender.Name}</h1>
              {(isEditing ? editData.Industry : lender.Industry) && <p className="text-sm text-slate-600">{isEditing ? editData.Industry : lender.Industry}</p>}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditData(lender); }} disabled={saving}>
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
                      <div>
                        <Label htmlFor="fax">Fax</Label>
                        <Input id="fax" value={editData.Fax || ''} onChange={(e) => setEditData({ ...editData, Fax: e.target.value })} />
                      </div>
                    </>
                  ) : (
                    <>
                      {lender.Phone && <div className="flex items-center gap-3"><a href={`tel:${lender.Phone}`} className="text-orange-600">{lender.Phone}</a></div>}
                      {lender.Email__c && <div className="flex items-center gap-3"><a href={`mailto:${lender.Email__c}`} className="text-orange-600">{lender.Email__c}</a></div>}
                      {lender.Website && <div className="flex items-center gap-3"><a href={lender.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600">{lender.Website}</a></div>}
                      {lender.Fax && <div className="flex items-center gap-3"><span className="text-slate-600">Fax: {lender.Fax}</span></div>}
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
                (lender.BillingStreet || lender.BillingCity) && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
                    <div className="space-y-2 text-sm text-slate-600">
                      {lender.BillingStreet && <p>{lender.BillingStreet}</p>}
                      {(lender.BillingCity || lender.BillingState || lender.BillingPostalCode) && (
                        <p>{[lender.BillingCity, lender.BillingState, lender.BillingPostalCode].filter(Boolean).join(', ')}</p>
                      )}
                      {lender.BillingCountry && <p>{lender.BillingCountry}</p>}
                    </div>
                  </div>
                )
              )}

              {/* Lending Criteria */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Lending Criteria</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Credit Score</Label>
                        <Input type="number" value={editData.csbs__Minimum_Credit_Score__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Credit_Score__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Maximum Negative Days</Label>
                        <Input type="number" value={editData.csbs__Maximum_Negative_Days__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Maximum_Negative_Days__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Min Monthly Deposits</Label>
                        <Input type="number" value={editData.csbs__Minimum_Monthly_Deposit_Count__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Monthly_Deposit_Count__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Maximum NSFs</Label>
                        <Input type="number" value={editData.csbs__Maximum_NSFs__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Maximum_NSFs__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Min Monthly Deposit Amount</Label>
                        <Input type="number" value={editData.csbs__Minimum_Monthly_Deposit_Amount__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Monthly_Deposit_Amount__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Min Avg Daily Balance</Label>
                        <Input type="number" value={editData.csbs__Minimum_Average_Daily_Balance__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Average_Daily_Balance__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Min Months in Business</Label>
                        <Input type="number" value={editData.csbs__Minimum_Months_in_Business__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Months_in_Business__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Maximum Offer Amount</Label>
                        <Input type="number" value={editData.csbs__Maximum_Offer_Amount__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Maximum_Offer_Amount__c: e.target.value })} />
                      </div>
                      <div>
                        <Label>Net Offer %</Label>
                        <Input type="number" step="0.01" value={editData.csbs__Net_Offer_Percentage__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Net_Offer_Percentage__c: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Restricted States</Label>
                        <MultiSelect options={US_STATES} value={editData.csbs__Restricted_States__c || []} onChange={(value) => setEditData({ ...editData, csbs__Restricted_States__c: value })} placeholder="Select states..." />
                      </div>
                      <div>
                        <Label>Restricted Industries</Label>
                        <MultiSelect options={INDUSTRIES} value={editData.csbs__Restricted_Industries__c || []} onChange={(value) => setEditData({ ...editData, csbs__Restricted_Industries__c: value })} placeholder="Select industries..." />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {lender.csbs__Minimum_Credit_Score__c && (<div><p className="text-slate-500 text-xs mb-1">Minimum Credit Score</p><p className="font-medium">{lender.csbs__Minimum_Credit_Score__c}</p></div>)}
                    {lender.csbs__Maximum_Negative_Days__c && (<div><p className="text-slate-500 text-xs mb-1">Maximum Negative Days</p><p className="font-medium">{lender.csbs__Maximum_Negative_Days__c}</p></div>)}
                    {lender.csbs__Minimum_Monthly_Deposit_Count__c && (<div><p className="text-slate-500 text-xs mb-1">Min Monthly Deposits</p><p className="font-medium">{lender.csbs__Minimum_Monthly_Deposit_Count__c}</p></div>)}
                    {lender.csbs__Maximum_NSFs__c && (<div><p className="text-slate-500 text-xs mb-1">Maximum NSFs</p><p className="font-medium">{lender.csbs__Maximum_NSFs__c}</p></div>)}
                    {lender.csbs__Minimum_Monthly_Deposit_Amount__c && (<div><p className="text-slate-500 text-xs mb-1">Min Monthly Deposit Amount</p><p className="font-medium">${Number(lender.csbs__Minimum_Monthly_Deposit_Amount__c).toLocaleString()}</p></div>)}
                    {lender.csbs__Minimum_Average_Daily_Balance__c && (<div><p className="text-slate-500 text-xs mb-1">Min Avg Daily Balance</p><p className="font-medium">${Number(lender.csbs__Minimum_Average_Daily_Balance__c).toLocaleString()}</p></div>)}
                    {lender.csbs__Minimum_Months_in_Business__c && (<div><p className="text-slate-500 text-xs mb-1">Min Months in Business</p><p className="font-medium">{lender.csbs__Minimum_Months_in_Business__c}</p></div>)}
                    {lender.csbs__Maximum_Offer_Amount__c && (<div><p className="text-slate-500 text-xs mb-1">Maximum Offer Amount</p><p className="font-medium">${Number(lender.csbs__Maximum_Offer_Amount__c).toLocaleString()}</p></div>)}
                    {lender.csbs__Net_Offer_Percentage__c && (<div><p className="text-slate-500 text-xs mb-1">Net Offer %</p><p className="font-medium">{lender.csbs__Net_Offer_Percentage__c}%</p></div>)}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {(lender.Description || lender.NumberOfEmployees) && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h2>
                  <div className="space-y-4 text-sm">
                    {lender.NumberOfEmployees && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Number of Employees</p>
                        <p className="font-medium">{lender.NumberOfEmployees}</p>
                      </div>
                    )}
                    {lender.Description && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Description</p>
                        <p className="text-slate-700">{lender.Description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Account Settings</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="active" checked={editData.csbs__Active__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Active__c: checked })} />
                      <Label htmlFor="active" className="cursor-pointer text-sm">Active Lender</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="trading" checked={editData.csbs__Trading_Center__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Trading_Center__c: checked })} />
                      <Label htmlFor="trading" className="cursor-pointer text-sm">Trading Center</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="leadsFromApi" checked={editData.csbs__Leads_from_API__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Leads_from_API__c: checked })} />
                      <Label htmlFor="leadsFromApi" className="cursor-pointer text-sm">Leads from API</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="leadsToApi" checked={editData.csbs__Leads_to_API__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Leads_to_API__c: checked })} />
                      <Label htmlFor="leadsToApi" className="cursor-pointer text-sm">Leads to API</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="appIndustry" checked={editData.csbs__Application_Industry__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Application_Industry__c: checked })} />
                      <Label htmlFor="appIndustry" className="cursor-pointer text-sm">Application Industry</Label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-sm">
                  {lender.csbs__Active__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Active Lender</p></div>}
                  {lender.csbs__Trading_Center__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Trading Center</p></div>}
                  {lender.csbs__Leads_from_API__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Leads from API</p></div>}
                  {lender.csbs__Leads_to_API__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Leads to API</p></div>}
                  {lender.csbs__Application_Industry__c && <div className="flex items-center gap-2"><input type="checkbox" checked={true} disabled className="w-4 h-4" /><p>Application Industry</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}