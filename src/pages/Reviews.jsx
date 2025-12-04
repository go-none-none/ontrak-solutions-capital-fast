import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function Reviews() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'The Rustic Kitchen',
      industry: 'Restaurant',
      location: 'Austin, TX',
      quote: 'OnTrak helped me expand my restaurant when traditional banks said no. The process was incredibly simple and I had funds within 48 hours. Their team walked me through every step.',
      rating: 5,
      amount: '$75,000',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      business: 'TechFlow Solutions',
      industry: 'Technology',
      location: 'San Francisco, CA',
      quote: 'The funding calculator gave me an instant estimate, and the actual offer was even better. Best decision I made for my business growth. Highly recommend!',
      rating: 5,
      amount: '$150,000',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    {
      name: 'Amanda Rodriguez',
      business: 'Elite Auto Repair',
      industry: 'Automotive',
      location: 'Miami, FL',
      quote: 'I needed equipment fast. OnTrak understood my urgency and delivered. Their team was responsive and the terms were transparent. No hidden fees at all.',
      rating: 5,
      amount: '$50,000',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop'
    },
    {
      name: 'David Thompson',
      business: 'Thompson Construction',
      industry: 'Construction',
      location: 'Denver, CO',
      quote: 'We needed funding to take on a large project. OnTrak came through with competitive terms and fast funding. We completed the project and grew our business significantly.',
      rating: 5,
      amount: '$250,000',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    },
    {
      name: 'Jennifer Williams',
      business: 'Glow Beauty Spa',
      industry: 'Beauty & Wellness',
      location: 'Los Angeles, CA',
      quote: 'Opening my second location seemed impossible until I found OnTrak. They believed in my vision and provided the capital I needed. Now both locations are thriving!',
      rating: 5,
      amount: '$85,000',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop'
    },
    {
      name: 'Robert Martinez',
      business: 'Martinez Trucking',
      industry: 'Transportation',
      location: 'Houston, TX',
      quote: 'Expanding our fleet was crucial for growth. OnTrak made it happen with their flexible payment terms that work with our cash flow. Professional team all the way.',
      rating: 5,
      amount: '$180,000',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Parker',
      business: 'Parker Fitness Studio',
      industry: 'Fitness',
      location: 'Chicago, IL',
      quote: 'After the pandemic, I needed capital to revamp my studio. OnTrak provided funding quickly with great terms. My membership has doubled since the renovation!',
      rating: 5,
      amount: '$65,000',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    {
      name: 'James Wilson',
      business: 'Wilson Medical Practice',
      industry: 'Healthcare',
      location: 'Phoenix, AZ',
      quote: 'Upgrading our medical equipment was essential for patient care. OnTrak understood healthcare and provided a funding solution that worked perfectly for our practice.',
      rating: 5,
      amount: '$120,000',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop'
    },
    {
      name: 'Lisa Anderson',
      business: 'Urban Boutique',
      industry: 'Retail',
      location: 'New York, NY',
      quote: 'Inventory funding for the holiday season was a game-changer. OnTrak's quick process meant I could stock up early and have my best season ever!',
      rating: 5,
      amount: '$40,000',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop'
    }
  ];

  const stats = [
    { value: '4.9/5', label: 'Average Rating' },
    { value: '10,000+', label: 'Happy Customers' },
    { value: '98%', label: 'Would Recommend' },
    { value: '24hrs', label: 'Avg. Response Time' }
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
            <span className="text-[#22d3ee] font-semibold text-sm uppercase tracking-wider">Reviews</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6">
              What Our Clients<br />Say About Us
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Don't just take our word for it. See what business owners across the country have to say about their experience with OnTrak.
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

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-slate-50"
              >
                <div className="text-3xl sm:text-4xl font-bold text-[#08708E] mb-2">{stat.value}</div>
                <div className="text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-[#08708E]/20 mb-4" />
                
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                      <div className="text-xs text-slate-500">{testimonial.business}</div>
                      <div className="text-xs text-slate-400">{testimonial.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#08708E] font-bold text-sm">{testimonial.amount}</div>
                    <div className="text-xs text-slate-400">{testimonial.industry}</div>
                  </div>
                </div>
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
              Join Thousands of Happy Business Owners
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Get the funding you need and experience the OnTrak difference for yourself.
            </p>
            <Link to={createPageUrl('Application')}>
              <Button className="bg-white text-[#08708E] hover:bg-white/90 px-10 py-6 rounded-full text-lg font-semibold">
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