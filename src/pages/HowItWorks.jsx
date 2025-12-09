import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Building2, 
  Receipt, 
  User, 
  FileCheck,
  Clock,
  TrendingUp,
  DollarSign,
  Zap,
  Shield,
  Eye,
  Users,
  ArrowRight,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      number: '01',
      title: 'Apply Online',
      description: 'Complete our simple online application in just 5-10 minutes. We\'ll ask for basic business information and your funding needs.',
      features: [
        'Quick 5-10 minute application',
        'No lengthy paperwork',
        'Secure online process',
        'Receive call back within the hour'
      ]
    },
    {
      icon: Search,
      number: '02',
      title: 'We Analyze Your Business',
      description: 'Our experienced team reviews your application and business performance. Don\'t worry, we don\'t bite!',
      features: [
        'Quick business assessment',
        'Review of bank statements',
        'No hard credit checks initially',
        'Transparent evaluation process'
      ]
    },
    {
      icon: CheckCircle,
      number: '03',
      title: 'Get Approved & Funded',
      description: 'Choose from our funding options and receive money in your account the same day!',
      features: [
        'Multiple funding options',
        'Same-day funding available',
        'Flexible repayment terms',
        'No prepayment penalties'
      ]
    }
  ];

  const requirements = [
    {
      icon: Building2,
      title: 'Business Information',
      description: 'Basic details about your business, including legal name, address, and industry.'
    },
    {
      icon: Receipt,
      title: 'Bank Statements',
      description: '3-6 months of recent business bank statements to verify cash flow.'
    },
    {
      icon: User,
      title: 'Owner Information',
      description: 'Personal details and identification for business owners with 20%+ ownership.'
    },
    {
      icon: FileCheck,
      title: 'Supporting Documents',
      description: 'Voided business check and any additional documents we may request.'
    }
  ];

  const repaymentFeatures = [
    {
      icon: Clock,
      title: 'Flexible Terms',
      description: 'Repayment terms from 3 to 18 months, depending on your business needs and cash flow.'
    },
    {
      icon: TrendingUp,
      title: 'Revenue-Based',
      description: 'Payments adjust with your business performance - pay more when you earn more, less when you earn less.'
    },
    {
      icon: DollarSign,
      title: 'No Penalties',
      description: 'Pay off your advance early without any prepayment penalties or hidden fees.'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Fast Approval',
      description: 'Get approved in hours, not days or weeks like traditional banks.'
    },
    {
      icon: Shield,
      title: 'No Perfect Credit Required',
      description: 'We focus on your business performance, not just your credit score.'
    },
    {
      icon: Eye,
      title: 'Transparent Pricing',
      description: 'No hidden fees or surprise charges - you\'ll know exactly what you\'re paying.'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Personal support from our experienced funding specialists throughout the process.'
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
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Securing Business Funding: Simplified
              </h1>
              <p className="text-base text-white/70 mb-4">
                Quick, transparent, and hassle-free funding so you can focus on your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
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
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop" 
                alt="Business Funding Process"
                className="rounded-2xl shadow-2xl h-48 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our Streamlined 3-Step Process
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get the funding you need quickly and efficiently
            </p>
          </motion.div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-bold text-[#08708E]/10">
                      {step.number}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-[#08708E] flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 text-lg mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#08708E] flex-shrink-0 mt-1" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="bg-slate-50 rounded-3xl p-8 lg:p-12">
                    <step.icon className="w-24 h-24 text-[#08708E]/20 mx-auto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#08708E]/10 rounded-full text-[#08708E] text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              5-10 Minutes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What You'll Need to Apply
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We've kept our requirements simple to make the process as smooth as possible
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {requirements.map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#08708E]/10 flex items-center justify-center mb-4">
                  <req.icon className="w-6 h-6 text-[#08708E]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{req.title}</h3>
                <p className="text-sm text-slate-600">{req.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <Link to={createPageUrl('Application')}>
              <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-6 rounded-full text-lg font-semibold">
                Start Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button variant="outline" className="border-2 border-[#08708E] text-[#08708E] hover:bg-[#08708E]/5 px-8 py-6 rounded-full text-lg font-semibold">
                Have Questions?
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Repayment */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Understanding Repayments
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our flexible repayment structure is designed to work with your business cash flow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {repaymentFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#08708E] flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Benefits of the OnTrak Process
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[#08708E] flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-white/70">{benefit.description}</p>
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
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of businesses that have successfully secured funding through our simple process. Apply today and get the capital your business needs to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Application')}>
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-10 py-6 rounded-full text-lg font-semibold">
                  Start Your Application
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:(302) 520-5200">
                <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-10 py-6 rounded-full text-lg font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Call (302) 520-5200
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}