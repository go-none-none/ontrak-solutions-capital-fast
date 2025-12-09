import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Percent, ArrowRight } from 'lucide-react';

export default function FundingCalculator({ compact = false }) {
  const [fundingAmount, setFundingAmount] = useState(50000);
  const [termMonths, setTermMonths] = useState(12);
  const [results, setResults] = useState(null);

  // Factor rate increases with term length
  const factorRate = 1.25 + ((termMonths - 1) * 0.01);

  useEffect(() => {
    calculateFunding();
  }, [fundingAmount, termMonths]);

  const calculateFunding = () => {
    // Total Payment = Funding Amount × Factor Rate
    const totalPayment = fundingAmount * factorRate;
    
    // Daily Payment = Total Payment / (Term Length in Months × 30)
    const dailyPayment = totalPayment / (termMonths * 30);
    
    // Weekly Payment = Total Payment / (Term Length in Months × 4.33)
    const weeklyPayment = totalPayment / (termMonths * 4.33);

    setResults({
      fundingAmount,
      factorRate,
      totalPayment,
      termMonths,
      weeklyPayment,
      dailyPayment
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };



  return (
    <div className={`bg-white rounded-3xl shadow-2xl ${compact ? 'p-6' : 'p-8 lg:p-10'} h-full flex flex-col`}>
      <div className={compact ? 'mb-4' : 'mb-8'}>
        <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 mb-1`}>Funding Calculator</h3>
        <p className="text-slate-500 text-sm">See your estimated funding in seconds</p>
      </div>

      <div className={`${compact ? 'space-y-4' : 'space-y-8'} flex-1 flex flex-col`}>
        {/* Headline & CTA */}
        <div className="text-center py-4">
          <h4 className="text-xl font-bold text-slate-900 mb-2">
            Slide to Explore Funding Options
          </h4>
          <p className="text-sm text-slate-600 mb-4">
            See your real-time estimated payments — No credit pull required
          </p>
          <Link to={createPageUrl('Application')}>
            <Button className="bg-[#08708E] hover:bg-[#065a72] text-white px-6 py-2 rounded-full">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Funding Amount Slider */}
        <div>
          <div className={`flex justify-between items-center ${compact ? 'mb-2' : 'mb-4'}`}>
            <label className="text-sm font-medium text-slate-700">Desired Funding</label>
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-[#08708E]`}>{formatCurrency(fundingAmount)}</span>
          </div>
          <Slider
            value={[fundingAmount]}
            onValueChange={(val) => setFundingAmount(val[0])}
            min={10000}
            max={500000}
            step={5000}
            className="[&_[role=slider]]:bg-[#08708E] [&_[role=slider]]:border-[#08708E] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_.relative]:bg-slate-200 [&_[data-disabled]]:bg-[#08708E]"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>$10K</span>
            <span>$500K</span>
          </div>
        </div>

        {/* Term Slider */}
        <div>
          <div className={`flex justify-between items-center ${compact ? 'mb-2' : 'mb-4'}`}>
            <label className="text-sm font-medium text-slate-700">Term Length</label>
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-[#08708E]`}>{termMonths} months</span>
          </div>
          <Slider
            value={[termMonths]}
            onValueChange={(val) => setTermMonths(val[0])}
            min={1}
            max={12}
            step={1}
            className="[&_[role=slider]]:bg-[#08708E] [&_[role=slider]]:border-[#08708E] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_.relative]:bg-slate-200"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>1 mo</span>
            <span>12 mo</span>
          </div>
        </div>



        <div className="flex-1" />

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl ${compact ? 'p-4' : 'p-6'} text-white`}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                  <DollarSign className="w-4 h-4" />
                  Estimated Daily
                </div>
                <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold`}>{formatCurrency(results.dailyPayment)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                  <DollarSign className="w-4 h-4" />
                  Estimated Weekly
                </div>
                <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold`}>{formatCurrency(results.weeklyPayment)}</p>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs text-white/60 mb-1">Total Payment • {results.termMonths} month term</p>
              <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold`}>{formatCurrency(results.totalPayment)}</p>
              <p className="text-xs text-white/50 mt-1">Factor Rate: {factorRate.toFixed(2)}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}