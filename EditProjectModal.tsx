import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Project>) => Promise<void>;
  project: Project | null;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [status, setStatus] = useState<ProjectStatus>('Lead');
  const [value, setValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setStatus(project.status);
      setValue(project.value);
      setNotes(project.notes || '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    await onSave(project.id, {
      status,
      value,
      notes
    });
    setSaving(false);
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Project</h2>
            <p className="text-sm text-slate-500">{project.clientName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Project Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Lead', 'Active', 'Completed', 'Cancelled'] as ProjectStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                    status === s
                      ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Project Value ($)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold">$</span>
              </div>
              <input
                type="number"
                step="1"
                required
                className="pl-7 w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-lg"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Update the agreed price for this client.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes / Details</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details about requirements or changes..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};