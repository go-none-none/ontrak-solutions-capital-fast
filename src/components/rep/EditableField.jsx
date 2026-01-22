import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from 'lucide-react';

export default function EditableField({ label, value, onSave, type = 'text', editable = true, multiline = false, className = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (onSave) {
      await onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!editable) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <p className="text-slate-900">{value || '-'}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      
      {isEditing ? (
        <div className="flex gap-2">
          {multiline ? (
            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
          ) : (
            <Input type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
          )}
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
          <p className="text-slate-900">{value || '-'}</p>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}