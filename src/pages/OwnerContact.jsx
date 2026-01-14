import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, Phone, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function OwnerContact() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('sfSession');
    if (!sessionData) {
      window.location.href = createPageUrl('RepPortal');
      return;
    }
    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    loadUser(parsedSession);
  }, []);

  const loadUser = async (sessionData) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('id');

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('getSalesforceContact', {
        userId,
        token: sessionData.token,
        instanceUrl: sessionData.instanceUrl
      });

      setUser(response.data.user);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>User not found</p>
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
              <h1 className="text-2xl font-bold text-slate-900">{user.Name}</h1>
              {user.Title && <p className="text-sm text-slate-600">{user.Title}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">User Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Name</p>
                  <p className="font-medium text-slate-900">{user.Name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Title</p>
                  <p className="font-medium text-slate-900">{user.Title || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Department</p>
                  <p className="font-medium text-slate-900">{user.Department || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Status</p>
                  <p className={`font-medium ${user.IsActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.IsActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {user.Email && (
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-xs mb-1">Email</p>
                    <a href={`mailto:${user.Email}`} className="text-[#08708E] hover:underline flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.Email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            {user.Phone && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact
                </h2>
                <div className="text-sm">
                  <p className="text-slate-500 text-xs mb-1">Phone</p>
                  <a href={`tel:${user.Phone}`} className="font-medium text-[#08708E] hover:underline">
                    {user.Phone}
                  </a>
                </div>
              </div>
            )}

            {/* Activity Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {user.LastLoginDate && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Last Login</p>
                    <p className="font-medium text-slate-900">{new Date(user.LastLoginDate).toLocaleString()}</p>
                  </div>
                )}
                {user.CreatedDate && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Created Date</p>
                    <p className="font-medium text-slate-900">{new Date(user.CreatedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Full Name</p>
                  <p className="font-medium text-slate-900">{user.Name}</p>
                </div>
                {user.Title && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Title</p>
                    <p className="font-medium text-slate-900">{user.Title}</p>
                  </div>
                )}
                {user.Department && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Department</p>
                    <p className="font-medium text-slate-900">{user.Department}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-xs mb-1">Account Status</p>
                  <p className={`font-medium ${user.IsActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.IsActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}