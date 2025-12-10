import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileCheck, Phone, Mail, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const steps = [
    {
      icon: FileCheck,
      title: 'Application Review',
      time: 'Within 1 hour',
      description: 'Our team will review your application and verify the information provided.'
    },
    {
      icon: Phone,
      title: 'Personal Contact',
      time: '1-2 hours',
      description: 'A dedicated funding specialist will reach out to discuss your options and answer any questions.'
    },
    {
      icon: TrendingUp,
      title: 'Funding Decision',
      time: '2-24 hours',
      description: 'We\'ll present you with tailored funding options that match your business needs.'
    },
    {
      icon: CheckCircle,
      title: 'Get Funded',
      time: '24-48 hours',
      description: 'Once approved, funds can be deposited directly into your business account.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Success Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 opacity-5" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Application Received!
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Thank you for applying with OnTrak Solutions. We're excited to help grow your business.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full border border-green-200">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">You'll hear from us within 1-2 hours</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Happens Next?</h2>
            <p className="text-lg text-slate-600">
              Here's our proven process to get you funded quickly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-[#08708E] rounded-xl flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                      <span className="text-sm font-semibold text-[#08708E] bg-[#08708E]/10 px-3 py-1 rounded-full">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Important Information</h3>
            <div className="space-y-4 text-slate-700">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>Check your email and phone:</strong> We'll reach out via both channels, so please keep an eye out for our messages.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>Have your documents ready:</strong> Recent bank statements and business documents will help speed up the process.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>Questions? We're here:</strong> Feel free to call us at <a href="tel:+13025205200" className="text-[#08708E] font-semibold hover:underline">(302) 520-5200</a> anytime during business hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Have Questions?</h3>
          <p className="text-lg text-slate-600 mb-8">
            Our team is standing by to help you through the process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+13025205200">
              <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-6 text-lg rounded-xl">
                <Phone className="w-5 h-5 mr-2" />
                Call (302) 520-5200
              </Button>
            </a>
            <Link to={createPageUrl('Contact')}>
              <Button variant="outline" className="border-[#08708E] text-[#08708E] hover:bg-[#08708E]/5 px-8 py-6 text-lg rounded-xl">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Monday - Friday: 9:00 AM - 6:00 PM EST
          </p>
        </div>
      </section>
    </div>
  );
}