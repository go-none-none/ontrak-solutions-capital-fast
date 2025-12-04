import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function QuickApplicationForm({ variant = 'default' }) {
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    phone: '',
    email: '',
    monthly_revenue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.Lead.create({
      ...formData,
      monthly_revenue: parseInt(formData.monthly_revenue) || 0,
      source: 'quick_form',
      status: 'new'
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const revenueOptions = [
    { value: '10000', label: '$10K - $25K' },
    { value: '25000', label: '$25K - $50K' },
    { value: '50000', label: '$50K - $100K' },
    { value: '100000', label: '$100K - $250K' },
    { value: '250000', label: '$250K+' }
  ];

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl p-8 lg:p-10 text-center ${
          variant === 'dark' ? 'bg-slate-800' : 'bg-white shadow-2xl'
        }`}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Application Received!
        </h3>
        <p className={`${variant === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
          Thank you for your interest. Our team will contact you within 24 hours with your funding options.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`rounded-3xl p-8 lg:p-10 ${
      variant === 'dark' ? 'bg-slate-800' : 'bg-white shadow-2xl'
    }`}>
      <div className="mb-8">
        <h3 className={`text-2xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Get Your Free Quote
        </h3>
        <p className={`${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Takes less than 60 seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            placeholder="Your Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className={`h-12 rounded-xl ${
              variant === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' 
                : 'border-slate-200'
            }`}
          />
        </div>

        <div>
          <Input
            placeholder="Business Name"
            value={formData.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            required
            className={`h-12 rounded-xl ${
              variant === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' 
                : 'border-slate-200'
            }`}
          />
        </div>

        <div>
          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            className={`h-12 rounded-xl ${
              variant === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' 
                : 'border-slate-200'
            }`}
          />
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className={`h-12 rounded-xl ${
              variant === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' 
                : 'border-slate-200'
            }`}
          />
        </div>

        <div>
          <Select 
            value={formData.monthly_revenue} 
            onValueChange={(val) => handleChange('monthly_revenue', val)}
          >
            <SelectTrigger className={`h-12 rounded-xl ${
              variant === 'dark' 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'border-slate-200'
            }`}>
              <SelectValue placeholder="Monthly Revenue" />
            </SelectTrigger>
            <SelectContent>
              {revenueOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-[#08708E] hover:bg-[#065a72] text-white rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#08708E]/25"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Get Funding Estimate
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <p className={`text-xs text-center ${variant === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
          No credit check required. No obligation.
        </p>
      </form>
    </div>
  );
}