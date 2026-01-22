import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Fast Funding for Your Business
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Get the capital you need in days, not months. Simple application, quick approval, real funding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('application')}>
                <Button size="lg" className="bg-white text-[#08708E] hover:bg-blue-50 font-semibold">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('HowItWorks')}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-2xl opacity-20"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Fast Approval</p>
                    <p className="text-sm text-blue-100">Within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Up to $500K</p>
                    <p className="text-sm text-blue-100">Flexible amounts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Simple Process</p>
                    <p className="text-sm text-blue-100">5-minute application</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}