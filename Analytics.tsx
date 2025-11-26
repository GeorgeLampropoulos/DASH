import React from 'react';
import { Project } from '@/types';

interface AnalyticsProps {
  projects: Project[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  
  // 1. Service Type Distribution
  const serviceStats = projects.reduce((acc, curr) => {
    acc[curr.serviceType] = (acc[curr.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProjects = projects.length;
  
  // 2. Revenue by Service
  const revenueStats = projects.reduce((acc, curr) => {
    if (curr.status !== 'Cancelled') {
      acc[curr.serviceType] = (acc[curr.serviceType] || 0) + curr.value;
    }
    return acc;
  }, {} as Record<string, number>);

  const maxRevenue = Math.max(...Object.values(revenueStats), 1);

  // 3. Client Satisfaction (Ratings)
  const ratedProjects = projects.filter(p => p.rating);
  const averageRating = ratedProjects.length > 0
    ? (ratedProjects.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedProjects.length).toFixed(1)
    : 'N/A';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto custom-scrollbar pb-8">
      
      {/* Service Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Project Distribution</h3>
            <p className="text-sm text-slate-500">Breakdown by service type</p>
          </div>
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
            <i className="fas fa-chart-pie"></i>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(serviceStats).map(([service, count]) => {
            const percentage = ((count / totalProjects) * 100).toFixed(0);
            return (
              <div key={service} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{service}</span>
                  <span className="text-slate-500">{count} projects ({percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      service === 'Web Development' ? 'bg-cyan-500' : 
                      service === 'AI Solutions' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Revenue Breakdown</h3>
          <p className="text-sm text-slate-500">Estimated value by category ($)</p>
        </div>

        <div className="flex items-end gap-4 h-48 pt-4">
          {Object.entries(revenueStats).map(([service, value]) => {
            const heightPercent = (value / maxRevenue) * 100;
            return (
              <div key={service} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-50 rounded-t-lg relative flex items-end justify-center h-full hover:bg-slate-100 transition-colors">
                  <div 
                    className={`w-full mx-2 rounded-t transition-all duration-700 relative group-hover:opacity-90 ${
                       service === 'Web Development' ? 'bg-cyan-400' : 
                       service === 'AI Solutions' ? 'bg-purple-400' : 'bg-orange-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      ${value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 text-center">{service.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <p className="text-indigo-200 text-sm font-medium uppercase">Total Active Value</p>
             <h3 className="text-3xl font-bold mt-1">
               ${projects.filter(p => p.status === 'Active').reduce((acc, c) => acc + c.value, 0).toLocaleString()}
             </h3>
             <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
               <i className="fas fa-arrow-up"></i> +12% vs last month
             </p>
          </div>
          <i className="fas fa-wallet absolute right-4 bottom-4 text-6xl opacity-10"></i>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium uppercase">Avg Client Rating</p>
             <h3 className="text-3xl font-bold text-slate-800 mt-1">{averageRating}</h3>
             <div className="flex gap-1 mt-2 text-yellow-400 text-xs">
               <i className="fas fa-star"></i>
               <i className="fas fa-star"></i>
               <i className="fas fa-star"></i>
               <i className="fas fa-star"></i>
               <i className="fas fa-star-half-alt"></i>
             </div>
           </div>
           <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 text-xl">
             <i className="fas fa-award"></i>
           </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
           <div>
             <p className="text-slate-500 text-sm font-medium uppercase">Conversion Rate</p>
             <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Completed' || p.status === 'Active').length / projects.length) * 100) : 0}%
             </h3>
             <p className="text-xs text-green-600 mt-2 font-medium">Healthy Pipeline</p>
           </div>
           <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-xl">
             <i className="fas fa-filter"></i>
           </div>
        </div>
      </div>

    </div>
  );
};