import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/70">
              Effective Date: 10/01/2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {[
              {
                title: "1. Agreement to Terms",
                content: "By accessing our website, submitting a form, or communicating with OnTrak Solutions LLC, you agree to these Terms of Service."
              },
              {
                title: "2. SMS Messaging Consent",
                content: "By providing your phone number, you consent to receive automated and/or non-automated text messages from OnTrak Solutions for purposes including updates, service information, and promotional content.",
                list: [
                  "Message frequency varies.",
                  "Message and data rates may apply.",
                  "You can reply STOP to unsubscribe or HELP for assistance."
                ]
              },
              {
                title: "3. Use of Services",
                content: "You agree to use our services only for lawful purposes and in compliance with all applicable regulations, including the Telephone Consumer Protection Act (TCPA)."
              },
              {
                title: "4. Privacy",
                content: "Your use of our services is also governed by our Privacy Policy, which describes how we collect, use, and protect your information."
              },
              {
                title: "5. Disclaimer of Warranties",
                content: "Our services are provided \"as is\" without warranties of any kind, express or implied."
              },
              {
                title: "6. Limitation of Liability",
                content: "OnTrak Solutions LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or SMS services."
              },
              {
                title: "7. Changes to These Terms",
                content: "We may update these Terms at any time. Continued use of our services constitutes acceptance of any changes."
              }
            ].map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-[#08708E] mb-3">{section.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
                {section.list && (
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-[#08708E] mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#08708E] rounded-2xl p-6 shadow-sm text-white"
            >
              <h2 className="text-lg font-semibold mb-3">8. Contact Us</h2>
              <p className="text-sm text-white/90 leading-relaxed mb-4">
                If you have questions about these Terms, contact us at:
              </p>
              <div className="text-sm space-y-1">
                <p className="font-semibold">OnTrak Solutions</p>
                <p className="text-white/90">Email: info@ontrakcap.com</p>
                <p className="text-white/90">Address: 1019 Ave. P, STE 305, Brooklyn, NY 11223</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}