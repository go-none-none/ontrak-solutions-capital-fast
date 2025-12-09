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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm prose-slate max-w-none prose-headings:text-[#08708E] prose-headings:font-semibold prose-a:text-[#08708E] prose-a:no-underline hover:prose-a:underline"
          >
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing our website, submitting a form, or communicating with OnTrak Solutions LLC, you agree to these Terms of Service.
            </p>

            <h2>2. SMS Messaging Consent</h2>
            <p>
              By providing your phone number, you consent to receive automated and/or non-automated text messages from OnTrak Solutions for purposes including updates, service information, and promotional content.
            </p>
            <ul>
              <li>Message frequency varies.</li>
              <li>Message and data rates may apply.</li>
              <li>You can reply <strong>STOP</strong> to unsubscribe or <strong>HELP</strong> for assistance.</li>
            </ul>

            <h2>3. Use of Services</h2>
            <p>
              You agree to use our services only for lawful purposes and in compliance with all applicable regulations, including the Telephone Consumer Protection Act (TCPA).
            </p>

            <h2>4. Privacy</h2>
            <p>
              Your use of our services is also governed by our Privacy Policy, which describes how we collect, use, and protect your information.
            </p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>
              Our services are provided "as is" without warranties of any kind, express or implied.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              OnTrak Solutions LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or SMS services.
            </p>

            <h2>7. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of our services constitutes acceptance of any changes.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions about these Terms, contact us at:
            </p>
            <p>
              <strong>OnTrak Solutions</strong><br />
              Email: info@ontrakcap.com<br />
              Address: 1019 Ave. P, STE 305, Brooklyn, NY 11223
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}