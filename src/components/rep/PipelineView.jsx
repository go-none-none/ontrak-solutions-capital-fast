import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target } from 'lucide-react';

export default function PipelineView({ opportunities, onStageClick }) {
  const stages = [
    { name: 'Application In', color: 'from-blue-500 to-blue-600' },
    { name: 'Underwriting', color: 'from-purple-500 to-purple-600' },
    { name: 'Approved', color: 'from-green-500 to-green-600' },
    { name: 'Contracts Out', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Contracts In', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Closed - Funded', color: 'from-emerald-500 to-emerald-600' }
  ];

  const getPipelineData = () => {
    return stages.map(stage => {
      const stageOpps = opportunities.filter(o => o.StageName === stage.name);
      const totalAmount = stageOpps.reduce((sum, o) => sum + (o.Amount || 0), 0);
      return {
        ...stage,
        count: stageOpps.length,
        amount: totalAmount
      };
    });
  };

  const pipelineData = getPipelineData();
  const totalPipeline = pipelineData.reduce((sum, stage) => sum + stage.amount, 0);
  const totalDeals = pipelineData.reduce((sum, stage) => sum + stage.count, 0);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">My Pipeline</h2>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">{totalDeals} Deals</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#08708E]" />
            <span className="font-semibold text-slate-900">{formatCurrency(totalPipeline)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pipelineData.map((stage, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative group"
          >
            <button
              onClick={() => onStageClick && onStageClick(stage.name)}
              className={`w-full bg-gradient-to-br ${stage.color} rounded-xl p-4 text-white shadow-sm hover:shadow-lg hover:scale-105 transition-all text-left`}
            >
              <div className="text-2xl font-bold mb-1">{stage.count}</div>
              <div className="text-xs opacity-90 mb-2">{stage.name}</div>
              <div className="text-sm font-semibold">{formatCurrency(stage.amount)}</div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}