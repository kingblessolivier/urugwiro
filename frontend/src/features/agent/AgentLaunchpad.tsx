import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Building2, Calendar, Layers, ShieldCheck,
  ArrowRight, Wallet, MessageSquare, AlertCircle,
  Landmark, Handshake, Star
} from 'lucide-react';
import { api } from '../../api/endpoints';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface AgentLaunchpadProps {
  onSelectTab?: (tab: string) => void;
}

export const AgentLaunchpad: React.FC<AgentLaunchpadProps> = ({ onSelectTab }) => {
  const { data, isLoading: _isLoading } = useQuery({
    queryKey: ['agent-dashboard'],
    queryFn: async () => {
      const res = await api.agent.dashboard();
      return res.data;
    },
  });

  const metrics = data?.metrics || {
    total_assigned_listings: 0,
    active_listings: 0,
    scheduled_visits: 0,
    completed_visits: 0,
    pending_offers: 0,
    active_deals: 0,
    gross_sales_volume: 0,
    earned_commissions: 0,
    pending_escrow_commission: 0,
    unread_leads: 0,
    currency: 'RWF',
  };

  const profile = data?.agent_profile || {
    name: 'Field Broker',
    license_number: 'PENDING_REGISTRATION',
    specialization: 'General Real Estate',
    rating: 0.0,
    total_deals: 0,
    is_verified: false,
  };

  const urgentAlerts = data?.urgent_alerts || [];
  const hasPipelineData = (metrics.total_assigned_listings + metrics.scheduled_visits + metrics.pending_offers + metrics.active_deals) > 0;

  const distributionChartData = {
    labels: ['Assigned Inventory', 'Scheduled Visits', 'Offers Under Review', 'Conveyance Deals'],
    datasets: [
      {
        data: [
          metrics.total_assigned_listings || 0,
          metrics.scheduled_visits || 0,
          metrics.pending_offers || 0,
          metrics.active_deals || 0,
        ],
        backgroundColor: ['#10b981', '#38bdf8', '#fbbf24', '#a855f7'],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const performanceChartData = {
    labels: ['Listings', 'Visits', 'Offers', 'Deals'],
    datasets: [
      {
        label: 'Transaction Pipeline',
        data: [
          metrics.total_assigned_listings,
          metrics.scheduled_visits + metrics.completed_visits,
          metrics.pending_offers,
          metrics.active_deals,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.25)',
          'rgba(56, 189, 248, 0.25)',
          'rgba(251, 191, 36, 0.25)',
          'rgba(168, 85, 247, 0.25)',
        ],
        borderColor: ['#10b981', '#38bdf8', '#fbbf24', '#a855f7'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-zinc-50 dark:via-white/[0.02] to-transparent p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Certified Field Broker Cockpit
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Welcome back, <span className="text-emerald-500">{profile.name}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
              Fiduciary portfolio management, scheduled showings with État des Lieux logging, offer negotiations, and legal title conveyance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-sm">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">License Number</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{profile.license_number}</span>
            </div>
            <div className="text-right p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10 shadow-sm">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Broker Rating</span>
              <span className="text-xs font-bold text-amber-500 flex items-center justify-end gap-1">
                <Star size={12} fill="currentColor" /> {profile.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Action Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          {urgentAlerts.map((alert: any, i: number) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center text-amber-700 dark:text-amber-300 animate-in fade-in duration-150"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <span className="font-medium">{alert.message}</span>
              </div>
              {onSelectTab && (
                <button
                  onClick={() => onSelectTab(alert.action_tab)}
                  className="font-bold uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Action <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Assigned Portfolio',
            value: metrics.total_assigned_listings,
            sub: `${metrics.active_listings} currently listed`,
            icon: Building2,
            color: 'text-sky-500',
            tab: 'portfolio',
          },
          {
            label: 'Scheduled Showings',
            value: metrics.scheduled_visits,
            sub: `${metrics.completed_visits} completed`,
            icon: Calendar,
            color: 'text-amber-500',
            tab: 'visits',
          },
          {
            label: 'Active Offers',
            value: metrics.pending_offers,
            sub: 'Awaiting consultation',
            icon: Handshake,
            color: 'text-purple-500',
            tab: 'offers',
          },
          {
            label: 'Earned Commissions',
            value: `${Number(metrics.earned_commissions).toLocaleString()} ${metrics.currency}`,
            sub: `+${Number(metrics.pending_escrow_commission).toLocaleString()} in escrow`,
            icon: Wallet,
            color: 'text-emerald-500',
            tab: 'earnings',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => onSelectTab && onSelectTab(stat.tab)}
              className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.04] ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-bold ${stat.color} font-mono truncate`}>
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium text-zinc-500 mt-1 flex justify-between items-center">
                  <span>{stat.sub}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 h-[380px] flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" /> Operational Volume Distribution
            </h3>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              Live Pipeline
            </span>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            {hasPipelineData ? (
              <Doughnut
                data={distributionChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#71717a', font: { family: 'Inter', size: 11 } },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                  <Layers size={20} />
                </div>
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Pipeline Transactions</div>
                <div className="text-[11px] text-zinc-500 max-w-xs">
                  Assigned listings, showings, or deals will populate this distribution graph.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 h-[380px] flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 size={16} className="text-emerald-500" /> Conveyance Pipeline Stages
            </h3>
            <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-500 text-xs font-bold rounded-full border border-sky-500/20">
              Rwandan Standards
            </span>
          </div>
          <div className="flex-1 relative">
            <Bar
              data={performanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    ticks: { color: '#71717a' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                  },
                  x: {
                    ticks: { color: '#71717a' },
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab && onSelectTab('portfolio')}
          className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 w-fit mb-3">
            <Building2 size={20} />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Assigned Inventory Dossiers
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Access cadastral UPI numbers, owner contact cards, and generate AI listing narratives.
          </p>
        </div>

        <div
          onClick={() => onSelectTab && onSelectTab('deals')}
          className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit mb-3">
            <Landmark size={20} />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Legal Conveyance & IremboGov
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Shepherd accepted sales through the 6 legal Rwandan conveyance steps to title transfer.
          </p>
        </div>

        <div
          onClick={() => onSelectTab && onSelectTab('leads')}
          className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 w-fit mb-3">
            <MessageSquare size={20} />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Prospective Buyer CRM
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Directly call, WhatsApp, or convert buyer inquiries into scheduled physical viewings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLaunchpad;
