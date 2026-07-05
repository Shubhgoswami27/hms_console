'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Receipt, CheckCircle, Clock } from 'lucide-react';

export default function PatientBilling() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await api.billing.list();
      setBills(data || []);
    } catch (err) {
      console.error('Error fetching patient bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayBill = async (billId: string) => {
    try {
      await api.billing.pay(billId);
      fetchBills();
    } catch (err) {
      alert('Error processing invoice payment.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Invoices & Statements</h2>
          <p className="text-slate-400 text-sm">Review your hospital stay billing and transaction histories.</p>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : bills.length === 0 ? (
          <p className="text-xs text-slate-500">You have no statements billed.</p>
        ) : (
          <div className="p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-lg">
            <div className="divide-y divide-slate-850">
              {bills.map((bill) => {
                const isPaid = bill.status === 'PAID';
                return (
                  <div key={bill.id} className="py-4 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-200">{bill.description}</p>
                      <p className="text-[10px] text-slate-500">Invoice ID: {bill.id.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-teal-400 text-sm">${bill.amount.toFixed(2)}</span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                          <CheckCircle className="h-3 w-3" />
                          <span>PAID</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayBill(bill.id)}
                          className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                        >
                          Settle payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
