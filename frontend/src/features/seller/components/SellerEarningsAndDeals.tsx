import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, ShieldCheck, Clock, FileText, CheckCircle2,
  Download, ArrowUpRight, HandCoins, Building
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';

export const SellerEarningsAndDeals: React.FC = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seller-deals-earnings'],
    queryFn: async () => {
      const res = await api.seller.deals();
      return res.data;
    },
  });

  const metrics = data?.metrics || {
    closed_sales_volume: 0,
    escrow_in_transit: 0,
    net_disbursed: 0,
    total_deals: 0,
    active_deals: 0,
    currency: 'RWF',
  };

  const deals = data?.deals || [];
  const documents = data?.documents || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Sales, Earnings & Notary Vault</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor closed asset volume, escrow-backed earnest deposits, and sovereign deeds.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck size={14} />
          <span>BNR Regulated Escrow Vault</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span>Closed Sales Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.closed_sales_volume.toLocaleString()} <span className="text-xs font-sans text-zinc-400">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">Lifetime settled conveyances</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span>Escrow In-Transit</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.escrow_in_transit.toLocaleString()} <span className="text-xs font-sans text-zinc-400">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">Held in bank tripartite vault</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span>Net Disbursed Payouts</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400">
            {metrics.net_disbursed.toLocaleString()} <span className="text-xs font-sans text-zinc-400">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">Disbursed to your Rwandan bank</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span>Transaction Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <HandCoins size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.active_deals} <span className="text-xs font-sans text-zinc-400">Active Deals</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">{metrics.total_deals} total deals processed</p>
        </div>
      </div>

      {/* Conveyance Pipeline Table */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building size={16} className="text-emerald-400" />
            Conveyance & Deals Ledger
          </h3>
          <span className="text-xs font-mono text-zinc-400">{deals.length} Recorded Deals</span>
        </div>

        {deals.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <HandCoins size={36} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-xs font-semibold text-white">No Sales or Deals Yet</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              When a buyer offer is accepted on one of your assets, it will automatically initiate a formal conveyance deal here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-4">Asset / Property</th>
                  <th className="py-3 px-4">Buyer / Tenant</th>
                  <th className="py-3 px-4">Agreed Price</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deals.map((deal: any) => (
                  <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block truncate max-w-[200px]">
                        {deal.listing_title || 'Listing Asset'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {deal.deal_type === 'sale' ? 'Sale Conveyance' : 'Rental Lease'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-200 block">{deal.buyer_name || deal.buyer_email}</span>
                      <span className="text-[10px] text-zinc-500">{deal.buyer_email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {Number(deal.agreed_price).toLocaleString()} {deal.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        deal.escrow_status === 'released_to_seller'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : deal.escrow_status === 'held_in_escrow'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-white/5'
                      }`}>
                        {deal.escrow_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-zinc-300">
                      {deal.current_stage?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${deal.progress_percentage || 20}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
                        {deal.progress_percentage || 20}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sovereign Notary Documents & Deeds Vault */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              Sovereign Legal Deeds & Notary Paperwork
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Official bilateral sales agreements, RLMUA title deeds, and Irembo transfer bills.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{documents.length} Deeds on File</span>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-black/20 rounded-2xl border border-white/5">
            <FileText size={28} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-xs">No transaction contracts filed yet</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Contracts, escrow vouchers, and notary certificates will populate automatically as deals advance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white line-clamp-1">{doc.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {doc.document_type_label || doc.document_type} • {doc.listing_title}
                    </p>
                  </div>
                </div>

                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
                    title="Download Deed"
                  >
                    <Download size={14} />
                  </a>
                ) : (
                  <Badge variant="success" className="text-[9px]">Verified On-Chain</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
