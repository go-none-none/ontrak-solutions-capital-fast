import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

export default function EditLeadModal({ isOpen, onClose, lead, onSave }) {
  const [formData, setFormData] = useState({
    FirstName: lead?.FirstName || '',
    LastName: lead?.LastName || '',
    Company: lead?.Company || '',
    Title: lead?.Title || '',
    Phone: lead?.Phone || '',
    Email: lead?.Email || '',
    Status: lead?.Status || '',
    Industry: lead?.Industry || '',
    LeadSource: lead?.LeadSource || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>First Name</Label><Input value={formData.FirstName} onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })} /></div>
            <div><Label>Last Name</Label><Input value={formData.LastName} onChange={(e) => setFormData({ ...formData, LastName: e.target.value })} required /></div>
          </div>

          <div>
            <Label>Company</Label>
            <Input value={formData.Company} onChange={(e) => setFormData({ ...formData, Company: e.target.value })} required />
          </div>

          <div>
            <Label>Title</Label>
            <Input value={formData.Title} onChange={(e) => setFormData({ ...formData, Title: e.target.value })} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input type="tel" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={formData.Email} onChange={(e) => setFormData({ ...formData, Email: e.target.value })} /></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.Status} onValueChange={(value) => setFormData({ ...formData, Status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div><Label>Lead Source</Label><Input value={formData.LeadSource} onChange={(e) => setFormData({ ...formData, LeadSource: e.target.value })} /></div>
          </div>

          <div>
            <Label>Industry</Label>
            <Input value={formData.Industry} onChange={(e) => setFormData({ ...formData, Industry: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}