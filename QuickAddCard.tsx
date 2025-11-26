import React, { useState } from 'react';
import { Project, ServiceType } from '@/types';

interface QuickAddCardProps {
  onAdd: (project: Omit<Project, 'id'>) => Promise<void>;
  onOpenAdvanced: () => void;
  existingClients: string[];
}

export const QuickAddCard: React.FC<QuickAddCardProps> = ({ onAdd, onOpenAdvanced, existingClients }) => {
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState('');
  const [service, setService] = useState<ServiceType>('Web Development');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !value) return;

    setLoading(true);
    
    // Default values for quick add
    await onAdd({
      clientName,
      value: parseFloat(value),
      serviceType: service,
      status: 'Lead',
      email: '', // Can be updated later
      phone: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Quick added from dashboard'
    });
    
    setLoading(false);
    setClientName('');
    setValue('');
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden group h-full flex flex-col justify-between border border-slate-800">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
          <i className="fas fa-bolt text-9xl transform -rotate-12 text-primary-500"></i>
       </div>
       
       <div className="relative z-10">
         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
           <i className="fas fa-rocket text-primary-400"></i> Quick Project
         </h3>

         <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client</label>
              <input 
                list="client-suggestions"
                type="text" 
                placeholder="Client Name..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-500 transition-colors"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
              <datalist id="client-suggestions">
                {existingClients.slice(0, 10).map((client, i) => <option key={i} value={client} />)}
              </datalist>
            </div>

            <div className="flex gap-3">
               <div className="w-1/2 space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Value ($)</label>
                 <input 
                  type="number" 
                  step="100"
                  placeholder="0" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none placeholder-slate-500 font-mono"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  required
                />
               </div>
               <div className="w-1/2 space-y-1">
                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type</label>
                 <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:ring-2 focus:ring-primary-500 outline-none h-[38px]"
                  value={service}
                  onChange={(e) => setService(e.target.value as ServiceType)}
                >
                  <option value="Web Development">Web</option>
                  <option value="AI Solutions">AI Bot</option>
                  <option value="Ad Campaign">Ads</option>
                </select>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
              Add to Board
            </button>
         </form>
       </div>

       <div className="relative z-10 mt-4 text-center pt-3 border-t border-slate-800/50">
         <button 
           type="button"
           onClick={onOpenAdvanced}
           className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
         >
           Open Advanced Calculator
         </button>
       </div>
    </div>
  );
};