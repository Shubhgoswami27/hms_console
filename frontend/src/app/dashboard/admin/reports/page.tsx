'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { FileText, Search, Loader2 } from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportRes = await api.reports.list();
        setReports(reportRes || []);
      } catch (err) {
        console.error('Error fetching clinical reports archive:', err);
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Medical Reports Archive</h2>
          <p className="text-slate-400 text-sm">Central electronic health records storage for lab values and clinical logs.</p>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <Loader2 className="animate-spin h-6 w-6 text-teal-400" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-500">No medical reports found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rep) => (
              <div key={rep.id} className="p-5 bg-slate-950 border border-slate-850 rounded-3xl flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex justify-between items-start pb-2 border-b border-slate-900">
                    <h4 className="text-xs font-bold text-slate-200">{rep.title}</h4>
                    <FileText className="h-4 w-4 text-teal-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{rep.description}</p>
                  
                  <div className="mt-4 space-y-1 text-[9px] text-slate-500">
                    <p>Patient: <strong className="text-slate-400">{rep.patient?.user?.firstName} {rep.patient?.user?.lastName}</strong></p>
                    <p>Doctor: <strong className="text-slate-400">Dr. {rep.doctor?.user?.firstName} {rep.doctor?.user?.lastName}</strong></p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-4 text-[9px] text-slate-500">
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  <a
                    href={rep.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-teal-400 hover:text-teal-350 hover:underline"
                  >
                    Download PDF
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
