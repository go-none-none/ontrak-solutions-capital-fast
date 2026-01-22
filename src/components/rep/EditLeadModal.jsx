import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIME_IN_BUSINESS = ['less_than_6_months', '6_to_12_months', '1_to_2_years', '2_to_5_years', '5_plus_years'];
const SOURCES = ['quick_form', 'full_application', 'calculator'];
const STATUSES = ['new', 'contacted', 'qualified', 'in_progress', 'funded', 'declined'];

export default function EditLeadModal({ isOpen, onClose, lead, session, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({ name: lead.name || '', business_name: lead.business_name || '', email: lead.email || '', phone: lead.phone || '', monthly_revenue: lead.monthly_revenue || '', funding_amount_requested: lead.funding_amount_requested || '', time_in_business: lead.time_in_business || '', industry: lead.industry || '', use_of_funds: lead.use_of_funds || '', source: lead.source || '', status: lead.status || 'new', notes: lead.notes || '' });
    }
  }, [lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Name, email, and phone are required');
      return;
    }

    setLoading(true);
    try {
      if (lead?.id) {
        // Update existing lead
        await base44.entities.Lead.update(lead.id, formData);
      } else {
        // Create new lead
        await base44.entities.Lead.create(formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">Name <span className="text-red-500">*</span></Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><Label htmlFor="business">Business Name</Label><Input id="business" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} /></div>
            <div><Label htmlFor="email">Email <span className="text-red-500">*</span></Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
            <div><Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
            <div><Label htmlFor="revenue">Monthly Revenue</Label><Input id="revenue" type="number" value={formData.monthly_revenue} onChange={(e) => setFormData({ ...formData, monthly_revenue: e.target.value })} /></div>
            <div><Label htmlFor="funding">Funding Requested</Label><Input id="funding" type="number" value={formData.funding_amount_requested} onChange={(e) => setFormData({ ...formData, funding_amount_requested: e.target.value })} /></div>
            <div><Label htmlFor="industry">Industry</Label><Input id="industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} /></div>
            <div><Label htmlFor="timeInBusiness">Time in Business</Label><Select value={formData.time_in_business} onValueChange={(val) => setFormData({ ...formData, time_in_business: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIME_IN_BUSINESS.map(t => (<SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>))}</SelectContent></Select></div>
            <div><Label htmlFor="source">Source</Label><Select value={formData.source} onValueChange={(val) => setFormData({ ...formData, source: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SOURCES.map(s => (<SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>))}</SelectContent></Select></div>
            <div><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => (<SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>))}</SelectContent></Select></div>
          </div>

          <div><Label htmlFor="useOfFunds">Use of Funds</Label><Textarea id="useOfFunds" value={formData.use_of_funds} onChange={(e) => setFormData({ ...formData, use_of_funds: e.target.value })} rows={3} /></div>
          <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}