import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Apply Online',
      description: 'Fill out our simple 5-minute application with basic business information.',
      icon: '📝'
    },
    {
      number: 2,
      title: 'Quick Review',
      description: 'Our team reviews your application and documents within 24 hours.',
      icon: '🔍'
    },
    {
      number: 3,
      title: 'Get Approved',
      description: 'Receive approval with transparent terms and no hidden fees.',
      icon: '✅'
    },
    {
      number: 4,
      title: 'Get Funded',
      description: 'Funds are deposited directly to your account within 48 hours of approval.',
      icon: '💵'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">How It Works</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get funded in just 4 simple steps. No complicated requirements, no endless paperwork.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-full h-1 bg-gradient-to-r from-blue-400 to-transparent -z-10"></div>
              )}
              
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 text-center">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}