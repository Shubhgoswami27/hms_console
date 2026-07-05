'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { HeartPulse, User, Mail, Lock, Phone, Calendar, Home, PhoneCall, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Other',
    bloodGroup: 'O+',
    address: '',
    emergencyContact: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.auth.register({
        ...formData,
        role: 'PATIENT' // Registration is always for Patients
      });
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please review fields and retry.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative font-sans">
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10 space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <HeartPulse className="h-10 w-10 text-teal-400 animate-pulse" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">HMS Core</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-350">Create your Patient Account</h2>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto h-16 w-16 bg-teal-950 text-teal-400 rounded-full border border-teal-800 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-teal-400">Registration Successful!</h3>
              <p className="text-slate-400 text-sm">
                Your medical record is created. Redirecting to login in a few seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-start gap-3 text-rose-300 text-xs">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Personal Section */}
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">1. Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane.doe@example.com"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Patient Profile Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-4">2. Medical & Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Contact Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-150"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-150"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Home Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, Zipcode"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Emergency Contact (Name & Phone)</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="John Doe (+1 (555) 123-4567)"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/10 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Submitting registration...' : 'Create Account'}</span>
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-xs text-slate-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline decoration-dotted">
                Sign In instead
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
