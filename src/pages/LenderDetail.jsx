import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Phone, Globe, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import RepPortalHeader from '../components/rep/RepPortalHeader';

export default function LenderDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [lender, setLender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    loadLender(parsedSession);
  }, []);

  const loadLender = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const lenderId = urlParams.get('id');

      const response = await base44.functions.invoke('getSalesforceRecord', {
        recordId: lenderId,
        recordType: 'Account',
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });

      setLender(response.data.record);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
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
        onRefresh={() => loadLender(session)}
        onLogout={() => {
          sessionStorage.removeItem('sfSession');
          window.location.reload();
        }}
        userName={session?.name}
        showCreateTask={false}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />

      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{lender.Name}</h1>
              {lender.Industry && <p className="text-sm text-slate-600">{lender.Industry}</p>}
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
                  {lender.Phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <a href={`tel:${lender.Phone}`} className="text-orange-600 hover:underline">
                        {lender.Phone}
                      </a>
                    </div>
                  )}
                  {lender.Website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <a href={lender.Website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                        {lender.Website}
                      </a>
                    </div>
                  )}
                  {lender.Email__c && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <a href={`mailto:${lender.Email__c}`} className="text-orange-600 hover:underline">
                        {lender.Email__c}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {(lender.BillingStreet || lender.BillingCity) && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
                  <div className="flex gap-3 text-slate-600">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-slate-400 mt-0.5" />
                    <div className="text-sm">
                      {lender.BillingStreet && <p>{lender.BillingStreet}</p>}
                      {(lender.BillingCity || lender.BillingState || lender.BillingPostalCode) && (
                        <p>
                          {[lender.BillingCity, lender.BillingState, lender.BillingPostalCode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lending Criteria */}
              {(lender.csbs__Min_Loan_Amount__c || lender.csbs__Max_Loan_Amount__c || lender.csbs__Product_Types__c) && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Lending Criteria</h2>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {lender.csbs__Min_Loan_Amount__c && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Min Loan Amount</p>
                        <p className="font-medium">${Number(lender.csbs__Min_Loan_Amount__c).toLocaleString()}</p>
                      </div>
                    )}
                    {lender.csbs__Max_Loan_Amount__c && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Max Loan Amount</p>
                        <p className="font-medium">${Number(lender.csbs__Max_Loan_Amount__c).toLocaleString()}</p>
                      </div>
                    )}
                    {lender.csbs__Product_Types__c && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500 text-xs mb-1">Product Types</p>
                        <p className="font-medium">{lender.csbs__Product_Types__c}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
            <h3 className="font-semibold text-slate-900 mb-4">Account Details</h3>
            <div className="space-y-4 text-sm">
              {lender.Type && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Account Type</p>
                  <p className="font-medium">{lender.Type}</p>
                </div>
              )}
              {lender.Industry && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Industry</p>
                  <p className="font-medium">{lender.Industry}</p>
                </div>
              )}
              {lender.AnnualRevenue && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Annual Revenue</p>
                  <p className="font-medium">${Number(lender.AnnualRevenue).toLocaleString()}</p>
                </div>
              )}
              {lender.BillingCountry && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Country</p>
                  <p className="font-medium">{lender.BillingCountry}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}