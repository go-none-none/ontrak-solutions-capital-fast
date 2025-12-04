import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, Package, Truck, Users, TrendingUp, Building, 
  ShoppingBag, RefreshCw, ArrowRight, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function UseCases() {
  const useCases = [
    {
      icon: Wrench,
      title: 'Equipment Purchase',
      description: 'Upgrade or purchase new equipment to improve efficiency and expand capabilities.',
      benefits: ['No collateral required', 'Quick approval', 'Flexible terms'],
      image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=600&fit=crop'
    },
    {
      icon: Package,
      title: 'Inventory Expansion',
      description: 'Stock up on inventory to meet seasonal demand or take advantage of bulk discounts.',
      benefits: ['Fund large orders', 'Meet seasonal demand', 'Bulk purchasing power'],
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop'
    },
    {
      icon: Users,
      title: 'Hiring & Payroll',
      description: 'Expand your team or cover payroll during growth phases without cash flow stress.',
      benefits: ['Grow your team', 'Cover payroll gaps', 'Support expansion'],
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop'
    },
    {
      icon: TrendingUp,
      title: 'Marketing & Advertising',
      description: 'Invest in marketing campaigns to attract new customers and boost revenue.',
      benefits: ['Launch campaigns', 'Increase visibility', 'Drive sales'],
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop'
    },
    {
      icon: Building,
      title: 'Renovations & Expansion',
      description: 'Renovate your space or open new locations to grow your business footprint.',
      benefits: ['Modernize facilities', 'Open new locations', 'Improve customer experience'],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    },
    {
      icon: RefreshCw,
      title: 'Cash Flow Management',
      description: 'Bridge gaps between receivables and payables to keep operations running smoothly.',
      benefits: ['Manage slow periods', 'Cover unexpected expenses', 'Maintain operations'],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop'
    }
  ];

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
            <span className="text-[#22d3ee] font-semibold text-sm uppercase tracking-wider">Use Cases</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              How Businesses Use<br />OnTrak Funding
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              From equipment purchases to expansion projects, discover how our flexible funding solutions help businesses achieve their goals.
            </p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="w-14 h-14 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mb-6">
                    <useCase.icon className="w-7 h-7 text-[#08708E]" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">{useCase.title}</h2>
                  <p className="text-slate-600 text-lg mb-6">{useCase.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {useCase.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#08708E]" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={createPageUrl('Application')}>
                    <Button className="bg-[#08708E] hover:bg-[#065a72] text-white rounded-full px-8 py-5">
                      Apply for Funding
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="rounded-2xl w-full h-80 object-cover shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Fund Your Next Project?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Whatever your business needs, we have the funding solution to help you achieve it. Apply today and get funded in as little as 24 hours.
            </p>
            <Link to={createPageUrl('Application')}>
              <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-10 py-6 rounded-full text-lg font-semibold">
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}