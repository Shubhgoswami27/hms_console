'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { Calendar, User, ArrowRight, ShieldAlert, HeartPulse } from 'lucide-react';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [form, setForm] = useState({
    doctorId: '',
    dateTime: '',
    reason: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const staffRes = await api.staff.list('DOCTOR');
        setDoctors(staffRes.doctors || []);
      } catch (err) {
        console.error('Error fetching doctors schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.appointments.create(form);
      router.push('/dashboard/patient');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Schedule Clinical Visit</h2>
          <p className="text-slate-400 text-sm">Select an on-duty specialist and secure a consultation slot.</p>
        </div>

        <div className="max-w-xl p-8 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg relative">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/5 rounded-full blur-[50px] pointer-events-none" />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-955/20 border border-rose-900 text-rose-350 text-xs flex gap-2 items-center">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex py-10 justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">1. Select Medical Specialist</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-2xl text-xs focus:outline-none"
                    required
                  >
                    <option value="">-- Select Doctor & Specialization --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.user?.firstName} {doc.user?.lastName} - {doc.specialization} ({doc.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">2. Appointment Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="datetime-local"
                    value={form.dateTime}
                    onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-850 rounded-2xl text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-2">3. Primary Consultation reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Summarize your current symptoms, duration, or follow-up directives..."
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-850 rounded-2xl text-xs focus:outline-none h-28"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
              >
                <span>Request Appointment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
