import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award, TrendingUp, ArrowRight, Rocket, Handshake, Briefcase, Star, RotateCw, Calendar, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";

function StatCounter({ stat, delay }) {
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
    
    // Parse the target value
    let target;
    if (stat.value.includes('M')) {
      target = parseFloat(stat.value.replace('$', '').replace('M+', ''));
    } else if (stat.value.includes('K')) {
      target = parseFloat(stat.value.replace('K+', '').replace(',', ''));
    } else if (stat.value.includes('%')) {
      target = parseFloat(stat.value.replace('%', ''));
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
    if (stat.value.includes('M')) {
      return `$${val.toFixed(0)}M+`;
    } else if (stat.value.includes('K')) {
      return `${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}+`;
    } else if (stat.value.includes('%')) {
      return `${val.toFixed(0)}%`;
    } else if (stat.value.includes('hrs')) {
      return `${val.toFixed(0)}hrs`;
    }
    return val.toFixed(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {formatValue(count)}
      </div>
      <div className="text-slate-400">{stat.label}</div>
    </motion.div>
  );
}

function TrustIndicator({ item, delay }) {
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
    if (item.value === 'A+') {
      return; // Don't animate letter grades
    } else if (item.value.includes('/')) {
      target = parseFloat(item.value.split('/')[0]);
    } else if (item.value.includes('+')) {
      target = parseFloat(item.value.replace('+', ''));
    } else if (item.value.includes('%')) {
      target = parseFloat(item.value.replace('%', ''));
    } else {
      target = parseFloat(item.value.replace(/[^0-9.]/g, ''));
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
  }, [isVisible, item.value]);

  const formatValue = (val) => {
    if (item.value === 'A+') {
      return 'A+';
    } else if (item.value.includes('/5')) {
      return `${val.toFixed(1)}/5`;
    } else if (item.value.includes('+')) {
      return `${val.toFixed(0)}+`;
    } else if (item.value.includes('%')) {
      return `${val.toFixed(0)}%`;
    }
    return val.toFixed(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="w-14 h-14 rounded-xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-3">
        <item.icon className="w-7 h-7 text-[#08708E]" />
      </div>
      <div className="text-3xl font-bold text-[#08708E] mb-2">
        {formatValue(count)}
      </div>
      <div className="text-sm text-slate-600">{item.label}</div>
    </motion.div>
  );
}

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Client-First Approach',
      description: 'Your success is our success. We build lasting relationships based on trust and transparency.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'We provide the capital you need to seize opportunities and accelerate your business growth.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our funding specialists bring decades of combined experience in business financing.'
    },
    {
      icon: Award,
      title: 'Industry Leaders',
      description: 'Recognized as a top business funding provider with consistent 5-star ratings.'
    }
  ];

  const stats = [
    { value: '$50M+', label: 'Total Funded' },
    { value: '1,000+', label: 'Businesses Served' },
    { value: '95%', label: 'Approval Rate' },
    { value: '24hrs', label: 'Average Funding Time' }
  ];



  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#08708E]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Your Business, Your Growth, Our Mission
              </h1>
              <p className="text-base text-white/70 mb-4">
                With over 10 years of experience, helping businesses grow and thrive.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Link to={createPageUrl('Application')}>
                  <Button className="bg-white text-[#08708E] hover:bg-white/90 px-6 py-3 rounded-full font-semibold">
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#22d3ee]" />
                    <span className="text-xs">A+ BBB Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#22d3ee]" />
                    <span className="text-xs">24hr Funding</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6932157da76cc7fc545d1203/9a6f0cb26_OnTrak-About.png" 
                alt="OnTrak-About"
                className="rounded-2xl shadow-2xl h-64 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 rounded-3xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#08708E] flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                To provide fast, accessible, and transparent funding solutions that empower business owners to pursue their goals without the barriers of traditional financing. We believe every business deserves the opportunity to grow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#08708E] rounded-3xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-white/80 leading-relaxed">
                To become the most trusted partner for business growth, known for our speed, simplicity, and unwavering commitment to our clients' success. We envision a world where capital is never a barrier to business innovation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA 1 */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to Get Started?
              </h3>
              <p className="text-slate-600">
                See how much funding you qualify for in just 60 seconds.
              </p>
            </div>
            <Link to={createPageUrl('Application')}>
              <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-3 rounded-full font-semibold whitespace-nowrap">
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCounter key={i} stat={stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4">
              What Drives Us
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-[#08708E]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-500 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Our Approach</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4">
              How We're Different
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Technology-Driven',
                description: 'Our advanced platform enables fast approvals and seamless funding experiences, getting you capital when you need it most.',
                icon: Rocket
              },
              {
                title: 'Relationship-Focused',
                description: 'Every client gets a dedicated funding advisor who understands your business and is committed to your long-term success.',
                icon: Handshake
              },
              {
                title: 'Industry Expertise',
                description: 'With over 10 years of experience, we understand the unique challenges businesses face and tailor solutions accordingly.',
                icon: Briefcase
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#08708E]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-[#08708E]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 2 */}
      <section className="py-16 bg-gradient-to-r from-[#08708E] to-[#065a72]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Have Questions?</h3>
              <p className="text-white/80">Our funding specialists are ready to help you find the perfect solution.</p>
            </div>
            <div className="flex gap-4">
              <Link to={createPageUrl('Contact')}>
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#08708E] px-6 py-3 rounded-full font-semibold">
                  Contact Us
                </Button>
              </Link>
              <a href="tel:+13025205200">
                <Button className="bg-white text-[#08708E] hover:bg-white/90 px-6 py-3 rounded-full font-semibold">
                  Call (302) 520-5200
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#08708E] font-semibold text-sm uppercase tracking-wider">Trust & Recognition</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4">
              Recognized Excellence
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'BBB Rating', value: 'A+', icon: Award },
              { label: 'Client Retention', value: '92%', icon: RotateCw },
              { label: 'Average Rating', value: '4.9/5', icon: Star },
              { label: 'Years Experience', value: '10+', icon: Calendar }
            ].map((item, i) => (
              <TrustIndicator key={i} item={item} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Our Commitment to You
            </h2>
            <div className="bg-white rounded-3xl p-10 shadow-xl">
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                At OnTrak, we're more than just a funding provider — we're your growth partner. 
                We understand that behind every business are real people with real dreams, and we're 
                committed to providing the financial solutions that help turn those dreams into reality.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Whether you're looking to expand operations, purchase equipment, manage cash flow, 
                or seize a new opportunity, we're here to provide fast, transparent, and flexible 
                funding solutions tailored to your unique needs.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#08708E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Partner with Us?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join thousands of successful businesses that have grown with OnTrak.
          </p>
          <Link to={createPageUrl('Application')}>
            <Button className="bg-white text-[#08708E] hover:bg-white/90 px-10 py-6 rounded-full text-lg font-semibold">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}