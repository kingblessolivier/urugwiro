import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, ShieldCheck,
  Search, Edit3, Trash2, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, ChevronLeft, UserPlus,
  Key, Eye, EyeOff, Building, Package, HandCoins,
  RefreshCw, X, Shield, Mail,
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';


export interface UserItem {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'owner' | 'staff' | 'seller' | 'customer' | 'finance' | string;
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
  { role: 'admin', label: 'Admin', desc: 'Full platform access', color: 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:bg-amber-500/10' },
  { role: 'staff', label: 'Staff', desc: 'Manages operations', color: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-500/40 dark:text-blue-400 dark:bg-blue-500/10' },
  { role: 'seller', label: 'Seller', desc: 'Lists properties', color: 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-500/40 dark:text-purple-400 dark:bg-purple-500/10' },
  { role: 'owner', label: 'Owner', desc: 'Business owner', color: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/40 dark:text-[var(--color-brand-emerald)] dark:bg-emerald-500/10' },
  { role: 'customer', label: 'Customer', desc: 'Browses and buys', color: 'border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-500/40 dark:text-teal-400 dark:bg-teal-500/10' },
  { role: 'finance', label: 'Finance', desc: 'Reviews payments', color: 'border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)]' },
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
    role: 'customer',
    is_active: true,
    is_staff: false,
  });

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'customer',
    is_active: true,
    is_staff: false,
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 1. Fetch Users Query
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter, statusFilter, page, pageSize],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.admin.users.list(params);
      return res.data;
    },
    retry: 2,
  });

  const users: UserItem[] = Array.isArray(data) ? data : (data?.results || data?.users || []);
  const totalCount: number = data?.count ?? users.length;
  const totalPages: number = data?.total_pages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const stats: UserStats = data?.stats || {
    total: totalCount,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'staff').length,
    sellers: users.filter(u => u.role === 'seller').length,
    owners: users.filter(u => u.role === 'owner').length,
    tenants: users.filter(u => u.role === 'customer').length,
    buyers: users.filter(u => u.role === 'customer').length,
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
        last_name: '', role: 'customer', is_active: true, is_staff: false,
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
    <div className="p-4 sm:p-6 lg:p-10 bg-[var(--color-bg-deep)] min-h-screen text-[var(--color-text-main)] font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* TOAST FEEDBACK NOTIFICATION */}
        {feedbackMessage && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
            "fixed top-6 right-6 z-50 max-w-sm px-4 py-3 rounded-2xl border shadow-[var(--shadow-depth-1)] flex items-start gap-2.5 text-xs font-semibold animate-fadeIn",
            feedbackMessage.type === 'success'
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40"
          )}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">Users</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{totalCount} users</p>
          </div>


          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
              title="Refresh roster"
            >
              <RefreshCw size={18} className={cn(isRefetching && "animate-spin text-[var(--color-brand-emerald)]")} />
            </button>
            <Button
              variant="primary"
              onClick={() => setActiveModal('create')}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-[var(--shadow-emerald-soft)] hover:scale-105 active:scale-95"
            >
              <UserPlus size={18} />
              <span>Add New User</span>
            </Button>
          </div>
        </div>

        {/* KPI ANALYTICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: User, color: 'text-[var(--color-text-main)] bg-[var(--color-bg-elevated)] border-[var(--color-border)]' },
            { label: 'Active Now', value: stats.active, icon: CheckCircle2, color: 'text-[var(--color-brand-emerald)] bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { label: 'Agents', value: stats.agents, icon: Building, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Sellers', value: stats.sellers, icon: Package, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { label: 'Suspended', value: stats.inactive, icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 flex flex-col justify-between group hover:border-emerald-500/40 transition-all shadow-[var(--shadow-depth-1)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-bold">
                    {item.label}
                  </span>
                  <div className={cn("h-7 w-7 rounded-md border flex items-center justify-center", item.color)}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-[var(--color-text-main)] tracking-tight">
                  {isLoading ? '...' : item.value}
                </div>
              </div>
            );
          })}
        </div>


        {/* FILTER & SEARCH CONTROL BAR */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              type="text"
              placeholder="Search by username, email, or full name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-xs text-[var(--color-text-muted)] outline-none focus:border-emerald-500/50"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="seller">Seller</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
              <option value="finance">Finance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-xs text-[var(--color-text-muted)] outline-none focus:border-emerald-500/50"
            >
              <option value="">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended / Inactive</option>
            </select>

            {(searchQuery || roleFilter || statusFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] px-2 py-1 underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* USERS ROSTER TABLE */}
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl overflow-hidden shadow-[var(--shadow-depth-1)]">
          <div className="p-4 sm:p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <User size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="font-sans font-bold text-[var(--color-text-main)] text-base sm:text-lg tracking-tight">Registered User Accounts</h3>
            </div>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              Showing {users.length} {users.length === 1 ? 'account' : 'accounts'}
            </span>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={tableHead}>
                <tr>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>User Identity</th>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Assigned Role</th>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Status</th>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold text-center')}>Portfolio</th>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold')}>Registered</th>
                  <th className={cn(tableTh, 'px-5 py-3.5 font-semibold text-right')}>Administrative Actions</th>
                </tr>
              </thead>
              <tbody className={cn(tableBody, 'text-xs sm:text-sm')}>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-[var(--color-text-dim)]">
                      <RefreshCw size={24} className="mx-auto animate-spin text-[var(--color-brand-emerald)] mb-2" />
                      Loading user records from database...
                    </td>
                  </tr>
                )}

                {isError && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-red-600 dark:text-red-400">
                      <AlertCircle size={30} className="mx-auto text-red-600 dark:text-red-400 mb-2" />
                      <p className="text-sm font-semibold">Unable to fetch users from server.</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{(error as any)?.message || 'Database connection error'}</p>
                      <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20 transition-colors inline-flex items-center gap-2 cursor-pointer"
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
                    <tr key={user.id} className={cn(tableTr, 'group')}>
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-main)] font-bold text-xs uppercase shrink-0">
                            {user.username.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)] transition-colors">
                                {user.username}
                              </span>
                              {user.is_superuser && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30">
                                  Superuser
                                </span>
                              )}
                            </div>
                            <p className="text-[var(--color-text-muted)] text-xs flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-[var(--color-text-dim)]" />
                              {user.email || 'No email registered'}
                            </p>
                            {fullName && <p className="text-[11px] text-[var(--color-text-dim)]">{fullName}</p>}
                          </div>
                        </div>
                      </td>


                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1", roleConfig.color)}>
                          <Shield size={10} />
                          {user.role}
                        </span>
                      </td>


                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", user.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
                          <span className={cn("text-xs font-semibold", user.is_active ? "text-[var(--color-brand-emerald)]" : "text-red-600 dark:text-red-400")}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>

                      {/* Portfolio */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-mono">
                          <span title="Listings Owned" className="flex items-center gap-1">
                            <Package size={12} className="text-[var(--color-text-dim)]" />
                            {user.listings_count}
                          </span>
                          <span title="Offers Placed" className="flex items-center gap-1">
                            <HandCoins size={12} className="text-[var(--color-text-dim)]" />
                            {user.offers_count}
                          </span>
                        </div>
                      </td>

                      {/* Registered */}
                      <td className="px-5 py-4 text-xs text-[var(--color-text-muted)] font-mono">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Action Controls */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details Drawer */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('drawer'); }}
                            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-emerald-500/30 hover:text-[var(--color-brand-emerald)] text-[var(--color-text-muted)] transition-colors"
                            title="Inspect User Details"
                          >
                            <Eye size={15} />
                          </button>


                          {/* Role Transition */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('role'); }}
                            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-amber-500/30 hover:text-amber-500 dark:hover:text-amber-400 text-[var(--color-text-muted)] transition-colors"
                            title="Assign Role"
                          >
                            <ShieldCheck size={15} />
                          </button>


                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-blue-500/30 hover:text-blue-500 dark:hover:text-blue-400 text-[var(--color-text-muted)] transition-colors"
                            title="Edit Account"
                          >
                            <Edit3 size={15} />
                          </button>


                          {/* Reset Password */}
                          <button
                            onClick={() => { setSelectedUser(user); setActiveModal('password'); }}
                            className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-purple-500/30 hover:text-purple-500 dark:hover:text-purple-400 text-[var(--color-text-muted)] transition-colors"
                            title="Reset Password"
                          >
                            <Key size={15} />
                          </button>


                          {/* Toggle Status (Activate / Suspend) */}
                          {!user.is_superuser && (
                            <button
                              onClick={() => { setSelectedUser(user); setActiveModal('status'); }}
                              className={cn(
                                "p-1.5 rounded-md border transition-colors",
                                user.is_active
                                  ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                                  : "border-emerald-500/20 bg-emerald-500/10 text-[var(--color-brand-emerald)] hover:bg-emerald-500/20"
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
                              className="p-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-red-500/40 hover:text-red-600 dark:text-red-400 text-[var(--color-text-muted)] transition-colors"
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
                    <td colSpan={6} className="p-16 text-center text-[var(--color-text-dim)]">
                      <User size={36} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                      <p className="text-sm text-[var(--color-text-muted)]">No user accounts matched your search criteria.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); }}
                        className="mt-3 text-xs text-[var(--color-brand-emerald)] hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION CONTROLS ── */}
          {!isLoading && !isError && totalCount > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                <span>
                  Showing <strong className="text-[var(--color-text-main)] font-mono">{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{' '}
                  <strong className="text-[var(--color-text-main)] font-mono">{Math.min(page * pageSize, totalCount)}</strong> of{' '}
                  <strong className="text-[var(--color-text-main)] font-mono">{totalCount}</strong> accounts
                </span>
                <div className="flex items-center gap-1.5 ml-2 border-l border-[var(--color-border)] pl-3">
                  <span className="text-[var(--color-text-dim)]">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-lg py-1 px-2 text-xs text-[var(--color-text-muted)] outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>


                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const hasGap = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-[var(--color-text-dim)] font-mono">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={cn(
                            "w-8 h-8 rounded-md text-xs font-mono font-bold transition-all cursor-pointer",
                            page === p
                              ? "bg-emerald-600 dark:bg-emerald-500 text-[#fff] shadow-[var(--shadow-emerald-soft)]"
                              : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)]"
                          )}
                        >
                          {p}
                        </button>

                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-card-hover)] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>

              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL 1: CREATE NEW USER ── */}
      {activeModal === 'create' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveModal(null); }}
        >
          <div className="w-full max-w-lg max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-2xl animate-fadeIn">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 p-5 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-emerald-500/10 text-[var(--color-brand-emerald)]">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] text-lg">Add user</h3>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Create an account and assign access.</p>
                </div>
              </div>
              <button type="button" aria-label="Close add user modal" onClick={() => setActiveModal(null)} className="rounded-lg p-2 text-[var(--color-text-dim)] transition hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]">
                <X size={20} />
              </button>
            </div>


            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(createForm);
              }}
              className="space-y-5 p-5 text-xs sm:p-6"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--color-text-muted)] block mb-1">First Name</label>
                  <input
                    type="text"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                    className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                  />

                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                    className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                  />

                </div>
              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="e.g. kigali_investor"
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                />

              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="name@urugwiro.rw"
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                />

              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Initial Password * (minimum 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
                />

              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Assign Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2.5 text-[var(--color-text-main)] outline-none"
                >

                  <option value="customer" className="bg-[var(--color-bg-surface)]">Customer</option>
                  <option value="seller" className="bg-[var(--color-bg-surface)]">Seller</option>
                  <option value="staff" className="bg-[var(--color-bg-surface)]">Staff</option>
                  <option value="owner" className="bg-[var(--color-bg-surface)]">Owner</option>
                  <option value="admin" className="bg-[var(--color-bg-surface)]">Admin</option>
                  <option value="finance" className="bg-[var(--color-bg-surface)]">Finance</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <label className="flex items-center gap-2 text-[var(--color-text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                    className="rounded border border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Activate immediately upon creation</span>
                </label>
                <label className="flex items-center gap-2 text-[var(--color-text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_staff}
                    onChange={(e) => setCreateForm({ ...createForm, is_staff: e.target.checked })}
                    className="rounded border border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Grant Staff Access</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold px-5 py-2.5 rounded-md shadow-[var(--shadow-emerald-soft)]"
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
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md w-full max-w-lg overflow-hidden shadow-[var(--shadow-depth-1)] animate-fadeIn">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] text-lg">Edit User Account</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Updating profile for @{selectedUser.username}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]">
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
                  <label className="text-[var(--color-text-muted)] block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-blue-500/50"
                  />

                </div>
                <div>
                  <label className="text-[var(--color-text-muted)] block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-blue-500/50"
                  />

                </div>
              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-blue-500/50"
                />

              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-blue-500/50"
                />

              </div>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">Role Assignment</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2.5 text-[var(--color-text-main)] outline-none"
                >

                  <option value="admin" className="bg-[var(--color-bg-surface)]">Admin</option>
                  <option value="staff" className="bg-[var(--color-bg-surface)]">Staff</option>
                  <option value="seller" className="bg-[var(--color-bg-surface)]">Seller</option>
                  <option value="owner" className="bg-[var(--color-bg-surface)]">Owner</option>
                  <option value="customer" className="bg-[var(--color-bg-surface)]">Customer</option>
                  <option value="finance" className="bg-[var(--color-bg-surface)]">Finance</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <label className="flex items-center gap-2 text-[var(--color-text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded border border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Account is Active</span>
                </label>
                <label className="flex items-center gap-2 text-[var(--color-text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_staff}
                    onChange={(e) => setEditForm({ ...editForm, is_staff: e.target.checked })}
                    className="rounded border border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Staff Permissions</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-[#fff] font-bold px-5 py-2.5 rounded-md shadow-[var(--shadow-depth-1)]"
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
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md w-full max-w-lg overflow-hidden shadow-[var(--shadow-depth-1)] animate-fadeIn">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-main)] text-lg">Change User Role</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Current Role: <span className="text-[var(--color-text-main)] font-mono">{selectedUser.role}</span></p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]">
                <X size={20} />
              </button>
            </div>


            <div className="p-6 space-y-4">
              <p className="text-xs text-[var(--color-text-muted)]">
                Select the target operational role for <span className="text-[var(--color-brand-emerald)] font-semibold">@{selectedUser.username}</span>. Assigning Admin grants platform oversight, while Seller/Owner automatically provisions a verified listing profile.
              </p>

              <div className="space-y-2.5">
                {ROLES_LIST.map((r) => {
                  const isCurrent = selectedUser.role === r.role;
                  return (
                    <div
                      key={r.role}
                      onClick={() => !isCurrent && roleMutation.mutate({ id: selectedUser.id, role: r.role })}
                      className={cn(
                        "p-3.5 rounded-md border transition-all flex items-center justify-between",
                        isCurrent
                          ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-hover)] opacity-60 cursor-default"
                          : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-[var(--color-bg-card-hover)] cursor-pointer"
                      )}
                    >

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{r.label}</span>
                          <span className={cn("text-[9px] font-mono px-2 py-0.2 rounded-full border", r.color)}>
                            {r.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{r.desc}</p>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] text-[var(--color-text-dim)] font-mono">Current</span>
                      ) : (
                        <ChevronRight size={16} className="text-[var(--color-text-dim)]" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-end">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] text-xs">
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
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden shadow-[var(--shadow-depth-1)] animate-fadeIn">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Key size={20} />
                </div>
                <h3 className="font-bold text-[var(--color-text-main)] text-lg">Reset Password</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]">
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
              <p className="text-[var(--color-text-muted)]">
                Enter a new secure password for <span className="text-purple-600 dark:text-purple-400 font-semibold">@{selectedUser.username}</span>. The user will be required to log in with this new credential immediately.
              </p>

              <div>
                <label className="text-[var(--color-text-muted)] block mb-1">New Password (minimum 6 characters)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 pr-10 text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={passwordMutation.isPending || newPassword.length < 6}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-[#fff] font-bold px-5 py-2 rounded-xl shadow-[var(--shadow-depth-1)]"
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
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden shadow-[var(--shadow-depth-1)] animate-fadeIn">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn("p-2 rounded-xl", selectedUser.is_active ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-[var(--color-brand-emerald)]")}>
                  {selectedUser.is_active ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <h3 className="font-bold text-[var(--color-text-main)] text-lg">
                  {selectedUser.is_active ? 'Suspend User Account' : 'Activate User Account'}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[var(--color-text-muted)]">
                {selectedUser.is_active ? (
                  <>
                    Are you sure you want to suspend <span className="text-[var(--color-text-main)] font-semibold">@{selectedUser.username}</span>? The user will immediately be blocked from logging in, making offers, or creating listings.
                  </>
                ) : (
                  <>
                    Are you sure you want to restore access for <span className="text-[var(--color-brand-emerald)] font-semibold">@{selectedUser.username}</span>? Their account will be activated immediately.
                  </>
                )}
              </p>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  Cancel
                </Button>
                <Button
                  onClick={() => statusMutation.mutate({ id: selectedUser.id, is_active: !selectedUser.is_active })}
                  disabled={statusMutation.isPending}
                  className={cn(
                    "font-bold px-5 py-2 rounded-xl text-[#fff]",
                    selectedUser.is_active ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
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
          <div className="bg-[var(--color-bg-surface)] border border-red-500/30 rounded-xl w-full max-w-md overflow-hidden shadow-[var(--shadow-depth-1)] animate-fadeIn">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Trash2 size={20} />
                </div>
                <h3 className="font-bold text-[var(--color-text-main)] text-lg">Delete User Permanently</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
                <p className="font-bold mb-1">Warning: Irreversible Action</p>
                <p>This will permanently delete the user account for <span className="font-mono text-[var(--color-text-main)] font-bold">@{selectedUser.username}</span> and purge their session credentials. Audit logs will record this action.</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setActiveModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteMutation.mutate(selectedUser.id)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-[#fff] font-bold px-5 py-2 rounded-xl shadow-[var(--shadow-depth-1)]"
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
          <div className="w-full max-w-md bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] h-full p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2.5">
                  <User size={20} className="text-[var(--color-brand-emerald)]" />
                  <h3 className="font-bold text-[var(--color-text-main)] text-lg">User Profile Details</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]">
                  <X size={18} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[var(--color-brand-emerald)] text-2xl font-bold flex items-center justify-center mx-auto uppercase">
                  {selectedUser.username.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-text-main)] text-lg">@{selectedUser.username}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedUser.email || 'No email registered'}</p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-[var(--color-brand-emerald)] border border-emerald-500/30 font-bold uppercase">
                    {selectedUser.role}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono px-3 py-1 rounded-full border font-bold uppercase",
                    selectedUser.is_active ? "bg-emerald-500/10 text-[var(--color-brand-emerald)] border-emerald-500/30" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                  )}>
                    {selectedUser.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Account Metadata */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-[var(--color-text-dim)] text-[10px]">Account Metadata</h4>
                <div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2 font-mono">
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Account ID</span>
                    <span className="text-[var(--color-text-main)]">#{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Date Registered</span>
                    <span className="text-[var(--color-text-main)]">{new Date(selectedUser.date_joined).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Last Login</span>
                    <span className="text-[var(--color-text-main)]">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>Staff Permissions</span>
                    <span className={selectedUser.is_staff ? "text-[var(--color-brand-emerald)]" : "text-[var(--color-text-dim)]"}>
                      {selectedUser.is_staff ? 'Granted' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portfolio Breakdown */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-[var(--color-text-dim)] text-[10px]">Platform Footprint</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                    <Package size={18} className="mx-auto text-[var(--color-brand-emerald)] mb-1" />
                    <span className="text-lg font-bold font-mono text-[var(--color-text-main)] block">{selectedUser.listings_count}</span>
                    <span className="text-[10px] uppercase text-[var(--color-text-dim)]">Listings Owned</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                    <HandCoins size={18} className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                    <span className="text-lg font-bold font-mono text-[var(--color-text-main)] block">{selectedUser.offers_count}</span>
                    <span className="text-[10px] uppercase text-[var(--color-text-dim)]">Offers Placed</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Quick Controls */}
            <div className="pt-6 border-t border-[var(--color-border)] flex gap-2">
              <button
                onClick={() => { setActiveModal('edit'); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400 text-xs font-semibold text-center transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { setActiveModal('role'); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400 text-xs font-semibold text-center transition-all"
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
