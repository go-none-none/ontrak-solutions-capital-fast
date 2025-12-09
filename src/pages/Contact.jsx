import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function Contact() {

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '(302) 520-5200',
      link: 'tel:+13025205200',
      description: 'Mon-Fri 9am to 6pm EST'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@ontrak.co',
      link: 'mailto:info@ontrak.co',
      description: 'We respond within 24 hours'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Monday - Friday',
      description: '9:00 AM - 6:00 PM EST'
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-[#22d3ee] font-semibold text-sm uppercase tracking-wider">Contact Us</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
                Let's Talk About<br />Your Funding Needs
              </h1>
              <p className="text-xl text-white/70 mb-8">
                Our team of funding specialists is ready to help you find the perfect solution for your business.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop" 
                alt="Contact Us"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#08708E] flex items-center justify-center mb-4 mx-auto">
                  <info.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                {info.link ? (
                  <a href={info.link} className="text-[#08708E] font-medium mb-1 hover:underline block">
                    {info.value}
                  </a>
                ) : (
                  <p className="text-[#08708E] font-medium mb-1">{info.value}</p>
                )}
                <p className="text-sm text-slate-500">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4 mb-6">
                Send Us a Message
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Have questions about our funding options? Want to discuss your specific business needs? 
                Fill out the form and one of our specialists will get back to you within 24 hours.
              </p>

              <div className="bg-[#08708E] rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Why Choose OnTrak?</h3>
                <ul className="space-y-4">
                  {[
                    'Fast funding in as little as 24 hours',
                    '95% approval rate across all industries',
                    'Transparent terms with no hidden fees',
                    'Dedicated funding advisor for your account'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form 
                action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00Dam00001TLTFV" 
                method="POST"
                className="bg-white rounded-3xl shadow-xl p-10 space-y-6"
              >
                <input type="hidden" name="oid" value="00Dam00001TLTFV" />
                <input type="hidden" name="retURL" value="http://ontrak.co" />

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      maxLength="40"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      maxLength="80"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    maxLength="40"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      maxLength="80"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">Mobile</label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      maxLength="40"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08708E] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-[#08708E] focus:ring-[#08708E]"
                    />
                    <span className="text-xs text-slate-600">
                      I consent to receive texts and agree to the <Link to={createPageUrl('TermsOfService')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Terms & Conditions</Link> and <Link to={createPageUrl('PrivacyPolicy')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Privacy Policy</Link>.
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    By submitting your phone number, you agree to receive recurring SMS messages from OnTrak Solutions LLC regarding your account and service updates. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out or HELP for help. Your information will not be sold or shared. View our <Link to={createPageUrl('PrivacyPolicy')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Privacy Policy</Link> and <Link to={createPageUrl('TermsOfService')} target="_blank" rel="noopener noreferrer" className="text-[#08708E] hover:underline">Terms of Service</Link>. Consent is not a condition of service.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-[#08708E] hover:bg-[#065a72] text-white rounded-xl text-lg font-semibold transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}