import React from 'react';
import { StatMetric } from '@/types';

export const StatCard: React.FC<{ metric: StatMetric }> = ({ metric }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{metric.label}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{metric.value}</h3>
        {metric.change && (
          <p className={`text-xs mt-2 font-medium ${
            metric.changeType === 'positive' ? 'text-emerald-600' : 
            metric.changeType === 'negative' ? 'text-red-500' : 'text-slate-400'
          }`}>
            <i className={`fas fa-arrow-${metric.changeType === 'positive' ? 'up' : 'down'} mr-1`}></i>
            {metric.change}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-slate-50 ${metric.color || 'text-slate-600'}`}>
        <i className={`fas ${metric.icon}`}></i>
      </div>
    </div>
  );
};