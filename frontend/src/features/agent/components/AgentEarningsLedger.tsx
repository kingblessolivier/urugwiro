import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, ShieldCheck, CheckCircle2, Clock, Landmark, ArrowUpRight, Wallet } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../api/endpoints';

export const AgentEarningsLedger: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-earnings'],
    queryFn: async () => {
      const res = await api.agent.earnings();
      return res.data;
    },
  });

  const metrics = data?.metrics || {
    gross_volume: 0,
    earned_commissions: 0,
    escrow_pending: 0,
    commission_rate_percent: 3.0,
    currency: 'RWF',
  };

  const payouts = data?.payouts || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Wallet size={22} className="text-emerald-500" /> Commissions & Disbursement Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Certified field broker commissions, escrow releases, and automated payout disbursements.
          </p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-3 py-1 font-bold">
          3.0% Standard Broker Tariff
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Gross Brokered Volume</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Landmark size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
            {Number(metrics.gross_volume).toLocaleString()} {metrics.currency}
          </div>
          <span className="text-[11px] text-zinc-500">Total represented asset volume</span>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Earned Commissions</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {Number(metrics.earned_commissions).toLocaleString()} {metrics.currency}
          </div>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Disbursed on settled deals</span>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Escrow In Transit</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-500">
            {Number(metrics.escrow_pending).toLocaleString()} {metrics.currency}
          </div>
          <span className="text-[11px] text-zinc-500">Pending final notary signing</span>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Fiduciary Tariff</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-500">
            {metrics.commission_rate_percent}%
          </div>
          <span className="text-[11px] text-zinc-500">Rwandan standard conveyance rate</span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-500" /> Disbursement Records & Bank Payouts
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-white/[0.01] text-zinc-400 text-[10px] uppercase font-bold border-b border-zinc-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Deal Asset</th>
                <th className="px-6 py-4">Disbursed Amount</th>
                <th className="px-6 py-4">Payout Channel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
              {payouts.map((pay: any) => (
                <tr key={pay.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-white">{pay.id}</td>
                  <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200">{pay.listing_title}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{Number(pay.amount).toLocaleString()} {pay.currency}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{pay.channel}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-400">{pay.date}</td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400">
                    <Wallet size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">No disbursements recorded yet</p>
                    <p className="text-xs text-zinc-500 mt-1">Commissions will be disbursed directly upon settlement of conveyance deals.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
