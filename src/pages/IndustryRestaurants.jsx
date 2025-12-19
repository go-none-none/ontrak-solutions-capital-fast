import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Utensils, ArrowRight, CheckCircle, DollarSign, Clock, TrendingUp, Users, Shield, Zap, ThumbsUp } from 'lucide-react';

export default function IndustryRestaurants() {
  const benefits = [
    { icon: DollarSign, title: 'Equipment Financing', description: 'New kitchen equipment, POS systems, or furniture' },
    { icon: TrendingUp, title: 'Expansion Capital', description: 'Open new locations or renovate existing spaces' },
    { icon: Users, title: 'Working Capital', description: 'Cover payroll, inventory, and seasonal fluctuations' },
    { icon: Clock, title: 'Fast Approval', description: 'Get funded in as little as 24 hours' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop" 
            alt="Restaurant"
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
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <span className="text-white/80 text-lg">Funding for</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Restaurants & Food Service
            </h1>
            <p className="text-xl text-white/90 mb-8">
              From equipment upgrades to expansion, we help restaurants thrive with flexible funding solutions tailored to the food service industry.
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
                <span className="font-medium">$10K - $250K Available</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Restaurant Funding Solutions That Understand Your Industry</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                Running a restaurant requires significant capital investment — from purchasing commercial kitchen equipment and maintaining inventory to managing seasonal cash flow fluctuations and covering payroll during slower months. At OnTrak, we specialize in providing fast, flexible financing specifically designed for restaurant owners, café operators, food trucks, catering businesses, and hospitality professionals.
              </p>
              <p>
                Whether you're a quick-service restaurant looking to upgrade your kitchen equipment, a fine dining establishment planning an expansion, or a café owner needing working capital to cover seasonal dips, our restaurant business loans and merchant cash advances are structured to match the unique revenue patterns of the food service industry. We understand that restaurants operate on thin margins with daily credit card sales, which is why our funding solutions are designed to align with your cash flow.
              </p>
              <p>
                With OnTrak's restaurant funding programs, you can access between $10,000 and $250,000 with approval in as little as a few hours and funding delivered within 24-48 hours. No lengthy bank applications, no waiting weeks for approval — just straightforward financing to help you seize opportunities when they arise.
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
              How We Help Restaurants Grow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you're launching a new concept or scaling an existing operation, we have the funding solutions you need.
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
              Common Funding Uses for Restaurants
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Here's how restaurant owners are using our funding to grow their business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Kitchen Equipment', description: 'Commercial ovens, refrigeration units, prep tables, and specialized cooking equipment' },
              { title: 'Renovations & Remodeling', description: 'Dining room updates, kitchen upgrades, outdoor seating areas, and interior design improvements' },
              { title: 'Point of Sale Systems', description: 'Modern POS systems, tablets, payment processing equipment, and integrated ordering platforms' },
              { title: 'Inventory & Supplies', description: 'Bulk food purchases, seasonal inventory, beverages, and essential restaurant supplies' },
              { title: 'Marketing & Promotion', description: 'Digital advertising, menu redesigns, promotional campaigns, and social media marketing' },
              { title: 'Staff & Payroll', description: 'Hiring seasonal staff, training programs, and managing payroll during slower periods' }
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

      {/* Why Choose Us for Restaurant Funding */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Why Restaurant Owners Trust OnTrak
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Fast Funding', description: 'Get approved in hours, funded within 24-48 hours - perfect for time-sensitive opportunities' },
                  { icon: Shield, title: 'No Collateral Required', description: 'Unsecured funding options available - you don\'t need to put your property at risk' },
                  { icon: ThumbsUp, title: 'Flexible Terms', description: 'Repayment schedules that work with your restaurant\'s cash flow and seasonal variations' },
                  { icon: CheckCircle, title: 'High Approval Rate', description: 'We work with restaurants of all sizes and credit profiles - 95% approval rate' }
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
                  <div className="text-4xl font-bold text-[#08708E] mb-1">$10K - $250K</div>
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
                  <div className="text-4xl font-bold text-[#08708E] mb-1">287</div>
                  <div className="text-slate-600">Restaurants Funded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">Restaurant Funding FAQs</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What credit score do I need for restaurant financing?',
                a: 'We work with restaurant owners across all credit profiles. While traditional banks may require excellent credit, our programs are designed to approve 95% of applicants, including those with less-than-perfect credit scores.'
              },
              {
                q: 'How quickly can I get restaurant funding?',
                a: 'Most restaurant owners receive approval within a few hours of applying, and funding is typically delivered to your business bank account within 24-48 hours. This makes it perfect for time-sensitive equipment purchases or seasonal inventory needs.'
              },
              {
                q: 'Do I need collateral for restaurant business loans?',
                a: 'No. Most of our restaurant funding options are unsecured, meaning you don\'t need to put up your property, equipment, or personal assets as collateral. We focus on your daily credit card sales and business performance.'
              },
              {
                q: 'What can I use restaurant financing for?',
                a: 'Restaurant financing can be used for virtually any business need: commercial kitchen equipment, renovation and remodeling, point-of-sale systems, inventory and food supplies, marketing campaigns, hiring and payroll, expansion to new locations, or working capital for seasonal fluctuations.'
              },
              {
                q: 'How do repayments work for restaurants?',
                a: 'Repayment is designed to match your restaurant\'s cash flow. For merchant cash advances, a small percentage of your daily credit card sales goes toward repayment automatically — meaning you pay more during busy periods and less during slower times.'
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
              Ready to Grow Your Restaurant?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Get funded in as little as 24 hours with our streamlined application process. Join hundreds of restaurant owners who have secured fast, flexible financing through OnTrak.
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