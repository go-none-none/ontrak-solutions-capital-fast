import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, DollarSign, FileCheck, Clock, Shield, HelpCircle, ArrowRight, Edit, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqSections = [
    {
      title: 'Funding Basics',
      icon: DollarSign,
      description: 'Learn about business cash advances, funding amounts, and how quickly you can access capital.',
      faqs: [
        {
          question: 'What is a business cash advance?',
          answer: 'A business cash advance gives you upfront capital today in exchange for a portion of your future sales. Repayments are flexible — a percentage of daily or weekly revenue — so payments adjust with your cash flow.'
        },
        {
          question: 'How much funding can I receive?',
          answer: 'We typically offer advances between $5,000 and $500,000. The exact amount depends on your monthly revenue, cash flow, and overall business performance. Use our funding calculator to see an estimate instantly.'
        },
        {
          question: 'How soon can I receive funding?',
          answer: 'Once approved and documents are submitted, funds can be deposited in as little as 24 hours, with most approvals funding within 24–48 hours.'
        },
        {
          question: 'Can I use the funds for any business purpose?',
          answer: 'Yes! Funds can be used for inventory, payroll, marketing, equipment, or other business needs — you\'re in control.'
        },
        {
          question: 'Is this a loan or a cash advance?',
          answer: 'This is a merchant cash advance, not a traditional loan. Repayments are based on a percentage of future sales rather than a fixed monthly payment with interest.'
        }
      ]
    },
    {
      title: 'Eligibility & Requirements',
      icon: FileCheck,
      description: 'Find out if your business qualifies and what documents you\'ll need to apply.',
      faqs: [
        {
          question: 'What are the eligibility requirements?',
          answer: 'You may qualify if your business:\n\n• Has been operating for at least 12 months\n• Maintains consistent monthly revenue and healthy cash flow\n• Is based in the United States\n• Has a business bank account\n\nOther factors, like recent business performance, are also considered.'
        },
        {
          question: 'What documents are required to apply?',
          answer: 'You\'ll need basic business info, a voided business check, and 3–6 months of business bank statements. Additional documentation may be requested depending on your business situation.'
        },
        {
          question: 'What types of businesses qualify?',
          answer: 'Most U.S.-based small and medium businesses qualify, including retail, restaurants, service providers, and e-commerce. Certain industries may have additional requirements.'
        },
        {
          question: 'Can I have more than one cash advance at a time?',
          answer: 'Yes, as long as your business can support multiple repayment schedules. We review current obligations to ensure repayment is manageable.'
        },
        {
          question: 'Can I get funding if my business is seasonal?',
          answer: 'Absolutely. Because repayments are tied to revenue, seasonal fluctuations are accommodated.'
        }
      ]
    },
    {
      title: 'Repayment & Costs',
      icon: Clock,
      description: 'Understand how repayments work, pricing transparency, and flexible payment options.',
      faqs: [
        {
          question: 'How is repayment calculated?',
          answer: 'Repayments are a fixed percentage of daily or weekly sales, adjusting automatically with your cash flow. This keeps payments manageable, even during slow periods.'
        },
        {
          question: 'How much does funding cost?',
          answer: 'Cost depends on your business profile, funding amount, and agreed repayment terms. We provide transparent pricing upfront — no hidden fees or surprises.'
        },
        {
          question: 'Can I pay off my advance early?',
          answer: 'Yes. There are no prepayment penalties, and paying early can reduce your total cost and shorten the repayment period.'
        },
        {
          question: 'Do I need to provide collateral?',
          answer: 'Generally, no. Repayment is based on future sales. In some cases, a personal guarantee may be required.'
        },
        {
          question: 'What if I have bad or limited credit?',
          answer: 'Your personal credit usually isn\'t a barrier. We focus on business performance and cash flow, so many businesses with less-than-perfect credit qualify.'
        }
      ]
    },
    {
      title: 'Application & Support',
      icon: Shield,
      description: 'Get answers about the application process, approval timeline, and our dedicated support.',
      faqs: [
        {
          question: 'Will applying affect my credit score?',
          answer: 'No. Most MCA applications are soft checks only, so your credit score remains unaffected.'
        },
        {
          question: 'How do I know how much I qualify for?',
          answer: 'Use our instant funding calculator to get an estimate in seconds. For exact approval, we review your bank statements and revenue info — usually in under 24 hours.'
        },
        {
          question: 'Who can I contact if I have questions during the application?',
          answer: 'Our funding specialists are available via phone, email, or live chat to guide you before, during, and after the application process.'
        },
        {
          question: 'Are there hidden fees or penalties?',
          answer: 'No. We provide full transparency — you\'ll know your total repayment before you accept an offer.'
        }
      ]
    }
  ];

  const toggleFaq = (sectionIndex, faqIndex) => {
    const key = `${sectionIndex}-${faqIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              FAQ
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to know about business funding with OnTrak. Simple, transparent, and designed for your success.
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

      {/* Quick Process Overview */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              How Do We Get You Funded, Faster
            </h2>
            <p className="text-slate-600">In three simple steps, you'll be on your way to prosperity</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Edit, title: 'Apply Online', description: '5-10 minute application with basic business info' },
              { icon: Search, title: 'Quick Review', description: 'We analyze your business and provide options' },
              { icon: CheckCircle, title: 'Get Funded', description: 'Receive funds in your account within 24 hours' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-[#08708E] flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-[#08708E] flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                  </div>
                  <p className="text-slate-600 ml-16">{section.description}</p>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  {section.faqs.map((faq, faqIndex) => {
                    const key = `${sectionIndex}-${faqIndex}`;
                    const isOpen = openFaq === key;

                    return (
                      <motion.div
                        key={faqIndex}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-slate-50 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(sectionIndex, faqIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-[#08708E] flex-shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="px-6 pb-4"
                          >
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#08708E] to-[#065a72]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Our funding specialists are here to help. Get in touch or start your application today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Application')}>
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-8 py-6 rounded-full text-lg font-semibold">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Contact')}>
                <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-semibold">
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