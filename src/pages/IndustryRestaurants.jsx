import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Utensils, CheckCircle, ArrowRight, DollarSign, Clock, TrendingUp, Zap } from 'lucide-react';

export default function IndustryRestaurants() {
  const benefits = [
    'Purchase or upgrade kitchen equipment',
    'Renovate dining areas',
    'Cover seasonal cash flow gaps',
    'Launch marketing campaigns',
    'Hire additional staff',
    'Expand to new locations'
  ];

  const useCases = [
    {
      title: 'Equipment Financing',
      description: 'Get the latest ovens, refrigerators, and kitchen equipment to improve efficiency.',
      amount: '$25K - $150K'
    },
    {
      title: 'Expansion Capital',
      description: 'Open a second location or expand your current restaurant space.',
      amount: '$100K - $250K'
    },
    {
      title: 'Working Capital',
      description: 'Manage inventory, payroll, and expenses during slower seasons.',
      amount: '$15K - $100K'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop"
            alt="Restaurant Funding"
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
              <Utensils className="w-12 h-12 text-[#22d3ee]" />
              <span className="text-[#22d3ee] font-semibold text-lg">Industry Funding</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Restaurant & Food Service Financing
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Fast, flexible funding solutions designed specifically for restaurants, cafes, food trucks, and catering businesses.
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
                  <span>$50K - $250K</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Restaurant Owners Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Funding</h3>
              <p className="text-slate-600">Get approved in hours, funded within 24 hours</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Terms</h3>
              <p className="text-slate-600">Repayment schedules that match your cash flow</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#08708E]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">High Approval</h3>
              <p className="text-slate-600">95% approval rate for restaurant businesses</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Can Use Funding For */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What You Can Use Restaurant Funding For
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Our flexible business cash advances can be used for any legitimate business expense
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

      {/* CTA */}
      <section className="py-24 bg-[#08708E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Grow Your Restaurant?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Apply today and get the funding you need to take your restaurant to the next level.
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