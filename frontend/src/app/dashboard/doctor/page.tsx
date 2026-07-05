'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Users, FileText, CheckCircle, Clock, Eye, AlertCircle, Edit3 } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clinical notes editing state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [notesForm, setNotesForm] = useState({
    status: 'CONFIRMED',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const appData = await api.appointments.list();
      setAppointments(appData || []);

      const reportData = await api.reports.list();
      setReports(reportData || []);
    } catch (err) {
      console.error('Error fetching doctor console details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenConsultation = (app: any) => {
    setSelectedApp(app);
    setNotesForm({
      status: app.status,
      notes: app.notes || ''
    });
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await api.appointments.updateStatus(selectedApp.id, notesForm);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      alert('Error updating appointment consultation logs.');
    }
  };

  const todayCount = appointments.filter((app) => {
    const appDate = new Date(app.dateTime).toDateString();
    const today = new Date().toDateString();
    return appDate === today;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Doctor Console</h2>
          <p className="text-slate-400 text-sm">Welcome back, Dr. {user?.firstName}. Access your schedules and clinical files.</p>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Today's Visits</p>
                  <p className="text-3xl font-extrabold text-teal-400">{todayCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-teal-950 border border-teal-900 flex items-center justify-center text-teal-400">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Total Queue</p>
                  <p className="text-3xl font-extrabold text-amber-400">{appointments.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-900 flex items-center justify-center text-amber-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Reports cataloged</p>
                  <p className="text-3xl font-extrabold text-emerald-400">{reports.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Main Consultation Queue */}
            <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-lg">
              <h3 className="text-md font-bold text-slate-200 border-b border-slate-900 pb-3">Consultation Schedule Queue</h3>
              
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">You have no scheduled visits at this time.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3">Date & Time</th>
                        <th className="py-3">Patient</th>
                        <th className="py-3">Visit Reason</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {appointments.map((app) => {
                        const isCompleted = app.status === 'COMPLETED';
                        return (
                          <tr key={app.id} className="text-slate-350 hover:bg-slate-900/20">
                            <td className="py-4 font-semibold text-slate-200">{new Date(app.dateTime).toLocaleString()}</td>
                            <td className="py-4 font-bold text-slate-300">
                              {app.patient?.user?.firstName} {app.patient?.user?.lastName}
                            </td>
                            <td className="py-4 italic max-w-xs truncate">{app.reason}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                app.status === 'PENDING' ? 'bg-amber-950 text-amber-450 border border-amber-900' : 'bg-slate-900 text-slate-400'
                              }`}>
                                <span>{app.status}</span>
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleOpenConsultation(app)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-teal-400 hover:text-teal-350 border border-slate-850 rounded-xl transition-all cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Consult</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Consultation Form Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
            <form onSubmit={handleConsultationSubmit} className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-4">
              <div>
                <h3 className="text-md font-bold text-slate-100">Consultation Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">Patient: {selectedApp.patient?.user?.firstName} {selectedApp.patient?.user?.lastName}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Visit Outcome Status</label>
                <select
                  value={notesForm.status}
                  onChange={(e) => setNotesForm({ ...notesForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed / Under Review</option>
                  <option value="COMPLETED">Completed Consultation</option>
                  <option value="CANCELLED">Cancelled Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Clinical Diagnostics / Prescriptions</label>
                <textarea
                  value={notesForm.notes}
                  onChange={(e) => setNotesForm({ ...notesForm, notes: e.target.value })}
                  placeholder="Record symptoms, diagnostic findings, prescriptions, and follow-up directives..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none h-32"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Submit Notes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
