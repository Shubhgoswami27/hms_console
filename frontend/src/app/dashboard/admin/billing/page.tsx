'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { Receipt, Plus, Printer, CheckCircle, Clock, Search, ShieldAlert, DollarSign } from 'lucide-react';

export default function BillingManagement() {
  const [bills, setBills] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  // Bill Creation Form
  const [form, setForm] = useState({
    patientId: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const billData = await api.billing.list();
      setBedsAndBills(billData);
      const patientData = await api.patients.list();
      setPatients(patientData || []);
    } catch (err) {
      console.error('Error fetching billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  const setBedsAndBills = (data: any[]) => {
    setBills(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.billing.create(form);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating patient invoice.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 print:p-0 print:m-0">
        {/* Hide header and dashboard controls when printing */}
        <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Billing & Financial Invoices</h2>
            <p className="text-slate-400 text-sm">Issue receipts, track pending stays, and record patient transaction histories.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all text-sm cursor-pointer shadow-lg shadow-teal-500/15"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Generate Patient Invoice</span>
          </button>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center print:hidden">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg print:hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-4">Invoice ID</th>
                    <th className="py-4">Patient Name</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Due Date</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50">
                  {bills.map((bill) => {
                    const isPaid = bill.status === 'PAID';
                    return (
                      <tr key={bill.id} className="text-slate-300 hover:bg-slate-900/40">
                        <td className="py-4 font-mono text-[10px] text-slate-500">{bill.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-4 font-bold text-slate-200">
                          {bill.patient?.user?.firstName} {bill.patient?.user?.lastName}
                        </td>
                        <td className="py-4 font-bold text-teal-400">${bill.amount.toFixed(2)}</td>
                        <td className="py-4 text-slate-450">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            isPaid ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-450 border border-amber-900'
                          }`}>
                            {isPaid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            <span>{bill.status}</span>
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setSelectedInvoice(bill)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-350 hover:text-slate-200 rounded-xl transition-all cursor-pointer text-[10px]"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>Preview Invoice</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Generate Invoice Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <form onSubmit={handleCreateSubmit} className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-4">
              <h3 className="text-md font-bold text-slate-100 mb-4">Generate Patient Invoice</h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Patient Profile</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="120.00"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Payment Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Service Breakdown Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Billing details (e.g., General ward stay, diagnostic consultation, laboratory ECG scan fees)"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none h-24"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Premium Printable Invoice Preview Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:relative print:inset-0 print:p-0 print:z-0">
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm print:hidden" onClick={() => setSelectedInvoice(null)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-8 shadow-2xl z-10 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none print:p-0">
              
              {/* Invoice Layout */}
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-800 print:border-slate-300 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 print:text-slate-900">HMS Core Clinical Invoice</h3>
                    <p className="text-xs text-slate-500">Invoice ID: {selectedInvoice.id.toUpperCase()}</p>
                    <p className="text-xs text-slate-500">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                      selectedInvoice.status === 'PAID' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' : 'bg-amber-950/60 text-amber-450 border border-amber-900'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase print:text-slate-600 mb-1">To: Patient</h4>
                    <p className="font-bold text-slate-200 print:text-slate-800">
                      {selectedInvoice.patient?.user?.firstName} {selectedInvoice.patient?.user?.lastName}
                    </p>
                    <p className="text-slate-500">{selectedInvoice.patient?.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-slate-400 uppercase print:text-slate-600 mb-1">From: Facility</h4>
                    <p className="font-bold text-slate-200 print:text-slate-800">HMS Medical Center</p>
                    <p className="text-slate-500">Billing Department</p>
                  </div>
                </div>

                {/* Description Table */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl print:bg-slate-50 print:border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase print:text-slate-600 mb-2">Service Details</h4>
                  <p className="text-xs text-slate-350 print:text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedInvoice.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 print:border-slate-300 pt-4 text-sm font-bold">
                  <span className="text-slate-400 print:text-slate-600">Total Invoice Amount:</span>
                  <span className="text-xl text-teal-400 print:text-slate-900">${selectedInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-850 print:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  <Printer className="h-4.5 w-4.5" />
                  <span>Print Receipt (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
