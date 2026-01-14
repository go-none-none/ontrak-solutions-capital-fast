import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function OwnerContact() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    loadContact(parsedSession);
  }, []);

  const loadContact = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const contactId = urlParams.get('id');

      if (!contactId) {
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('getSalesforceContact', {
        contactId,
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });

      setContact(response.data.contact);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#08708E] animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Contact not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{contact.Name}</h1>
              {contact.Title && <p className="text-sm text-slate-600">{contact.Title}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">First Name</p>
                  <p className="font-medium text-slate-900">{contact.FirstName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Last Name</p>
                  <p className="font-medium text-slate-900">{contact.LastName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Title</p>
                  <p className="font-medium text-slate-900">{contact.Title || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Department</p>
                  <p className="font-medium text-slate-900">{contact.Department || '-'}</p>
                </div>
                {contact.Email && (
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-xs mb-1">Email</p>
                    <a href={`mailto:${contact.Email}`} className="text-[#08708E] hover:underline flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {contact.Email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Phone Numbers
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {contact.Phone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Phone</p>
                    <a href={`tel:${contact.Phone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.Phone}
                    </a>
                  </div>
                )}
                {contact.MobilePhone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Mobile</p>
                    <a href={`tel:${contact.MobilePhone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.MobilePhone}
                    </a>
                  </div>
                )}
                {contact.HomePhone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Home</p>
                    <a href={`tel:${contact.HomePhone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.HomePhone}
                    </a>
                  </div>
                )}
                {contact.OtherPhone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Other</p>
                    <a href={`tel:${contact.OtherPhone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.OtherPhone}
                    </a>
                  </div>
                )}
                {contact.Fax && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Fax</p>
                    <p className="font-medium text-slate-900">{contact.Fax}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mailing Address */}
            {contact.MailingStreet && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mailing Address
                </h2>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>{contact.MailingStreet}</p>
                  <p>
                    {[contact.MailingCity, contact.MailingState, contact.MailingPostalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {contact.MailingCountry && <p>{contact.MailingCountry}</p>}
                </div>
              </div>
            )}

            {/* Other Address */}
            {contact.OtherStreet && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Other Address
                </h2>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>{contact.OtherStreet}</p>
                  <p>
                    {[contact.OtherCity, contact.OtherState, contact.OtherPostalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {contact.OtherCountry && <p>{contact.OtherCountry}</p>}
                </div>
              </div>
            )}

            {/* Home Address */}
            {contact.csbs__Home_Address_Street__c && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Home Address
                </h2>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>{contact.csbs__Home_Address_Street__c}</p>
                  <p>
                    {[contact.csbs__Home_Address_City__c, contact.csbs__Home_Address_State__c, contact.csbs__Home_Address_Zip_Code__c]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {contact.csbs__Home_Address_Country__c && <p>{contact.csbs__Home_Address_Country__c}</p>}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {contact.Account?.Name && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Account</p>
                    <p className="font-medium text-slate-900">{contact.Account.Name}</p>
                  </div>
                )}
                {contact.LeadSource && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Lead Source</p>
                    <p className="font-medium text-slate-900">{contact.LeadSource}</p>
                  </div>
                )}
                {contact.Birthdate && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Birthdate</p>
                    <p className="font-medium text-slate-900">{new Date(contact.Birthdate).toLocaleDateString()}</p>
                  </div>
                )}
                {contact.csbs__Ownership__c && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Ownership %</p>
                    <p className="font-medium text-slate-900">{contact.csbs__Ownership__c}%</p>
                  </div>
                )}
                {contact.csbs__Credit_Score__c && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Credit Score</p>
                    <p className="font-medium text-slate-900">{contact.csbs__Credit_Score__c}</p>
                  </div>
                )}
                {contact.ReportsTo?.Name && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Reports To</p>
                    <p className="font-medium text-slate-900">{contact.ReportsTo.Name}</p>
                  </div>
                )}
                {contact.Owner?.Name && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Owner</p>
                    <p className="font-medium text-slate-900">{contact.Owner.Name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {contact.Description && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes</h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{contact.Description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Full Name</p>
                  <p className="font-medium text-slate-900">{contact.Name}</p>
                </div>
                {contact.Title && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Title</p>
                    <p className="font-medium text-slate-900">{contact.Title}</p>
                  </div>
                )}
                {contact.Department && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Department</p>
                    <p className="font-medium text-slate-900">{contact.Department}</p>
                  </div>
                )}
                {contact.Account?.Name && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Associated Account</p>
                    <p className="font-medium text-slate-900">{contact.Account.Name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Preferences</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Do Not Call</span>
                  <span className={`font-medium ${contact.DoNotCall ? 'text-red-600' : 'text-green-600'}`}>
                    {contact.DoNotCall ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Email Opt Out</span>
                  <span className={`font-medium ${contact.HasOptedOutOfEmail ? 'text-red-600' : 'text-green-600'}`}>
                    {contact.HasOptedOutOfEmail ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Fax Opt Out</span>
                  <span className={`font-medium ${contact.HasOptedOutOfFax ? 'text-red-600' : 'text-green-600'}`}>
                    {contact.HasOptedOutOfFax ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}