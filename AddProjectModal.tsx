import React, { useState, useEffect } from 'react';
import { Project, ServiceType, ProjectStatus } from '@/types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => Promise<void>;
}

interface PricingFeature {
  id: string;
  label: string;
  cost: number;
  category: ServiceType | 'All';
}

const AVAILABLE_FEATURES: PricingFeature[] = [
  // Web Dev Features
  { id: 'responsive', label: 'Mobile Responsive', cost: 500, category: 'Web Development' },
  { id: 'cms', label: 'CMS Integration', cost: 1200, category: 'Web Development' },
  { id: 'ecommerce', label: 'E-commerce Functionality', cost: 2500, category: 'Web Development' },
  { id: 'seo', label: 'Advanced SEO Pack', cost: 800, category: 'Web Development' },
  
  // AI Features
  { id: 'fine_tuning', label: 'Model Fine-Tuning', cost: 3000, category: 'AI Solutions' },
  { id: 'rag', label: 'RAG Implementation', cost: 2000, category: 'AI Solutions' },
  { id: 'voice', label: 'Voice/Audio Interface', cost: 1500, category: 'AI Solutions' },
  
  // Ad Features
  { id: 'creatives', label: 'Creative Asset Design', cost: 800, category: 'Ad Campaign' },
  { id: 'ab_testing', label: 'A/B Testing Setup', cost: 600, category: 'Ad Campaign' },
  { id: 'multi_platform', label: 'Multi-Platform Setup', cost: 1000, category: 'Ad Campaign' },
];

const BASE_COSTS: Record<ServiceType, number> = {
  'Web Development': 1500, // Standard Cost
  'AI Solutions': 2500,    // Standard Cost
  'Ad Campaign': 1000      // Standard Cost
};

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  // Form State
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('Web Development');
  const [status, setStatus] = useState<ProjectStatus>('Lead');
  
  // Calculator State
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isRush, setIsRush] = useState(false); // The "Double Tariff"
  const [customAdjustment, setCustomAdjustment] = useState<string>('0'); // Manual override
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  // Recalculate price whenever inputs change
  useEffect(() => {
    let total = BASE_COSTS[serviceType];

    // Add selected features cost
    selectedFeatures.forEach(featId => {
      const feature = AVAILABLE_FEATURES.find(f => f.id === featId);
      if (feature) {
        total += feature.cost;
      }
    });

    // Add custom adjustment
    const adj = parseFloat(customAdjustment) || 0;
    total += adj;

    // Apply Multipliers (Double Tariff)
    if (isRush) {
      total = total * 2;
    }

    setCalculatedTotal(total);
  }, [serviceType, selectedFeatures, isRush, customAdjustment]);

  // Reset selected features when service type changes
  useEffect(() => {
    setSelectedFeatures([]);
  }, [serviceType]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId) 
        : [...prev, featureId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Construct Notes based on features
    const featureNames = selectedFeatures
      .map(id => AVAILABLE_FEATURES.find(f => f.id === id)?.label)
      .join(', ');
    
    const adj = parseFloat(customAdjustment) || 0;
    const adjNote = adj !== 0 ? `Manual Adj: ${adj > 0 ? '+' : ''}${adj}. ` : '';
    
    const notes = `Features: ${featureNames || 'Standard Package'}. ${adjNote}${isRush ? '[RUSH ORDER APPLIED]' : ''}`;

    await onSave({
      clientName,
      email,
      phone,
      serviceType,
      status,
      value: calculatedTotal,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days out
      notes
    });
    
    setSaving(false);
    // Form is cleared by parent re-rendering or manual reset here if needed
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Client Details */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">1</div>
            Client Details
          </h2>
          
          <form id="projectForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client / Company Name</label>
              <input 
                required
                type="text" 
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Status</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="Lead">Lead (Prospect)</option>
                <option value="Active">Active (Signed)</option>
              </select>
            </div>
          </form>
        </div>

        {/* Right Side: Cost Calculator */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 overflow-y-auto flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">2</div>
            Smart Pricing Calculator
          </h2>

          {/* Service Selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Service Type (Base Price)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Web Development', 'AI Solutions', 'Ad Campaign'] as ServiceType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                    serviceType === type 
                      ? 'bg-white border-primary-500 text-primary-700 shadow-md ring-1 ring-primary-500' 
                      : 'bg-slate-100 border-transparent text-slate-500 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  {type}
                  <div className="mt-1 font-bold">${BASE_COSTS[type].toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Features Checklist */}
          <div className="flex-1 mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Add-ons & Complexity
            </label>
            <div className="space-y-2">
              {AVAILABLE_FEATURES.filter(f => f.category === serviceType).map(feature => (
                <label key={feature.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-primary-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                    />
                    <span className="text-sm text-slate-700">{feature.label}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">+${feature.cost}</span>
                </label>
              ))}
              {AVAILABLE_FEATURES.filter(f => f.category === serviceType).length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">No specific add-ons for this category.</p>
              )}
            </div>
          </div>
          
          {/* Custom Adjustment */}
          <div className="mb-6 bg-white p-3 rounded-lg border border-slate-200">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Manual Adjustment ($)</label>
             <div className="flex items-center gap-2">
               <input 
                 type="number" 
                 step="100"
                 className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                 value={customAdjustment}
                 onChange={(e) => setCustomAdjustment(e.target.value)}
                 placeholder="0"
               />
               <span className="text-xs text-slate-400 whitespace-nowrap">+/- Cost</span>
             </div>
          </div>

          {/* Multipliers & Total */}
          <div className="mt-auto bg-slate-900 rounded-xl p-5 text-white shadow-lg">
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
              <span className="text-sm font-medium">Rush Order (Double Tariff)</span>
              <button 
                type="button"
                onClick={() => setIsRush(!isRush)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isRush ? 'bg-red-500' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRush ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-1 mb-4 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Base Cost:</span>
                <span>${BASE_COSTS[serviceType].toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${calculatedTotal.toLocaleString()}</span>
              </div>
               {isRush && (
                <div className="flex justify-between text-red-400 font-bold">
                  <span>Double Tariff (2x):</span>
                  <span>Active</span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between pt-2">
              <span className="text-slate-300 font-medium">Total Estimate</span>
              <span className="text-3xl font-bold text-cyan-400">${calculatedTotal.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="projectForm"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-primary-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create Project'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};