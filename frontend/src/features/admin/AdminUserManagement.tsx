import React, { useState, useMemo } from 'react';
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
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
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

  const userColumns = useMemo(() => [
    { accessorKey: 'username', id: 'identity', header: 'User Identity', cell: ({ row }: any) => {
      const user = row.original;
      const fullName = `${user.first_name} ${user.last_name}`.trim();
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-main)] font-bold text-xs uppercase shrink-0">
            {user.username.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--color-text-main)]">{user.username}</span>
              {user.is_superuser && <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30">Superuser</span>}
            </div>
            <p className="text-[var(--color-text-muted)] text-xs flex items-center gap-1 mt-0.5"><Mail size={11} className="text-[var(--color-text-dim)]" />{user.email || 'No email'}</p>
            {fullName && <p className="text-[11px] text-[var(--color-text-dim)]">{fullName}</p>}
          </div>
        </div>
      );
    } },
    { accessorKey: 'role', id: 'role', header: 'Role', cell: ({ row }: any) => {
      const roleConfig = ROLES_LIST.find(r => r.role === row.original.role) || ROLES_LIST[4];
      return <span className={cn('px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1', roleConfig.color)}><Shield size={10} />{row.original.role}</span>;
    } },
    { accessorKey: 'is_active', id: 'status', header: 'Status', cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', row.original.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
        <span className="text-xs text-[var(--color-text-muted)]">{row.original.is_active ? 'Active' : 'Suspended'}</span>
      </div>
    ) },
    { accessorKey: 'listings_count', id: 'portfolio', header: 'Portfolio', cell: ({ row }: any) => <span className="font-mono text-xs text-[var(--color-text-muted)]">{row.original.listings_count ?? 0} listings</span> },
    { accessorKey: 'date_joined', id: 'registered', header: 'Registered', cell: ({ row }: any) => <span className="text-xs text-[var(--color-text-muted)]">{new Date(row.original.date_joined).toLocaleDateString()}</span> },
    { id: 'actions', header: '', cell: ({ row }: any) => {
      const u = row.original;
      const openEdit = () => {
        setSelectedUser(u);
        setEditForm({
          username: u.username || '',
          email: u.email || '',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          role: u.role || 'customer',
          is_active: u.is_active ?? true,
          is_staff: u.is_staff ?? false,
        });
        setActiveModal('edit');
      };
      const openSimple = (type: 'role' | 'password' | 'delete') => {
        setSelectedUser(u);
        setActiveModal(type);
      };
      return (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={openEdit} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors" title="Edit"><Edit3 size={14} /></button>
          <button onClick={() => openSimple('role')} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-500 transition-colors" title="Role"><Key size={14} /></button>
          <button onClick={() => openSimple('password')} className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-blue-500 transition-colors" title="Reset Password"><RefreshCw size={14} /></button>
          <button onClick={() => openSimple('delete')} className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      );
    } },
  ], [setActiveModal, setSelectedUser, setEditForm]);

  // 2. Create User Mutation
  const createMutation = useMutation({
    mutationFn: (userData: any) => api.admin.users.create(userData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      setCreateForm({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'customer', is_active: true, is_staff: false });
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
    mutationFn: ({ id, is_active }: { id: number; is_active?: boolean }) => api.admin.users.toggleStatus(id, is_active),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast(res.data?.message || 'Account status updated!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to update status.';
      showToast(errDetail, 'error');
    }
  });

  // 6. Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, new_password }: { id: number; new_password: string }) => api.admin.users.resetPassword(id, new_password),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActiveModal(null);
      showToast('User deleted successfully!');
    },
    onError: (err: any) => {
      const errDetail = err.response?.data?.error || 'Failed to delete user.';
      showToast(errDetail, 'error');
    }
  });

  const handleCreateUser = () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      showToast('Username, email and password are required.', 'error');
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, data: editForm });
  };

  const handleSetRole = (role: string) => {
    if (!selectedUser) return;
    roleMutation.mutate({ id: selectedUser.id, role });
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;
    statusMutation.mutate({ id: selectedUser.id, is_active: !selectedUser.is_active });
  };

  const handleResetPassword = () => {
    if (!selectedUser || !newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }
    resetPasswordMutation.mutate({ id: selectedUser.id, new_password: newPassword });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (!window.confirm(`Are you sure you want to delete user "${selectedUser.username}"?`)) return;
    deleteMutation.mutate(selectedUser.id);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">User Management</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage user accounts, roles, and access permissions.</p>
        </div>
        <Button onClick={() => setActiveModal('create')} className="flex items-center gap-2">
          <UserPlus size={16} />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: User, color: 'text-[var(--color-brand-emerald)]' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Suspended', value: stats.inactive, icon: XCircle, color: 'text-red-600' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-amber-600' },
          { label: 'Sellers', value: stats.sellers, icon: Building, color: 'text-purple-600' },
          { label: 'Customers', value: stats.buyers, icon: HandCoins, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 hover:border-emerald-500/40 shadow-[var(--shadow-depth-1)] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-text-muted)]">{stat.label}</span>
            </div>
            <p className="text-2xl font-mono font-bold text-[var(--color-text-main)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={cn(
          'p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in',
          feedbackMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--color-brand-emerald)]' : 'bg-red-500/10 border-red-500/30 text-red-600'
        )}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-wrap gap-3 items-center shadow-[var(--shadow-depth-1)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
          />
        </div>

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

        <DataTable
          data={users}
          columns={userColumns}
          searchKeys={['username', 'email', 'first_name', 'last_name']}
          searchPlaceholder="Search users..."
          emptyTitle="No users found"
          emptyDescription="No users match the current filters."
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          showBulkActions={false}
          showDensityToggle={true}
          showColumnToggle={true}
          pageSize={pageSize}
        />
      </div>

      {/* ── MODALS ── */}

      {/* Create User Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="font-bold text-[var(--color-text-main)] text-lg">Create New User</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Username *</label>
                <input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Email *</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Password *</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] block mb-1">First Name</label>
                  <input value={createForm.first_name} onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] block mb-1">Last Name</label>
                  <input value={createForm.last_name} onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Role</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50">
                  {ROLES_LIST.map(r => <option key={r.role} value={r.role}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateUser} isLoading={createMutation.isPending} className="flex-1">Create User</Button>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {activeModal === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="font-bold text-[var(--color-text-main)] text-lg">Edit User: {selectedUser.username}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Username</label>
                <input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] block mb-1">First Name</label>
                  <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] block mb-1">Last Name</label>
                  <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] block mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50">
                  {ROLES_LIST.map(r => <option key={r.role} value={r.role}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleUpdateUser} isLoading={updateMutation.isPending} className="flex-1">Update User</Button>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {activeModal === 'role' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="font-bold text-[var(--color-text-main)] text-lg">Change Role: {selectedUser.username}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {ROLES_LIST.map(r => (
                <button
                  key={r.role}
                  onClick={() => handleSetRole(r.role)}
                  className={cn('w-full flex items-center gap-3 p-3 rounded-xl border transition-colors', selectedUser.role === r.role ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[var(--color-border)] hover:border-emerald-500/30')}
                >
                  <span className={cn('px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase border', r.color)}>{r.label}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {activeModal === 'password' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="font-bold text-[var(--color-text-main)] text-lg">Reset Password: {selectedUser.username}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] px-3 py-2 pr-10 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleResetPassword} isLoading={resetPasswordMutation.isPending} className="flex-1">Reset Password</Button>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text-main)] text-lg">Delete User</h3>
                <p className="text-xs text-[var(--color-text-muted)]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Are you sure you want to delete user <strong className="text-[var(--color-text-main)]">"{selectedUser.username}"</strong>? This will permanently remove their account and all associated data.
            </p>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleDeleteUser} isLoading={deleteMutation.isPending} variant="destructive" className="flex-1">Delete User</Button>
              <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
