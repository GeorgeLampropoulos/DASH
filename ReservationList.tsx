import React, { useState } from 'react';
import { Reservation } from '@/types';

interface ReservationListProps {
  reservations: Reservation[];
}

export const ReservationList: React.FC<ReservationListProps> = ({ reservations }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = reservations.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          r.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'seated': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">
          Today's Reservations 
          <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
        </h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search guest..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="seated">Seated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guest Info</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pax</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bot/Source</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-slate-900">{res.customerName}</div>
                  <div className="text-xs text-slate-500">{res.email}</div>
                  <div className="text-xs text-slate-500">{res.phoneNumber}</div>
                </td>
                <td className="p-4">
                  <div className="text-slate-700 font-medium">{res.time}</div>
                  <div className="text-xs text-slate-400">{res.date}</div>
                </td>
                <td className="p-4 text-slate-700 font-medium">
                  <i className="fas fa-user-friends mr-1 text-slate-300"></i> {res.guests}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                    {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    {res.bookedBy === 'AI Bot' && <i className="fas fa-robot text-purple-500"></i>}
                    {res.bookedBy === 'Website' && <i className="fas fa-globe text-blue-500"></i>}
                    {res.bookedBy === 'Manual' && <i className="fas fa-user-edit text-slate-400"></i>}
                    {res.bookedBy}
                  </span>
                </td>
                <td className="p-4">
                  {res.specialRequests ? (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 max-w-xs">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {res.specialRequests}
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <i className="fas fa-clipboard-list text-4xl mb-3 opacity-20"></i>
                  <p>No reservations found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};