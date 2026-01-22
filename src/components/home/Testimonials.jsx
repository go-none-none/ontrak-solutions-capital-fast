import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'The Rustic Kitchen',
      industry: 'Restaurant',
      quote: 'OnTrak helped me expand my restaurant when traditional banks said no. The process was incredibly simple and I had funds within 48 hours.',
      rating: 5,
      amount: '$75,000',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      business: 'TechFlow Solutions',
      industry: 'Technology',
      quote: 'The funding calculator gave me an instant estimate, and the actual offer was even better. Best decision I made for my business growth.',
      rating: 5,
      amount: '$150,000',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    {
      name: 'Amanda Rodriguez',
      business: 'Elite Auto Repair',
      industry: 'Automotive',
      quote: 'I needed equipment fast. OnTrak understood my urgency and delivered. Their team was responsive and the terms were transparent.',
      rating: 5,
      amount: '$50,000',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop'
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 mb-6">
            Trusted by Business Owners
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            See what our clients have to say about their experience with OnTrak.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <Quote className="w-10 h-10 text-[#08708E]/20 mb-4" />
              
              <p className="text-slate-600 mb-6 leading-relaxed">
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
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.business}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#08708E] font-bold">{testimonial.amount}</div>
                  <div className="text-xs text-slate-400">Funded</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl('Reviews')}>
            <Button variant="outline" className="border-[#08708E] text-[#08708E] hover:bg-[#08708E] hover:text-white rounded-full px-8 py-5">
              Read More Reviews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}