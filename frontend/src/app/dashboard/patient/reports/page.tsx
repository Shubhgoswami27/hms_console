'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { FileText, Download } from 'lucide-react';

export default function PatientReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.reports.list();
        setReports(data || []);
      } catch (err) {
        console.error('Error loading patient medical files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Diagnostics & Reports Archive</h2>
          <p className="text-slate-400 text-sm">Review clinical diagnostic scan documents and physician prescription summaries.</p>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-500">No medical diagnostic documents cataloged.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
              <div key={rep.id} className="p-5 bg-slate-950 border border-slate-855 rounded-3xl flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex justify-between items-start pb-2 border-b border-slate-900">
                    <h4 className="text-xs font-bold text-slate-200">{rep.title}</h4>
                    <FileText className="h-4 w-4 text-teal-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{rep.description}</p>
                  <p className="text-[9px] text-slate-500 mt-4 font-semibold">
                    Attending Physician: Dr. {rep.doctor?.user?.firstName} {rep.doctor?.user?.lastName}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-4 text-[9px] text-slate-500">
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  <a
                    href={rep.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-400 hover:text-teal-350 hover:underline"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download file</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
