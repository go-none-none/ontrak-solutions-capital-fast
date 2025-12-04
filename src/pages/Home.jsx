import React from 'react';
import HeroSection from '../components/home/HeroSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}