import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const sections = [
    {
      title: "Funding Basics",
      icon: "💰",
      questions: [
        {
          q: "What is a business cash advance?",
          a: "A business cash advance gives you upfront capital today in exchange for a portion of your future sales. Repayments are flexible — a percentage of daily or weekly revenue — so payments adjust with your cash flow."
        },
        {
          q: "How much funding can I receive?",
          a: "We typically offer advances between $5,000 and $500,000. The exact amount depends on your monthly revenue, cash flow, and overall business performance. Use our funding calculator to see an estimate instantly."
        },
        {
          q: "How soon can I receive funding?",
          a: "Once approved and documents are submitted, funds can be deposited in as little as 24 hours, with most approvals funding within 24–48 hours."
        },
        {
          q: "Can I use the funds for any business purpose?",
          a: "Yes! Funds can be used for inventory, payroll, marketing, equipment, or other business needs — you're in control."
        },
        {
          q: "Is this a loan or a cash advance?",
          a: "This is a merchant cash advance, not a traditional loan. Repayments are based on a percentage of future sales rather than a fixed monthly payment with interest."
        }
      ]
    },
    {
      title: "Eligibility & Requirements",
      icon: "✓",
      questions: [
        {
          q: "What are the eligibility requirements?",
          a: "You may qualify if your business:\n\n• Has been operating for at least 12 months\n• Maintains consistent monthly revenue and healthy cash flow\n• Is based in the United States\n• Has a business bank account\n\nOther factors, like recent business performance, are also considered."
        },
        {
          q: "What documents are required to apply?",
          a: "You'll need basic business info, a voided business check, and 3–6 months of business bank statements. Additional documentation may be requested depending on your business situation."
        },
        {
          q: "What types of businesses qualify?",
          a: "Most U.S.-based small and medium businesses qualify, including retail, restaurants, service providers, and e-commerce. Certain industries may have additional requirements."
        },
        {
          q: "Can I have more than one cash advance at a time?",
          a: "Yes, as long as your business can support multiple repayment schedules. We review current obligations to ensure repayment is manageable."
        },
        {
          q: "Can I get funding if my business is seasonal?",
          a: "Absolutely. Because repayments are tied to revenue, seasonal fluctuations are accommodated."
        }
      ]
    },
    {
      title: "Repayment & Costs",
      icon: "💳",
      questions: [
        {
          q: "How is repayment calculated?",
          a: "Repayments are a fixed percentage of daily or weekly sales, adjusting automatically with your cash flow. This keeps payments manageable, even during slow periods."
        },
        {
          q: "How much does funding cost?",
          a: "Cost depends on your business profile, funding amount, and agreed repayment terms. We provide transparent pricing upfront — no hidden fees or surprises."
        },
        {
          q: "Can I pay off my advance early?",
          a: "Yes. There are no prepayment penalties, and paying early can reduce your total cost and shorten the repayment period."
        },
        {
          q: "Do I need to provide collateral?",
          a: "Generally, no. Repayment is based on future sales. In some cases, a personal guarantee may be required."
        },
        {
          q: "What if I have bad or limited credit?",
          a: "Your personal credit usually isn't a barrier. We focus on business performance and cash flow, so many businesses with less-than-perfect credit qualify."
        }
      ]
    },
    {
      title: "Application & Support",
      icon: "🤝",
      questions: [
        {
          q: "Will applying affect my credit score?",
          a: "No. Most MCA applications are soft checks only, so your credit score remains unaffected."
        },
        {
          q: "How do I know how much I qualify for?",
          a: "Use our instant funding calculator to get an estimate in seconds. For exact approval, we review your bank statements and revenue info — usually in under 24 hours."
        },
        {
          q: "Who can I contact if I have questions during the application?",
          a: "Our funding specialists are available via phone, email, or live chat to guide you before, during, and after the application process."
        },
        {
          q: "Are there hidden fees or penalties?",
          a: "No. We provide full transparency — you'll know your total repayment before you accept an offer."
        }
      ]
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to know about business funding with OnTrak Solutions
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

      {/* FAQ Content */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">{section.icon}</div>
                  <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {section.questions.map((item, qIndex) => (
                    <AccordionItem
                      key={qIndex}
                      value={`${sectionIndex}-${qIndex}`}
                      className="bg-slate-50 rounded-xl px-6 border-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-semibold text-slate-900 pr-4">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 pb-5 leading-relaxed whitespace-pre-line">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl p-10 text-center text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-white/80 mb-6">
              Our funding specialists are here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-lg font-semibold">📞 (302) 520-5200</div>
              <div className="hidden sm:block text-white/40">|</div>
              <div className="text-lg font-semibold">✉️ info@ontrak.co</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}