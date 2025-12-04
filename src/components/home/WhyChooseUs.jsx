import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, DollarSign, Users, Award } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Funding',
      description: 'Get approved within hours and receive funds in as little as 24 hours.'
    },
    {
      icon: Shield,
      title: 'No Collateral Required',
      description: 'Unsecured funding options that don\'t put your assets at risk.'
    },
    {
      icon: Clock,
      title: 'Simple Application',
      description: 'Apply in minutes with our streamlined digital process. No paperwork hassle.'
    },
    {
      icon: DollarSign,
      title: 'Flexible Repayment',
      description: 'Customized payment schedules that align with your cash flow.'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Personal funding advisors available to guide you every step of the way.'
    },
    {
      icon: Award,
      title: 'High Approval Rates',
      description: '95% approval rate. We work with all credit types and business situations.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Why Choose OnTrak</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6">
            Funding Made Simple
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            We've streamlined the funding process so you can focus on what matters most — growing your business.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-slate-50 hover:bg-[#08708E] transition-all duration-500 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[#08708E]/10 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-500">
                <feature.icon className="w-7 h-7 text-[#08708E] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-slate-500 group-hover:text-white/80 transition-colors duration-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}