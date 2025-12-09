import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/70">
              Effective Date: December 1, 2025
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
                title: "1. Introduction",
                content: "Welcome to OnTrak Solutions LLC. These Terms and Conditions (\"Terms\") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access our website or use our services.\n\nOnTrak Solutions LLC (\"we,\" \"us,\" or \"our\") reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms."
              },
              {
                title: "2. Definitions",
                list: [
                  "\"Company\" refers to OnTrak Solutions LLC",
                  "\"User,\" \"you,\" or \"your\" refers to the individual or entity using our services",
                  "\"Services\" refers to all products, services, and solutions offered by OnTrak Solutions LLC",
                  "\"Website\" refers to our online platform and all associated web pages",
                  "\"Application\" refers to any funding application or request submitted through our platform"
                ]
              },
              {
                title: "3. Use of Services - Eligibility",
                content: "To use our services, you must:",
                list: [
                  "Be at least 18 years old",
                  "Have the legal authority to enter into binding agreements",
                  "Operate a legitimate business entity",
                  "Provide accurate and complete information",
                  "Comply with all applicable laws and regulations"
                ]
              },
              {
                title: "4. Prohibited Uses",
                content: "You may not use our services to:",
                list: [
                  "Engage in any illegal or fraudulent activities",
                  "Submit false or misleading information",
                  "Violate any applicable laws or regulations",
                  "Interfere with the proper functioning of our website",
                  "Attempt to gain unauthorized access to our systems",
                  "Use our services for any purpose other than obtaining business funding"
                ]
              },
              {
                title: "5. Application Process",
                content: "When you submit a funding application, you represent and warrant that all information provided is true, accurate, and complete. You authorize us to verify the information provided and to obtain additional information as necessary to process your application.\n\nSubmission of an application does not guarantee approval for funding. We reserve the right to approve or deny any application at our sole discretion. We do not charge application fees. However, approved funding may be subject to origination fees, processing fees, or other charges as disclosed in your funding agreement."
              },
              {
                title: "6. Funding Terms",
                content: "If your application is approved, you will receive a separate funding agreement that outlines the specific terms of your funding, including repayment terms, fees, and other conditions. The funding agreement will supersede these general Terms with respect to the specific funding transaction.\n\nYou agree to repay all funded amounts according to the terms specified in your funding agreement. Failure to make payments as agreed may result in additional fees, collection activities, and potential legal action."
              },
              {
                title: "7. SMS Messaging Consent",
                content: "By providing your phone number, you consent to receive automated and/or non-automated text messages from OnTrak Solutions for purposes including updates, service information, and promotional content.",
                list: [
                  "Message frequency varies",
                  "Message and data rates may apply",
                  "You can reply STOP to unsubscribe or HELP for assistance"
                ]
              },
              {
                title: "8. Privacy and Data Protection",
                content: "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy."
              },
              {
                title: "9. Intellectual Property",
                content: "The content, features, and functionality of our website are owned by OnTrak Solutions LLC and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of our content without our express written permission."
              },
              {
                title: "10. Disclaimers",
                content: "Our services are limited to providing business funding. We do not provide financial, legal, or tax advice. You should consult with qualified professionals regarding your specific financial situation.\n\nWe strive to maintain our website's availability but do not guarantee uninterrupted access. We may temporarily suspend access for maintenance, updates, or other operational reasons."
              },
              {
                title: "11. Limitation of Liability",
                content: "To the maximum extent permitted by law, OnTrak Solutions LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount of fees paid by you to us in the twelve months preceding the claim."
              },
              {
                title: "12. Indemnification",
                content: "You agree to indemnify and hold harmless OnTrak Solutions LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services, violation of these Terms, or infringement of any third-party rights."
              },
              {
                title: "13. Governing Law and Jurisdiction",
                content: "These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New York."
              },
              {
                title: "14. Severability",
                content: "If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions shall continue in full force and effect. The unenforceable provision shall be replaced with an enforceable provision that most closely reflects the original intent."
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
              transition={{ delay: 0.7 }}
              className="bg-[#08708E] rounded-2xl p-6 shadow-sm text-white"
            >
              <h2 className="text-lg font-semibold mb-3">15. Contact Information</h2>
              <p className="text-sm text-white/90 leading-relaxed mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="text-sm space-y-1">
                <p className="font-semibold">OnTrak Solutions LLC</p>
                <p className="text-white/90">Phone: (302) 520-5200</p>
                <p className="text-white/90">Email: info@ontrak.co</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#08708E] mb-3">Acknowledgment</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}