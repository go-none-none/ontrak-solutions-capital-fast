import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowRight, CheckCircle, DollarSign, Clock, TrendingUp, Users, Shield, Zap, ThumbsUp } from 'lucide-react';

export default function IndustryHealthcare() {
  const benefits = [
    { icon: DollarSign, title: 'Medical Equipment', description: 'Purchase state-of-the-art equipment for your practice' },
    { icon: TrendingUp, title: 'Facility Expansion', description: 'Add treatment rooms or open new locations' },
    { icon: Users, title: 'Cash Flow Management', description: 'Bridge gaps between insurance reimbursements' },
    { icon: Clock, title: 'Fast Approval', description: 'Get funded in as little as 24 hours' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=900&fit=crop" 
            alt="Healthcare"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">Funding for</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Healthcare & Medical
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Purchase equipment, expand facilities, or manage cash flow for medical practices with specialized healthcare funding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link to={createPageUrl('application')}>
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-8 py-6 rounded-full font-semibold text-lg">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-[#22d3ee]" />
                <span className="font-medium">$10K - $500K Available</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How We Support Healthcare Providers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From private practices to clinics, we understand the unique financial needs of healthcare providers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#08708E] rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Use Cases */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Common Funding Uses for Healthcare
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Here's how healthcare providers are using our funding to enhance patient care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Medical Equipment', description: 'Diagnostic tools, imaging equipment, treatment devices, and specialized technology' },
              { title: 'Facility Expansion', description: 'Additional treatment rooms, waiting areas, parking, or opening a new location' },
              { title: 'EMR & Software', description: 'Electronic medical records systems, practice management software, and telehealth platforms' },
              { title: 'Reimbursement Bridge', description: 'Cover cash flow gaps while waiting for insurance reimbursements and patient payments' },
              { title: 'Staff Recruitment', description: 'Hire additional medical staff, specialists, administrative personnel, and support teams' },
              { title: 'Renovations & Upgrades', description: 'Update waiting rooms, exam rooms, comply with ADA requirements, and modernize facilities' }
            ].map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-xl p-6 border-l-4 border-[#08708E]"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{useCase.title}</h3>
                <p className="text-slate-600 text-sm">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Why Healthcare Providers Trust OnTrak
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Fast Funding', description: 'Get approved in hours, funded within 24-48 hours - ideal for time-sensitive equipment purchases' },
                  { icon: Shield, title: 'HIPAA Compliant', description: 'We understand healthcare regulations and maintain strict confidentiality standards' },
                  { icon: ThumbsUp, title: 'Flexible Terms', description: 'Payment structures that accommodate insurance reimbursement cycles and patient payment schedules' },
                  { icon: CheckCircle, title: 'High Approval Rate', description: 'We work with all healthcare specialties and practice sizes - 95% approval rate' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#08708E] rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-4xl font-bold text-[#08708E] mb-1">$10K - $500K</div>
                  <div className="text-slate-600">Funding Range</div>
                </div>
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-4xl font-bold text-[#08708E] mb-1">24-48 hrs</div>
                  <div className="text-slate-600">Average Funding Time</div>
                </div>
                <div className="border-b border-slate-200 pb-4">
                  <div className="text-4xl font-bold text-[#08708E] mb-1">95%</div>
                  <div className="text-slate-600">Approval Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#08708E] mb-1">600+</div>
                  <div className="text-slate-600">Healthcare Practices Funded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Ready to Invest in Your Practice?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get the funding you need to provide better care and grow your practice.
            </p>
            <Link to={createPageUrl('application')}>
              <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-6 rounded-full text-lg font-semibold">
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}