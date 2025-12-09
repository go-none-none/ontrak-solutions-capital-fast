import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      number: '01',
      title: 'Quick Application',
      description: 'Fill out our simple online application in just 5 minutes. No paperwork, no hassle.'
    },
    {
      icon: Search,
      number: '02',
      title: 'Fast Review',
      description: 'Our team reviews your application and provides funding options within hours.'
    },
    {
      icon: CreditCard,
      number: '03',
      title: 'Get Funded',
      description: 'Accept your offer and receive funds in your account in as little as 24 hours.'
    }
  ];

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#08708E]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#08708E]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Three Steps to Funding
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Our streamlined process gets you the capital you need without the typical delays and red tape.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#08708E] to-transparent" />
              )}
              
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-[#08708E]/50 transition-colors duration-300">
                {/* Step number */}
                <div className="absolute -top-4 right-6 text-6xl font-bold text-slate-800">
                  {step.number}
                </div>
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#08708E] flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to={createPageUrl('Application')}>
            <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-10 py-6 rounded-full text-lg font-semibold">
              My Business Deserves More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}