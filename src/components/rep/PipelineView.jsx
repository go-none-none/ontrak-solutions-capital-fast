import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target } from 'lucide-react';

export default function PipelineView({ leads, opportunities, activeTab, onStageClick }) {
  const leadStages = [
    { name: 'Open - Not Contacted', label: 'New', color: 'from-blue-500 to-blue-600' },
    { name: 'Working - Contacted', label: 'Contacted', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Working - Application Out', label: 'App Out', color: 'from-purple-500 to-purple-600' },
    { name: 'Application Missing Info', label: 'Missing Info', color: 'from-orange-500 to-orange-600' },
    { name: 'Closed - Not Converted', label: 'Not Converted', color: 'from-red-500 to-red-600' }
  ];

  const opportunityStages = [
    { name: 'Application In', label: 'App In', color: 'from-blue-500 to-blue-600' },
    { name: 'Underwriting', label: 'Underwriting', color: 'from-purple-500 to-purple-600' },
    { name: 'Approved', label: 'Approved', color: 'from-green-500 to-green-600' },
    { name: 'Contracts Out', label: 'Contracts Out', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Contracts In', label: 'Contracts In', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Closed - Funded', label: 'Funded', color: 'from-emerald-500 to-emerald-600' },
    { name: 'Declined', label: 'Declined', color: 'from-red-500 to-red-600' }
  ];

  const stages = activeTab === 'leads' ? leadStages : opportunityStages;

  const getPipelineData = () => {
  if (activeTab === 'leads') {
    return stages.map(stage => {
      const stageLeads = leads.filter(l => l.Status === stage.name);
      return {
        ...stage,
        count: stageLeads.length,
        amount: 0
      };
    });
  } else {
    return stages.map(stage => {
      let stageOpps;
      if (stage.name === 'Declined') {
        stageOpps = opportunities.filter(o => o.StageName && o.StageName.includes('Declined'));
      } else {
        stageOpps = opportunities.filter(o => o.StageName === stage.name);
      }
      const totalAmount = stageOpps.reduce((sum, o) => sum + (o.Amount || 0), 0);
      return {
        ...stage,
        count: stageOpps.length,
        amount: totalAmount
      };
    });
  }
  };

  const pipelineData = getPipelineData();
  const totalPipeline = activeTab === 'opportunities' ? pipelineData.reduce((sum, stage) => sum + stage.amount, 0) : 0;
  const totalDeals = pipelineData.reduce((sum, stage) => sum + stage.count, 0);

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg p-4 border-2 border-slate-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-0.5">Pipeline Overview</h2>
          <p className="text-slate-600 text-xs">{activeTab === 'leads' ? 'Track your lead progress' : 'Monitor deal flow and stages'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#08708E]" />
              <div>
                <p className="text-xs text-slate-500">Total {activeTab === 'leads' ? 'Leads' : 'Deals'}</p>
                <p className="text-lg font-bold text-slate-900">{totalDeals}</p>
              </div>
            </div>
          </div>
          {activeTab === 'opportunities' && (
            <div className="bg-gradient-to-br from-[#08708E] to-[#065a72] rounded-lg px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-white" />
                <div>
                  <p className="text-xs text-white/80">Pipeline Value</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(totalPipeline)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`grid gap-2 ${activeTab === 'leads' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7'}`}>
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
              className={`w-full bg-gradient-to-br ${stage.color} rounded-lg p-3 text-white shadow-md hover:shadow-xl hover:scale-105 transition-all text-left relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-xl font-bold mb-1">{stage.count}</div>
                <div className="text-xs font-medium opacity-90 mb-1 break-words">{stage.label}</div>
                {activeTab === 'opportunities' && stage.amount > 0 && (
                  <div className="text-xs font-semibold bg-white/20 rounded px-1.5 py-0.5 inline-block mt-auto">
                    {formatCurrency(stage.amount)}
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}