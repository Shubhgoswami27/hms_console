'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { 
  Users, 
  BedDouble, 
  Boxes, 
  DollarSign, 
  Activity,
  HeartPulse,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    staffCount: 0,
    patientCount: 0,
    bedCount: 0,
    occupiedBeds: 0,
    maintenanceBeds: 0,
    totalRevenue: 0,
    pendingInvoicesCount: 0,
    criticalResources: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const staffRes = await api.staff.list();
        const patientRes = await api.patients.list();
        const bedRes = await api.beds.list();
        const resourceRes = await api.resources.list();
        const billRes = await api.billing.list();

        const doctorsCount = staffRes.doctors.length;
        const nursesCount = staffRes.nurses.length;
        const beds = bedRes.length;
        const occupied = bedRes.filter((b: any) => b.status === 'OCCUPIED').length;
        const maintenance = bedRes.filter((b: any) => b.status === 'MAINTENANCE').length;
        const critical = resourceRes.filter((r: any) => r.status === 'OUT_OF_STOCK' || r.status === 'MAINTENANCE').length;
        
        let revenue = 0;
        let pending = 0;
        billRes.forEach((bill: any) => {
          if (bill.status === 'PAID') {
            revenue += bill.amount;
          } else {
            pending += 1;
          }
        });

        setStats({
          staffCount: doctorsCount + nursesCount,
          patientCount: patientRes.length,
          bedCount: beds,
          occupiedBeds: occupied,
          maintenanceBeds: maintenance,
          totalRevenue: revenue,
          pendingInvoicesCount: pending,
          criticalResources: critical
        });
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Mock revenue monthly telemetry
  const chartData = [
    { name: 'Jan', Revenue: 4000 },
    { name: 'Feb', Revenue: 5500 },
    { name: 'Mar', Revenue: 6200 },
    { name: 'Apr', Revenue: 8200 },
    { name: 'May', Revenue: 9500 },
    { name: 'Jun', Revenue: 11200 },
    { name: 'Jul', Revenue: 12500 }
  ];

  // Bed details data for PieChart
  const bedStatusData = [
    { name: 'Available', value: stats.bedCount - stats.occupiedBeds - stats.maintenanceBeds },
    { name: 'Occupied', value: stats.occupiedBeds },
    { name: 'Maintenance', value: stats.maintenanceBeds }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Overview Dashboard</h2>
          <p className="text-slate-400 text-sm">System status logs, health tracking and billing analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Hospital Staff</p>
              <p className="text-3xl font-extrabold text-teal-400">{loading ? '...' : stats.staffCount}</p>
              <p className="text-[10px] text-slate-500">Doctors & Nurses active</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-teal-950/50 border border-teal-900 flex items-center justify-center text-teal-400">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bed Occupancy</p>
              <p className="text-3xl font-extrabold text-amber-400">
                {loading ? '...' : `${stats.occupiedBeds}/${stats.bedCount}`}
              </p>
              <p className="text-[10px] text-slate-500">Active ward occupancy</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-950/50 border border-amber-900 flex items-center justify-center text-amber-400">
              <BedDouble className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-extrabold text-emerald-400">
                {loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
              </p>
              <p className="text-[10px] text-slate-500">Cleared client invoices</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-950/50 border border-emerald-900 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Asset Alert</p>
              <p className="text-3xl font-extrabold text-rose-450">{loading ? '...' : stats.criticalResources}</p>
              <p className="text-[10px] text-slate-500">Equipment in maintenance</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-950/50 border border-rose-900 flex items-center justify-center text-rose-400">
              <Boxes className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl lg:col-span-2 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-md font-bold text-slate-200">Revenue Stream Analysis</h3>
                <p className="text-xs text-slate-400">Monthly breakdown of paid medical transactions</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+12.4% MoM</span>
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bed Allocation PieChart */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl shadow-lg flex flex-col">
            <h3 className="text-md font-bold text-slate-200 mb-2">Beds Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">Current ward occupancy distribution</p>
            <div className="flex-1 h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bedStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Operational Guidelines Banner */}
        <div className="p-5 bg-gradient-to-r from-teal-950/30 to-cyan-950/30 border border-teal-900/40 rounded-3xl flex items-start gap-4">
          <HeartPulse className="h-6 w-6 text-teal-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-200">Real-Time Sync Activated</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The administrator console is currently synchronized with the hospital gateway. Active nurse call requests and real-time bed checkouts will display instantly.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
