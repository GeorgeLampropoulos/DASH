import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ProjectList } from '@/components/ProjectList';
import { StatCard } from '@/components/StatCard';
import { Analytics } from '@/components/Analytics';
import { AddProjectModal } from '@/components/AddProjectModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { QuickAddCard } from '@/components/QuickAddCard';
import { Login } from '@/components/Login';
import { ViewState, Project, ConnectionStatus } from '@/types';
import { fetchProjects, addProject, updateProject, supabase } from '@/services/supabaseService';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [currentView, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Check Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        // If we just logged in, trigger a data load
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setConnectionStatus('loading');
    
    try {
      const result = await fetchProjects();
      
      setDebugLogs(result.details || []);

      if (result.data && result.data.length > 0) {
        setProjects(result.data);
        setConnectionStatus('connected');
      } else {
        setProjects([]);
        setConnectionStatus('empty');
        // If we have an error message but no data, it's a failure
        if (result.error && !result.error.includes("No data found")) {
           setConnectionStatus('error');
        }
      }
    } catch (e) {
      console.error(e);
      setConnectionStatus('error');
      setDebugLogs(prev => [...prev, `CRITICAL FAIL: ${e}`]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from Supabase on mount if session exists
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const handleSaveProject = async (newProjectData: Omit<Project, 'id'>) => {
    // Optimistic UI update
    const tempId = Math.random().toString();
    const tempProject: Project = { ...newProjectData, id: tempId };
    
    setProjects(prev => [tempProject, ...prev]);
    setIsAddModalOpen(false); // Close advanced modal if open

    // Save to DB
    const result = await addProject(newProjectData);
    if (!result.success) {
      alert(`Failed to save to database: ${result.error}`);
    } else {
      // Reload to get the real ID and consistency
      loadData();
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingProject(null);

    // Save to DB
    const result = await updateProject(id, updates);
    if (!result.success) {
      alert(`Failed to update project: ${result.error}`);
      loadData(); // Revert on failure
    }
  };

  const copySqlToClipboard = () => {
    const sql = `-- Run this in Supabase SQL Editor to fix permissions for logged-in users
create policy "Enable read access for authenticated users" on public.projects for select to authenticated using (true);
create policy "Enable insert access for authenticated users" on public.projects for insert to authenticated with check (true);
create policy "Enable update access for authenticated users" on public.projects for update to authenticated using (true);`;
    navigator.clipboard.writeText(sql);
    alert("SQL copied to clipboard! Paste this into your Supabase SQL Editor.");
  };

  // Stats derivation
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const newLeads = projects.filter(p => p.status === 'Lead').length;
  
  // Calculate potential revenue
  const totalPipelineValue = projects.reduce((acc, curr) => acc + curr.value, 0).toLocaleString();

  // Extract unique client names for auto-complete
  const uniqueClients = Array.from(new Set(projects.map(p => p.clientName))).sort();

  const renderDashboard = () => (
    <div className="space-y-6 h-full flex flex-col">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard metric={{ label: 'Total Projects', value: totalProjects, icon: 'fa-folder-open', color: 'text-primary-600' }} />
        <StatCard metric={{ label: 'Active Builds', value: activeProjects, icon: 'fa-hammer', color: 'text-cyan-500' }} />
        <StatCard metric={{ label: 'New Leads', value: newLeads, icon: 'fa-bolt', color: 'text-yellow-500' }} />
        <StatCard metric={{ label: 'Pipeline Value', value: `$${totalPipelineValue}`, icon: 'fa-dollar-sign', color: 'text-emerald-500' }} />
      </div>

      {/* Main Content Area: Board + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Main Board Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <i className="fas fa-tasks text-primary-500"></i> Project Status
             </h3>
             <button onClick={() => setView(ViewState.PROJECTS)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
               View Full Board &rarr;
             </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden relative">
             <ProjectList 
               projects={projects.slice(0, 10)} 
               onProjectClick={setEditingProject}
               enableSearch={false}
             /> 
          </div>
        </div>
        
        {/* Right Panel: Quick Actions / Activity */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          {/* New Quick Add Card */}
          <div className="flex-shrink-0">
            <QuickAddCard 
              onAdd={handleSaveProject} 
              onOpenAdvanced={() => setIsAddModalOpen(true)}
              existingClients={uniqueClients}
            />
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 sticky top-0 bg-white">Latest Activity</h3>
            <div className="space-y-4">
              {projects.slice(0, 8).map((p, i) => (
                <div key={p.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                    p.status === 'Active' ? 'bg-primary-500' : 
                    p.status === 'Completed' ? 'bg-emerald-500' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">{p.clientName}</span> marked as <span className="text-slate-500 lowercase">{p.status}</span>.
                    </p>
                    <span className="text-xs text-slate-400">{p.deadline}</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 1. Session Loading State
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary-500 text-4xl"></i>
      </div>
    );
  }

  // 2. Unauthenticated State (Show Login)
  if (!session) {
    return <Login />;
  }

  // 3. Authenticated Dashboard
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar currentView={currentView} setView={setView} connectionStatus={connectionStatus} />
      
      <main className="ml-64 p-8 h-screen flex flex-col overflow-hidden">
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentView === ViewState.DASHBOARD && 'Agency Overview'}
              {currentView === ViewState.PROJECTS && 'Project Board'}
              {currentView === ViewState.ANALYTICS && 'Performance Stats'}
              {currentView === ViewState.CLIENTS && 'Client Directory'}
            </h1>
            <p className="text-slate-500 text-sm">Managing {activeProjects} active builds and {newLeads} leads.</p>
          </div>
          <div className="flex items-center gap-4">
             {connectionStatus !== 'connected' && connectionStatus !== 'loading' && (
               <button 
                onClick={() => setShowDebug(!showDebug)}
                className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-2 hover:bg-red-100 transition"
               >
                 <i className="fas fa-bug"></i> {showDebug ? 'Hide Debug' : 'Show Debug Info'}
               </button>
             )}
             <button 
               onClick={loadData} 
               className="text-slate-500 hover:text-primary-600 transition-colors text-sm font-medium flex items-center gap-2"
               disabled={loading}
             >
               <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
               {loading ? 'Syncing...' : 'Refresh Data'}
             </button>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
             >
                <i className="fas fa-plus"></i>
             </button>
          </div>
        </header>

        {showDebug && debugLogs.length > 0 && (
          <div className="bg-slate-800 text-green-400 p-4 rounded-lg mb-4 font-mono text-xs shadow-lg max-h-40 overflow-y-auto">
            <h4 className="text-white font-bold border-b border-slate-700 pb-2 mb-2 sticky top-0 bg-slate-800">Connection Diagnostics:</h4>
            {debugLogs.map((log, i) => (
              <div key={i} className="mb-1 border-b border-slate-700/50 pb-1 last:border-0">{log}</div>
            ))}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {projects.length === 0 && !loading && !showDebug && connectionStatus !== 'connected' && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
                <i className="fas fa-lock text-yellow-500 text-3xl mb-3"></i>
                <h3 className="text-yellow-800 font-bold">Logged In, But No Data?</h3>
                <p className="text-yellow-700 text-sm mt-1 max-w-lg mx-auto mb-4">
                  You are now authenticated, but your database might be blocking you. 
                  You need to add "Policies" for authenticated users in Supabase.
                </p>
                <button 
                  onClick={copySqlToClipboard}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  <i className="fas fa-copy mr-2"></i> Copy SQL Fix
                </button>
             </div>
          )}

          {currentView === ViewState.DASHBOARD && renderDashboard()}
          
          {currentView === ViewState.PROJECTS && (
            <div className="h-full">
              <ProjectList 
                projects={projects} 
                onProjectClick={setEditingProject}
                enableSearch={true}
              />
            </div>
          )}

          {currentView === ViewState.ANALYTICS && (
            <Analytics projects={projects} />
          )}

          {currentView === ViewState.CLIENTS && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">Last Project</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map(p => (
                      <tr 
                        key={p.id} 
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setEditingProject(p)}
                      >
                        <td className="p-4 font-medium text-slate-900">{p.clientName}</td>
                        <td className="p-4 text-sm text-slate-500">{p.email}</td>
                        <td className="p-4 font-bold text-slate-700">${p.value.toLocaleString()}</td>
                        <td className="p-4 text-xs text-slate-400">{p.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}
        </div>
      </main>
      
      {/* Modals */}
      <AddProjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveProject} 
      />
      <EditProjectModal 
        isOpen={!!editingProject} 
        project={editingProject} 
        onClose={() => setEditingProject(null)} 
        onSave={(id, updates) => handleUpdateProject(id, updates)} 
      />
    </div>
  );
}

export default App;