import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import ReviewSubmissionForm from '../components/reviews/ReviewSubmissionForm';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

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
    
    let target;
    if (stat.value.includes('/')) {
      target = parseFloat(stat.value.split('/')[0]);
    } else if (stat.value.includes('+')) {
      target = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
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
    if (stat.value.includes('/5')) {
      return `${val.toFixed(1)}/5`;
    } else if (stat.value.includes('+')) {
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
      className="text-center p-6 rounded-2xl bg-slate-50"
    >
      <div className="text-3xl sm:text-4xl font-bold text-[#08708E] mb-2">
        {formatValue(count)}
      </div>
      <div className="text-slate-500">{stat.label}</div>
    </motion.div>
  );
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = React.useState(9);

  const { data: userReviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.Review.filter({ approved: true }, '-created_date')
  });

  const hardcodedTestimonials = [
    {
      name: 'Sarah Johnson',
      business: 'The Rustic Kitchen',
      industry: 'Restaurant',
      location: 'Austin, TX',
      quote: 'OnTrak helped me expand my restaurant when traditional banks said no. The process was incredibly simple and I had funds within 48 hours. Their team walked me through every step.',
      rating: 5,
      amount: '$75,000'
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
      business: 'Precision Auto Works',
      industry: 'Automotive',
      location: 'Miami, FL',
      quote: 'I needed equipment fast. OnTrak understood my urgency and delivered. Their team was responsive and the terms were transparent. No hidden fees at all.',
      rating: 5,
      amount: '$50,000'
    },
    {
      name: 'David Thompson',
      business: 'Ace Construction Group',
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
      amount: '$85,000'
    },
    {
      name: 'Robert Martinez',
      business: 'Swift Logistics LLC',
      industry: 'Transportation',
      location: 'Houston, TX',
      quote: 'Expanding our fleet was crucial for growth. OnTrak made it happen with their flexible payment terms that work with our cash flow. Professional team all the way.',
      rating: 5,
      amount: '$180,000',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Parker',
      business: 'Peak Performance Gym',
      industry: 'Fitness',
      location: 'Chicago, IL',
      quote: 'After the pandemic, I needed capital to revamp my studio. OnTrak provided funding quickly with great terms. My membership has doubled since the renovation!',
      rating: 5,
      amount: '$65,000',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    },
    {
      name: 'James Wilson',
      business: 'Riverside Family Medicine',
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
      quote: "Inventory funding for the holiday season was a game-changer. OnTrak's quick process meant I could stock up early and have my best season ever!",
      rating: 5,
      amount: '$40,000',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop'
    },
    {
      name: 'Kevin Brown',
      business: 'Premier Plumbing Pro',
      industry: 'Home Services',
      location: 'Atlanta, GA',
      quote: 'Needed to expand my team during peak season. OnTrak provided the funds quickly with no hassle. Business has been booming ever since!',
      rating: 5,
      amount: '$95,000'
    },
    {
      name: 'Rachel Kim',
      business: 'Sweet Dreams Bakery',
      industry: 'Food & Beverage',
      location: 'Seattle, WA',
      quote: 'Opening my second bakery location seemed impossible. OnTrak made it a reality with their flexible funding. The application was so easy!',
      rating: 5,
      amount: '$70,000',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
    },
    {
      name: 'Marcus Johnson',
      business: 'Bright Spark Electric',
      industry: 'Electrical Services',
      location: 'Dallas, TX',
      quote: 'The team at OnTrak understood my business needs perfectly. Got approved fast and the terms were better than I expected.',
      rating: 5,
      amount: '$110,000',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop'
    },
    {
      name: 'Nicole Davis',
      business: 'Luxe Hair Lounge',
      industry: 'Beauty',
      location: 'Las Vegas, NV',
      quote: 'Renovating my salon was a dream come true thanks to OnTrak. The process was smooth and my clients love the new space!',
      rating: 5,
      amount: '$55,000',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop'
    },
    {
      name: 'Brian White',
      business: 'Guardian Security Pro',
      industry: 'Security',
      location: 'Boston, MA',
      quote: 'OnTrak helped me purchase new equipment and hire additional staff. My business has grown 40% since getting funded!',
      rating: 5,
      amount: '$130,000'
    },
    {
      name: 'Angela Martinez',
      business: 'Green Thumb Landscapes',
      industry: 'Landscaping',
      location: 'Portland, OR',
      quote: 'Seasonal business can be tough. OnTrak understood my needs and provided funding that works with my cash flow. Highly recommend!',
      rating: 5,
      amount: '$80,000',
      image: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?w=150&h=150&fit=crop'
    },
    {
      name: 'Steven Lee',
      business: 'Precision Collision Center',
      industry: 'Automotive',
      location: 'San Diego, CA',
      quote: 'After a rough year, I needed capital to get back on track. OnTrak believed in my business when others didn\'t. Forever grateful!',
      rating: 5,
      amount: '$90,000'
    },
    {
      name: 'Patricia Garcia',
      business: 'Savory Events Catering',
      industry: 'Catering',
      location: 'Miami, FL',
      quote: 'The funding came at the perfect time to upgrade my kitchen equipment. OnTrak made the entire process stress-free!',
      rating: 5,
      amount: '$65,000',
      image: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?w=150&h=150&fit=crop'
    },
    {
      name: 'Daniel Taylor',
      business: 'Cool Breeze HVAC',
      industry: 'HVAC',
      location: 'Nashville, TN',
      quote: 'Needed to replace aging equipment. OnTrak provided fast funding with great terms. My efficiency has improved dramatically!',
      rating: 5,
      amount: '$105,000',
      image: 'https://images.unsplash.com/photo-1558203728-00f45181dd84?w=150&h=150&fit=crop'
    },
    {
      name: 'Karen Wilson',
      business: 'Smile Bright Dental',
      industry: 'Healthcare',
      location: 'Charlotte, NC',
      quote: 'Upgrading to digital equipment was expensive but necessary. OnTrak made it affordable with flexible repayment terms.',
      rating: 5,
      amount: '$140,000',
      image: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=150&h=150&fit=crop'
    },
    {
      name: 'Christopher Moore',
      business: 'Pro Finish Painting',
      industry: 'Painting',
      location: 'Indianapolis, IN',
      quote: 'OnTrak helped me buy new trucks and equipment for my crew. The approval process was incredibly fast and straightforward!',
      rating: 5,
      amount: '$75,000'
    },
    {
      name: 'Michelle Thomas',
      business: 'Pampered Paws Grooming',
      industry: 'Pet Services',
      location: 'Austin, TX',
      quote: 'Growing my pet grooming business was made possible by OnTrak. Their team was supportive and understanding throughout!',
      rating: 5,
      amount: '$45,000',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop'
    },
    {
      name: 'Jason Jackson',
      business: 'Summit Roofing Solutions',
      industry: 'Roofing',
      location: 'Tampa, FL',
      quote: 'After storm season, I needed to hire more workers fast. OnTrak delivered the funding I needed within 24 hours!',
      rating: 5,
      amount: '$125,000',
      image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop'
    },
    {
      name: 'Laura Harris',
      business: 'Bean & Brew Café',
      industry: 'Coffee Shop',
      location: 'Minneapolis, MN',
      quote: 'Opening my coffee shop was a dream. OnTrak helped make it happen with funding for equipment and initial inventory!',
      rating: 5,
      amount: '$60,000',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'
    },
    {
      name: 'Timothy Clark',
      business: 'Shield Insurance Group',
      industry: 'Insurance',
      location: 'Columbus, OH',
      quote: 'Expanding my insurance agency required capital. OnTrak provided excellent service and quick funding. Very professional!',
      rating: 5,
      amount: '$95,000'
    },
    {
      name: 'Sandra Lewis',
      business: 'Capture Moments Studio',
      industry: 'Photography',
      location: 'San Antonio, TX',
      quote: 'Investing in new camera equipment was crucial. OnTrak understood my creative business and funded me quickly!',
      rating: 5,
      amount: '$35,000',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=150&h=150&fit=crop'
    },
    {
      name: 'Gary Robinson',
      business: 'Mastercraft Woodworks',
      industry: 'Carpentry',
      location: 'Philadelphia, PA',
      quote: 'OnTrak helped me purchase the tools I needed to take on bigger projects. My business revenue has doubled!',
      rating: 5,
      amount: '$70,000',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop'
    },
    {
      name: 'Betty Walker',
      business: 'Sparkle Clean Pro',
      industry: 'Cleaning',
      location: 'San Jose, CA',
      quote: 'Growing my cleaning business required hiring more staff. OnTrak made it easy with their flexible funding options!',
      rating: 5,
      amount: '$50,000',
      image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop'
    },
    {
      name: 'Ronald Young',
      business: 'Fast Fix Appliances',
      industry: 'Appliance Repair',
      location: 'Jacksonville, FL',
      quote: 'I needed a van and tools to expand my service area. OnTrak provided the capital quickly with no hassle!',
      rating: 5,
      amount: '$55,000'
    },
    {
      name: 'Donna Hall',
      business: 'Elegant Affairs Events',
      industry: 'Event Planning',
      location: 'Fort Worth, TX',
      quote: 'OnTrak helped me invest in equipment and marketing. My event planning business is now fully booked months in advance!',
      rating: 5,
      amount: '$65,000',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
    },
    {
      name: 'Frank Allen',
      business: 'Crystal Clear Pools',
      industry: 'Pool Service',
      location: 'Phoenix, AZ',
      quote: 'Seasonal business needs flexible funding. OnTrak understood this and gave me terms that work perfectly with my cash flow!',
      rating: 5,
      amount: '$80,000',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop'
    },
    {
      name: 'Carol King',
      business: 'Petal & Bloom Florist',
      industry: 'Florist',
      location: 'Charlotte, NC',
      quote: 'Opening a second location seemed risky, but OnTrak made it possible. The funding process was seamless and fast!',
      rating: 5,
      amount: '$45,000',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=150&h=150&fit=crop'
    },
    {
      name: 'Edward Wright',
      business: 'Bug Shield Pest Solutions',
      industry: 'Pest Control',
      location: 'Memphis, TN',
      quote: 'Expanding my pest control routes required new equipment and vehicles. OnTrak delivered exactly what I needed!',
      rating: 5,
      amount: '$85,000'
    },
    {
      name: 'Nancy Lopez',
      business: 'Sparkle & Shine Jewelers',
      industry: 'Jewelry',
      location: 'San Francisco, CA',
      quote: 'Inventory for my jewelry store is expensive. OnTrak provided the working capital I needed to stock up for the holidays!',
      rating: 5,
      amount: '$75,000',
      image: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?w=150&h=150&fit=crop'
    },
    {
      name: 'Kenneth Hill',
      business: 'SecureKey Locksmith',
      industry: 'Locksmith',
      location: 'Detroit, MI',
      quote: 'OnTrak helped me modernize my locksmith business with new technology. The approval was fast and terms were fair!',
      rating: 5,
      amount: '$40,000',
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop'
    },
    {
      name: 'Barbara Scott',
      business: 'Zen Flow Yoga',
      industry: 'Fitness',
      location: 'Denver, CO',
      quote: 'My yoga studio needed renovations to attract more clients. OnTrak made it happen with their quick funding process!',
      rating: 5,
      amount: '$55,000',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop'
    },
    {
      name: 'Paul Green',
      business: 'TechFix Solutions',
      industry: 'Technology',
      location: 'Baltimore, MD',
      quote: 'Upgrading my computer repair shop was crucial for staying competitive. OnTrak provided the capital I needed quickly!',
      rating: 5,
      amount: '$50,000'
    },
    {
      name: 'Helen Adams',
      business: 'Serenity Massage Studio',
      industry: 'Wellness',
      location: 'Portland, OR',
      quote: 'OnTrak believed in my massage therapy business from day one. Their funding helped me create a peaceful sanctuary for clients!',
      rating: 5,
      amount: '$45,000',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop'
    },
    {
      name: 'Mark Baker',
      business: 'Precision Print Works',
      industry: 'Printing',
      location: 'Milwaukee, WI',
      quote: 'Investing in new printing equipment was expensive but necessary. OnTrak made it affordable with great repayment terms!',
      rating: 5,
      amount: '$95,000'
    },
    {
      name: 'Sharon Nelson',
      business: 'Little Stars Learning Center',
      industry: 'Childcare',
      location: 'Las Vegas, NV',
      quote: 'Expanding my daycare to accommodate more children was made possible by OnTrak. They truly care about small businesses!',
      rating: 5,
      amount: '$70,000',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop'
    },
    {
      name: 'Joshua Carter',
      business: 'Swift Move Logistics',
      industry: 'Moving',
      location: 'Oklahoma City, OK',
      quote: 'I needed more trucks to handle growing demand. OnTrak came through with fast funding and transparent terms!',
      rating: 5,
      amount: '$120,000'
    },
    {
      name: 'Deborah Mitchell',
      business: 'Premier Tax Advisors',
      industry: 'Accounting',
      location: 'Raleigh, NC',
      quote: 'OnTrak helped me open a second office location during tax season. Their team was professional and responsive throughout!',
      rating: 5,
      amount: '$65,000',
      image: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=150&h=150&fit=crop'
    },
    {
      name: 'Jeffrey Perez',
      business: 'Desert Bloom Landscapes',
      industry: 'Landscaping',
      location: 'Tucson, AZ',
      quote: 'My landscaping business needed new equipment for larger projects. OnTrak delivered the funding quickly with no hassle!',
      rating: 5,
      amount: '$90,000',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop'
    },
    {
      name: 'Dorothy Roberts',
      business: 'Perfect Fit Tailoring',
      industry: 'Tailoring',
      location: 'New Orleans, LA',
      quote: 'OnTrak helped me purchase industrial sewing machines. My alterations business has grown tremendously since then!',
      rating: 5,
      amount: '$35,000',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    }
  ];

  const userReviewsFormatted = userReviews.map(review => ({
    name: review.name,
    business: review.business,
    industry: '',
    location: review.location,
    quote: review.review,
    rating: review.rating,
    amount: review.funding_amount || '',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
  }));

  const testimonials = [...userReviewsFormatted, ...hardcodedTestimonials];

  const stats = [
    { value: '4.9/5', label: 'Average Rating' },
    { value: '1,000+', label: 'Happy Customers' },
    { value: '98%', label: 'Would Recommend' },
    { value: '24hrs', label: 'Avg. Response Time' }
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
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                What Our Clients Are Saying
              </h1>
              <p className="text-base text-white/70 mb-4">
                See what business owners across the country say about their experience with OnTrak.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Link to={createPageUrl('application')}>
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
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6932157da76cc7fc545d1203/b54d8d041_OnTrak-Reviews.png" 
                alt="Client Reviews"
                className="rounded-2xl shadow-2xl h-64 w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
            </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCounter key={i} stat={stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, visibleCount).map((testimonial, i) => (
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

          {visibleCount < testimonials.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mt-12"
            >
              <Button
                onClick={() => setVisibleCount(prev => Math.min(prev + 9, testimonials.length))}
                className="bg-[#08708E] hover:bg-[#065a72] text-white px-8 py-6 rounded-full text-lg font-semibold"
              >
                Load More Reviews
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Submit Review */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Share Your Experience
            </h2>
            <p className="text-slate-600 text-lg">
              We'd love to hear about your funding experience with OnTrak
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ReviewSubmissionForm />
          </motion.div>
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
            <Link to={createPageUrl('application')}>
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