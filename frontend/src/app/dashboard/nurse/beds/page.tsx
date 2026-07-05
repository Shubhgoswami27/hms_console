'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { BedDouble, LogOut, UserPlus, Wrench } from 'lucide-react';

export default function NurseBeds() {
  const [beds, setBeds] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admission Modal State
  const [selectedBed, setSelectedBed] = useState<any | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    nurseId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const bedRes = await api.beds.list();
      setBeds(bedRes || []);
      
      const patRes = await api.patients.list();
      setPatients(patRes || []);

      const staffRes = await api.staff.list('NURSE');
      setNurses(staffRes.nurses || []);
    } catch (err) {
      console.error('Error fetching bed logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // WebSockets live synchronization
  const { emit } = useSocket(undefined, (event, data) => {
    if (event === 'bed_updated') {
      setBeds((prevBeds) =>
        prevBeds.map((bed) =>
          bed.id === data.bedId
            ? { 
                ...bed, 
                status: data.status, 
                assignments: data.assignment ? [data.assignment] : [] 
              }
            : bed
        )
      );
    }
  });

  const handleOpenAssign = (bed: any) => {
    setSelectedBed(bed);
    setForm({ patientId: '', nurseId: '' });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !form.patientId) return;

    try {
      await api.beds.assign({
        bedId: selectedBed.id,
        patientId: form.patientId,
        nurseId: form.nurseId || undefined
      });
      setIsAssignModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error admitting patient.');
    }
  };

  const handleDischarge = async (bedId: string) => {
    if (!confirm('Are you sure you want to discharge this patient? This will vacate the bed.')) {
      return;
    }

    try {
      await api.beds.discharge(bedId);
    } catch (err: any) {
      alert(err.message || 'Error discharging patient.');
    }
  };

  const handleToggleMaintenance = async (bed: any) => {
    const nextStatus = bed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await api.beds.updateStatus(bed.id, nextStatus);
    } catch (err: any) {
      alert(err.message || 'Error updating maintenance logs.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Ward bed mapping</h2>
          <p className="text-slate-400 text-sm">Real-time occupancy mapping across ICU, Emergency, and General wards.</p>
        </div>

        {/* Real-time sync notifications banner */}
        <div className="flex items-center gap-2.5 px-4 py-2 border border-teal-900/40 bg-teal-950/20 rounded-2xl text-[10px] text-teal-400 font-semibold w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span>WebSockets Connected: Receiving live occupancy changes</span>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beds.map((bed) => {
              const activeAssignment = bed.assignments?.[0];
              const isOccupied = bed.status === 'OCCUPIED';
              const isMaintenance = bed.status === 'MAINTENANCE';
              
              return (
                <div 
                  key={bed.id} 
                  className={`p-6 border rounded-3xl transition-all shadow-md flex flex-col justify-between ${
                    isOccupied ? 'bg-amber-950/25 border-amber-900/60' :
                    isMaintenance ? 'bg-rose-950/20 border-rose-900/50' : 'bg-slate-950 border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start border-b border-slate-850/60 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <BedDouble className={`h-6 w-6 ${
                          isOccupied ? 'text-amber-400' :
                          isMaintenance ? 'text-rose-455' : 'text-emerald-400'
                        }`} />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">Bed {bed.number}</h4>
                          <p className="text-[10px] text-slate-500 uppercase">{bed.type} room • {bed.wardName}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        isOccupied ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        isMaintenance ? 'bg-rose-950/50 text-rose-450 border border-rose-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {bed.status}
                      </span>
                    </div>

                    {isOccupied && activeAssignment ? (
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-slate-350">Admitted Patient:</p>
                        <p className="text-slate-200 font-bold text-sm">
                          {activeAssignment.patient?.user?.firstName} {activeAssignment.patient?.user?.lastName}
                        </p>
                        {activeAssignment.nurse && (
                          <p className="text-[10px] text-slate-500">
                            Assigned Nurse: {activeAssignment.nurse.user?.firstName} {activeAssignment.nurse.user.lastName}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-550 font-mono">Admitted: {new Date(activeAssignment.assignedAt).toLocaleString()}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-550 italic py-4">No patient currently admitted.</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-6 border-t border-slate-855/60 pt-4">
                    {isOccupied ? (
                      <button
                        onClick={() => handleDischarge(bed.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-rose-400 border border-rose-950/30 hover:border-rose-900/40 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Discharge</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAssign(bed)}
                        disabled={isMaintenance}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Admit Patient</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleMaintenance(bed)}
                      disabled={isOccupied}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-450 hover:text-slate-200 border border-slate-800 text-xs transition-colors cursor-pointer"
                      title="Maintenance"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admission Modal */}
        {isAssignModalOpen && selectedBed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
            <form onSubmit={handleAssignSubmit} className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-5">
              <h3 className="text-md font-bold text-slate-100">Admit Patient to Bed {selectedBed.number}</h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Select Patient</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Admitting Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.user?.firstName} {pat.user?.lastName} (ID: {pat.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Assign On-Duty Nurse (Optional)</label>
                <select
                  value={form.nurseId}
                  onChange={(e) => setForm({ ...form, nurseId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-955 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">-- Choose Nurse --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.user?.firstName} {nurse.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-3 border border-slate-855 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
