import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react';

export default function FundingCalculator({ compact = false }) {
  const [fundingAmount, setFundingAmount] = useState(50000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [timeInBusiness, setTimeInBusiness] = useState('1_to_2_years');
  const [results, setResults] = useState(null);

  useEffect(() => {
    calculateFunding();
  }, [fundingAmount, monthlyRevenue, timeInBusiness]);

  const calculateFunding = () => {
    // Factor rate based on time in business
    const factorRates = {
      'less_than_6_months': 1.35,
      '6_to_12_months': 1.28,
      '1_to_2_years': 1.22,
      '2_to_5_years': 1.18,
      '5_plus_years': 1.15
    };

    const factorRate = factorRates[timeInBusiness];
    
    // Calculate max funding (typically 100-150% of monthly revenue)
    const revenueMultiplier = timeInBusiness === '5_plus_years' ? 1.5 : 
                              timeInBusiness === '2_to_5_years' ? 1.3 : 1.1;
    const maxFunding = Math.min(monthlyRevenue * revenueMultiplier, 500000);
    
    // Adjusted funding amount
    const adjustedFunding = Math.min(fundingAmount, maxFunding);
    
    // Fixed 12 month term
    const termMonths = 12;
    
    // Total repayment based on factor rate
    const totalRepayment = adjustedFunding * factorRate;
    
    // Weekly payment
    const weeklyPayment = totalRepayment / (termMonths * 4.33);
    
    // Daily payment option
    const dailyPayment = totalRepayment / (termMonths * 22); // 22 business days per month

    setResults({
      approvedAmount: adjustedFunding,
      factorRate,
      totalRepayment,
      termMonths,
      weeklyPayment,
      dailyPayment,
      maxFunding
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

  const timeOptions = [
    { value: 'less_than_6_months', label: 'Less than 6 months' },
    { value: '6_to_12_months', label: '6-12 months' },
    { value: '1_to_2_years', label: '1-2 years' },
    { value: '2_to_5_years', label: '2-5 years' },
    { value: '5_plus_years', label: '5+ years' }
  ];

  return (
    <div className={`bg-white rounded-3xl shadow-2xl ${compact ? 'p-6' : 'p-8 lg:p-10'} h-full flex flex-col`}>
      <div className={compact ? 'mb-4' : 'mb-8'}>
        <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 mb-1`}>Funding Calculator</h3>
        <p className="text-slate-500 text-sm">See your estimated funding in seconds</p>
      </div>

      <div className={`${compact ? 'space-y-4' : 'space-y-8'} flex-1 flex flex-col`}>
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

        {/* Monthly Revenue Slider */}
        <div>
          <div className={`flex justify-between items-center ${compact ? 'mb-2' : 'mb-4'}`}>
            <label className="text-sm font-medium text-slate-700">Monthly Revenue</label>
            <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-[#08708E]`}>{formatCurrency(monthlyRevenue)}</span>
          </div>
          <Slider
            value={[monthlyRevenue]}
            onValueChange={(val) => setMonthlyRevenue(val[0])}
            min={10000}
            max={500000}
            step={5000}
            className="[&_[role=slider]]:bg-[#08708E] [&_[role=slider]]:border-[#08708E] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_.relative]:bg-slate-200"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>$10K</span>
            <span>$500K</span>
          </div>
        </div>

        {/* Time in Business */}
        <div>
          <label className={`text-sm font-medium text-slate-700 ${compact ? 'mb-2' : 'mb-3'} block`}>Time in Business</label>
          <Select value={timeInBusiness} onValueChange={setTimeInBusiness}>
            <SelectTrigger className="w-full h-12 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-2xl ${compact ? 'p-4' : 'p-6'} text-white`}
          >
            <div className={`text-center ${compact ? 'mb-3' : 'mb-6'}`}>
              <p className="text-xs text-white/70 mb-1">Estimated Funding Amount</p>
              <p className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold`}>{formatCurrency(results.approvedAmount)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                  <DollarSign className="w-3 h-3" />
                  Weekly
                </div>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold`}>{formatCurrency(results.weeklyPayment)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                  <Calendar className="w-3 h-3" />
                  Term
                </div>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold`}>{results.termMonths} months</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                  <Percent className="w-3 h-3" />
                  Factor
                </div>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold`}>{results.factorRate.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Total
                </div>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-semibold`}>{formatCurrency(results.totalRepayment)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}