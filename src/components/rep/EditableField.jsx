import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Check, X } from 'lucide-react';

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const ENTITY_TYPES = [
  "Corporation",
  "LLC",
  "Partnership",
  "Sole Proprietorship",
  "S-Corporation",
  "Non-Profit"
];

const PAYMENT_FREQUENCIES = [
  "Daily",
  "Weekly",
  "Bi-Weekly",
  "Monthly"
];

const PAYMENT_METHODS = [
  "ACH",
  "Check",
  "Wire Transfer"
];

// Field configuration - maps field names to their types and options
const FIELD_CONFIG = {
  // Boolean fields (checkboxes)
  'csbs__Seasonal_Business__c': { type: 'checkbox' },
  'csbs__E_Commerce__c': { type: 'checkbox' },
  'csbs__Franchise__c': { type: 'checkbox' },
  'csbs__Home_Based_Business__c': { type: 'checkbox' },
  'Line_of_Credit__c': { type: 'checkbox' },
  
  // Picklist fields (dropdowns)
  'csbs__Entity_Type__c': { type: 'select', options: ENTITY_TYPES },
  'csbs__Home_Address_State__c': { type: 'select', options: US_STATES },
  'csbs__Owner_2_Home_Address_State__c': { type: 'select', options: US_STATES },
  'csbs__State_of_Incorporation__c': { type: 'select', options: US_STATES },
  'Payment_Frequency__c': { type: 'select', options: PAYMENT_FREQUENCIES },
  'Payment_Method__c': { type: 'select', options: PAYMENT_METHODS },
  
  // Date fields
  'csbs__Birthdate__c': { type: 'date' },
  'csbs__Owner_2_Birthday__c': { type: 'date' },
  'csbs__Business_Start_Date_Current_Ownership__c': { type: 'date' },
  'CloseDate': { type: 'date' },
  'X20_Paid_In__c': { type: 'date' },
  'X40_Paid_In__c': { type: 'date' },
  'X60_Paid_In__c': { type: 'date' },
  'X80_Paid_In__c': { type: 'date' },
  'X100_Paid_In__c': { type: 'date' },
  
  // Number/Percentage fields
  'csbs__Ownership_Percentage__c': { type: 'number', suffix: '%' },
  'csbs__Owner_2_Ownership__c': { type: 'number', suffix: '%' },
  'csbs__CreditScore__c': { type: 'number' },
  'csbs__Owner_2_CreditScore__c': { type: 'number' },
  'Holdback__c': { type: 'number', suffix: '%' },
  'Commission_Percentage__c': { type: 'number', suffix: '%' },
  'Origination_Fee_Percentage__c': { type: 'number', suffix: '%' },
  'Probability': { type: 'number', suffix: '%' },
  'Months_In_Business__c': { type: 'number' },
  'Avg_Bank_Deposits_Count__c': { type: 'number' },
  'Avg_Credit_Card_Batches__c': { type: 'number' },
  'Avg_NSFs__c': { type: 'number' },
  'Avg_Negative_Days__c': { type: 'number' },
  'Term__c': { type: 'number' },
  'Buy_Rate__c': { type: 'number' },
  'Factor_Rate__c': { type: 'number' },
  
  // Email fields
  'Email': { type: 'email' },
  'csbs__Owner_2_Email__c': { type: 'email' },
  
  // Phone fields
  'Phone': { type: 'tel' },
  'MobilePhone': { type: 'tel' },
  'csbs__Owner_2_Mobile__c': { type: 'tel' },
  
  // Multiline text
  'Description': { type: 'textarea' },
  'Use_of_Proceeds__c': { type: 'textarea' },
  'csbs__Seasonal_Peak_Months__c': { type: 'textarea' }
};

export default function EditableField({ 
  label, 
  field, 
  value, 
  editing, 
  editValues,
  disabled = false,
  onEdit,
  onSave,
  onCancel
}) {
  const fieldConfig = FIELD_CONFIG[field] || { type: 'text' };
  const isEditing = editing[field];
  const displayValue = isEditing ? editValues[field] : value;
  
  const renderDisplayValue = () => {
    if (fieldConfig.type === 'checkbox') {
      return value ? 'Yes' : 'No';
    }
    if (fieldConfig.suffix && value) {
      return `${value}${fieldConfig.suffix}`;
    }
    return value || <span className="text-slate-400 text-sm">Not set</span>;
  };

  const renderEditControl = () => {
    switch (fieldConfig.type) {
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={displayValue || false}
              onChange={(e) => onEdit(field, e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
            />
            <span className="text-sm text-slate-700">
              {displayValue ? 'Yes' : 'No'}
            </span>
          </label>
        );
        
      case 'select':
        return (
          <Select 
            value={displayValue || ''} 
            onValueChange={(val) => onEdit(field, val)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'textarea':
        return (
          <Textarea
            value={displayValue || ''}
            onChange={(e) => onEdit(field, e.target.value)}
            className="text-sm min-h-20"
            rows={3}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={displayValue || ''}
            onChange={(e) => onEdit(field, e.target.value)}
            className="h-8 text-sm"
          />
        );
        
      case 'number':
        return (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={displayValue || ''}
              onChange={(e) => onEdit(field, e.target.value)}
              className="h-8 text-sm"
              step={fieldConfig.suffix === '%' ? '0.01' : '1'}
            />
            {fieldConfig.suffix && (
              <span className="text-sm text-slate-500">{fieldConfig.suffix}</span>
            )}
          </div>
        );
        
      default:
        return (
          <Input
            type={fieldConfig.type || 'text'}
            value={displayValue || ''}
            onChange={(e) => onEdit(field, e.target.value)}
            className="h-8 text-sm"
          />
        );
    }
  };

  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      {isEditing && !disabled ? (
        <div className="flex items-start gap-2">
          <div className="flex-1">
            {renderEditControl()}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onSave(field)} className="h-8 w-8 p-0">
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onCancel(field)} className="h-8 w-8 p-0">
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 group">
          <p className="font-medium text-slate-900">
            {renderDisplayValue()}
          </p>
          {!disabled && (
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={() => {
                onEdit(field, value || (fieldConfig.type === 'checkbox' ? false : ''));
                // Trigger editing mode by calling parent handler
                if (onEdit) {
                  const newEditing = { [field]: true };
                  // This will be handled by parent
                }
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}