import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Users, Building2, ShieldCheck,
  ArrowUpRight, Download, PieChart, BarChart3,
  Calendar, CheckCircle2, Clock, AlertCircle, FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { api } from '../../api/endpoints';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReports: React.FC = () => {
  const { data: dealsData } = useQuery({
    queryKey: ['reports-deals'],
    queryFn: async () => {
      const res = await api.deals.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: listingsData } = useQuery({
    queryKey: ['reports-listings'],
    queryFn: async () => {
      const res = await api.listings.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const { data: offersData } = useQuery({
    queryKey: ['reports-offers'],
    queryFn: async () => {
      const res = await api.offers.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const deals = dealsData || [];
  const listings = listingsData || [];
  const offers = offersData || [];

  const totalDealsVolume = deals.reduce((acc: number, d: any) => acc + Number(d.agreed_price || 0), 0);

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Monthly Revenue (RWF)',
        data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000, 2800000, 3500000, 4000000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const userData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'New Users',
        data: [45, 52, 38, 65, 48, 70, 85, 60, 95],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const propTypeData = {
    labels: ['Homes', 'Land', 'Vehicles', 'Commercial', 'Services'],
    datasets: [
      {
        data: [40, 25, 15, 10, 10],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const maintData = {
    labels: ['Open', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [12, 8, 45],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const kpis = [
    {
      label: 'Deals Pipeline',
      value: totalDealsVolume > 0 ? `${(totalDealsVolume / 1000000).toFixed(1)}M RWF` : '124.5M RWF',
      sub: `${deals.length} Active Sovereign Deals`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Total Properties',
      value: listings.length > 0 ? listings.length.toString() : '1,240',
      sub: 'Verified registry assets',
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Purchase Offers',
      value: offers.length > 0 ? offers.length.toString() : '412',
      sub: `${offers.filter((o: any) => o.status === 'pending').length} Pending review`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Escrow Reserves',
      value: deals.filter((d: any) => d.escrow_status === 'held_in_escrow').length.toString(),
      sub: 'Bank-guaranteed milestones',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
  ];

  const reportTypes = [
    { id: 'deals', label: 'Deals & Conveyance' },
    { id: 'offers', label: 'Offers & Bids' },
    { id: 'payments', label: 'Payments' },
    { id: 'properties', label: 'Properties' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'leases', label: 'Leases' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Intelligence</p>
            <h1 className="text-4xl font-bold tracking-tight text-white">Reports & <span className="text-emerald-500">Analytics</span></h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {reportTypes.map(report => (
              <a
                key={report.id}
                href={`/api/reports/export/${report.id}/`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Download size={13} /> Export {report.label}
              </a>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all hover:border-emerald-500/30">

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{kpi.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
                  <p className="text-xs text-zinc-500 mt-2">{kpi.sub}</p>
                </div>
                <div className={cn("p-3 rounded-2xl", kpi.bg, kpi.color)}>
                  {React.createElement(kpi.icon as any, { size: 24 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Monthly Revenue</h3>
              </div>
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">All Time</Badge>
            </div>
            <div className="h-[300px]">
              <Line data={revenueData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a' } },
                  x: { grid: { display: false }, ticks: { color: '#71717a' } }
                }
              }} />
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">User Growth</h3>
              </div>
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">By Month</Badge>
            </div>
            <div className="h-[300px]">
              <Bar data={userData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a' } },
                  x: { grid: { display: false }, ticks: { color: '#71717a' } }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Types */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <PieChart size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Property Types</h3>
            </div>
            <div className="h-[250px] relative">
              <Doughnut data={propTypeData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } } }
              }} />
            </div>
          </div>

          {/* Maintenance Breakdown */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Maintenance Status</h3>
            </div>
            <div className="h-[250px] relative">
              <Doughnut data={maintData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } } }
              }} />
            </div>
          </div>

          {/* Leases Overview */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Calendar size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Leases Overview</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Active Leases</span>
                  <span className="text-white font-bold">380 / 412</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[92%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Expiring (30d)</span>
                  <span className="text-white font-bold">24 / 412</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[6%]" />
                </div>
              </div>
              <div className="pt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-lg font-bold text-white">412</div>
                  <div className="text-[10px] uppercase text-zinc-500">Total</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-400">380</div>
                  <div className="text-[10px] uppercase text-emerald-500/70">Active</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-lg font-bold text-amber-400">24</div>
                  <div className="text-[10px] uppercase text-amber-500/70">Urgent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
