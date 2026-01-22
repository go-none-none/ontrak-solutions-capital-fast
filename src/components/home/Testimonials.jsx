import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'Johnson\'s Bakery',
      location: 'Austin, TX',
      rating: 5,
      quote: 'We got approved and funded in 2 days. It was incredible. The team was so helpful throughout the process.',
      amount: '$50,000'
    },
    {
      name: 'Michael Chen',
      company: 'TechStart Solutions',
      location: 'San Francisco, CA',
      rating: 5,
      quote: 'Finally, a lender that understands small businesses. No ridiculous requirements, just straightforward funding.',
      amount: '$150,000'
    },
    {
      name: 'Jennifer Martinez',
      company: 'Wellness Center',
      location: 'Miami, FL',
      rating: 5,
      quote: 'The application was so simple. My kids could have done it. Great rates too!',
      amount: '$75,000'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Trusted by Thousands</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real businesses, real results. See what our customers are saying.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.company}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                  <p className="text-sm font-semibold text-[#08708E] mt-2">Funded: {testimonial.amount}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}