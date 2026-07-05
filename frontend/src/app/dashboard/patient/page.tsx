'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { 
  HeartPulse, 
  Activity, 
  FileText, 
  Calendar, 
  Receipt, 
  PhoneCall, 
  CheckCircle, 
  Clock, 
  User, 
  AlertTriangle 
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Nurse Call Request Trigger
  const [isCallingNurse, setIsCallingNurse] = useState(false);
  const [bedNumber, setBedNumber] = useState('');
  const [callMessage, setCallMessage] = useState('');
  const [callSuccess, setCallSuccess] = useState(false);

  const fetchProfile = async () => {
    if (!user?.profileId) return;
    setLoading(true);
    try {
      const data = await api.patients.get(user.profileId);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Connect to Socket to listen to live state modifications
  const { emit } = useSocket('PATIENT', (event, data) => {
    if (event === 'nurse_call_status_updated' && profile) {
      // Reload profile to show resolved/responding status
      fetchProfile();
    }
  });

  const handleCallNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedNumber) return;

    try {
      const response = await api.nurseCalls.create({
        bedNumber,
        message: callMessage
      });
      
      // Emit socket trigger
      emit('send_nurse_call', response.call);

      setCallSuccess(true);
      setCallMessage('');
      setTimeout(() => {
        setIsCallingNurse(false);
        setCallSuccess(false);
      }, 3000);
    } catch (err) {
      alert('Error triggering nurse call alert.');
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      await api.billing.pay(billId);
      fetchProfile();
    } catch (err) {
      alert('Error processing invoice payment.');
    }
  };

  const lastVitals = profile?.vitals?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome, {user?.firstName}</h2>
            <p className="text-slate-400 text-sm">Access your clinical timelines, check vitals, and settle billing invoices.</p>
          </div>

          <button
            onClick={() => setIsCallingNurse(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold transition-all text-sm cursor-pointer shadow-lg shadow-rose-500/10"
          >
            <PhoneCall className="h-4.5 w-4.5 animate-bounce" />
            <span>Call Duty Nurse</span>
          </button>
        </div>

        {/* Call Nurse Dialog Form */}
        {isCallingNurse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCallingNurse(false)} />
            <form onSubmit={handleCallNurseSubmit} className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-4">
              <h3 className="text-md font-bold text-slate-100">Trigger Nurse Dispatch Call</h3>
              
              {callSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-400">Emergency Dispatch Triggered</p>
                  <p className="text-xs text-slate-400">A duty nurse has been paged to your bed.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Your Current Bed Number</label>
                    <input
                      type="text"
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      placeholder="ICU-102 or GEN-201"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-rose-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Emergency Description / Message (Optional)</label>
                    <input
                      type="text"
                      value={callMessage}
                      onChange={(e) => setCallMessage(e.target.value)}
                      placeholder="e.g. Vitals monitor alarm is ringing"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCallingNurse(false)}
                      className="flex-1 py-3 border border-slate-855 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-500/10"
                    >
                      Trigger Call
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        {loading || !profile ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Vitals Overview */}
            <div className="space-y-6 lg:col-span-1">
              <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-6 shadow-md">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Activity className="h-5 w-5 text-teal-400" />
                  <h3 className="font-bold text-slate-200">My Health Vitals</h3>
                </div>

                {lastVitals ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Temperature</p>
                      <p className="text-xl font-black text-teal-450 mt-1">{lastVitals.temperature}°C</p>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Blood Pressure</p>
                      <p className="text-xl font-black text-teal-450 mt-1">{lastVitals.bloodPressure || '--'}</p>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Pulse Rate</p>
                      <p className="text-xl font-black text-teal-450 mt-1">{lastVitals.pulseRate} bpm</p>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">SpO2 Oxygen</p>
                      <p className="text-xl font-black text-teal-450 mt-1">{lastVitals.oxygenSat}%</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 italic text-center py-4">No health readings recorded yet.</p>
                )}
              </div>

              {/* Patient Bed status if admitted */}
              {profile.bedAssignments?.filter((b: any) => !b.dischargedAt).length > 0 && (
                <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-md">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                    <HeartPulse className="h-5 w-5 text-teal-400" />
                    <h3 className="font-bold text-slate-200">Current Bed Admission</h3>
                  </div>
                  {profile.bedAssignments.filter((b: any) => !b.dischargedAt).map((assign: any) => (
                    <div key={assign.id} className="text-xs space-y-1.5">
                      <p>Ward: <strong className="text-slate-200">{assign.bed?.wardName}</strong></p>
                      <p>Bed Number: <strong className="text-slate-200">{assign.bed?.number}</strong></p>
                      <p>Room Type: <strong className="text-slate-250 uppercase">{assign.bed?.type}</strong></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Bills & Records */}
            <div className="lg:col-span-2 space-y-6">
              {/* Financial Bills */}
              <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Receipt className="h-5 w-5 text-teal-400" />
                  <h3 className="font-bold text-slate-200">Invoices & Bills</h3>
                </div>

                {profile.bills?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No pending or cleared transactions.</p>
                ) : (
                  <div className="divide-y divide-slate-855">
                    {profile.bills.map((bill: any) => {
                      const isPaid = bill.status === 'PAID';
                      return (
                        <div key={bill.id} className="py-4 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-250">{bill.description}</p>
                            <p className="text-[10px] text-slate-500 mt-1">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-teal-400 text-sm">${bill.amount.toFixed(2)}</span>
                            {isPaid ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                                PAID
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePayBill(bill.id)}
                                className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                              >
                                Pay Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Medical Diagnostic Records */}
              <div className="p-6 bg-slate-950 border border-slate-855 rounded-3xl space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <h3 className="font-bold text-slate-200">Diagnostics & Reports Timeline</h3>
                </div>

                {profile.medicalReports?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No medical diagnostic records logged.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.medicalReports.map((rep: any) => (
                      <div key={rep.id} className="p-4 bg-slate-900 border border-slate-855 rounded-2xl flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{rep.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{rep.description}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-4">
                          <span className="text-[9px] text-slate-550">{new Date(rep.createdAt).toLocaleDateString()}</span>
                          <a
                            href={rep.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-350 hover:underline"
                          >
                            Open Scans
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
