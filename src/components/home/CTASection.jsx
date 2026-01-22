import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#08708E] to-[#065a72]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Get Funded?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of businesses that have grown with our fast, flexible funding. Apply today and get a decision within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('application')}>
            <Button size="lg" className="bg-white text-[#08708E] hover:bg-blue-50 font-semibold w-full sm:w-auto">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to={createPageUrl('Contact')}>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold w-full sm:w-auto">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}