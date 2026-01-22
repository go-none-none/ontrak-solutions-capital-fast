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

const INDUSTRIES = [
  'Agriculture and Landscaping',
  'Apparel and Accessories',
  'Automotive/Bicycle',
  'Auto Repair Shops / Car Dealerships',
  'Bars / Nightclubs / Breweries',
  'Beauty Salon / Spa',
  'Beauty Salons / Barber Shops / Spas',
  'Building Materials',
  'Business Services',
  'Chiropractors / Physical Therapy Clinics',
  'Cleaning Services / Janitorial Services',
  'Clothing & Apparel Stores',
  'Construction',
  'Convenience Stores / Gas Stations',
  'Courier Services',
  'Dental Practices',
  'Electronics',
  'Fitness Studios / Gyms / Personal Training',
  'Garden Store / Retail Nursery',
  'General Merchandise',
  'Grocery and Baked Goods',
  'Health Services',
  'Home Furnishing',
  'Home Improvement / Contractors / Handyman Services',
  'Hotel, Motel, and Lodging',
  'Hotels / Motels / B&Bs',
  'IT / Tech Support Companies',
  'Landscaping / Lawn Care Services',
  'Laundry and Garment Services',
  'Manufacturing',
  'Marketing / Advertising Agencies',
  'Medical Offices / Urgent Care Clinics',
  'Moving Companies',
  'Online Retailers / E-Commerce',
  'Recreation',
  'Restaurant/Bar',
  'Restaurants / Cafes / Food Trucks',
  'Retail Store',
  'Specialty Retail Shops (Pet Stores, Hobby Shops, etc.)',
  'Staffing Agencies',
  'Subscription Box Companies',
  'Travel Agencies / Tour Operators',
  'Travel and Transportation',
  'Trucking / Delivery Services',
  'Veterinary Clinic',
  'Wholesale'
];

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
  const [loadingRecordTypes, setLoadingRecordTypes] = useState(false);

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
    setLoadingRecordTypes(true);
    try {
      const response = await base44.functions.invoke('getAccountRecordTypes', {
        token: session?.token,
        instanceUrl: session?.instanceUrl
      });
      setRecordTypes(response.data.recordTypes || []);
    } catch (error) {
      console.error('Load record types error:', error);
    } finally {
      setLoadingRecordTypes(false);
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

      const response = await base44.functions.invoke('getSalesforceAccount', {
        accountId: accountId,
        token: session?.token,
        instanceUrl: session?.instanceUrl
      });

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
      const dataToSend = {
        ...editData,
        RecordTypeId: recordTypeId,
        csbs__Restricted_States__c: Array.isArray(editData.csbs__Restricted_States__c)
          ? editData.csbs__Restricted_States__c.join(';')
          : editData.csbs__Restricted_States__c || '',
        csbs__Restricted_Industries__c: Array.isArray(editData.csbs__Restricted_Industries__c)
          ? editData.csbs__Restricted_Industries__c.join(';')
          : editData.csbs__Restricted_Industries__c || '',
        csbs__Seasonal_Peak_Months__c: Array.isArray(editData.csbs__Seasonal_Peak_Months__c)
          ? editData.csbs__Seasonal_Peak_Months__c.join(';')
          : editData.csbs__Seasonal_Peak_Months__c || ''
      };

      if (account?.Id) {
        await base44.functions.invoke('updateSalesforceRecord', {
          objectType: 'Account',
          recordId: account.Id,
          data: dataToSend,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      } else {
        await base44.functions.invoke('createSalesforceAccount', {
          data: dataToSend,
          token: session.token,
          instanceUrl: session.instanceUrl
        });
      }

      setAccount(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const isLender = recordTypeName?.toLowerCase().includes('lender');
  const isMerchant = recordTypeName?.toLowerCase().includes('merchant');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RepPortalHeader
        isAdmin={session?.isAdmin || false}
        refreshing={false}
        onRefresh={() => loadAccount()}
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

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'New Account' : (account?.Name || 'Account')}
            </h1>
            {!isEditing && account && (
              <p className="text-sm text-slate-600 mt-1">{recordTypeName}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => { setIsEditing(false); setEditData(account); }}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {!account && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-slate-600 mb-6">No account selected. Create a new one or select from the list.</p>
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Account
            </Button>
          </div>
        )}

        {(account || isEditing) && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Account Information Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.Name || ''}
                      onChange={(e) => setEditData({ ...editData, Name: e.target.value })}
                      placeholder="Enter account name"
                      className="border-2"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{account?.Name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Record Type {!account && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing || !account ? (
                    <select
                      value={recordTypeId || ''}
                      onChange={(e) => {
                        const selected = recordTypes.find(rt => rt.id === e.target.value);
                        setRecordTypeId(e.target.value);
                        setRecordTypeName(selected?.name || '');
                        setEditData({ ...editData, RecordTypeId: e.target.value });
                      }}
                      disabled={!!account}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Record Type</option>
                      {recordTypes.map(rt => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-900">{recordTypeName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editData.Phone || ''}
                      onChange={(e) => setEditData({ ...editData, Phone: e.target.value })}
                      placeholder="Phone"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Phone || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fax</label>
                  {isEditing ? (
                    <Input
                      value={editData.Fax || ''}
                      onChange={(e) => setEditData({ ...editData, Fax: e.target.value })}
                      placeholder="Fax"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Fax || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  {isEditing ? (
                    <Input
                      value={editData.Website || ''}
                      onChange={(e) => setEditData({ ...editData, Website: e.target.value })}
                      placeholder="Website"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Website || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.csbs__Email__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Email__c: e.target.value })}
                      placeholder="Email"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Email__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tier</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Tier__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Tier__c: e.target.value })}
                      placeholder="Tier"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Tier__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tier Position</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Tier_Position__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Tier_Position__c: e.target.value })}
                      placeholder="Tier Position"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Tier_Position__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Emails to CC</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Emails_to_CC__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Emails_to_CC__c: e.target.value })}
                      placeholder="Emails to CC"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Emails_to_CC__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Emails to BCC</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Emails_to_BCC__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Emails_to_BCC__c: e.target.value })}
                      placeholder="Emails to BCC"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Emails_to_BCC__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Phone</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Additional_Phone__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Additional_Phone__c: e.target.value })}
                      placeholder="Additional Phone"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Additional_Phone__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Source</label>
                  {isEditing ? (
                    <select
                      value={editData.AccountSource || ''}
                      onChange={(e) => setEditData({ ...editData, AccountSource: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Select source</option>
                      {ACCOUNT_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-600">{account?.AccountSource || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  {isEditing ? (
                    <select
                      value={editData.Industry || ''}
                      onChange={(e) => setEditData({ ...editData, Industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-slate-600">{account?.Industry || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">DBA</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__DBA__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__DBA__c: e.target.value })}
                      placeholder="DBA"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__DBA__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application Industry</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Application_Industry__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Application_Industry__c: e.target.value })}
                      placeholder="Application Industry"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Application_Industry__c || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employees</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.NumberOfEmployees || ''}
                      onChange={(e) => setEditData({ ...editData, NumberOfEmployees: e.target.value })}
                      placeholder="Number of Employees"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.NumberOfEmployees || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                  {isEditing ? (
                    <Input
                      value={editData.AccountNumber || ''}
                      onChange={(e) => setEditData({ ...editData, AccountNumber: e.target.value })}
                      placeholder="Account Number"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.AccountNumber || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.AnnualRevenue || ''}
                      onChange={(e) => setEditData({ ...editData, AnnualRevenue: e.target.value })}
                      placeholder="Annual Revenue"
                    />
                  ) : (
                    <p className="text-slate-600">${Number(account?.AnnualRevenue || 0).toLocaleString()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Site</label>
                  {isEditing ? (
                    <Input
                      value={editData.Site || ''}
                      onChange={(e) => setEditData({ ...editData, Site: e.target.value })}
                      placeholder="Account Site"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Site || '-'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  {isEditing ? (
                    <Textarea
                      value={editData.Description || ''}
                      onChange={(e) => setEditData({ ...editData, Description: e.target.value })}
                      placeholder="Description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Description || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div>
                  <h3 className="font-medium text-slate-800 mb-3">Billing Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                      {isEditing ? (
                        <Input
                          value={editData.BillingStreet || ''}
                          onChange={(e) => setEditData({ ...editData, BillingStreet: e.target.value })}
                          placeholder="Street"
                        />
                      ) : (
                        <p className="text-slate-600">{account?.BillingStreet || '-'}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                        {isEditing ? (
                          <Input
                            value={editData.BillingCity || ''}
                            onChange={(e) => setEditData({ ...editData, BillingCity: e.target.value })}
                            placeholder="City"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.BillingCity || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                        {isEditing ? (
                          <select
                            value={editData.BillingState || ''}
                            onChange={(e) => setEditData({ ...editData, BillingState: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          >
                            <option value="">Select</option>
                            {US_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-slate-600">{account?.BillingState || '-'}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Zip</label>
                        {isEditing ? (
                          <Input
                            value={editData.BillingPostalCode || ''}
                            onChange={(e) => setEditData({ ...editData, BillingPostalCode: e.target.value })}
                            placeholder="Zip"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.BillingPostalCode || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                        {isEditing ? (
                          <Input
                            value={editData.BillingCountry || ''}
                            onChange={(e) => setEditData({ ...editData, BillingCountry: e.target.value })}
                            placeholder="Country"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.BillingCountry || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-medium text-slate-800 mb-3">Shipping Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                      {isEditing ? (
                        <Input
                          value={editData.ShippingStreet || ''}
                          onChange={(e) => setEditData({ ...editData, ShippingStreet: e.target.value })}
                          placeholder="Street"
                        />
                      ) : (
                        <p className="text-slate-600">{account?.ShippingStreet || '-'}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                        {isEditing ? (
                          <Input
                            value={editData.ShippingCity || ''}
                            onChange={(e) => setEditData({ ...editData, ShippingCity: e.target.value })}
                            placeholder="City"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.ShippingCity || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                        {isEditing ? (
                          <select
                            value={editData.ShippingState || ''}
                            onChange={(e) => setEditData({ ...editData, ShippingState: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          >
                            <option value="">Select</option>
                            {US_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-slate-600">{account?.ShippingState || '-'}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Zip</label>
                        {isEditing ? (
                          <Input
                            value={editData.ShippingPostalCode || ''}
                            onChange={(e) => setEditData({ ...editData, ShippingPostalCode: e.target.value })}
                            placeholder="Zip"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.ShippingPostalCode || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                        {isEditing ? (
                          <Input
                            value={editData.ShippingCountry || ''}
                            onChange={(e) => setEditData({ ...editData, ShippingCountry: e.target.value })}
                            placeholder="Country"
                          />
                        ) : (
                          <p className="text-slate-600">{account?.ShippingCountry || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Lender Criteria Section */}
            {isLender && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Lender Criteria</h2>
                <div className="flex gap-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={editData.csbs__Active_Lender__c || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, csbs__Active_Lender__c: checked })}
                      disabled={!isEditing}
                    />
                    <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">Active Lender</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priority"
                      checked={editData.csbs__Priority_Lender__c || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, csbs__Priority_Lender__c: checked })}
                      disabled={!isEditing}
                    />
                    <label htmlFor="priority" className="text-sm font-medium text-slate-700 cursor-pointer">Priority Lender</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Credit Score</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Minimum_Credit_Score__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Minimum_Credit_Score__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Minimum_Credit_Score__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Negative Days</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Maximum_Negative_Days__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Maximum_Negative_Days__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Maximum_Negative_Days__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Monthly Deposit Count</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Minimum_Monthly_Deposit_Count__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Minimum_Monthly_Deposit_Count__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Minimum_Monthly_Deposit_Count__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximum NSFs</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Maximum_NSFs__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Maximum_NSFs__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Maximum_NSFs__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Monthly Deposit Amount</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Minimum_Monthly_Deposit_Amount__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Minimum_Monthly_Deposit_Amount__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Minimum_Monthly_Deposit_Amount__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Average Daily Balance</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Minimum_Average_Daily_Balance__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Minimum_Average_Daily_Balance__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Minimum_Average_Daily_Balance__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Months in Business</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Minimum_Months_in_Business__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Minimum_Months_in_Business__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Minimum_Months_in_Business__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Offer Amount</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.csbs__Maximum_Offer_Amount__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Maximum_Offer_Amount__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Maximum_Offer_Amount__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Restricted States</label>
                    {isEditing ? (
                      <MultiSelect
                        options={US_STATES}
                        value={Array.isArray(editData.csbs__Restricted_States__c) ? editData.csbs__Restricted_States__c : (editData.csbs__Restricted_States__c ? editData.csbs__Restricted_States__c.split(';').filter(s => s) : [])}
                        onChange={(value) => setEditData({ ...editData, csbs__Restricted_States__c: value })}
                        placeholder="Select states..."
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Restricted_States__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Restricted Industries</label>
                    {isEditing ? (
                      <MultiSelect
                        options={INDUSTRIES}
                        value={Array.isArray(editData.csbs__Restricted_Industries__c) ? editData.csbs__Restricted_Industries__c : (editData.csbs__Restricted_Industries__c ? editData.csbs__Restricted_Industries__c.split(';').filter(i => i) : [])}
                        onChange={(value) => setEditData({ ...editData, csbs__Restricted_Industries__c: value })}
                        placeholder="Select industries..."
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Restricted_Industries__c || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type of Business</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Type_of_Business__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Type_of_Business__c: e.target.value })}
                      placeholder="Type of Business"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Type_of_Business__c || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product/Service Sold</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Product_Service_Sold__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Product_Service_Sold__c: e.target.value })}
                      placeholder="Product/Service Sold"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Product_Service_Sold__c || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Federal Tax ID</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__Federal_Tax_ID_Unencrypted__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__Federal_Tax_ID_Unencrypted__c: e.target.value })}
                      placeholder="Federal Tax ID"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__Federal_Tax_ID_Unencrypted__c || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SIC Code</label>
                  {isEditing ? (
                    <Input
                      value={editData.Sic || ''}
                      onChange={(e) => setEditData({ ...editData, Sic: e.target.value })}
                      placeholder="SIC Code"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.Sic || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NAICS Code</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__NAICS_Code__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__NAICS_Code__c: e.target.value })}
                      placeholder="NAICS Code"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__NAICS_Code__c || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UC Code</label>
                  {isEditing ? (
                    <Input
                      value={editData.csbs__UC_Code__c || ''}
                      onChange={(e) => setEditData({ ...editData, csbs__UC_Code__c: e.target.value })}
                      placeholder="UC Code"
                    />
                  ) : (
                    <p className="text-slate-600">{account?.csbs__UC_Code__c || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Merchant Criteria Section */}
            {isMerchant && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Criteria</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Start Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editData.csbs__Business_Start_Date__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Business_Start_Date__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Business_Start_Date__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Start Date (Current Ownership)</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editData.csbs__Business_Start_Date_Current_Ownership__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Business_Start_Date_Current_Ownership__c: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Business_Start_Date_Current_Ownership__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type</label>
                    {isEditing ? (
                      <select
                        value={editData.csbs__Entity_Type__c || ''}
                        onChange={(e) => setEditData({ ...editData, csbs__Entity_Type__c: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="">Select</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="C Corporation">C Corporation</option>
                        <option value="S Corporation">S Corporation</option>
                        <option value="LLC">LLC</option>
                      </select>
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Entity_Type__c || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Franchise</label>
                    {isEditing ? (
                      <select
                        value={editData.csbs__Franchise__c ? 'Yes' : 'No'}
                        onChange={(e) => setEditData({ ...editData, csbs__Franchise__c: e.target.value === 'Yes' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Franchise__c ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Home-Based Business</label>
                    {isEditing ? (
                      <select
                        value={editData.csbs__Home_Based_Business__c ? 'Yes' : 'No'}
                        onChange={(e) => setEditData({ ...editData, csbs__Home_Based_Business__c: e.target.value === 'Yes' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Home_Based_Business__c ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Commerce</label>
                    {isEditing ? (
                      <select
                        value={editData.csbs__E_Commerce__c ? 'Yes' : 'No'}
                        onChange={(e) => setEditData({ ...editData, csbs__E_Commerce__c: e.target.value === 'Yes' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    ) : (
                      <p className="text-slate-600">{account?.csbs__E_Commerce__c ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Seasonal Peak Months</label>
                    {isEditing ? (
                      <select
                        multiple
                        value={Array.isArray(editData.csbs__Seasonal_Peak_Months__c) ? editData.csbs__Seasonal_Peak_Months__c : (editData.csbs__Seasonal_Peak_Months__c ? editData.csbs__Seasonal_Peak_Months__c.split(';') : [])}
                        onChange={(e) => setEditData({ ...editData, csbs__Seasonal_Peak_Months__c: Array.from(e.target.selectedOptions, option => option.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md h-32"
                      >
                        {MONTHS.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-600">{account?.csbs__Seasonal_Peak_Months__c || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* System Information Section */}
            {account && (
              <div className="bg-slate-100 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Created By</p>
                    <p className="text-slate-900 font-medium">{account?.CreatedBy?.Name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Account Owner</p>
                    <p className="text-slate-900 font-medium">{account?.Owner?.Name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Last Modified By</p>
                    <p className="text-slate-900 font-medium">{account?.LastModifiedBy?.Name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Parent Account</p>
                    <p className="text-slate-900 font-medium">{account?.Parent?.Name || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsEditing(false); setEditData(account); }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Account
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}