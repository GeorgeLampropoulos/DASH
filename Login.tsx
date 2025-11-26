import React, { useState } from 'react';
import { signIn } from '@/services/supabaseService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Session handling is done in App.tsx via onAuthStateChange
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center border-b border-slate-700">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/30 mx-auto mb-4">
            <i className="fas fa-code"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NexGen Agency</h1>
          <p className="text-cyan-400 text-sm font-medium mt-1">Internal Dashboard Access</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors placeholder-slate-600"
                  placeholder="admin@nexgen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors placeholder-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs">
              Restricted access. Please contact the system administrator to obtain credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};