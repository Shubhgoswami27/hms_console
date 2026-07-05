'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role);
    }
  }, [user]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': router.push('/dashboard/admin'); break;
      case 'DOCTOR': router.push('/dashboard/doctor'); break;
      case 'NURSE': router.push('/dashboard/nurse'); break;
      case 'PATIENT': router.push('/dashboard/patient'); break;
      default: router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Quick fill testing helper
  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <HeartPulse className="h-10 w-10 text-teal-400 animate-pulse" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">HMS Core</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-350 mt-1">Sign in to your console</h2>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3 text-rose-300 text-xs">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-slate-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            New patient?{' '}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 font-semibold underline decoration-dotted">
              Register here
            </Link>
          </p>
        </div>

        {/* Quick Fill Box for Testing */}
        <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl">
          <p className="text-center text-xs font-bold text-teal-400 mb-3 tracking-wide uppercase">Quick Testing Logins</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickFill('admin@hms.com')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-slate-200">Super Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@hms.com</p>
            </button>
            <button
              onClick={() => handleQuickFill('john.smith@hms.com')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-slate-200">Doctor (Cardiology)</p>
              <p className="text-[10px] text-slate-500 truncate">john.smith@hms.com</p>
            </button>
            <button
              onClick={() => handleQuickFill('emily.watson@hms.com')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-slate-200">Nurse (General)</p>
              <p className="text-[10px] text-slate-500 truncate">emily.watson@hms.com</p>
            </button>
            <button
              onClick={() => handleQuickFill('jane.doe@hms.com')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-colors cursor-pointer"
            >
              <p className="font-bold text-slate-200">Patient (Jane Doe)</p>
              <p className="text-[10px] text-slate-500 truncate">jane.doe@hms.com</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-3">All test accounts use password: <code className="text-teal-400 font-mono">password123</code></p>
        </div>
      </div>
    </div>
  );
}
