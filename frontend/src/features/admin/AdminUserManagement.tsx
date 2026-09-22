import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, UserCheck, UserMinus, ShieldCheck,
  Search, Filter, Edit3, Trash2, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, UserPlus,
  Key, Eye, EyeOff, Building, Package, HandCoins,
  RefreshCw, X, MoreVertical, Shield, Mail,
  Calendar, Phone, Lock, ExternalLink
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

export interface UserItem {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Owner' | 'Agent' | 'Seller' | 'Tenant' | 'Buyer' | 'RentalManager';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  listings_count: number;
  offers_count: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  agents: number;
  sellers: number;
  owners: number;
  tenants: number;
  buyers: number;
}

const ROLES_LIST = [
  { role: 'Admin', label: 'Administrator', desc: 'Full sovereign platform control and compliance auditing', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { role: 'Agent', label: 'Certified Agent', desc: 'Manages physical site visits, viewings, and negotiations', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { role: 'Seller', label: 'Asset Seller', desc: 'Lists real estate parcels, villas, and vehicle fleets', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { role: 'Owner', label: 'Property Owner', desc: 'Manages long-term estate portfolio and title deeds', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { role: 'Buyer', label: 'Verified Buyer', desc: 'Explores catalog, submits escrow offers, and purchases', color: 'border-teal-500/40 text-teal-400 bg-teal-500/10' },
  { role: 'Tenant', label: 'Tenant / Resident', desc: 'Rents residential or commercial spaces with lease tracking', color: 'border-zinc-500/40 text-zinc-300 bg-zinc-500/10' },
];

export const AdminUserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Action State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'role' | 'password' | 'status' | 'delete' | 'drawer' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form States
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'Buyer',
    is_active: true,
    is_staff: false,
  });

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'Buyer',
    is_active: true,
    is_staff: false,
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 1. Fetch Users Query
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.admin.users.list(params);
      return res.data;
    },
    retry: 2,
  });

  const users: UserItem[] = Array.isArray(data) ? data : (data?.users || []);
  const stats: UserStats = data?.stats || {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'Admin').length,
    agents: users.filter(u => u.role === 'Agent').length,
    sellers: users.filter(u => u.role === 'Seller').length,
    owners: users.filter(u => u.role === 'Owner').length,
    tenants: users.filter(u => u.role === 'Tenant').length,
    buyers: users.filter(u => u.role === 'Buyer').length,
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // 2. Create User Mutation
  const createMutation = useMutation({
    mutationFn: (userData: any) => api.admin.users.create(userData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      setCreateForm({
        username: '', email: '', password: '', first_name: '',
        last_name: '', role: 'Buyer', is_active: true, is_staff: false,
      });
      showToast(res.data?.message || 'User created successfully!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || err.response?.data?.username?.[0] || 'Error creating user.';
      showToast(errDetail, 'error');
    }
  });

  // 3. Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.admin.users.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast(res.data?.message || 'User profile updated!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Error updating user.';
      showToast(errDetail, 'error');
    }
  });

  // 4. Set Role Mutation
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => api.admin.users.setRole(id, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast(res.data?.message || 'User role successfully updated!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to update role.';
      showToast(errDetail, 'error');
    }
  });

  // 5. Toggle Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active?: boolean }) =>
      api.admin.users.toggleStatus(id, is_active),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast(res.data?.message || 'Account status updated!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to update account status.';
      showToast(errDetail, 'error');
    }
  });

  // 6. Reset Password Mutation
  const passwordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      api.admin.users.resetPassword(id, password),
    onSuccess: (res) => {
      setActiveModal(null);
      setNewPassword('');
      showToast(res.data?.message || 'Password reset successfully!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to reset password.';
      showToast(errDetail, 'error');
    }
  });

  // 7. Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.users.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast(res.data?.message || 'User deleted successfully!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to delete user account.';
      showToast(errDetail, 'error');
    }
  });

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setEditForm({
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      is_active: u.is_active,
      is_staff: u.is_staff,
    });
    setActiveModal('edit');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#05070b] min-h-screen text-zinc-100 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* TOAST FEEDBACK NOTIFICATION */}
        {feedbackMessage && (
          <div className={cn(
            "fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn",
            feedbackMessage.type === 'success'
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
              : "bg-red-950/90 text-red-300 border-red-500/40"
          )}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} />
              Identity & Access Governance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              User <span className="text-emerald-400">Registry</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Manage permissions, assign roles, enforce platform security, and audit identity lifecycles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              title="Refresh roster"
            >
              <RefreshCw size={18} className={cn(isRefetching && "animate-spin text-emerald-400")} />
            </button>
            <Button
              variant="primary"
              onClick={() => setActiveModal('create')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95"
            >
              <UserPlus size={18} />
              <span>Add New User</span>
            </Button>
          </div>
        </div>

        {/* KPI ANALYTICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: User, color: 'text-white bg-white/5 border-white/10' },
            { label: 'Active Now', value: stats.active, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Agents', value: stats.agents, icon: Building, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Sellers', value: stats.sellers, icon: Package, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Suspended', value: stats.inactive, icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between group hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{item.label}</span>
                  <div className={cn("p-1.5 rounded-lg border", item.color)}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {isLoading ? '...' : item.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTER & SEARCH CONTROL BAR */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by username, email, or full name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300 outline-none focus:border-emerald-500/50"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Agent">Agent</option>
              <option value="Seller">Seller</option>
              <option value="Owner">Owner</option>
              <option value="Buyer">Buyer</option>
              <option value="Tenant">Tenant</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300 outline-none focus:border-emerald-500/50"
            >
              <option value="">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended / Inactive</option>
            </select>

            {(searchQuery || roleFilter || statusFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); }}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* USERS ROSTER TABLE */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.01] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <User size={18} className="text-emerald-400" />
              <h3 className="font-bold text-white text-base sm:text-lg">Registered User Accounts</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Showing {users.length} {users.length === 1 ? 'account' : 'accounts'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.01]">
                  <th className="px-5 py-3.5 font-semibold">User Identity</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned Role</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Portfolio</th>
                  <th className="px-5 py-3.5 font-semibold">Registered</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-zinc-500">
                      <RefreshCw size={24} className="mx-auto animate-spin text-emerald-400 mb-2" />
                      Loading user records from database...
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-red-400">
                      <AlertCircle size={30} className="mx-auto text-red-400 mb-2" />
                      <p className="text-sm font-semibold">Unable to fetch users from server.</p>
                      <p className="text-xs text-zinc-400 mt-1">{(error as any)?.message || 'Database connection error'}</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs hover:bg-red-500/20 transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Retry Connection
                      </button>
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && users.map((user) => {
                  const fullName = `${user.first_name} ${user.last_name}`.trim();
                  const roleConfig = ROLES_LIST.find(r => r.role === user.role) || ROLES_LIST[4];

                  return (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {user.username.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                {user.username}
                              </span>
                              {user.is_superuser && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                                  Superuser
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-zinc-500" />
                              {user.email || 'No email registered'}
                            </p>
                            {fullName && <p className="text-[11px] text-zinc-500">{fullName}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1", roleConfig.color)}>
                          <Shield size={10} />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", user.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
                          <span className={cn("text-xs font-semibold", user.is_active ? "text-emerald-400" : "text-red-400")}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>

                      {/* Portfolio */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-3 text-xs text-zinc-400 font-mono">
                          <span title="Listings Owned" className="flex items-center gap-1">
                            <Package size={12} className="text-zinc-500" />
                            {user.listings_count}
                          </span>
                          <span title="Offers Placed" className="flex items-center gap-1">
                            <HandCoins size={12} className="text-zinc-500" />
                            {user.offers_count}
                          </span>
                        </div>
                      </td>

                      {/* Registered */}
                      <td className="px-5 py-4 text-xs text-zinc-400 font-mono">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Action Controls */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details Drawer */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('drawer'); }}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-emerald-500/30 hover:text-emerald-400 text-zinc-400 transition-colors"
                            title="Inspect User Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Role Transition */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('role'); }}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-amber-500/30 hover:text-amber-400 text-zinc-400 transition-colors"
                            title="Assign Role"
                          >
                            <ShieldCheck size={15} />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-blue-500/30 hover:text-blue-400 text-zinc-400 transition-colors"
                            title="Edit Account"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('password'); }}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-purple-500/30 hover:text-purple-400 text-zinc-400 transition-colors"
                            title="Reset Password"
                          >
                            <Key size={15} />
                          </button>

                          {/* Toggle Status (Activate / Suspend) */}
                          {!user.is_superuser && (
                            <button
                              onClick={() => { setSelectedUser(user); setActiveModal('status'); }}
                              className={cn(
                                "p-1.5 rounded-lg border transition-colors",
                                user.is_active
                                  ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              )}
                              title={user.is_active ? "Suspend Account" : "Activate Account"}
                            >
                              {user.is_active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                            </button>
                          )}

                          {/* Delete */}
                          {!user.is_superuser && (
                            <button
                              onClick={() => { setSelectedUser(user); setActiveModal('delete'); }}
                              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-red-500/40 hover:text-red-400 text-zinc-400 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!isLoading && !isError && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-zinc-500">
                      <User size={36} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-sm text-zinc-400">No user accounts matched your search criteria.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); }}
                        className="mt-3 text-xs text-emerald-400 hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── MODAL 1: CREATE NEW USER ── */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-white text-lg">Add New User Account</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(createForm);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="e.g. kigali_investor"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="name@urugwiro.rw"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Initial Password * (minimum 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Assign Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-white outline-none"
                >
                  <option value="Buyer" className="bg-[#0b0e14]">Verified Buyer</option>
                  <option value="Seller" className="bg-[#0b0e14]">Asset Seller</option>
                  <option value="Agent" className="bg-[#0b0e14]">Certified Agent</option>
                  <option value="Owner" className="bg-[#0b0e14]">Property Owner</option>
                  <option value="Admin" className="bg-[#0b0e14]">Platform Administrator</option>
                  <option value="Tenant" className="bg-[#0b0e14]">Tenant</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Activate immediately upon creation</span>
                </label>
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_staff}
                    onChange={(e) => setCreateForm({ ...createForm, is_staff: e.target.checked })}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Grant Staff Access</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT USER DETAILS ── */}
      {activeModal === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Edit User Account</h3>
                  <p className="text-xs text-zinc-400">Updating profile for @{selectedUser.username}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({ id: selectedUser.id, data: editForm });
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Role Assignment</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-white outline-none"
                >
                  <option value="Admin" className="bg-[#0b0e14]">Admin</option>
                  <option value="Agent" className="bg-[#0b0e14]">Agent</option>
                  <option value="Seller" className="bg-[#0b0e14]">Seller</option>
                  <option value="Owner" className="bg-[#0b0e14]">Owner</option>
                  <option value="Buyer" className="bg-[#0b0e14]">Buyer</option>
                  <option value="Tenant" className="bg-[#0b0e14]">Tenant</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Account is Active</span>
                </label>
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_staff}
                    onChange={(e) => setEditForm({ ...editForm, is_staff: e.target.checked })}
                    className="rounded border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Staff Permissions</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ROLE TRANSITION ── */}
      {activeModal === 'role' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Change User Role</h3>
                  <p className="text-xs text-zinc-400">Current Role: <span className="text-white font-mono">{selectedUser.role}</span></p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-300">
                Select the target operational role for <span className="text-emerald-400 font-semibold">@{selectedUser.username}</span>. Assigning Admin grants platform oversight, while Seller/Owner automatically provisions a verified listing profile.
              </p>

              <div className="space-y-2.5">
                {ROLES_LIST.map((r) => {
                  const isCurrent = selectedUser.role === r.role;
                  return (
                    <div
                      key={r.role}
                      onClick={() => !isCurrent && roleMutation.mutate({ id: selectedUser.id, role: r.role })}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all flex items-center justify-between",
                        isCurrent
                          ? "bg-white/[0.04] border-white/20 opacity-60 cursor-default"
                          : "bg-white/[0.02] border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.05] cursor-pointer"
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{r.label}</span>
                          <span className={cn("text-[9px] font-mono px-2 py-0.2 rounded-full border", r.color)}>
                            {r.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{r.desc}</p>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] text-zinc-500 font-mono">Current</span>
                      ) : (
                        <ChevronRight size={16} className="text-zinc-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RESET PASSWORD ── */}
      {activeModal === 'password' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Key size={20} />
                </div>
                <h3 className="font-bold text-white text-lg">Reset Password</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                passwordMutation.mutate({ id: selectedUser.id, password: newPassword });
              }}
              className="p-6 space-y-4 text-xs"
            >
              <p className="text-zinc-300">
                Enter a new secure password for <span className="text-purple-400 font-semibold">@{selectedUser.username}</span>. The user will be required to log in with this new credential immediately.
              </p>

              <div>
                <label className="text-zinc-400 block mb-1">New Password (minimum 6 characters)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 pr-10 text-white outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={passwordMutation.isPending || newPassword.length < 6}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  {passwordMutation.isPending ? 'Resetting...' : 'Confirm Reset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: TOGGLE STATUS (ACTIVATE / SUSPEND) ── */}
      {activeModal === 'status' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn("p-2 rounded-xl", selectedUser.is_active ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400")}>
                  {selectedUser.is_active ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <h3 className="font-bold text-white text-lg">
                  {selectedUser.is_active ? 'Suspend User Account' : 'Activate User Account'}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-zinc-300">
                {selectedUser.is_active ? (
                  <>
                    Are you sure you want to suspend <span className="text-white font-semibold">@{selectedUser.username}</span>? The user will immediately be blocked from logging in, making offers, or creating listings.
                  </>
                ) : (
                  <>
                    Are you sure you want to restore access for <span className="text-emerald-400 font-semibold">@{selectedUser.username}</span>? Their account will be activated immediately.
                  </>
                )}
              </p>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={() => statusMutation.mutate({ id: selectedUser.id, is_active: !selectedUser.is_active })}
                  disabled={statusMutation.isPending}
                  className={cn(
                    "font-bold px-5 py-2 rounded-xl text-white",
                    selectedUser.is_active ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
                  )}
                >
                  {statusMutation.isPending ? 'Updating...' : selectedUser.is_active ? 'Confirm Suspension' : 'Confirm Activation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 6: DELETE ACCOUNT ── */}
      {activeModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <Trash2 size={20} />
                </div>
                <h3 className="font-bold text-white text-lg">Delete User Permanently</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
                <p className="font-bold mb-1">Warning: Irreversible Action</p>
                <p>This will permanently delete the user account for <span className="font-mono text-white font-bold">@{selectedUser.username}</span> and purge their session credentials. Audit logs will record this action.</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteMutation.mutate(selectedUser.id)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete Permanently'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DRAWER 7: USER INSPECTION SIDE-SHEET ── */}
      {activeModal === 'drawer' && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#080b11] border-l border-white/10 h-full p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <User size={20} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-lg">Identity Dossier</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white bg-white/5">
                  <X size={18} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 text-emerald-400 text-2xl font-bold flex items-center justify-center mx-auto uppercase">
                  {selectedUser.username.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">@{selectedUser.username}</h4>
                  <p className="text-xs text-zinc-400">{selectedUser.email || 'No email registered'}</p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    {selectedUser.role}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono px-3 py-1 rounded-full border font-bold uppercase",
                    selectedUser.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                  )}>
                    {selectedUser.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Account Metadata */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-zinc-500 text-[10px]">Account Metadata</h4>
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-2 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Account ID</span>
                    <span className="text-white">#{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Date Registered</span>
                    <span className="text-white">{new Date(selectedUser.date_joined).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Last Login</span>
                    <span className="text-white">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Staff Permissions</span>
                    <span className={selectedUser.is_staff ? "text-emerald-400" : "text-zinc-500"}>
                      {selectedUser.is_staff ? 'Granted' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Breakdown */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-zinc-500 text-[10px]">Platform Footprint</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center">
                    <Package size={18} className="mx-auto text-emerald-400 mb-1" />
                    <span className="text-lg font-bold font-mono text-white block">{selectedUser.listings_count}</span>
                    <span className="text-[10px] uppercase text-zinc-500">Listings Owned</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center">
                    <HandCoins size={18} className="mx-auto text-amber-400 mb-1" />
                    <span className="text-lg font-bold font-mono text-white block">{selectedUser.offers_count}</span>
                    <span className="text-[10px] uppercase text-zinc-500">Offers Placed</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Quick Controls */}
            <div className="pt-6 border-t border-white/10 flex gap-2">
              <button
                onClick={() => { setActiveModal('edit'); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold text-center transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { setActiveModal('role'); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold text-center transition-all"
              >
                Change Role
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserManagement;
