import React from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, ShoppingCart, Stethoscope, HardHat, Truck, 
  Scissors, Dumbbell, Wrench, Building2, ArrowRight, CheckCircle, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function Industries() {
  const industries = [
    {
      icon: Utensils,
      name: 'Restaurants & Food Service',
      description: 'From equipment upgrades to expansion, we help restaurants thrive with flexible funding.',
      stats: '$50K - $250K',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
    },
    {
      icon: ShoppingCart,
      name: 'Retail',
      description: 'Stock inventory, renovate your store, or launch marketing campaigns to boost sales.',
      stats: '$75K - $400K',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop'
    },
    {
      icon: Stethoscope,
      name: 'Healthcare & Medical',
      description: 'Purchase equipment, expand facilities, or manage cash flow for medical practices.',
      stats: '$100K - $500K',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop'
    },
    {
      icon: HardHat,
      name: 'Construction',
      description: 'Fund equipment, materials, and payroll for construction and contracting businesses.',
      stats: '$150K - $500K',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop'
    },
    {
      icon: Truck,
      name: 'Transportation & Logistics',
      description: 'Expand your fleet, cover fuel costs, or manage seasonal fluctuations.',
      stats: '$100K - $500K',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'
    },
    {
      icon: Scissors,
      name: 'Beauty & Wellness',
      description: 'Renovate your salon, buy equipment, or open a new location.',
      stats: '$50K - $200K',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop'
    },
    {
      icon: Dumbbell,
      name: 'Fitness & Recreation',
      description: 'Purchase equipment, expand your gym, or launch new programs.',
      stats: '$75K - $300K',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
    },
    {
      icon: Wrench,
      name: 'Auto Services',
      description: 'Buy lifts, diagnostic equipment, or expand your auto repair shop.',
      stats: '$50K - $250K',
      image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop'
    },
    {
      icon: Building2,
      name: 'Professional Services',
      description: 'Fund growth initiatives for accounting, legal, consulting, and other service firms.',
      stats: '$75K - $400K',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Funding for Every Industry
              </h1>
              <p className="text-base text-white/70 mb-4">
                We work with businesses across all industries with tailored funding solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Link to={createPageUrl('Application')}>
                  <Button className="bg-white text-[#08708E] hover:bg-white/90 px-6 py-3 rounded-full font-semibold">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#22d3ee]" />
                    <span className="text-xs">A+ BBB Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#22d3ee]" />
                    <span className="text-xs">24hr Funding</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop" 
                alt="Industries We Serve"
                className="rounded-2xl shadow-2xl h-64 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={industry.image}
                    alt={industry.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <industry.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="text-xs font-semibold text-white bg-[#08708E] px-3 py-1 rounded-full">
                      {industry.stats}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{industry.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{industry.description}</p>
                  <Link to={createPageUrl('Application')} className="inline-flex items-center text-[#08708E] font-medium text-sm hover:gap-2 transition-all">
                    Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Don't see your industry */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Don't See Your Industry?
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              We work with businesses across hundreds of industries. If you don't see yours listed, don't worry – 
              we likely have a funding solution for you. Contact us to discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('Application')}>
                <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-6 rounded-full text-lg font-semibold">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button variant="outline" className="border-[#08708E] text-[#08708E] hover:bg-[#08708E] hover:text-white px-8 py-6 rounded-full text-lg font-semibold">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}