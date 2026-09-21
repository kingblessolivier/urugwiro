import React from 'react';
import {
  ArrowRight,
  FileCheck2,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  Bell,
  User,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
    HelpCircle,
    TrendingUp
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface AdminHubProps {
    setView: (view: 'admin-listings' | 'admin-verification' | 'admin-settings' | 'admin-enquiries' | 'admin-offers' | 'admin-reports' | 'admin-users') => void;
}

const AdminHub: React.FC<AdminHubProps> = ({ setView }) => {
    const listingsQuery = useQuery({
        queryKey: ['admin-current-listings'],
        queryFn: async () => (await api.listings.list()).data,
    });
    const verificationQuery = useQuery({
        queryKey: ['admin-verification-list'],
        queryFn: async () => (await api.admin.verification.list()).data,
    });

    const listings = Array.isArray(listingsQuery.data) ? listingsQuery.data : [];
    const verificationRequests = Array.isArray(verificationQuery.data) ? verificationQuery.data : [];
    const published = listings.filter((listing) => ['listed', 'published', 'available'].includes(listing.status)).length;
    const pending = verificationRequests.filter((request) => request.status === 'pending').length;

    const stats = [
        { label: 'Unified listings', value: listings.length, detail: 'Current listing records', icon: ListChecks },
        { label: 'Published assets', value: published, detail: 'Visible marketplace records', icon: LayoutDashboard },
        { label: 'Pending verification', value: pending, detail: 'Documents awaiting review', icon: ShieldCheck },
    ];

    return (
        <div className="flex h-screen bg-[#05070b] text-zinc-100 font-sans antialiased overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-72 bg-[#0b0d12] border-r border-white/10 hidden lg:flex flex-col p-8 sticky top-0 h-full">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        A
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">Urugwiro Admin</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Management</div>
                    <button
                        onClick={() => {}}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium tracking-tight">Main Hub</span>
                    </button>

                    <div className="pt-4">
                        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Marketplace</div>
                        <button
                            onClick={() => setView('admin-listings')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ListChecks size={20} />
                            <span className="font-medium tracking-tight">Listing Registry</span>
                        </button>
                        <button
                            onClick={() => setView('admin-offers')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ArrowUpRight size={20} />
                            <span className="font-medium tracking-tight">Offers Management</span>
                        </button>
                    </div>

                    <div className="pt-4">
                        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trust & Safety</div>
                        <button
                            onClick={() => setView('admin-verification')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <ShieldCheck size={20} />
                            <span className="font-medium tracking-tight">Trust Audit</span>
                        </button>
                        <button
                            onClick={() => setView('admin-users')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <User size={20} />
                            <span className="font-medium tracking-tight">User Registry</span>
                        </button>
                    </div>

                    <div className="pt-4">
                        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Communications</div>
                        <button
                            onClick={() => setView('admin-enquiries')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <Bell size={20} />
                            <span className="font-medium tracking-tight">Customer Enquiries</span>
                        </button>
                    </div>

                    <div className="pt-4">
                        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Intelligence</div>
                        <button
                            onClick={() => setView('admin-reports')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <TrendingUp size={20} />
                            <span className="font-medium tracking-tight">Reports & Analytics</span>
                        </button>
                    </div>

                    <div className="pt-4">
                        <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Platform</div>
                        <button
                            onClick={() => setView('admin-settings')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <Settings size={20} />
                            <span className="font-medium tracking-tight">Global Config</span>
                        </button>
                    </div>
                </nav>

                <div className="pt-8 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
                        <User size={20} />
                        <span className="font-medium tracking-tight">Admin Profile</span>
                    </button>
                </div>
            </aside>

            {/* MAIN WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* TOP NAVBAR */}
                <header className="h-20 bg-[#0b0d12]/80 backdrop-blur-xl border-b border-white/10 px-8 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search users, listings, or documents..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition-all">
                            <HelpCircle size={20} />
                        </Button>
                        <Button variant="ghost" className="relative p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#0b0d12]" />
                        </Button>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white leading-none">Super Admin</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">System Owner</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-emerald-600 border-2 border-white/10 overflow-hidden cursor-pointer hover:ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0b0d12] transition-all">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin Avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT SECTION */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-br from-[#05070b] to-[#0b0d12]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Urugwiro Operations</p>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Admin <span className="text-emerald-500">Command Center</span></h1>
                            <p className="text-zinc-400 mt-1">Moderate the marketplace, review trust evidence and manage platform configuration.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" /> System Operational
                        </div>
                    </div>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div key={stat.label} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]">
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                        {React.createElement(stat.icon as any, { size: 22 })}
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-white mt-1">
                                        {listingsQuery.isLoading || verificationQuery.isLoading ? '—' : stat.value}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-2">{stat.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LISTINGS TABLE */}
                        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-white text-xl">Current Listing Activity</h3>
                                    <Button variant="ghost" className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors">
                                        <Filter size={16} />
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setView('admin-listings')} className="text-emerald-400 text-xs font-bold hover:text-emerald-300 flex items-center gap-1">
                                    Open Registry <ArrowRight size={14} />
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Asset</th>
                                            <th className="px-6 py-4 font-semibold text-center">Type</th>
                                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                                            <th className="px-6 py-4 font-semibold text-right">Value</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {listings.slice(0, 6).map((listing) => (
                                            <tr key={listing.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                                                            <FileCheck2 size={18} />
                                                        </div>
                                                        <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{listing.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center text-zinc-400 text-sm font-medium">{listing.listing_type}</td>
                                                <td className="px-6 py-5">
                                                    <Badge
                                                        variant={['listed', 'published', 'available'].includes(listing.status) ? 'success' : 'neutral'}
                                                        className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                            ['listed', 'published', 'available'].includes(listing.status) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                                        )}
                                                    >
                                                        {listing.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-5 text-right text-white font-medium font-mono">
                                                    {Number(listing.price || 0).toLocaleString()} {listing.currency || 'RWF'}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="p-2 rounded-lg text-zinc-600 hover:text-white transition-colors">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!listingsQuery.isLoading && listings.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-10 text-center text-sm text-zinc-500">No current listings are available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 transition-all hover:border-emerald-500/40">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Trust Audit</h3>
                                </div>
                                <p className="text-zinc-400 leading-relaxed mb-8">
                                    Review submitted documents and record an approval or rejection to upgrade listing trust levels.
                                </p>
                                <Button
                                    onClick={() => setView('admin-verification')}
                                    variant="primary"
                                    className="w-full py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
                                >
                                    Enter Workspace <ArrowRight size={18} />
                                </Button>
                                <div className="mt-6 flex justify-center items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {pending} Pending Requests
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 transition-all hover:border-white/20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Global Config</h3>
                                </div>
                                <p className="text-zinc-400 leading-relaxed mb-8">
                                    Manage platform-wide configuration, API keys, and administrative roles.
                                </p>
                                <Button
                                    onClick={() => setView('admin-settings')}
                                    variant="ghost"
                                    className="w-full py-4 rounded-2xl font-bold transition-all border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2"
                                >
                                    Open Settings <ArrowRight size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
              </div>
            </div>
    );
};

export default AdminHub;
