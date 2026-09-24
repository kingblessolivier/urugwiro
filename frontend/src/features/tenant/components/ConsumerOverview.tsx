import React from 'react';
import {
  AlertCircle, ArrowRight, Calendar, Handshake, Landmark,
  TrendingUp, Sparkles, KeyRound, Smartphone, ShieldCheck,
  ChevronRight, Clock, MapPin, Eye, Building2, Heart
} from 'lucide-react';
import type { ConsumerDashboardData, ConsumerPersona, ConsumerTab } from '../types';
import { Badge } from '../../../components/ui/Badge';

interface ConsumerOverviewProps {
  data: ConsumerDashboardData | null;
  persona: ConsumerPersona;
  onSelectTab: (tab: ConsumerTab) => void;
  onOpenCounterModal?: () => void;
  onOpenPayRentModal?: () => void;
  onNavigate?: (view: any) => void;
}

export const ConsumerOverview: React.FC<ConsumerOverviewProps> = ({
  data,
  persona,
  onSelectTab,
  onOpenCounterModal,
  onOpenPayRentModal,
  onNavigate,
}) => {
  const metrics = data?.metrics || {
    active_offers: 0,
    countered_offers: 0,
    upcoming_visits: 0,
    active_leases: 0,
    purchased_assets: 0,
    saved_properties: 0,
    total_volume_rwf: 0,
    next_rent_due: {
      days_left: 12,
      due_date: '05 Oct 2026',
      amount_rwf: 450000,
      is_urgent: false,
    },
  };

  const urgentCounter = data?.urgent_counter;
  const nextVisit = data?.next_visit;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Urgent Counter-Offer Alert Banner */}
      {urgentCounter && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-purple-950/30 border border-purple-500/30 shadow-lg shadow-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Action Required
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-medium">
                  Revised Offer
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Seller countered your offer on <span className="text-purple-300">{urgentCounter.listing_title}</span>
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 font-mono">
                Counter Amount: <strong className="text-purple-200">{urgentCounter.counter_amount.toLocaleString()} RWF</strong> (was {urgentCounter.original_amount.toLocaleString()} RWF)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectTab('offers');
              if (onOpenCounterModal) onOpenCounterModal();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
          >
            <span>Review & Respond</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Primary Status Cockpit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Showing Pass Card */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-950/30 via-white/[0.02] to-transparent border border-emerald-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Verified Inspection
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">Next Showing Pass</h4>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('showings')}
              className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-medium"
            >
              View Pass <ChevronRight size={14} />
            </button>
          </div>

          {nextVisit ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                    {nextVisit.property_title}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-emerald-400" />
                    <span>{nextVisit.scheduled_date}</span>
                  </div>
                </div>
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
                  CONFIRMED
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">Broker: <strong className="text-zinc-200">{nextVisit.agent_name}</strong></span>
                <span className="text-zinc-400 font-mono">{nextVisit.agent_phone}</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-zinc-400">No showings scheduled this week.</p>
              <button
                onClick={() => onNavigate && onNavigate('discovery')}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5 transition-all"
              >
                <span>Browse & Book Inspection</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Rent & Tenancy / Escrow Vault Status */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-sky-950/20 via-white/[0.02] to-transparent border border-sky-500/20 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <KeyRound size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Tenancy Vault
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {persona === 'tenant' ? 'Monthly Rent Countdown' : 'Escrow & Deeds Vault'}
                </h4>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('assets')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              Vault <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider">Next Rent Obligation</div>
                <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-0.5">
                  {metrics.next_rent_due.amount_rwf.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-zinc-400">RWF</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-sky-400">
                  {metrics.next_rent_due.days_left} <span className="text-xs font-normal">days</span>
                </div>
                <div className="text-[10px] text-zinc-400">Due {metrics.next_rent_due.due_date}</div>
              </div>
            </div>

            <button
              onClick={onOpenPayRentModal}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Smartphone size={15} />
              <span>Instant Pay via MTN MoMo / Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onSelectTab('offers')}
          className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-purple-500/40 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Active Offers</span>
            <Handshake size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {metrics.active_offers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {metrics.countered_offers > 0 ? (
              <span className="text-purple-400 font-semibold">{metrics.countered_offers} waiting response</span>
            ) : (
              'Under broker review'
            )}
          </div>
        </div>

        <div
          onClick={() => onSelectTab('showings')}
          className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Showings Booked</span>
            <Calendar size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {metrics.upcoming_visits}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">With certified field agents</div>
        </div>

        <div
          onClick={() => onSelectTab('assets')}
          className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-sky-500/40 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">
              {persona === 'buyer' ? 'Acquired Deeds' : 'Active Leases'}
            </span>
            <Landmark size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {persona === 'buyer' ? metrics.purchased_assets : metrics.active_leases}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Sovereign certified archives</div>
        </div>

        <div
          onClick={() => onSelectTab('saved')}
          className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-rose-500/40 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Watchlist</span>
            <Heart size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {metrics.saved_properties}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Tracked for price shifts</div>
        </div>
      </div>

      {/* Kigali Market Trends & AI Quick Match Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Market Benchmark Pulse */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Kigali Benchmark Index (Price / SQM)
                </h4>
                <p className="text-[11px] text-zinc-400">RLMUA Cadastral Valuation Standard</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('trends')}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
            >
              Corridor Insights <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { district: 'Gasabo', price: '1,150,000 RWF', growth: '+14.2%', yield: '7.8%' },
              { district: 'Kicukiro', price: '720,000 RWF', growth: '+11.8%', yield: '8.5%' },
              { district: 'Nyarugenge', price: '980,000 RWF', growth: '+9.5%', yield: '7.2%' },
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/10">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">{d.district}</div>
                <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {d.price}
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                  <span>YoY: <strong className="text-emerald-500">{d.growth}</strong></span>
                  <span>Yield: {d.yield}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Matchmaker Shortcut */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-3">
              <Sparkles size={12} /> AI Property Advisor
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">
              Personalized Investment Engine
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Match your exact budget, district preferences, and desired rental yield against newly surveyed inventory.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('matchmaker')}
            className="mt-4 w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <span>Run AI Matchmaker</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
