import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, X, ArrowLeft } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from '@/components/ui/multi-select';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import RepPortalHeader from '../components/rep/RepPortalHeader';

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
const INDUSTRIES = ['Agriculture and Landscaping', 'Apparel and Accessories', 'Automotive/Bicycle', 'Auto Repair Shops / Car Dealerships', 'Bars / Nightclubs / Breweries', 'Beauty Salon / Spa', 'Beauty Salons / Barber Shops / Spas', 'Building Materials', 'Business Services', 'Chiropractors / Physical Therapy Clinics', 'Cleaning Services / Janitorial Services', 'Clothing & Apparel Stores', 'Construction', 'Convenience Stores / Gas Stations', 'Courier Services', 'Dental Practices', 'Electronics', 'Fitness Studios / Gyms / Personal Training', 'Garden Store / Retail Nursery', 'General Merchandise', 'Grocery and Baked Goods', 'Health Services', 'Home Furnishing', 'Home Improvement / Contractors / Handyman Services', 'Hotel, Motel, and Lodging', 'Hotels / Motels / B&Bs', 'IT / Tech Support Companies', 'Landscaping / Lawn Care Services', 'Laundry and Garment Services', 'Manufacturing', 'Marketing / Advertising Agencies', 'Medical Offices / Urgent Care Clinics', 'Moving Companies', 'Online Retailers / E-Commerce', 'Recreation', 'Restaurant/Bar', 'Restaurants / Cafes / Food Trucks', 'Retail Store', 'Specialty Retail Shops (Pet Stores, Hobby Shops, etc.)', 'Staffing Agencies', 'Subscription Box Companies', 'Travel Agencies / Tour Operators', 'Travel and Transportation', 'Trucking / Delivery Services', 'Veterinary Clinic', 'Wholesale'];
const ACCOUNT_SOURCES = ['Direct Mail', 'Email', 'Phone Inquiry', 'Purchased List', 'Self Generated', 'Web', 'Word of mouth', 'Other'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AccountDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [recordTypeId, setRecordTypeId] = useState(null);
  const [recordTypeName, setRecordTypeName] = useState('');
  const [recordTypes, setRecordTypes] = useState([]);

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
      loadAccount();
      loadRecordTypes();
    }
  }, [session]);

  const loadRecordTypes = async () => {
    try {
      const response = await base44.functions.invoke('getAccountRecordTypes', { token: session?.token, instanceUrl: session?.instanceUrl });
      setRecordTypes(response.data.recordTypes || []);
    } catch (error) {
      console.error('Load record types error:', error);
    }
  };

  const loadAccount = async () => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accountId = urlParams.get('id');
      if (!accountId) {
        setAccount(null);
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('getSalesforceAccount', { accountId, token: session?.token, instanceUrl: session?.instanceUrl });
      if (response.data?.account) {
        const accountRecord = response.data.account;
        setAccount(accountRecord);
        setEditData(accountRecord);
        setRecordTypeId(accountRecord.RecordTypeId);
        setRecordTypeName(accountRecord.RecordType?.Name || '');
      }
    } catch (error) {
      console.error('Load error:', error);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.Name?.trim()) {
      alert('Account Name is required');
      return;
    }

    setSaving(true);
    try {
      const { Id, CreatedBy, CreatedDate, LastModifiedBy, LastModifiedDate, Owner, RecordType, Parent, ...cleanData } = editData;
      const dataToSend = { ...cleanData, RecordTypeId: recordTypeId, csbs__Restricted_States__c: Array.isArray(cleanData.csbs__Restricted_States__c) ? cleanData.csbs__Restricted_States__c.join(';') : cleanData.csbs__Restricted_States__c || '', csbs__Restricted_Industries__c: Array.isArray(cleanData.csbs__Restricted_Industries__c) ? cleanData.csbs__Restricted_Industries__c.join(';') : cleanData.csbs__Restricted_Industries__c || '', csbs__Seasonal_Peak_Months__c: Array.isArray(cleanData.csbs__Seasonal_Peak_Months__c) ? cleanData.csbs__Seasonal_Peak_Months__c.join(';') : cleanData.csbs__Seasonal_Peak_Months__c || '' };

      if (account?.Id) {
        await base44.functions.invoke('updateSalesforceRecord', { objectType: 'Account', recordId: account.Id, data: dataToSend, token: session.token, instanceUrl: session.instanceUrl });
      } else {
        await base44.functions.invoke('createSalesforceAccount', { data: dataToSend, token: session.token, instanceUrl: session.instanceUrl });
      }

      setAccount(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      let errorMessage = 'Failed to save: ';
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        if (Array.isArray(details) && details.length > 0) {
          errorMessage += details.map(d => d.message || JSON.stringify(d)).join(', ');
        } else {
          errorMessage += JSON.stringify(details, null, 2);
        }
      } else {
        errorMessage += error.response?.data?.error || error.message;
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const isLender = recordTypeName?.toLowerCase().includes('lender');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RepPortalHeader isAdmin={session?.isAdmin || false} refreshing={false} onRefresh={() => loadAccount()} onLogout={() => { sessionStorage.removeItem('sfSession'); window.location.reload(); }} userName={session?.name} showCreateTask={false} showBackButton={true} onBackClick={() => navigate(-1)} session={session} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{isEditing ? 'New Account' : (account?.Name || 'Account')}</h1>
            {!isEditing && account && <p className="text-sm text-slate-600 mt-1">{recordTypeName}</p>}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(account); }} disabled={saving}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{saving ? 'Saving...' : 'Save'}</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">Edit</Button>
            )}
          </div>
        </div>

        {!account && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-slate-600 mb-6">No account selected. Create a new one or select from the list.</p>
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">Create New Account</Button>
          </div>
        )}

        {(account || isEditing) && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Name <span className="text-red-500">*</span></label>
                  {isEditing ? <Input value={editData.Name || ''} onChange={(e) => setEditData({ ...editData, Name: e.target.value })} placeholder="Enter account name" className="border-2" /> : <p className="text-slate-900 font-medium">{account?.Name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Record Type {!account && <span className="text-red-500">*</span>}</label>
                  {isEditing || !account ? (
                    <select value={recordTypeId || ''} onChange={(e) => { const selected = recordTypes.find(rt => rt.id === e.target.value); setRecordTypeId(e.target.value); setRecordTypeName(selected?.name || ''); setEditData({ ...editData, RecordTypeId: e.target.value }); }} disabled={!!account} className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">
                      <option value="">Select Record Type</option>
                      {recordTypes.map(rt => (<option key={rt.id} value={rt.id}>{rt.name}</option>))}
                    </select>
                  ) : (
                    <p className="text-slate-900">{recordTypeName || 'Not set'}</p>
                  )}
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>{isEditing ? <Input value={editData.Phone || ''} onChange={(e) => setEditData({ ...editData, Phone: e.target.value })} placeholder="Phone" /> : <p className="text-slate-600">{account?.Phone || '-'}</p>}</div>
              </div>
            </div>

            {isLender && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Lender Criteria</h2>
                <div className="flex gap-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="active" checked={editData.csbs__Active_Lender__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Active_Lender__c: checked })} disabled={!isEditing} />
                    <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">Active Lender</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="priority" checked={editData.csbs__Priority_Lender__c || false} onCheckedChange={(checked) => setEditData({ ...editData, csbs__Priority_Lender__c: checked })} disabled={!isEditing} />
                    <label htmlFor="priority" className="text-sm font-medium text-slate-700 cursor-pointer">Priority Lender</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Minimum Credit Score</label>{isEditing ? <Input type="number" value={editData.csbs__Minimum_Credit_Score__c || ''} onChange={(e) => setEditData({ ...editData, csbs__Minimum_Credit_Score__c: e.target.value })} /> : <p className="text-slate-600">{account?.csbs__Minimum_Credit_Score__c || '-'}</p>}</div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(account); }} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save Account</Button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}