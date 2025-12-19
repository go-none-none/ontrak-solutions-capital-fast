import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Truck, ArrowRight, CheckCircle, DollarSign, Clock, TrendingUp, Users, Shield, Zap, ThumbsUp } from 'lucide-react';

export default function IndustryTransportation() {
  const benefits = [
    { icon: DollarSign, title: 'Fleet Expansion', description: 'Purchase new vehicles or trailers for your fleet' },
    { icon: TrendingUp, title: 'Fuel & Maintenance', description: 'Cover fuel costs and vehicle maintenance expenses' },
    { icon: Users, title: 'Seasonal Coverage', description: 'Manage cash flow during peak and slow seasons' },
    { icon: Clock, title: 'Fast Approval', description: 'Get funded in as little as 24 hours' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=900&fit=crop" 
            alt="Transportation"
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
                <Truck className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">Funding for</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Transportation & Logistics
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Expand your fleet, cover fuel costs, or manage seasonal fluctuations with transportation-focused funding solutions.
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

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Transportation & Logistics Business Financing</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                Transportation companies and logistics providers operate in a capital-intensive industry — from purchasing trucks and trailers to covering fuel costs, managing maintenance expenses, hiring drivers, and handling the cash flow gaps that come with freight payment terms. OnTrak provides specialized financing for trucking companies, owner-operators, freight brokers, delivery services, courier companies, and all types of transportation businesses.
              </p>
              <p>
                Whether you're an owner-operator looking to purchase your next truck, a small fleet wanting to expand capacity, a delivery service needing to cover fuel costs during growth, or a logistics company investing in technology and tracking systems, our transportation business loans and equipment financing are designed to keep your fleet moving and your business growing.
              </p>
              <p>
                With OnTrak's transportation financing ranging from $10,000 to $500,000, you can access the capital you need with approval in hours and funding within 24-48 hours. We understand the transportation industry operates on tight margins with payment terms that can extend 30-60 days, which is why our repayment structures are designed to align with freight payment cycles and seasonal demand fluctuations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How We Keep Your Fleet Moving
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From owner-operators to large fleets, we understand the unique challenges of the transportation industry.
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
              Common Funding Uses for Transportation
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Here's how transportation companies are using our funding to scale operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Fleet Expansion', description: 'Purchase trucks, trailers, vans, specialized vehicles, and expand your delivery capacity' },
              { title: 'Fuel & Operating Costs', description: 'Cover fuel expenses, tolls, permits, and day-to-day operational costs' },
              { title: 'Maintenance & Repairs', description: 'Scheduled maintenance, emergency repairs, tire replacement, and keep fleet running' },
              { title: 'Driver Recruitment', description: 'Hire and train new drivers, offer competitive pay, and expand your workforce' },
              { title: 'Technology & GPS', description: 'Fleet management software, GPS tracking, ELD compliance, and dispatch systems' },
              { title: 'Seasonal Demand', description: 'Scale up for peak seasons, holiday shipping, and high-volume periods' }
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
                Why Transportation Companies Trust OnTrak
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Fast Funding', description: 'Get approved in hours, funded within 24-48 hours - never miss a growth opportunity' },
                  { icon: Shield, title: 'No Vehicle Liens', description: 'Keep your fleet unencumbered with unsecured funding options' },
                  { icon: ThumbsUp, title: 'Flexible Terms', description: 'Payment schedules that accommodate freight payment cycles and seasonal fluctuations' },
                  { icon: CheckCircle, title: 'High Approval Rate', description: 'We work with owner-operators and large fleets alike - 95% approval rate' }
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
                  <div className="text-4xl font-bold text-[#08708E] mb-1">201</div>
                  <div className="text-slate-600">Transportation Companies Funded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">Transportation Financing FAQs</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can owner-operators qualify for truck financing?',
                a: 'Yes! Owner-operators are welcome to apply. We evaluate your business based on current revenue and performance, not just credit scores. Many owner-operators use our funding to purchase additional trucks, cover operating expenses, or invest in trailer equipment.'
              },
              {
                q: 'What about fuel and operating costs?',
                a: 'Absolutely. Transportation companies frequently use our working capital to cover fuel expenses, tolls, permits, insurance, and other operating costs — especially during periods when freight payments are delayed or you\'re scaling up operations.'
              },
              {
                q: 'Do I need to pledge my trucks as collateral?',
                a: 'Not always. We offer unsecured financing options where you don\'t need to put liens on your vehicles. For larger amounts, equipment-secured loans are available, but many transportation companies prefer to keep their fleet unencumbered.'
              },
              {
                q: 'How do you handle seasonal fluctuations in transportation?',
                a: 'Our repayment structures can accommodate the seasonal nature of freight and logistics. For merchant cash advances based on revenue, you naturally pay more during peak seasons and less during slower periods — aligning perfectly with transportation cash flow.'
              },
              {
                q: 'Can I use funding for technology and GPS systems?',
                a: 'Yes! Many transportation companies use our financing to invest in fleet management software, GPS tracking, ELD compliance systems, dispatch technology, and other digital tools that improve efficiency and profitability.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-50 rounded-xl p-6 border-l-4 border-[#08708E]"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
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
              Ready to Expand Your Fleet?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get the capital you need to grow your transportation business and increase revenue. Trusted by owner-operators and fleet managers nationwide.
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