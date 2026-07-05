'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { FileText, Upload, Check, AlertCircle, FileUp, Loader2 } from 'lucide-react';

export default function DoctorReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    patientId: '',
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReportsAndPatients = async () => {
    setLoading(true);
    try {
      const reportRes = await api.reports.list();
      setReports(reportRes || []);

      const patientRes = await api.patients.list();
      setPatients(patientRes || []);
    } catch (err) {
      console.error('Error fetching clinical reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndPatients();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !selectedFile) {
      setErrorMsg('Please select a patient, enter a title, and select a file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('patientId', form.patientId);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('file', selectedFile);

    try {
      await api.reports.upload(formData);
      setSuccessMsg('Medical report uploaded successfully!');
      setForm({ patientId: '', title: '', description: '' });
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById('report-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload
      fetchReportsAndPatients();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading report file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Medical Reports Repository</h2>
          <p className="text-slate-400 text-sm">Upload clinical diagnostics, lab results, scans, and patient prescriptions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg h-fit">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-900 pb-3 mb-6">Upload Medical Document</h3>
            
            {successMsg && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/45 border border-emerald-900 text-emerald-450 text-xs">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-4 rounded-xl bg-rose-955/20 border border-rose-900 text-rose-350 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Patient Profile</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs focus:outline-none"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.user?.firstName} {pat.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Document Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. ECG Diagnostic Scan"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Summary description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Clinical assessment summary..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs focus:outline-none h-20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Attach Document (PDF/Image)</label>
                <div className="relative group border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-teal-500/50 transition-colors">
                  <input
                    type="file"
                    id="report-file-input"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <FileUp className="mx-auto h-8 w-8 text-slate-500 group-hover:text-teal-400 transition-colors mb-2" />
                  <p className="text-xs text-slate-400">
                    {selectedFile ? selectedFile.name : 'Drag & drop file or click to browse'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-teal-500/10 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Syncing file...</span>
                  </>
                ) : (
                  <span>Upload & Catalog Document</span>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Reports Catalog */}
          <div className="lg:col-span-2 p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg space-y-4 h-fit">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-900 pb-3">Document Archive</h3>
            
            {loading ? (
              <div className="flex py-20 justify-center items-center">
                <Loader2 className="animate-spin h-6 w-6 text-teal-400" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No diagnostic files cataloged in archive.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col justify-between shadow">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-200">{rep.title}</h4>
                        <FileText className="h-4 w-4 text-teal-400 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed">{rep.description || 'No summary notes.'}</p>
                      <p className="text-[9px] text-slate-500 mt-3 font-semibold">
                        Patient: {rep.patient?.user?.firstName} {rep.patient?.user?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-4 text-[9px] text-slate-500">
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                      <a
                        href={rep.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-teal-400 hover:text-teal-350 hover:underline"
                      >
                        Download Scan
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
