import React, { useState } from 'react';
import {
  User, UserCheck, UserMinus, ShieldCheck,
  Search, Filter, Edit3, Trash2,
  CheckCircle2, XCircle, AlertCircle,
  ChevronRight, UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Owner' | 'Agent' | 'Seller' | 'Tenant';
  is_active: boolean;
  is_superuser: boolean;
}

const MOCK_USERS: UserAccount[] = [
  { id: '1', username: 'superadmin', email: 'admin@urugwiro.com', role: 'Admin', is_active: true, is_superuser: true },
  { id: '2', username: 'olivier_n', email: 'olivier@urugwiro.com', role: 'Owner', is_active: true, is_superuser: false },
  { id: '3', username: 'sarah_agent', email: 'sarah@agent.com', role: 'Agent', is_active: true, is_superuser: false },
  { id: '4', username: 'jean_seller', email: 'jean@seller.com', role: 'Seller', is_active: false, is_superuser: false },
  { id: '5', username: 'mtore_tenant', email: 'mtore@gmail.com', role: 'Tenant', is_active: true, is_superuser: false },
];

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [modalType, setModalType] = useState<'promote' | 'demote' | 'activate' | 'deactivate' | 'delete' | 'edit' | null>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    const matchesStatus = statusFilter === '' || (statusFilter === 'Active' ? u.is_active : !u.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (newRole: UserAccount['role']) => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
    setModalType(null);
    setSelectedUser(null);
  };

  const handleStatusChange = (status: boolean) => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, is_active: status } : u));
    setModalType(null);
    setSelectedUser(null);
  };

  const deleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setModalType(null);
    setSelectedUser(null);
  };

  return (
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Trust & Safety</p>
            <h1 className="text-4xl font-bold tracking-tight text-white">User <span className="text-emerald-500">Registry</span></h1>
          </div>
          <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
            <UserPlus size={20} /> Add New User
          </Button>
        </div>

        {/* Advanced Filters - Mapping exactly to the original HTML form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[280px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by Name or Email..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Filter by Role</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
              <option value="Agent">Agent</option>
              <option value="Seller">Seller</option>
              <option value="Tenant">Tenant</option>
            </select>
            <select
              className="bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-sm text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Filter by Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearchQuery(''); setRoleFilter(''); setStatusFilter(''); }} className="text-zinc-500 hover:text-white">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Users Table - Mapping to users.html exactly */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
            <h3 className="font-bold text-white text-xl flex items-center gap-3">
              <User size={22} className="text-emerald-500" /> All Registered Users
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              {filteredUsers.length} of {users.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold border-b border-white/10 bg-white/[0.01]">
                <tr>
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Account Actions</th>
                  <th className="px-6 py-4 font-semibold text-center">Role Management</th>
                  <th className="px-6 py-4 font-semibold text-right">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5 text-zinc-500 font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-5 font-medium text-zinc-200 group-hover:text-white transition-colors">{user.username}</td>
                    <td className="px-6 py-5 text-sm text-zinc-400">{user.email}</td>
                    <td className="px-6 py-5">
                      <Badge
                        variant="neutral"
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          user.is_superuser ? "bg-zinc-800 text-white border-zinc-600" :
                          user.role === 'Admin' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          user.role === 'Owner' ? "bg-emerald-600/10 text-emerald-500 border-emerald-600/30" :
                          user.role === 'Agent' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                          user.role === 'Seller' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                          "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                        )}
                      >
                        {user.is_superuser ? 'Superuser' : user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn(
                        "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider",
                        user.is_active ? "text-emerald-400" : "text-red-400"
                      )}>
                        {user.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        {!user.is_superuser && (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => { setSelectedUser(user); setModalType('edit'); }}
                              className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400"
                              title="Edit User"
                            >
                              <Edit3 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => { setSelectedUser(user); setModalType('delete'); }}
                              className="p-2 rounded-lg text-zinc-500 hover:text-red-400"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        {!user.is_superuser && (
                          <div className="flex gap-1">
                            {/* Role Promotion Buttons mapping to original Modals */}
                            {user.role !== 'Admin' && (
                              <button
                                onClick={() => { setSelectedUser(user); setModalType('promote'); }}
                                className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                title="Promote Role"
                              >
                                <ShieldCheck size={16} />
                              </button>
                            )}
                            {user.role !== 'Tenant' && (
                              <button
                                onClick={() => { setSelectedUser(user); setModalType('demote'); }}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Remove Role"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {!user.is_superuser && (
                        <Button
                          variant="ghost"
                          onClick={() => { setSelectedUser(user); setModalType(user.is_active ? 'deactivate' : 'activate'); }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                            user.is_active
                              ? "text-red-400 hover:bg-red-500/10 border border-red-500/20"
                              : "text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                          )}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr className="border-b border-white/5">
                    <td colSpan={8} className="p-20 text-center text-sm text-zinc-500">
                      <div className="flex flex-col items-center gap-3">
                        <User size={40} className="text-zinc-700" />
                        <p>No users match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- RICH ROLE MANAGEMENT MODALS (Mapping to users.html modals) --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0d12] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    {modalType === 'promote' ? <UserPlus size={24} /> :
                     modalType === 'demote' ? <UserMinus size={24} /> :
                     modalType === 'delete' ? <Trash2 size={24} /> :
                     modalType === 'activate' ? <CheckCircle2 size={24} /> :
                     modalType === 'deactivate' ? <XCircle size={24} /> : <User size={24} />}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {modalType === 'promote' && 'Promote Role'}
                    {modalType === 'demote' && 'Remove Role'}
                    {modalType === 'delete' && 'Delete User'}
                    {modalType === 'activate' && 'Activate User'}
                    {modalType === 'deactivate' && 'Deactivate User'}
                    {modalType === 'edit' && 'Edit User'}
                  </h3>
                </div>
                <button onClick={() => { setSelectedUser(null); setModalType(null); }} className="text-zinc-500 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                  <p className="text-zinc-400 text-center">
                    {modalType === 'promote' && `Are you sure you want to promote ${selectedUser.username} to a higher role?`}
                    {modalType === 'demote' && `Are you sure you want to remove the current role from ${selectedUser.username}? They will be reset to Tenant.`}
                    {modalType === 'delete' && `Are you sure you want to permanently delete ${selectedUser.username}? This action cannot be undone.`}
                    {modalType === 'activate' && `Are you sure you want to activate ${selectedUser.username}?`}
                    {modalType === 'deactivate' && `Are you sure you want to deactivate ${selectedUser.username}?`}
                    {modalType === 'edit' && `Editing details for ${selectedUser.username}.`}
                  </p>
                </div>

                {modalType === 'promote' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { role: 'Admin', label: 'Make Admin', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
                      { role: 'Owner', label: 'Make Owner', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
                      { role: 'Agent', label: 'Make Agent', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
                      { role: 'Seller', label: 'Make Seller', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
                    ].map(opt => (
                      <button
                        key={opt.role}
                        onClick={() => handleRoleChange(opt.role as any)}
                        className={cn("p-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all hover:scale-105", opt.color)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {modalType === 'demote' && (
                  <Button
                    onClick={() => handleRoleChange('Tenant')}
                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
                  >
                    Yes, Remove Role
                  </Button>
                )}

                {modalType === 'activate' && (
                  <Button onClick={() => handleStatusChange(true)} className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all">
                    Yes, Activate User
                  </Button>
                )}

                {modalType === 'deactivate' && (
                  <Button onClick={() => handleStatusChange(false)} className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all">
                    Yes, Deactivate User
                  </Button>
                )}

                {modalType === 'delete' && (
                  <Button onClick={deleteUser} className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all">
                    Yes, Delete Permanently
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;

