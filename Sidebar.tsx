import React from 'react';
import { ViewState, ConnectionStatus } from '@/types';
import { signOut } from '@/services/supabaseService';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  connectionStatus: ConnectionStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, connectionStatus }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Overview', icon: 'fa-layer-group' },
    { id: ViewState.PROJECTS, label: 'Projects Board', icon: 'fa-trello' },
    { id: ViewState.ANALYTICS, label: 'Statistics', icon: 'fa-chart-pie' },
    { id: ViewState.CLIENTS, label: 'Clients', icon: 'fa-users' },
  ];

  const getConnectionColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'empty': return 'bg-yellow-500';
      case 'loading': return 'bg-blue-500 animate-pulse';
      default: return 'bg-slate-500';
    }
  };

  const getConnectionText = () => {
    switch(connectionStatus) {
      case 'connected': return 'DB CONNECTED';
      case 'error': return 'CONNECTION FAILED';
      case 'empty': return 'NO DATA FOUND';
      case 'loading': return 'CONNECTING...';
      default: return 'OFFLINE';
    }
  };

  const handleLogout = async () => {
    await signOut();
    // State change handled in App.tsx via subscription
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-900">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
          <i className="fas fa-code"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">NexGen</h1>
          <p className="text-xs text-cyan-400 font-medium">Digital Solutions</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-6 text-center transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-3">
        {/* Connection Status */}
        <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm flex items-center gap-3 ${connectionStatus === 'error' ? 'border-red-900 bg-red-900/10' : ''}`}>
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`}></div>
            {connectionStatus === 'connected' && <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-0 left-0 animate-ping"></div>}
          </div>
          <span className={`text-xs font-mono ${connectionStatus === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
            {getConnectionText()}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-red-900/20 p-2 rounded-lg transition-colors text-sm"
        >
          <i className="fas fa-sign-out-alt"></i>
          Sign Out
        </button>
      </div>
    </div>
  );
};