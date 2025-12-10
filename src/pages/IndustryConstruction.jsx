import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { HardHat, CheckCircle, ArrowRight, DollarSign, Clock, TrendingUp, Zap } from 'lucide-react';

export default function IndustryConstruction() {
  const benefits = [
    'Purchase heavy equipment and machinery',
    'Cover materials and supplies',
    'Manage payroll during projects',
    'Bid on larger contracts',
    'Expand your contractor business',
    'Bridge cash flow gaps'
  ];

  const useCases = [
    {
      title: 'Equipment Financing',
      description: 'Purchase excavators, bulldozers, and other heavy equipment.',
      amount: '$100K - $400K'
    },
    {
      title: 'Project Capital',
      description: 'Cover upfront costs for materials, labor, and subcontractors.',
      amount: '$150K - $500K'
    },
    {
      title: 'Working Capital',
      description: 'Manage cash flow between project payments and expenses.',
      amount: '$75K - $300K'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop"
            alt="Construction Funding"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08708E]/90 to-slate-900/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <HardHat className="w-12 h-12 text-[#22d3ee]" />
              <span className="text-[#22d3ee] font-semibold text-lg">Industry Funding</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Construction & Contracting Business Loans
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Fast funding for contractors, builders, and construction companies to cover equipment, materials, and project costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('Application')}>
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-semibold">
                  Get Funded Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#22d3ee]" />
                  <span>24hr Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#22d3ee]" />
                  <span>$150K - $500K</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Access</h3>
              <p className="text-slate-600">Get funds fast to bid on time-sensitive projects</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Large Amounts</h3>
              <p className="text-slate-600">Access up to $500K for major projects and equipment</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Repayment</h3>
              <p className="text-slate-600">Terms that match your project payment schedules</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What You Can Use Construction Funding For
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Merchant cash advances and business loans designed for the construction industry
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 bg-white p-6 rounded-xl shadow-sm"
              >
                <CheckCircle className="w-6 h-6 text-[#08708E] flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-3">{useCase.title}</h3>
                <p className="text-slate-600 mb-4">{useCase.description}</p>
                <div className="inline-block bg-[#08708E]/10 text-[#08708E] px-4 py-2 rounded-full text-sm font-semibold">
                  {useCase.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#08708E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Build Bigger Projects?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Apply today and get the working capital you need to grow your construction business.
            </p>
            <Link to={createPageUrl('Application')}>
              <Button className="bg-white text-[#08708E] hover:bg-white/90 px-10 py-6 rounded-full text-lg font-semibold">
                Apply for Funding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}