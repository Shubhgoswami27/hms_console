'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.appointments.list();
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching doctor appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Consultation Calendar</h2>
          <p className="text-slate-400 text-sm">Full listing of scheduled patient visits.</p>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-xs text-slate-500">No scheduled appointments.</p>
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg">
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-400" />
                      <p className="font-bold text-slate-200">{new Date(app.dateTime).toLocaleString()}</p>
                    </div>
                    <p className="text-slate-400">Patient: {app.patient?.user?.firstName} {app.patient?.user?.lastName}</p>
                    <p className="text-[10px] text-slate-500 italic mt-1">Reason: "{app.reason}"</p>
                    {app.notes && (
                      <p className="text-[10px] text-teal-500 mt-1">Clinical notes: "{app.notes}"</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    app.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900' :
                    app.status === 'PENDING' ? 'bg-amber-950 text-amber-450 border border-amber-900' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
