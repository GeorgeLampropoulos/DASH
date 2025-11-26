import React, { useState } from 'react';
import { Project, ProjectStatus } from '@/types';

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  enableSearch?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick, enableSearch = true }) => {
  const [search, setSearch] = useState('');
  
  const columns: { id: ProjectStatus; label: string; color: string }[] = [
    { id: 'Lead', label: 'New Leads', color: 'border-yellow-400' },
    { id: 'Active', label: 'In Progress', color: 'border-primary-500' },
    { id: 'Completed', label: 'Delivered', color: 'border-emerald-500' },
    { id: 'Cancelled', label: 'Cancelled', color: 'border-slate-300' }
  ];

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'Web Development': return 'fa-laptop-code text-cyan-500';
      case 'AI Solutions': return 'fa-robot text-purple-500';
      case 'Ad Campaign': return 'fa-bullhorn text-orange-500';
      default: return 'fa-box';
    }
  };

  // Filter projects based on search text
  const filteredProjects = projects.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.clientName.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.serviceType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search Header - Only shown if enabled */}
      {enableSearch && (
        <div className="flex-shrink-0 mb-4 px-1">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search projects, clients, or services..." 
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => {
            const colProjects = filteredProjects.filter(p => p.status === col.id);
            const totalValue = colProjects.reduce((acc, curr) => acc + curr.value, 0).toLocaleString();

            return (
              <div key={col.id} className="w-80 flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                {/* Column Header */}
                <div className={`p-4 border-t-4 ${col.color} bg-white rounded-t-xl border-b border-slate-100 flex-shrink-0`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800">{col.label}</h3>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-bold">
                      {colProjects.length}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Total Value: <span className="text-slate-700">${totalValue}</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 overflow-y-auto flex-1 custom-scrollbar space-y-3">
                  {colProjects.length > 0 ? colProjects.map(project => (
                    <div 
                      key={project.id} 
                      onClick={() => onProjectClick && onProjectClick(project)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                          {project.serviceType}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <i className="fas fa-pen text-slate-400 hover:text-primary-500 text-xs"></i>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{project.clientName}</h4>
                      <p className="text-xs text-slate-500 mb-3 truncate">{project.email}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <i className={`fas ${getServiceIcon(project.serviceType)}`}></i>
                          <span className="text-xs font-bold text-slate-700">${project.value.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <i className="far fa-clock mr-1"></i>
                          {project.deadline.slice(5)}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400 opacity-50">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                        {search ? 'No matches' : 'No projects'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};