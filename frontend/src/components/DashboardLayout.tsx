'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from './Avatar';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BedDouble, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  HeartPulse, 
  Receipt, 
  Settings, 
  ShieldAlert,
  Boxes,
  BellRing
} from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <HeartPulse className="mx-auto h-12 w-12 animate-pulse text-rose-500" />
          <h2 className="mt-4 text-xl font-semibold">Verifying credentials...</h2>
        </div>
      </div>
    );
  }

  // Generate links based on Role
  const getLinks = (): SidebarLink[] => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Overview', href: '/dashboard/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Manage Staff', href: '/dashboard/admin/staff', icon: <Users className="h-5 w-5" /> },
          { label: 'Patients List', href: '/dashboard/admin/patients', icon: <HeartPulse className="h-5 w-5" /> },
          { label: 'Beds Availability', href: '/dashboard/admin/beds', icon: <BedDouble className="h-5 w-5" /> },
          { label: 'Equipment Stock', href: '/dashboard/admin/resources', icon: <Boxes className="h-5 w-5" /> },
          { label: 'Invoices', href: '/dashboard/admin/billing', icon: <Receipt className="h-5 w-5" /> },
          { label: 'Medical Reports', href: '/dashboard/admin/reports', icon: <FileText className="h-5 w-5" /> }
        ];
      case 'DOCTOR':
        return [
          { label: 'My Console', href: '/dashboard/doctor', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'My Appointments', href: '/dashboard/doctor/appointments', icon: <Calendar className="h-5 w-5" /> },
          { label: 'EHR Directory', href: '/dashboard/doctor/patients', icon: <HeartPulse className="h-5 w-5" /> },
          { label: 'Medical Reports', href: '/dashboard/doctor/reports', icon: <FileText className="h-5 w-5" /> }
        ];
      case 'NURSE':
        return [
          { label: 'Nurse Station', href: '/dashboard/nurse', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Bed Map', href: '/dashboard/nurse/beds', icon: <BedDouble className="h-5 w-5" /> },
          { label: 'Resources Inventory', href: '/dashboard/nurse/resources', icon: <Boxes className="h-5 w-5" /> }
        ];
      case 'PATIENT':
        return [
          { label: 'Patient Portal', href: '/dashboard/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Book Appointment', href: '/dashboard/patient/book', icon: <Calendar className="h-5 w-5" /> },
          { label: 'My Bills', href: '/dashboard/patient/billing', icon: <Receipt className="h-5 w-5" /> },
          { label: 'Medical Records', href: '/dashboard/patient/reports', icon: <FileText className="h-5 w-5" /> }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  const getRoleLabel = () => {
    switch (user.role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'DOCTOR': return 'Doctor Console';
      case 'NURSE': return 'Nurse Station';
      case 'PATIENT': return 'Patient Portal';
      default: return 'User';
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-slate-900 overflow-hidden text-slate-100 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col h-full max-h-full bg-slate-950 border-r border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <HeartPulse className="h-8 w-8 text-teal-400 animate-pulse" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">HMS Console</span>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-700/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800/80 mb-3">
            <Avatar 
              firstName={user.firstName}
              lastName={user.lastName}
              avatarUrl={user.avatarUrl}
              size={10}
              className="border-teal-500 bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-950/30"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-72 max-w-xs flex flex-col h-full bg-slate-950 border-r border-slate-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-7 w-7 text-teal-400 animate-pulse" />
                <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">HMS Console</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-teal-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800/80 mb-3">
                <Avatar 
                  firstName={user.firstName}
                  lastName={user.lastName}
                  avatarUrl={user.avatarUrl}
                  size={10}
                  className="border-teal-500"
                />
                <div>
                  <p className="text-sm font-semibold truncate text-slate-200">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden bg-slate-900">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">{getRoleLabel()}</h1>
              <p className="hidden sm:block text-xs text-slate-400">Hospital Information & Logistics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span className="font-medium text-slate-300">Live Gateway Sync</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-6 md:p-8 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
};
