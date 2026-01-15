import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Percent, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import RepPortalHeader from '../components/rep/RepPortalHeader';
import CommunicationCard from '../components/rep/CommunicationCard.jsx';
import ActivityPanel from '../components/rep/ActivityPanel';
import { NotificationContext } from '../components/context/NotificationContext';

export default function ContactDetail() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [contact, setContact] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const { removeNotification, notifications } = useContext(NotificationContext);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    loadData(parsedSession);
  }, []);

  // Clear notifications for this record on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('id');
    if (contactId) {
      notifications.forEach(notif => {
        if (notif.link && notif.link.includes(contactId)) {
          removeNotification(notif.id);
        }
      });
    }
  }, []);

  const loadData = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const contactId = urlParams.get('id');

      console.log('ContactDetail loadData:', { contactId, hasToken: !!sessionData?.token, hasInstanceUrl: !!sessionData?.instanceUrl });

      if (!contactId) {
        console.log('No contactId in URL');
        setLoading(false);
        return;
      }

      if (!sessionData?.token || !sessionData?.instanceUrl) {
        console.error('Missing session data:', sessionData);
        setLoading(false);
        return;
      }

      const [contactRes, oppsRes] = await Promise.all([
        base44.functions.invoke('getSalesforceContact', {
          contactId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        }),
        base44.functions.invoke('getContactRelatedOpportunities', {
          contactId,
          token: sessionData.token,
          instanceUrl: sessionData.instanceUrl
        })
      ]);

      console.log('Contact loaded:', contactRes.data);
      setContact(contactRes.data.contact);
      setOpportunities(oppsRes.data.opportunities || []);
    } catch (error) {
      console.error('Load error:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadContact = () => {
    if (session) {
      loadData(session);
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
      <RepPortalHeader
        isAdmin={false}
        refreshing={false}
        onRefresh={loadContact}
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{contact.Name}</h1>
            {contact.Title && <p className="text-sm text-slate-600">{contact.Title}</p>}
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
              <div className="grid sm:grid-cols-2 gap-4">
                {contact.FirstName && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">First Name</p>
                    <p className="font-medium text-slate-900">{contact.FirstName}</p>
                  </div>
                )}
                {contact.LastName && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Last Name</p>
                    <p className="font-medium text-slate-900">{contact.LastName}</p>
                  </div>
                )}
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
              <div className="grid sm:grid-cols-2 gap-4 text-sm space-y-3">
                {contact.MobilePhone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Mobile</p>
                    <a href={`tel:${contact.MobilePhone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.MobilePhone}
                    </a>
                  </div>
                )}
                {contact.Phone && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Phone</p>
                    <a href={`tel:${contact.Phone}`} className="font-medium text-[#08708E] hover:underline">
                      {contact.Phone}
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

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm space-y-3">
                {contact.Account?.Name && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Account</p>
                    <p className="font-medium text-slate-900">{contact.Account.Name}</p>
                  </div>
                )}
                {contact.Department && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Department</p>
                    <p className="font-medium text-slate-900">{contact.Department}</p>
                  </div>
                )}
                {contact.LeadSource && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Lead Source</p>
                    <p className="font-medium text-slate-900">{contact.LeadSource}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            {contact.MailingStreet && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
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

            {/* Related Opportunities */}
            {opportunities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Related Opportunities</h2>
                <div className="space-y-3">
                  {opportunities.map(opp => (
                    <button
                      key={opp.Id}
                      onClick={() => navigate(createPageUrl('OpportunityDetail') + `?id=${opp.Id}`)}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{opp.Name}</p>
                          <p className="text-sm text-slate-600">{opp.AccountName}</p>
                        </div>
                        <Badge className="text-xs">{opp.StageName}</Badge>
                      </div>
                      {opp.Amount && (
                        <p className="text-sm text-slate-600 mt-2">${opp.Amount.toLocaleString()}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* Sidebar */}
           <div className="space-y-6">
            {/* Communication Card - Email & SMS */}
            <CommunicationCard
              recipientEmail={contact.Email}
              recipientName={contact.Name}
              phoneNumber={contact.MobilePhone || contact.Phone}
              recordId={contact.Id}
              recordType="Contact"
              session={session}
              smsColor="bg-[#08708E]"
            />

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Overview</h3>
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
                {contact.csbs__Ownership__c && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-slate-500 text-xs mb-1">Ownership %</p>
                    <p className="text-2xl font-bold text-[#08708E]">{contact.csbs__Ownership__c}%</p>
                  </div>
                )}
                {contact.csbs__Credit_Score__c && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Credit Score</p>
                    <p className="text-2xl font-bold text-[#08708E]">{contact.csbs__Credit_Score__c}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <ActivityPanel
              recordId={contact.Id}
              recordType="Contact"
              session={session}
            />
          </div>
        </div>
      </div>
    </div>
  );
}