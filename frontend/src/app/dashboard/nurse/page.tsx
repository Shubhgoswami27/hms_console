'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { BellRing, ShieldCheck, Clock, Check, BellOff, PhoneIncoming, AlertTriangle } from 'lucide-react';

export default function NurseDashboard() {
  const [calls, setCalls] = useState<any[]>([]);
  const [bedsCount, setBedsCount] = useState({ total: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchNurseData = async () => {
    setLoading(true);
    try {
      const callData = await api.nurseCalls.list();
      setCalls(callData || []);

      const bedData = await api.beds.list();
      const occupied = bedData.filter((b: any) => b.status === 'OCCUPIED').length;
      setBedsCount({ total: bedData.length, occupied });
    } catch (err) {
      console.error('Error fetching nurse station updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurseData();
  }, []);

  // Socket.io integration for Nurse Call Alerts
  const { emit } = useSocket('NURSE', (event, data) => {
    if (event === 'receive_nurse_call') {
      console.log('Realtime Nurse Call Received:', data);
      setCalls((prev) => [data, ...prev]);
      
      // Visual Alert Notification
      setAlertMessage(`EMERGENCY: Bed ${data.bedNumber} is calling!`);
      // Optional sound notification in browser
      if (typeof window !== 'undefined') {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } else if (event === 'nurse_call_status_updated') {
      console.log('Realtime Nurse Call Updated:', data);
      setCalls((prev) =>
        prev.map((call) => (call.id === data.id ? data : call))
      );
    }
  });

  const handleRespond = async (callId: string) => {
    try {
      await api.nurseCalls.updateStatus(callId, 'RESPONDING');
      setAlertMessage(null);
    } catch (err) {
      alert('Error updating response log.');
    }
  };

  const handleResolve = async (callId: string) => {
    try {
      await api.nurseCalls.updateStatus(callId, 'RESOLVED');
    } catch (err) {
      alert('Error updating resolved status.');
    }
  };

  const pendingCalls = calls.filter((c) => c.status !== 'RESOLVED');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Nurse Central Station</h2>
          <p className="text-slate-400 text-sm">Monitor ward beds and coordinate patient emergency dispatch alerts.</p>
        </div>

        {/* Global Flashing Emergency Alert */}
        {alertMessage && (
          <div className="p-5 bg-rose-950 border-2 border-rose-500 rounded-3xl animate-pulse flex items-start gap-4 text-rose-100">
            <BellRing className="h-8 w-8 text-rose-450 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-sm uppercase tracking-wide">Emergency Patient Call Received</h4>
              <p className="text-xs text-rose-300 font-semibold">{alertMessage}</p>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-xs border border-rose-800 bg-rose-900/40 hover:bg-rose-900 px-3 py-1.5 rounded-xl transition-all font-bold"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Central Wards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bed stats */}
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase font-semibold">Active Bed Allocations</p>
              <p className="text-3xl font-extrabold text-teal-400">{loading ? '...' : `${bedsCount.occupied}/${bedsCount.total}`}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-950 border border-teal-900 flex items-center justify-center text-teal-400">
              <Check className="h-5 w-5" />
            </div>
          </div>

          {/* Pending Alerts */}
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl flex items-center justify-between shadow-md col-span-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase font-semibold">Active Dispatch Calls</p>
              <p className="text-3xl font-extrabold text-amber-400">{loading ? '...' : `${pendingCalls.length} Pending`}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-900 flex items-center justify-center text-amber-400">
              <BellRing className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Live Call Dispatch Board */}
        <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="h-5 w-5 text-teal-400" />
              <h3 className="font-bold text-slate-200">Patient Calls Queue</h3>
            </div>
            
            <div className="flex items-center gap-2.5 px-3 py-1 bg-teal-950/20 border border-teal-900 rounded-full text-[9px] text-teal-400 font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
              </span>
              <span>Central Radio Sync</span>
            </div>
          </div>

          {loading ? (
            <div className="flex py-20 justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
            </div>
          ) : calls.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No patient calls currently logged.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {calls.map((call) => {
                const isPending = call.status === 'PENDING';
                const isResponding = call.status === 'RESPONDING';
                const isResolved = call.status === 'RESOLVED';

                return (
                  <div 
                    key={call.id} 
                    className={`p-5 border rounded-3xl transition-all flex flex-col justify-between ${
                      isPending ? 'bg-rose-950/20 border-rose-900/50 animate-pulse' :
                      isResponding ? 'bg-amber-950/20 border-amber-900/50' : 'bg-slate-900 border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          isPending ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                          isResponding ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        }`}>
                          {call.status}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(call.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-200">Bed: {call.bedNumber}</h4>
                      <p className="text-xs text-slate-350 font-bold">
                        Patient: {call.patient?.user?.firstName} {call.patient?.user?.lastName}
                      </p>
                      {call.message && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{call.message}"
                        </p>
                      )}

                      {call.nurse && (
                        <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-850/40">
                          Responder: Nurse {call.nurse.user?.firstName} {call.nurse.user?.lastName}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {!isResolved && (
                      <div className="flex gap-2 mt-5 pt-3 border-t border-slate-850/40">
                        {isPending ? (
                          <button
                            onClick={() => handleRespond(call.id)}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                          >
                            Respond to Call
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResolve(call.id)}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
