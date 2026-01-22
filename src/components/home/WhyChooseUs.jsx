import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, DollarSign, Shield, Users, TrendingUp } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get approved and funded in 24-48 hours, not weeks or months.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'No hidden fees, no surprises. Know exactly what you\'re paying.'
    },
    {
      icon: Clock,
      title: 'Simple Process',
      description: '5-minute online application with minimal documentation required.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-level security protects your data and financial information.'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Dedicated team available to answer questions and guide you through.'
    },
    {
      icon: TrendingUp,
      title: 'Up to $500K',
      description: 'Flexible funding amounts to match your business needs.'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Why Choose Us</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We've simplified small business funding so you can focus on growing your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#08708E]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}