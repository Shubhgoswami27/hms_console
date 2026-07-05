import React from 'react';
import Link from 'next/link';
import { 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  BedDouble, 
  Receipt, 
  Boxes,
  ArrowRight,
  Stethoscope,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-teal-400 animate-pulse" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">HMS Core</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
          >
            <span>Register Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-2xl text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-teal-400 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-teal-400" />
            <span>Next-Generation Healthcare Information System</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Seamless Logistics for{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-500 bg-clip-text text-transparent">
              Modern Hospitals
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            HMS Core brings secure role-based controls, electronic medical records (EHR), real-time ward bed occupancies, live nurse call dispatch systems, and instant invoices together into a unified cloud workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/register" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-900 text-slate-100 hover:bg-slate-800 transition-colors border border-slate-800"
            >
              <span>Patient Pre-Registration</span>
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="flex-1 relative w-full max-w-lg aspect-square md:aspect-auto md:h-[450px] rounded-3xl bg-slate-900/50 border border-slate-800/80 p-8 flex flex-col justify-between overflow-hidden shadow-2xl shadow-slate-950">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-bold text-slate-200">ICU Core Telemetry</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-900">Connected</span>
          </div>

          {/* Simple Mock stats inside Hero */}
          <div className="space-y-6 my-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/50">
                <p className="text-xs text-slate-400">Total ICU Bed Capacity</p>
                <p className="text-2xl font-bold text-teal-400 mt-1">12 / 15</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/50">
                <p className="text-xs text-slate-400">Nurse Call Queue</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">0 Active</p>
                <p className="text-[10px] text-slate-400 mt-2">Median response: 1.8 mins</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Stethoscope className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Dr. John Smith</p>
                  <p className="text-[10px] text-slate-400">Cardiology Specialist</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-teal-950 text-teal-400 text-[10px] font-semibold border border-teal-900">On Duty</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center">
            HMS Platform Core v1.0.0. Realtime sync enabled.
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 w-full bg-slate-950 border-t border-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Key Hospital Operations Modules</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Explore custom workflows designed for administrators, physicians, patient registration, and nursing personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Role-Based Access (RBAC)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated interfaces for Super Admins, Doctors, Nurses, and Patients, restricting medical details, logs, and billing features cleanly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <BedDouble className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Real-Time Bed Monitoring</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Live interactive ward map tracking ICU, Emergency, General, and Private rooms. Instantly broadcast updates across all terminals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Live Nurse Call Gateway</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Patients trigger alerts instantly with bed numbers, flashing emergency notices directly to the nursing station in real time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Billing & Invoices</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate breakdown statements for hospital stays. Patients pay digitally via simple checkouts, and print invoices directly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Diagnostic Records</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Physicians upload health files, diagnostic PDFs, and prescriptions, maintaining secure, searchable patient timelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-850 hover:border-teal-500/25 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Boxes className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mt-6 mb-2">Logistics Inventory</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Monitor and allocate ambulances, portable oxygen units, emergency ventilators, and transport wheelchairs across departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-8 px-6 text-center text-slate-500 text-xs">
        <p>© 2026 Hospital Management System Core. Developed using Next.js, Prisma, and Socket.io.</p>
      </footer>
    </div>
  );
}
