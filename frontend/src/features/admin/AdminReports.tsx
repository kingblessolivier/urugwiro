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
  // 1. Live Deals (Transactions)
  const { data: dealsData } = useQuery({
    queryKey: ['reports-deals'],
    queryFn: async () => {
      try {
        const res = await api.admin.transactions();
        const data = res.data?.results || res.data || [];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  // 2. Live Listings
  const { data: listingsData } = useQuery({
    queryKey: ['reports-listings'],
    queryFn: async () => {
      try {
        const res = await api.listings.list();
        const data = res.data?.results || res.data || [];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  // 3. Live Offers
  const { data: offersData } = useQuery({
    queryKey: ['reports-offers'],
    queryFn: async () => {
      try {
        const res = await api.admin.offers();
        const data = res.data?.results || res.data || [];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  // 4. Live Users
  const { data: usersData } = useQuery({
    queryKey: ['reports-users'],
    queryFn: async () => {
      try {
        const res = await api.admin.users.list({ page_size: 100 });
        const data = res.data?.results || res.data || [];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  const deals = dealsData || [];
  const listings = listingsData || [];
  const offers = offersData || [];
  const users = usersData || [];

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

  // Dynamic Transaction Status Distribution
  const dealStatusData = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let cancelled = 0;

    deals.forEach((d: any) => {
      const st = (d.status || '').toLowerCase();
      if (st === 'completed') completed += 1;
      else if (st === 'cancelled') cancelled += 1;
      else pending += 1;
    });

    const hasData = completed + pending + cancelled > 0;

    return {
      labels: ['Completed', 'Pending / In Progress', 'Cancelled'],
      datasets: [
        {
          data: hasData ? [completed, pending, cancelled] : [0, 0, 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
        },
      ],
    };
  }, [deals]);

  // Dynamic Offers Status Breakdown
  const offerStats = useMemo(() => {
    const total = offers.length;
    const accepted = offers.filter((o: any) => (o.status || '').toLowerCase() === 'accepted').length;
    const pending = offers.filter((o: any) => (o.status || '').toLowerCase() === 'pending').length;
    const rejected = offers.filter((o: any) => ['rejected', 'declined'].includes((o.status || '').toLowerCase())).length;

    const acceptedPct = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

    return { total, accepted, pending, rejected, acceptedPct, pendingPct };
  }, [offers]);

  const kpis = [
    {
      label: 'Transaction Volume',
      value: totalDealsVolume > 0 ? `${(totalDealsVolume / 1000000).toFixed(1)}M RWF` : '0 RWF',
      sub: `${deals.length} Total Transactions`,
      icon: TrendingUp,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      label: 'Total Properties',
      value: listings.length.toString(),
      sub: `${listings.filter((listing: any) => ['verified', 'professional'].includes(listing.verification_level)).length} verified`,
      icon: Building2,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      label: 'Purchase Offers',
      value: offers.length.toString(),
      sub: `${offers.filter((o: any) => o.status === 'pending').length} Pending review`,
      icon: Users,
      color: 'text-purple-700 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10'
    },
  ];

  const reportTypes = [
    { id: 'listings', label: 'Listings' },
    { id: 'customers', label: 'Customers' },
    { id: 'conversations', label: 'Conversations' },
    { id: 'visits', label: 'Visits' },
    { id: 'offers', label: 'Offers' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'expenses', label: 'Expenses' },
  ];

  return (
    <div className="p-8 lg:p-12 bg-transparent min-h-screen text-[var(--color-text-main)] animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-brand-emerald)] mb-2">Live Reports</p>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-main)]">Reports & <span className="text-[var(--color-brand-emerald)]">Analytics</span></h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {reportTypes.map(report => (
              <a
                key={report.id}
                href={`/api/reports/export/${report.id}/`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:border-emerald-500/40 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Download size={13} /> Export {report.label}
              </a>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] transition-all hover:border-emerald-500/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--color-text-dim)] text-sm font-medium uppercase tracking-widest">{kpi.label}</p>
                  <h3 className="text-3xl font-bold text-[var(--color-text-main)] mt-1 font-mono">{kpi.value}</h3>
                  <p className="text-xs text-[var(--color-text-dim)] mt-2">{kpi.sub}</p>
                </div>
                <div className={cn("p-3 rounded-xl border border-[var(--color-border)]", kpi.bg, kpi.color)}>
                  {React.createElement(kpi.icon as any, { size: 24 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)]">Monthly Revenue</h3>
              </div>
              <Badge variant="text" tone="neutral" className="text-[10px] uppercase tracking-widest">Real Database Records</Badge>
            </div>
            <div className="h-[300px]">
              <Line data={revenueData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(113,113,122,0.15)' }, ticks: { color: '#71717a' } },
                  x: { grid: { display: false }, ticks: { color: '#71717a' } }
                }
              }} />
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-main)]">User Signups Growth</h3>
              </div>
              <Badge variant="text" tone="neutral" className="text-[10px] uppercase tracking-widest">By Month ({new Date().getFullYear()})</Badge>
            </div>
            <div className="h-[300px]">
              <Bar data={userData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(113,113,122,0.15)' }, ticks: { color: '#71717a' } },
                  x: { grid: { display: false }, ticks: { color: '#71717a' } }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Types */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                <PieChart size={20} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">Asset Classes</h3>
            </div>
            <div className="h-[250px] relative">
              <Doughnut data={propTypeData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } } }
              }} />
            </div>
          </div>

          {/* Transaction Stages */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">Transaction Stages</h3>
            </div>
            <div className="h-[250px] relative">
              <Doughnut data={dealStatusData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { size: 11 } } } }
              }} />
            </div>
          </div>

          {/* Offers & Negotiations */}
          <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)] lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">Offers & Negotiations</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Accepted Offers</span>
                  <span className="text-[var(--color-text-main)] font-bold">{offerStats.accepted} / {offerStats.total}</span>
                </div>
                <div className="h-2 w-full bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 dark:bg-emerald-500" style={{ width: `${offerStats.acceptedPct}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Under Review (Pending)</span>
                  <span className="text-[var(--color-text-main)] font-bold">{offerStats.pending} / {offerStats.total}</span>
                </div>
                <div className="h-2 w-full bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${offerStats.pendingPct}%` }} />
                </div>
              </div>
              <div className="pt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  <div className="text-lg font-bold text-[var(--color-text-main)] font-mono">{offerStats.total}</div>
                  <div className="text-[10px] uppercase text-[var(--color-text-dim)]">Total</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">{offerStats.accepted}</div>
                  <div className="text-[10px] uppercase text-emerald-700/70 dark:text-emerald-500/70">Accepted</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono">{offerStats.pending}</div>
                  <div className="text-[10px] uppercase text-amber-700/70 dark:text-amber-500/70">Pending</div>
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
