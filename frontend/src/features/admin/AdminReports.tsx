import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Users, Building2, ShieldCheck,
  ArrowUpRight, Download, PieChart, BarChart3,
  Calendar, CheckCircle2, Clock, AlertCircle, FileText
} from 'lucide-react';
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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminReports: React.FC = () => {
  // 1. Live Deals
  const { data: dealsData } = useQuery({
    queryKey: ['reports-deals'],
    queryFn: async () => {
      const res = await api.deals.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 2. Live Listings
  const { data: listingsData } = useQuery({
    queryKey: ['reports-listings'],
    queryFn: async () => {
      const res = await api.listings.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 3. Live Offers
  const { data: offersData } = useQuery({
    queryKey: ['reports-offers'],
    queryFn: async () => {
      const res = await api.offers.list();
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // 4. Live Users
  const { data: usersData } = useQuery({
    queryKey: ['reports-users'],
    queryFn: async () => {
      const res = await api.admin.users.list({ page_size: 100 });
      return Array.isArray(res.data) ? res.data : (res.data?.results || []);
    },
  });

  // 5. Live Leases
  const { data: leasesData } = useQuery({
    queryKey: ['reports-leases'],
    queryFn: async () => {
      try {
        const res = await api.admin.leases();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  // 6. Live Maintenance
  const { data: maintDataRaw } = useQuery({
    queryKey: ['reports-maintenance'],
    queryFn: async () => {
      try {
        const res = await api.admin.maintenance();
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const deals = dealsData || [];
  const listings = listingsData || [];
  const offers = offersData || [];
  const users = usersData || [];
  const leases = leasesData || [];
  const maintenance = maintDataRaw || [];

  const totalDealsVolume = useMemo(() => {
    return deals.reduce((acc: number, d: any) => acc + Number(d.agreed_price || 0), 0);
  }, [deals]);

  // Dynamic Monthly Revenue Aggregation from settled deals
  const revenueData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlySum = new Array(12).fill(0);

    deals.forEach((d: any) => {
      if (d.current_stage === 'settled_closed' || d.current_stage === 'closed' || d.escrow_status === 'released_to_seller') {
        const dateStr = d.updated_at || d.created_at;
        if (dateStr) {
          const dt = new Date(dateStr);
          if (dt.getFullYear() === currentYear) {
            monthlySum[dt.getMonth()] += Number(d.agreed_price || 0);
          }
        }
      }
    });

    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Monthly Revenue (RWF)',
          data: monthlySum,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    };
  }, [deals]);

  // Dynamic User Signups Aggregation
  const userData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyUsers = new Array(12).fill(0);

    users.forEach((u: any) => {
      if (u.date_joined) {
        const dt = new Date(u.date_joined);
        if (dt.getFullYear() === currentYear) {
          monthlyUsers[dt.getMonth()] += 1;
        }
      }
    });

    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'New Users',
          data: monthlyUsers,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 6,
        },
      ],
    };
  }, [users]);

  // Dynamic Property Type Distribution
  const propTypeData = useMemo(() => {
    let homes = 0;
    let land = 0;
    let vehicles = 0;
    let commercial = 0;
    let services = 0;

    listings.forEach((l: any) => {
      const cat = (l.category || l.listing_type || '').toLowerCase();
      if (cat.includes('land') || cat.includes('plot')) land += 1;
      else if (cat.includes('car') || cat.includes('vehic') || cat.includes('motor')) vehicles += 1;
      else if (cat.includes('commercial') || cat.includes('hotel') || cat.includes('office')) commercial += 1;
      else if (cat.includes('service')) services += 1;
      else homes += 1;
    });

    const hasData = homes + land + vehicles + commercial + services > 0;

    return {
      labels: ['Homes', 'Land', 'Vehicles', 'Commercial', 'Services'],
      datasets: [
        {
          data: hasData ? [homes, land, vehicles, commercial, services] : [1, 0, 0, 0, 0],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0,
        },
      ],
    };
  }, [listings]);

  // Dynamic Maintenance Breakdown
  const maintData = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let completed = 0;

    maintenance.forEach((m: any) => {
      const st = (m.status || '').toLowerCase();
      if (st === 'completed') completed += 1;
      else if (st === 'in_progress') inProgress += 1;
      else open += 1;
    });

    const hasMaint = open + inProgress + completed > 0;

    return {
      labels: ['Open', 'In Progress', 'Completed'],
      datasets: [
        {
          data: hasMaint ? [open, inProgress, completed] : [0, 0, 0],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderWidth: 0,
        },
      ],
    };
  }, [maintenance]);

  // Leases Computations
  const leasesStats = useMemo(() => {
    const total = leases.length;
    const active = leases.filter((l: any) => l.contract_signed && !l.contract_archived).length;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiring = leases.filter((l: any) => {
      if (!l.end_date) return false;
      const end = new Date(l.end_date);
      return end > now && end <= thirtyDaysFromNow;
    }).length;

    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const expiringPct = total > 0 ? Math.round((expiring / total) * 100) : 0;

    return { total, active, expiring, activePct, expiringPct };
  }, [leases]);

  const kpis = [
    {
      label: 'Deals Pipeline',
      value: totalDealsVolume > 0 ? `${(totalDealsVolume / 1000000).toFixed(1)}M RWF` : '0 RWF',
      sub: `${deals.length} Active Sovereign Deals`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Total Properties',
      value: listings.length.toString(),
      sub: 'Verified registry assets',
      icon: Building2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Purchase Offers',
      value: offers.length.toString(),
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
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Live Registry Intelligence</p>
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
                  <h3 className="text-3xl font-bold text-white mt-1 font-mono">{kpi.value}</h3>
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
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">Real Database Records</Badge>
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
                <h3 className="text-xl font-bold text-white">User Signups Growth</h3>
              </div>
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">By Month ({new Date().getFullYear()})</Badge>
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
              <h3 className="text-xl font-bold text-white">Asset Classes</h3>
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
              <h3 className="text-xl font-bold text-white">Tenancy Leases</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Active Leases</span>
                  <span className="text-white font-bold">{leasesStats.active} / {leasesStats.total}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${leasesStats.activePct}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Expiring (30d)</span>
                  <span className="text-white font-bold">{leasesStats.expiring} / {leasesStats.total}</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${leasesStats.expiringPct}%` }} />
                </div>
              </div>
              <div className="pt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-lg font-bold text-white font-mono">{leasesStats.total}</div>
                  <div className="text-[10px] uppercase text-zinc-500">Total</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-400 font-mono">{leasesStats.active}</div>
                  <div className="text-[10px] uppercase text-emerald-500/70">Active</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-lg font-bold text-amber-400 font-mono">{leasesStats.expiring}</div>
                  <div className="text-[10px] uppercase text-amber-500/70">Expiring</div>
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
