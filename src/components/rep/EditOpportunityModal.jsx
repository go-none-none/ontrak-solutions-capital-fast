import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from 'lucide-react';

export default function EditOpportunityModal({ opportunity, onSave, onClose }) {
  const [formData, setFormData] = useState({
    Name: opportunity.Name || '',
    StageName: opportunity.StageName || '',
    Amount: opportunity.Amount || '',
    CloseDate: opportunity.CloseDate || '',
    Probability: opportunity.Probability || '',
    Type: opportunity.Type || '',
    LeadSource: opportunity.LeadSource || '',
    NextStep: opportunity.NextStep || '',
    Description: opportunity.Description || ''
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
          <h2 className="text-2xl font-bold text-slate-900">Edit Opportunity</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Opportunity Name</Label>
            <Input
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Stage</Label>
              <Select value={formData.StageName} onValueChange={(value) => setFormData({ ...formData, StageName: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Application In">Application In</SelectItem>
                  <SelectItem value="Underwriting">Underwriting</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Contracts Out">Contracts Out</SelectItem>
                  <SelectItem value="Contracts In">Contracts In</SelectItem>
                  <SelectItem value="Closed - Funded">Closed - Funded</SelectItem>
                  <SelectItem value="Closed - Declined">Closed - Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={formData.Type}
                onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.Amount}
                onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.Probability}
                onChange={(e) => setFormData({ ...formData, Probability: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Close Date</Label>
              <Input
                type="date"
                value={formData.CloseDate}
                onChange={(e) => setFormData({ ...formData, CloseDate: e.target.value })}
              />
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
            <Label>Next Step</Label>
            <Input
              value={formData.NextStep}
              onChange={(e) => setFormData({ ...formData, NextStep: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
              rows={3}
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