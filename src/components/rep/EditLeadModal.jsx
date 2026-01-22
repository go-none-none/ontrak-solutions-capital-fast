import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from 'lucide-react';

export default function EditLeadModal({ lead, onSave, onClose }) {
  const [formData, setFormData] = useState({
    FirstName: lead.FirstName || '',
    LastName: lead.LastName || '',
    Company: lead.Company || '',
    Title: lead.Title || '',
    Phone: lead.Phone || '',
    Email: lead.Email || '',
    Status: lead.Status || '',
    Industry: lead.Industry || '',
    LeadSource: lead.LeadSource || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Lead</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={formData.FirstName}
                onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={formData.LastName}
                onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Company</Label>
            <Input
              value={formData.Company}
              onChange={(e) => setFormData({ ...formData, Company: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.Status} onValueChange={(value) => setFormData({ ...formData, Status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open - Not Contacted">Open - Not Contacted</SelectItem>
                  <SelectItem value="Working - Contacted">Working - Contacted</SelectItem>
                  <SelectItem value="Working - Application Out">Working - Application Out</SelectItem>
                  <SelectItem value="Application Missing Info">Application Missing Info</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Closed - Not Converted">Closed - Not Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lead Source</Label>
              <Input
                value={formData.LeadSource}
                onChange={(e) => setFormData({ ...formData, LeadSource: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Industry</Label>
            <Input
              value={formData.Industry}
              onChange={(e) => setFormData({ ...formData, Industry: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1 bg-[#08708E] hover:bg-[#065a72]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}