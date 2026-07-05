'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { 
  HeartPulse, 
  Search, 
  Calendar, 
  FileText, 
  Activity, 
  User, 
  Eye, 
  ArrowLeft,
  Thermometer,
  ShieldCheck,
  Percent,
  TrendingDown
} from 'lucide-react';
import { Avatar } from '@/components/Avatar';

export default function PatientsList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // EHR Detail View State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Vitals form
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    bloodPressure: '',
    pulseRate: '',
    respiratoryRate: '',
    oxygenSat: ''
  });

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const data = await api.patients.list(query);
      setPatients(data || []);
    } catch (err) {
      console.error('Error loading patients list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const handleViewPatient = async (id: string) => {
    setSelectedPatientId(id);
    setLoadingDetails(true);
    try {
      const details = await api.patients.get(id);
      setPatientDetails(details);
    } catch (err) {
      console.error('Error fetching EHR details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      await api.patients.recordVitals(selectedPatientId, vitalsForm);
      // Reload details
      const details = await api.patients.get(selectedPatientId);
      setPatientDetails(details);
      setShowVitalsForm(false);
      setVitalsForm({
        temperature: '',
        bloodPressure: '',
        pulseRate: '',
        respiratoryRate: '',
        oxygenSat: ''
      });
    } catch (err) {
      alert('Error updating vitals details.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {selectedPatientId && patientDetails ? (
          // Detailed Patient EHR Timeline
          <div className="space-y-6">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Patient Directory</span>
            </button>

            {/* Patient card details */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <Avatar 
                  firstName={patientDetails.user?.firstName}
                  lastName={patientDetails.user?.lastName}
                  avatarUrl={patientDetails.user?.avatarUrl}
                  size={16}
                  className="border-teal-500 bg-slate-900"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{patientDetails.user?.firstName} {patientDetails.user?.lastName}</h3>
                  <p className="text-xs text-slate-400">DOB: {new Date(patientDetails.dateOfBirth).toLocaleDateString()} | Gender: {patientDetails.gender}</p>
                  <p className="text-[10px] text-teal-400 mt-1 font-mono uppercase">ID: {patientDetails.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <p className="text-slate-400 font-semibold">Blood Type</p>
                  <p className="text-sm font-bold text-teal-400 mt-0.5">{patientDetails.bloodGroup || 'Not set'}</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <p className="text-slate-400 font-semibold">Emergency Contacts</p>
                  <p className="text-sm font-bold text-slate-300 mt-0.5 truncate max-w-[150px]">{patientDetails.emergencyContact || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Core Timelines Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Vitals log */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-lg space-y-6 lg:col-span-1">
                <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-teal-400" />
                    <h4 className="font-bold text-slate-200">Patient Vitals</h4>
                  </div>
                  <button
                    onClick={() => setShowVitalsForm(!showVitalsForm)}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-350"
                  >
                    {showVitalsForm ? 'View Vitals' : 'Record Vitals'}
                  </button>
                </div>

                {showVitalsForm ? (
                  <form onSubmit={handleVitalsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalsForm.temperature}
                        onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                        placeholder="37.2"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Blood Pressure (BP)</label>
                      <input
                        type="text"
                        value={vitalsForm.bloodPressure}
                        onChange={(e) => setVitalsForm({...vitalsForm, bloodPressure: e.target.value})}
                        placeholder="120/80"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Pulse Rate (bpm)</label>
                      <input
                        type="number"
                        value={vitalsForm.pulseRate}
                        onChange={(e) => setVitalsForm({...vitalsForm, pulseRate: e.target.value})}
                        placeholder="72"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Oxygen Saturation (%)</label>
                      <input
                        type="number"
                        value={vitalsForm.oxygenSat}
                        onChange={(e) => setVitalsForm({...vitalsForm, oxygenSat: e.target.value})}
                        placeholder="98"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
                    >
                      Save Vitals
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {patientDetails.vitals?.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No vital records logged.</p>
                    ) : (
                      patientDetails.vitals.slice(0, 5).map((vit: any) => (
                        <div key={vit.id} className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl text-xs space-y-2">
                          <p className="text-[10px] text-slate-500">{new Date(vit.recordedAt).toLocaleString()}</p>
                          <div className="grid grid-cols-2 gap-2 text-slate-350">
                            <p>Temp: <span className="font-bold text-teal-400">{vit.temperature ? `${vit.temperature}°C` : '--'}</span></p>
                            <p>BP: <span className="font-bold text-teal-400">{vit.bloodPressure || '--'}</span></p>
                            <p>Pulse: <span className="font-bold text-teal-400">{vit.pulseRate ? `${vit.pulseRate} bpm` : '--'}</span></p>
                            <p>SpO2: <span className="font-bold text-teal-400">{vit.oxygenSat ? `${vit.oxygenSat}%` : '--'}</span></p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Appointments & Medical Files */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Appointments */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-lg space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-850">
                    <Calendar className="h-5 w-5 text-teal-400" />
                    <h4 className="font-bold text-slate-200">Patient Appointments</h4>
                  </div>
                  
                  {patientDetails.appointments?.length === 0 ? (
                    <p className="text-xs text-slate-500">No scheduled visits.</p>
                  ) : (
                    <div className="divide-y divide-slate-850">
                      {patientDetails.appointments.map((app: any) => (
                        <div key={app.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{new Date(app.dateTime).toLocaleString()}</p>
                            <p className="text-slate-400 mt-0.5">Physician: Dr. {app.doctor?.user?.firstName} {app.doctor?.user?.lastName}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{app.reason}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400' :
                            app.status === 'PENDING' ? 'bg-amber-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medical Reports */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-lg space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-850">
                    <FileText className="h-5 w-5 text-teal-400" />
                    <h4 className="font-bold text-slate-200">Diagnostics & Prescriptions</h4>
                  </div>

                  {patientDetails.medicalReports?.length === 0 ? (
                    <p className="text-xs text-slate-500">No diagnostic reports uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {patientDetails.medicalReports.map((rep: any) => (
                        <div key={rep.id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{rep.title}</p>
                            <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{rep.description || 'No summary notes.'}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-4">
                            <span className="text-[9px] text-slate-500">{new Date(rep.createdAt).toLocaleDateString()}</span>
                            <a
                              href={rep.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-teal-400 hover:text-teal-350 hover:underline"
                            >
                              Download File
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Patients List view
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">Electronic Health Records (EHR)</h2>
                <p className="text-slate-400 text-sm">Access clinical histories, vitals telemetry logs, and diagnostic scans.</p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by patient name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-350 rounded-xl text-sm font-semibold hover:text-slate-100 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {loading ? (
              <div className="flex py-20 justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
              </div>
            ) : patients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients matching search query found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((pat) => {
                  const lastVitals = pat.vitals?.[0];
                  return (
                    <div key={pat.id} className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-md flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={pat.user?.firstName}
                            lastName={pat.user?.lastName}
                            avatarUrl={pat.user?.avatarUrl}
                            size={10}
                            className="border-teal-500 bg-slate-900"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{pat.user?.firstName} {pat.user?.lastName}</h4>
                            <p className="text-[10px] text-slate-400">Blood type: {pat.bloodGroup || 'Not logged'}</p>
                          </div>
                        </div>

                        {/* Recent vitals teaser */}
                        <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl text-[10px] space-y-1 text-slate-400">
                          <p className="font-bold text-[9px] text-slate-500 uppercase tracking-wide">Last Vitals Log</p>
                          {lastVitals ? (
                            <div className="grid grid-cols-2 gap-1 text-slate-350 pt-1">
                              <p>Temp: <span className="text-teal-400 font-semibold">{lastVitals.temperature}°C</span></p>
                              <p>BP: <span className="text-teal-400 font-semibold">{lastVitals.bloodPressure}</span></p>
                              <p>Pulse: <span className="text-teal-400 font-semibold">{lastVitals.pulseRate} bpm</span></p>
                              <p>SpO2: <span className="text-teal-400 font-semibold">{lastVitals.oxygenSat}%</span></p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500 py-1">No clinical readings recorded.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-4">
                        <span className="text-[9px] text-slate-500 font-mono">DOB: {new Date(pat.dateOfBirth).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleViewPatient(pat.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View EHR File</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
