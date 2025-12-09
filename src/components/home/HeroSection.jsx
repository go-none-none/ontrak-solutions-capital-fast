import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Shield } from 'lucide-react';
import FundingCalculator from '../calculator/FundingCalculator';
import SalesforceWebToLeadForm from '../forms/SalesforceWebToLeadForm';

function HeroStatCounter({ stat, delay }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;
    
    let target;
    if (stat.value.includes('M+')) {
      target = parseFloat(stat.value.replace('$', '').replace('M+', ''));
    } else if (stat.value.includes('K+')) {
      target = parseFloat(stat.value.replace('K+', ''));
    } else if (stat.value.includes('hrs')) {
      target = parseFloat(stat.value.replace('hrs', ''));
    } else {
      target = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
    }

    let current = 0;
    const step = target / steps;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(current);
    }, increment);

    return () => clearInterval(timer);
  }, [isVisible, stat.value]);

  const formatValue = (val) => {
    if (stat.value.includes('M+')) {
      return `$${val.toFixed(0)}M+`;
    } else if (stat.value.includes('K+')) {
      return `${val.toFixed(0)}K+`;
    } else if (stat.value.includes('hrs')) {
      return `${val.toFixed(0)}hrs`;
    }
    return val.toFixed(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-3xl sm:text-5xl font-bold text-white" style={{ textShadow: '1px 1px 8px rgba(0,0,0,0.9)' }}>
        {formatValue(count)}
      </div>
      <div className="text-sm text-white/50" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>{stat.label}</div>
    </motion.div>
  );
}

export default function HeroSection() {
  const benefits = [
    { icon: Zap, text: 'Funding in 24 Hours' },
    { icon: Shield, text: '95% Approval Rate' },
    { icon: Clock, text: 'Simple Application' }
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://ontrakcap.com/wp-content/uploads/2025/10/2397246-hd_1920_1080_24fps-1.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay to ensure text visibility */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="space-y-12">
          {/* Top Content - Headlines */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 1,000+ Businesses
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ textShadow: '2px 2px 12px rgba(0,0,0,0.9)' }}>
              Capital Your Business
              <span className="relative">
                <span className="relative z-10"> Deserves</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C60 3 140 3 198 10" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed max-w-3xl mx-auto" style={{ textShadow: '1px 1px 8px rgba(0,0,0,0.9)' }}>
              Fast, flexible funding solutions with no hidden fees. 
              Apply in minutes, get approved the same day, and receive 
              funds in as little as 24 hours.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.8)' }}>{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12">
              {[
                { value: '$50M+', label: 'Funded' },
                { value: '1K+', label: 'Businesses' },
                { value: '24hrs', label: 'Avg. Funding' }
              ].map((stat, i) => (
                <HeroStatCounter key={i} stat={stat} delay={0.6 + i * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Right - Calculator & Form Side by Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <FundingCalculator compact />
            <SalesforceWebToLeadForm />
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}