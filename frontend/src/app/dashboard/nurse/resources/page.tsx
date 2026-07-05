'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { Boxes, Edit2, MapPin } from 'lucide-react';

export default function NurseResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Oxygen Cylinder',
    status: 'AVAILABLE',
    location: '',
    quantity: '1',
    description: ''
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await api.resources.list();
      setResources(data || []);
    } catch (err) {
      console.error('Error loading resource records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // WebSockets live synchronization
  const { emit } = useSocket(undefined, (event, data) => {
    if (event === 'resource_updated') {
      setResources((prev) => {
        const exists = prev.some((r) => r.id === data.id);
        if (exists) {
          return prev.map((r) => (r.id === data.id ? data : r));
        } else {
          return [...prev, data];
        }
      });
    }
  });

  const handleOpenEdit = (res: any) => {
    setEditingResource(res);
    setForm({
      name: res.name,
      type: res.type,
      status: res.status,
      location: res.location || '',
      quantity: String(res.quantity),
      description: res.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.resources.update(editingResource.id, form);
      setIsModalOpen(false);
    } catch (err) {
      alert('Error updating resource registry.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Clinical Equipment & Stock</h2>
          <p className="text-slate-400 text-sm">Monitor ventilators, portable oxygen tanks, transport chairs, and ambulances.</p>
        </div>

        {/* Websocket indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2 border border-teal-900/40 bg-teal-950/20 rounded-2xl text-[10px] text-teal-400 font-semibold w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span>WebSockets Connected: Receiving live equipment changes</span>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => {
              const isAvailable = res.status === 'AVAILABLE';
              const isInUse = res.status === 'IN_USE';
              const isMaintenance = res.status === 'MAINTENANCE';

              return (
                <div 
                  key={res.id} 
                  className={`p-6 border rounded-3xl transition-all shadow-md flex flex-col justify-between ${
                    isMaintenance ? 'bg-rose-955/20 border-rose-900/50' :
                    isInUse ? 'bg-amber-950/25 border-amber-900/60' : 'bg-slate-950 border-slate-855 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-850/60">
                      <div className="flex items-center gap-3">
                        <Boxes className={`h-6 w-6 ${
                          isAvailable ? 'text-emerald-400' :
                          isInUse ? 'text-amber-400' : 'text-rose-455'
                        }`} />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{res.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase">{res.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                        isInUse ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-rose-950/50 text-rose-450 border border-rose-900'
                      }`}>
                        {res.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-350">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>Location: <strong className="text-slate-200">{res.location || 'Not set'}</strong></span>
                      </div>
                      <p>Total Stock: <strong className="text-slate-200">{res.quantity} unit(s)</strong></p>
                      {res.description && (
                        <p className="text-[10px] text-slate-455 leading-relaxed border-t border-slate-900 pt-2 mt-2">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(res)}
                    className="mt-6 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Modify Record</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && editingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <form onSubmit={handleSubmit} className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-4">
              <h3 className="text-md font-bold text-slate-100 mb-4">Modify Asset status</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Item Name</label>
                  <p className="text-sm font-bold text-slate-350">{editingResource.name}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Active Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Stock quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Lobby, Ward Room 102"
                    className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Brief Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none h-20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-855 hover:bg-slate-805 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
