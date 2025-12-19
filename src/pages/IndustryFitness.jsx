import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight, CheckCircle, DollarSign, Clock, TrendingUp, Users, Shield, Zap, ThumbsUp } from 'lucide-react';

export default function IndustryFitness() {
  const benefits = [
    { icon: DollarSign, title: 'Equipment Financing', description: 'Purchase cardio machines, weights, and specialized equipment' },
    { icon: TrendingUp, title: 'Facility Expansion', description: 'Add more space or open a new gym location' },
    { icon: Users, title: 'Program Development', description: 'Launch new classes, training programs, or services' },
    { icon: Clock, title: 'Fast Approval', description: 'Get funded in as little as 24 hours' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop" 
            alt="Fitness & Recreation"
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
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">Funding for</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Fitness & Recreation
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Purchase equipment, expand your gym, or launch new programs with flexible fitness industry funding.
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
                <span className="font-medium">$10K - $300K Available</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Fitness Center Financing for Gyms & Studios</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                Fitness businesses require substantial capital investment — purchasing cardio and strength equipment, expanding facility square footage, launching new class formats, hiring certified trainers, and maintaining a competitive edge in a growing industry. OnTrak provides specialized financing for traditional gyms, boutique fitness studios, CrossFit boxes, yoga and Pilates studios, martial arts schools, personal training facilities, and recreation centers.
              </p>
              <p>
                Whether you need funding to purchase commercial-grade treadmills and weight equipment, expand your facility to accommodate more members, launch new group fitness classes or training programs, invest in member management software and booking systems, run marketing campaigns to attract new members, or renovate your space with better lighting and flooring, our fitness business loans are structured to support your growth objectives.
              </p>
              <p>
                With OnTrak's fitness industry financing ranging from $10,000 to $300,000, you can access fast capital with approval in hours and funding within 24-48 hours. We understand that fitness businesses have membership-based revenue models with monthly recurring income, which is why our repayment structures align with your membership billing cycles and seasonal trends.
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
              How We Help Fitness Businesses Grow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From boutique studios to full-service gyms, we provide capital to help you expand and thrive.
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
              Common Funding Uses for Fitness
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Here's how gym and studio owners are using our funding to build thriving communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Fitness Equipment', description: 'Cardio machines, free weights, resistance equipment, functional training gear, and specialized tools' },
              { title: 'Facility Expansion', description: 'Add square footage, additional workout areas, locker rooms, and create more space for members' },
              { title: 'Class & Programs', description: 'Launch new group fitness classes, personal training programs, and specialized offerings' },
              { title: 'Technology & Software', description: 'Member management systems, booking software, virtual training platforms, and access control' },
              { title: 'Marketing & Acquisition', description: 'Member acquisition campaigns, referral programs, grand opening promotions, and brand awareness' },
              { title: 'Interior Design', description: 'Mirrors, flooring, lighting, sound systems, and create an inspiring workout environment' }
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
                Why Fitness Businesses Trust OnTrak
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Fast Funding', description: 'Get approved in hours, funded within 24-48 hours - launch your expansion quickly' },
                  { icon: Shield, title: 'No Equipment Liens', description: 'Keep your equipment free and clear with unsecured funding options' },
                  { icon: ThumbsUp, title: 'Flexible Terms', description: 'Payment structures that align with membership cycles and seasonal trends' },
                  { icon: CheckCircle, title: 'High Approval Rate', description: 'We work with gyms, studios, and fitness centers of all sizes - 95% approval rate' }
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
                  <div className="text-4xl font-bold text-[#08708E] mb-1">$10K - $300K</div>
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
                  <div className="text-4xl font-bold text-[#08708E] mb-1">142</div>
                  <div className="text-slate-600">Fitness Centers Funded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">Fitness Business Financing FAQs</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I finance gym equipment purchases?',
                a: 'Yes! Gym equipment financing is one of our most popular use cases. You can use our funding to purchase cardio machines (treadmills, ellipticals, bikes), strength equipment (weight racks, benches, machines), free weights, functional training gear, and any specialized equipment your fitness concept requires.'
              },
              {
                q: 'Do you fund boutique fitness studios?',
                a: 'Absolutely! We love working with boutique concepts like yoga studios, Pilates studios, barre studios, cycling studios, boxing gyms, and other specialized fitness businesses. Whether you\'re launching your first studio or expanding to multiple locations, we can help.'
              },
              {
                q: 'What if my gym is still building its member base?',
                a: 'We work with fitness businesses at all stages of growth. Even if you\'re still building membership, we can evaluate your application based on your current revenue trends, growth trajectory, and business plan. Many new gym owners successfully secure funding to accelerate growth.'
              },
              {
                q: 'Can I use funding for marketing and member acquisition?',
                a: 'Yes! Many fitness businesses use our capital for marketing campaigns, member acquisition programs, social media advertising, referral incentives, and promotional offers. Investing in marketing often delivers the highest ROI for growing fitness centers.'
              },
              {
                q: 'How do repayments work with membership-based revenue?',
                a: 'Our repayment structures are designed to align with recurring membership revenue. For merchant cash advances, repayments are based on a percentage of daily sales, which naturally accommodates fluctuations in memberships and seasonal trends in fitness.'
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
              Ready to Level Up Your Fitness Business?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get the funding you need to purchase equipment, expand your facility, or launch new programs. Trusted by fitness entrepreneurs nationwide.
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