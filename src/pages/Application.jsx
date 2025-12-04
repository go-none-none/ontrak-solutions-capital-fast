import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, ArrowLeft, CheckCircle, Loader2, 
  User, Building, DollarSign, FileText, Shield, Clock, Zap
} from 'lucide-react';

export default function Application() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    email: '',
    phone: '',
    // Business Info
    business_name: '',
    industry: '',
    time_in_business: '',
    // Financial Info
    monthly_revenue: '',
    funding_amount_requested: '',
    use_of_funds: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.Lead.create({
      ...formData,
      monthly_revenue: parseInt(formData.monthly_revenue) || 0,
      funding_amount_requested: parseInt(formData.funding_amount_requested) || 0,
      source: 'full_application',
      status: 'new'
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Business Info', icon: Building },
    { num: 3, title: 'Funding Details', icon: DollarSign }
  ];

  const industries = [
    'Restaurant & Food Service',
    'Retail',
    'Healthcare & Medical',
    'Construction',
    'Transportation & Logistics',
    'Beauty & Wellness',
    'Fitness & Recreation',
    'Auto Services',
    'Professional Services',
    'Manufacturing',
    'Technology',
    'Real Estate',
    'Other'
  ];

  const timeOptions = [
    { value: 'less_than_6_months', label: 'Less than 6 months' },
    { value: '6_to_12_months', label: '6-12 months' },
    { value: '1_to_2_years', label: '1-2 years' },
    { value: '2_to_5_years', label: '2-5 years' },
    { value: '5_plus_years', label: '5+ years' }
  ];

  const revenueOptions = [
    { value: '10000', label: '$10,000 - $25,000' },
    { value: '25000', label: '$25,000 - $50,000' },
    { value: '50000', label: '$50,000 - $100,000' },
    { value: '100000', label: '$100,000 - $250,000' },
    { value: '250000', label: '$250,000 - $500,000' },
    { value: '500000', label: '$500,000+' }
  ];

  const fundingOptions = [
    { value: '10000', label: '$10,000 - $25,000' },
    { value: '25000', label: '$25,000 - $50,000' },
    { value: '50000', label: '$50,000 - $100,000' },
    { value: '100000', label: '$100,000 - $250,000' },
    { value: '250000', label: '$250,000 - $500,000' },
    { value: '500000', label: '$500,000+' }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-10 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Application Submitted!
            </h1>
            <p className="text-slate-600 text-lg mb-8">
              Thank you for applying. One of our funding specialists will review your application 
              and contact you within 24 hours with your funding options.
            </p>
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">What happens next?</h3>
              <ul className="text-left space-y-3">
                {[
                  'Our team reviews your application (within 2-4 hours)',
                  'A funding specialist contacts you to discuss options',
                  'You receive and review your funding offer',
                  'Accept your offer and receive funds within 24 hours'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#08708E] text-white flex items-center justify-center flex-shrink-0 text-xs">
                      {i + 1}
                    </div>
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[#22d3ee] font-semibold text-sm uppercase tracking-wider">Apply Now</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
              Get Your Funding Quote
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Complete the application below and receive your funding options within 24 hours. No credit check required.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                { icon: Shield, text: 'No Credit Impact' },
                { icon: Clock, text: 'Same Day Response' },
                { icon: Zap, text: 'Funds in 24 Hours' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            {steps.map((s, i) => (
              <div key={s.num} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    step >= s.num ? 'bg-[#08708E] text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {step > s.num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step >= s.num ? 'text-[#08708E]' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    step > s.num ? 'bg-[#08708E]' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8 sm:p-10"
            >
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
                    <p className="text-slate-500">Tell us about yourself</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Business Information</h2>
                    <p className="text-slate-500">Tell us about your business</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Business Name *</label>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => handleChange('business_name', e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Industry *</label>
                    <Select value={formData.industry} onValueChange={(val) => handleChange('industry', val)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time in Business *</label>
                    <Select value={formData.time_in_business} onValueChange={(val) => handleChange('time_in_business', val)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200">
                        <SelectValue placeholder="How long have you been in business?" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Funding Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Funding Details</h2>
                    <p className="text-slate-500">Tell us about your funding needs</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Revenue *</label>
                    <Select value={formData.monthly_revenue} onValueChange={(val) => handleChange('monthly_revenue', val)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200">
                        <SelectValue placeholder="Select monthly revenue" />
                      </SelectTrigger>
                      <SelectContent>
                        {revenueOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Funding Amount Needed *</label>
                    <Select value={formData.funding_amount_requested} onValueChange={(val) => handleChange('funding_amount_requested', val)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200">
                        <SelectValue placeholder="How much funding do you need?" />
                      </SelectTrigger>
                      <SelectContent>
                        {fundingOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">How will you use the funds?</label>
                    <Textarea
                      value={formData.use_of_funds}
                      onChange={(e) => handleChange('use_of_funds', e.target.value)}
                      className="rounded-xl border-slate-200"
                      rows={4}
                      placeholder="Equipment purchase, inventory, marketing, expansion, etc."
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="rounded-xl px-6 py-5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="bg-[#08708E] hover:bg-[#065a72] text-white rounded-xl px-8 py-5"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#08708E] hover:bg-[#065a72] text-white rounded-xl px-8 py-5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </form>

          {/* Trust badges */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              🔒 Your information is secure and will never be shared
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}