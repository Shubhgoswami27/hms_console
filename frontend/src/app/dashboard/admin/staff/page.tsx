'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Stethoscope, 
  Activity, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Avatar } from '@/components/Avatar';

export default function StaffManagement() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'DOCTOR',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    licenseNumber: '',
    specialization: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await api.staff.list();
      setDoctors(data.doctors || []);
      setNurses(data.nurses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenCreate = () => {
    setEditingStaffId(null);
    setAvatarFile(null);
    setForm({
      email: '',
      password: '',
      role: 'DOCTOR',
      firstName: '',
      lastName: '',
      phone: '',
      department: '',
      licenseNumber: '',
      specialization: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: any, role: string) => {
    setEditingStaffId(staff.user.id);
    setAvatarFile(null);
    setForm({
      email: staff.user.email,
      password: '', // blank password unless resetting
      role: role,
      firstName: staff.user.firstName,
      lastName: staff.user.lastName,
      phone: staff.user.phone || '',
      department: staff.department || '',
      licenseNumber: staff.licenseNumber || '',
      specialization: staff.specialization || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This deletes the user profile and authorization.')) {
      return;
    }

    try {
      await api.staff.delete(userId);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Error deleting staff account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      if (editingStaffId) {
        // Update staff
        await api.staff.update(editingStaffId, formData);
      } else {
        // Create staff
        await api.staff.create(formData);
      }
      setIsModalOpen(false);
      setAvatarFile(null);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to submit staff form.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Manage Staff Directory</h2>
            <p className="text-slate-400 text-sm">Register, edit, or remove Doctors and Nurses profiles.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all text-sm cursor-pointer shadow-lg shadow-teal-500/15"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Staff Account</span>
          </button>
        </div>

        {/* Modal form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-100 mb-6">
                {editingStaffId ? 'Edit Staff Member Details' : 'Add New Staff Account'}
              </h3>
              
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-350 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Smith"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {!editingStaffId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="doctor@hms.com"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">System Role</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={!!editingStaffId}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                    >
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Contact Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      placeholder="Cardiology"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={form.licenseNumber}
                      onChange={handleChange}
                      placeholder="LIC-DOC-7721"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {form.role === 'DOCTOR' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Medical Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="Cardiovascular Surgeon"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Profile Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setAvatarFile(file || null);
                    }}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-teal-400 hover:file:bg-slate-800 cursor-pointer"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/10"
                  >
                    Save Staff Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Directory Listings */}
        {loading ? (
          <div className="flex py-20 justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Doctors Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Stethoscope className="h-5 w-5 text-teal-400" />
                <h3 className="text-md font-bold text-slate-200">Physicians / Doctors ({doctors.length})</h3>
              </div>

              {doctors.length === 0 ? (
                <p className="text-sm text-slate-500">No doctors registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar
                          firstName={doc.user?.firstName}
                          lastName={doc.user?.lastName}
                          avatarUrl={doc.user?.avatarUrl}
                          size={12}
                          className="border-teal-500/40 bg-slate-900"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold truncate text-slate-200">Dr. {doc.user?.firstName} {doc.user?.lastName}</h4>
                          <p className="text-xs text-teal-400 truncate mt-0.5">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-400 mt-2">Lic: {doc.licenseNumber}</p>
                          <p className="text-[10px] text-slate-400">Dept: {doc.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-2">
                        <p className="text-[10px] text-slate-500 truncate">{doc.user?.email}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(doc, 'DOCTOR')}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.user.id)}
                            className="p-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/20 rounded-lg text-rose-400 hover:text-rose-350 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nurses Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity className="h-5 w-5 text-teal-400" />
                <h3 className="text-md font-bold text-slate-200">Nursing Staff ({nurses.length})</h3>
              </div>

              {nurses.length === 0 ? (
                <p className="text-sm text-slate-500">No nurses registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nurses.map((nurse) => (
                    <div key={nurse.id} className="p-6 bg-slate-950 border border-slate-850 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar
                          firstName={nurse.user?.firstName}
                          lastName={nurse.user?.lastName}
                          avatarUrl={nurse.user?.avatarUrl}
                          size={12}
                          className="border-teal-500/40 bg-slate-900"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold truncate text-slate-200">Nurse {nurse.user?.firstName} {nurse.user?.lastName}</h4>
                          <p className="text-xs text-teal-400 truncate mt-0.5">{nurse.department}</p>
                          <p className="text-[10px] text-slate-400 mt-2">Lic: {nurse.licenseNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-2">
                        <p className="text-[10px] text-slate-500 truncate">{nurse.user?.email}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(nurse, 'NURSE')}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(nurse.user.id)}
                            className="p-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/20 rounded-lg text-rose-400 hover:text-rose-350 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
