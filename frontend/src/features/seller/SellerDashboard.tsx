import React, { useState } from 'react';
import {
  LayoutDashboard, Package, MessageSquare,
  ShieldCheck, TrendingUp, Eye,
  Bell, User, LogOut, Plus,
  ArrowUpRight, MoreVertical, Filter,
  Search, Settings, HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface DashboardStat {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface ListingActivity {
  id: string;
  title: string;
  views: number;
  inquiries: number;
  status: 'Active' | 'Pending' | 'Sold';
  updatedAt: string;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
      active
        ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        : "text-zinc-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <span className={cn(
      "transition-colors duration-300",
      active ? "text-white" : "text-zinc-500 group-hover:text-emerald-400"
    )}>
      {icon}
    </span>
    <span className="font-medium tracking-tight">{label}</span>
  </button>
);

export const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const stats: DashboardStat[] = [
    { label: 'Total Views', value: '12,482', change: '+12%', trend: 'up', icon: <Eye size={20} /> },
    { label: 'Active Listings', value: '8', change: '0', trend: 'up', icon: <Package size={20} /> },
    { label: 'New Inquiries', value: '42', change: '+5', trend: 'up', icon: <MessageSquare size={20} /> },
    { label: 'Trust Score', value: '98%', change: '+2%', trend: 'up', icon: <ShieldCheck size={20} /> },
  ];

  const activities: ListingActivity[] = [
    { id: '1', title: 'Modern Villa in Kicukiro', views: 1200, inquiries: 14, status: 'Active', updatedAt: '2h ago' },
    { id: '2', title: 'Prime Plot in Gasabo', views: 850, inquiries: 6, status: 'Active', updatedAt: '5h ago' },
    { id: '3', title: 'Toyota RAV4 2021', views: 2100, inquiries: 22, status: 'Sold', updatedAt: '1d ago' },
  ];

  return (
    <div className="flex h-screen bg-[#05070b] text-zinc-100 font-sans antialiased overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0b0d12] border-r border-white/10 hidden lg:flex flex-col p-8 sticky top-0 h-full">
        <div className="flex items-center gap-3 mb-12 px-2">
          <img
            src="/urugwiro_logo_fav.png"
            alt="Urugwiro"
            className="h-9 w-9 rounded-xl object-contain drop-shadow-md"
          />
          <span className="text-2xl font-bold font-display tracking-tight text-white">Urugwiro</span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Main Menu</div>
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <SidebarItem icon={<Package size={20} />} label="My Listings" active={activeTab === 'Listings'} onClick={() => setActiveTab('Listings')} />
          <SidebarItem icon={<MessageSquare size={20} />} label="Messages" active={activeTab === 'Messages'} onClick={() => setActiveTab('Messages')} />
          <SidebarItem icon={<ShieldCheck size={20} />} label="Verification" active={activeTab === 'Verification'} onClick={() => setActiveTab('Verification')} />
          <SidebarItem icon={<TrendingUp size={20} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
        </nav>

        <div className="pt-8 border-t border-white/10 space-y-2">
          <div className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Account</div>
          <SidebarItem icon={<User size={20} />} label="Profile" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
          <SidebarItem icon={<LogOut size={20} />} label="Logout" />
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
                placeholder="Search in dashboard..."
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
                <p className="text-sm font-bold text-white leading-none">Olivier N.</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Verified Seller</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500 border-2 border-white/10 overflow-hidden cursor-pointer hover:ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0b0d12] transition-all">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Olivier" alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SECTION */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-br from-[#05070b] to-[#0b0d12]">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Dashboard <span className="text-emerald-500">Overview</span></h1>
              <p className="text-zinc-400 mt-1">Welcome back. Your assets are performing 12% better than last month.</p>
            </div>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
              <Plus size={20} />
              List New Asset
            </Button>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    {stat.icon}
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                    stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {stat.change}
                    <TrendingUp size={10} className={stat.trend === 'up' ? "" : "rotate-180"} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LISTINGS TABLE */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-white text-xl">Performance Feed</h3>
                  <Button variant="ghost" className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors">
                    <Filter size={16} />
                  </Button>
                </div>
                <Button variant="ghost" className="text-emerald-400 text-xs font-bold hover:text-emerald-300 flex items-center gap-1">
                  Detailed Report <ArrowUpRight size={14} />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold border-b border-white/10">
                      <th className="px-6 py-4 font-semibold">Asset</th>
                      <th className="px-6 py-4 font-semibold text-center">Views</th>
                      <th className="px-6 py-4 font-semibold text-center">Inquiries</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Timeline</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activities.map((act) => (
                      <tr key={act.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                              <Package size={18} />
                            </div>
                            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{act.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-zinc-400 text-sm font-medium">{act.views.toLocaleString()}</td>
                        <td className="px-6 py-5 text-center text-zinc-400 text-sm font-medium">{act.inquiries}</td>
                        <td className="px-6 py-5">
                          <Badge
                            variant={act.status === 'Active' ? 'success' : 'neutral'}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              act.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                            )}
                          >
                            {act.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right text-zinc-500 text-xs font-mono">{act.updatedAt}</td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 rounded-lg text-zinc-600 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NOTIFICATIONS / ALERTS */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 transition-all hover:border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-white text-xl">Priority Alerts</h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-5">
                {[
                  { type: 'offer', msg: 'New offer on Modern Villa: RWF 80M', time: '10m ago' },
                  { type: 'message', msg: 'Client inquiry: Land in Gasabo', time: '1h ago' },
                  { type: 'verification', msg: 'ID Card verified successfully', time: '3h ago' },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      alert.type === 'offer' ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                      alert.type === 'message' ? "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
                    )}>
                      {alert.type === 'offer' ? <TrendingUp size={20}/> : alert.type === 'message' ? <MessageSquare size={20}/> : <ShieldCheck size={20}/>}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{alert.msg}</p>
                      <p className="text-xs text-zinc-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 py-3 rounded-2xl text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">
                View All Notifications
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

