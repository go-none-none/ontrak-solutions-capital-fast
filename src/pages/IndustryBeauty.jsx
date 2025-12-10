import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Scissors, ArrowRight, CheckCircle, DollarSign, Clock, TrendingUp, Users } from 'lucide-react';

export default function IndustryBeauty() {
  const benefits = [
    { icon: DollarSign, title: 'Equipment & Supplies', description: 'Purchase styling stations, equipment, and inventory' },
    { icon: TrendingUp, title: 'Salon Renovations', description: 'Create a beautiful space that attracts clients' },
    { icon: Users, title: 'New Location Opening', description: 'Expand with a second or third salon location' },
    { icon: Clock, title: 'Fast Approval', description: 'Get funded in as little as 24 hours' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop" 
            alt="Beauty & Wellness"
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
                <Scissors className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">Funding for</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Beauty & Wellness
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Renovate your salon, buy equipment, or open a new location with specialized beauty industry funding.
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
                <span className="font-medium">$10K - $200K Available</span>
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
              How We Help Beauty Businesses Shine
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From salons to spas, we provide the funding you need to create an exceptional client experience.
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

      {/* CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Ready to Transform Your Salon?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get the funding you need to renovate, expand, or upgrade your beauty business.
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