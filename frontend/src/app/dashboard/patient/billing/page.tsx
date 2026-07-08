'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Receipt, CheckCircle, CreditCard, Printer, X, Wallet } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'INSURANCE', label: 'Insurance', icon: '🏥' },
];

const formatPaymentMethod = (method?: string) => {
  if (!method) return '—';
  return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
};

export default function PatientBilling() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState<any | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [isPaying, setIsPaying] = useState(false);
  const [receiptBill, setReceiptBill] = useState<any | null>(null);

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

  const handlePayBill = async () => {
    if (!payingBill) return;
    setIsPaying(true);
    try {
      const result = await api.billing.pay(payingBill.id, selectedMethod);
      setPayingBill(null);
      setReceiptBill(result.bill);
      fetchBills();
    } catch (err: any) {
      alert(err.message || 'Error processing invoice payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
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
                  <div key={bill.id} className="py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs">
                    <div className="space-y-1.5">
                      <p className="font-bold text-slate-200">{bill.description}</p>
                      <p className="text-[10px] text-slate-500">Invoice ID: {bill.id.toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                      {isPaid && bill.paymentMethod && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Wallet className="h-3 w-3 text-teal-400" />
                          Paid via {formatPaymentMethod(bill.paymentMethod)}
                          {bill.paidAt && ` · ${new Date(bill.paidAt).toLocaleDateString()}`}
                        </p>
                      )}
                      {isPaid && bill.receiptNumber && (
                        <p className="text-[10px] text-slate-500 font-mono">Receipt: {bill.receiptNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-teal-400 text-sm">${bill.amount.toFixed(2)}</span>
                      {isPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                            <CheckCircle className="h-3 w-3" />
                            <span>PAID</span>
                          </span>
                          <button
                            onClick={() => setReceiptBill(bill)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-slate-100 rounded-xl transition-all cursor-pointer text-[10px] font-semibold"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPayingBill(bill);
                            setSelectedMethod('UPI');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Settle Payment</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {payingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isPaying && setPayingBill(null)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-bold text-slate-100">Select Payment Method</h3>
                  <p className="text-xs text-slate-500 mt-1">Amount due: <span className="text-teal-400 font-bold">${payingBill.amount.toFixed(2)}</span></p>
                </div>
                <button onClick={() => setPayingBill(null)} disabled={isPaying} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-[10px] text-slate-400">{payingBill.description}</p>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === method.value
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={selectedMethod === method.value}
                      onChange={() => setSelectedMethod(method.value)}
                      className="accent-teal-500"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-semibold text-slate-200">{method.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingBill(null)}
                  disabled={isPaying}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayBill}
                  disabled={isPaying}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPaying ? 'Processing...' : `Pay $${payingBill.amount.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {receiptBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:relative print:inset-0 print:p-0">
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm print:hidden" onClick={() => setReceiptBill(null)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-8 shadow-2xl z-10 print:bg-white print:text-black print:border-none print:shadow-none print:w-full print:max-w-none">
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-800 print:border-slate-300 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 print:text-slate-900">Payment Receipt</h3>
                    <p className="text-xs text-slate-500">HMS Medical Center · Billing Department</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-900 print:text-emerald-700 print:border-emerald-300">
                    <CheckCircle className="h-3.5 w-3.5" />
                    PAID
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase print:text-slate-600 mb-1">Patient</h4>
                    <p className="font-bold text-slate-200 print:text-slate-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-slate-500">{user?.email}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-slate-400 uppercase print:text-slate-600 mb-1">Receipt No.</h4>
                    <p className="font-mono font-bold text-slate-200 print:text-slate-800">{receiptBill.receiptNumber || '—'}</p>
                    <p className="text-slate-500 mt-1">
                      {receiptBill.paidAt
                        ? new Date(receiptBill.paidAt).toLocaleString()
                        : new Date(receiptBill.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl print:bg-slate-50 print:border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Invoice ID</span>
                    <span className="font-mono text-slate-300 print:text-slate-700">{receiptBill.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-bold text-slate-200 print:text-slate-800">{formatPaymentMethod(receiptBill.paymentMethod)}</span>
                  </div>
                  <div className="border-t border-slate-850 print:border-slate-200 pt-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase print:text-slate-600 mb-2">Service Details</h4>
                    <p className="text-xs text-slate-350 print:text-slate-700 leading-relaxed">{receiptBill.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 print:border-slate-300 pt-4">
                  <span className="text-sm font-bold text-slate-400 print:text-slate-600">Total Paid</span>
                  <span className="text-xl font-bold text-teal-400 print:text-slate-900">${receiptBill.amount.toFixed(2)}</span>
                </div>

                <p className="text-[10px] text-slate-500 text-center print:text-slate-400">
                  This is an official payment receipt from HMS Medical Center. Thank you for your payment.
                </p>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-850 print:hidden">
                <button
                  type="button"
                  onClick={() => setReceiptBill(null)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
