import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, ShieldCheck, Clock, FileText,
  Download, HandCoins, Building
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../api/endpoints';
import { cn } from '../../../lib/utils';
import { tableHead, tableTh, tableBody, tableTr } from '../../../components/ui/Dashboard';
import { ContractSigningDesk } from '../../../components/contracts/ContractSigningDesk';

export const SellerEarningsAndDeals: React.FC = () => {
  const [contractDeal, setContractDeal] = useState<any | null>(null);
  const { data, isLoading: _isLoading, refetch: _refetch } = useQuery({
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
          <h2 className="text-2xl font-bold font-display text-[var(--color-text-main)]">Sales, Earnings & Documents</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Monitor closed transaction volume, escrow deposits, and property deeds.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--color-brand-emerald)] text-xs font-mono">
          <ShieldCheck size={14} />
          <span>BNR Regulated Escrow</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] text-xs mb-3">
            <span>Closed Sales Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-[var(--color-brand-emerald)]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-main)]">
            {metrics.closed_sales_volume.toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-muted)]">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-2">Lifetime settled transactions</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] text-xs mb-3">
            <span>Escrow In-Transit</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {metrics.escrow_in_transit.toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-muted)]">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-2">Held in bank escrow account</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] text-xs mb-3">
            <span>Net Disbursed Payouts</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
            {metrics.net_disbursed.toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-muted)]">{metrics.currency}</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-2">Disbursed to your Rwandan bank</p>
        </div>

        <div className="p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--color-text-muted)] text-xs mb-3">
            <span>Transaction Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HandCoins size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-main)]">
            {metrics.active_deals} <span className="text-xs font-sans text-[var(--color-text-muted)]">Active Deals</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-dim)] mt-2">{metrics.total_deals} total deals processed</p>
        </div>
      </div>

      {/* Conveyance Pipeline Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Building size={16} className="text-[var(--color-brand-emerald)]" />
            Conveyance & Deals Ledger
          </h3>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{deals.length} Recorded Deals</span>
        </div>

        {deals.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-dim)]">
            <HandCoins size={36} className="mx-auto text-[var(--color-text-dim)] mb-2" />
            <p className="text-xs font-semibold text-[var(--color-text-main)]">No Sales or Deals Yet</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              When a buyer offer is accepted on one of your assets, it will automatically initiate a formal conveyance deal here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className={tableHead}>
                <tr>
                  <th className={tableTh}>Asset / Property</th>
                  <th className={tableTh}>Buyer / Tenant</th>
                  <th className={tableTh}>Agreed Price</th>
                  <th className={tableTh}>Escrow Status</th>
                  <th className={tableTh}>Current Stage</th>
                  <th className={tableTh}>Progress</th>
                  <th className={tableTh}>Date</th>
                  <th className={cn(tableTh, 'text-right')}>Contract Signing</th>
                </tr>
              </thead>
              <tbody className={tableBody}>
                {deals.map((deal: any) => (
                  <tr key={deal.id} className={tableTr}>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[var(--color-text-main)] block truncate max-w-[200px]">
                        {deal.listing_title || 'Listing Asset'}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                        {deal.deal_type === 'sale' ? 'Sale Conveyance' : 'Rental Lease'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[var(--color-text-muted)] block">{deal.buyer_name || deal.buyer_email}</span>
                      <span className="text-[10px] text-[var(--color-text-dim)]">{deal.buyer_email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--color-brand-emerald)]">
                      {Number(deal.agreed_price).toLocaleString()} {deal.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        deal.escrow_status === 'released_to_seller'
                          ? 'bg-[var(--color-accent-soft-bg)] text-[var(--color-brand-emerald)] border-emerald-500/20'
                          : deal.escrow_status === 'held_in_escrow'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-600 dark:text-amber-400 dark:border-amber-500/20'
                          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                      }`}>
                        {deal.escrow_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-[var(--color-text-muted)]">
                      {deal.current_stage?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-24 bg-[var(--color-bg-elevated)] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${deal.progress_percentage || 20}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-text-dim)] mt-0.5 block">
                        {deal.progress_percentage || 20}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--color-text-dim)]">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setContractDeal(deal)}
                        className="rounded-xl text-[11px] font-bold border-emerald-500/30 text-[var(--color-brand-emerald)] hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <FileText size={12} className="mr-1" />
                        {deal.contracts?.length > 0 && deal.contracts[0].status === 'fully_executed'
                          ? 'Sealed Contract'
                          : 'Sign Contract'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notary Documents & Deeds Vault */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-brand-emerald)]" />
              Legal Deeds & Notary Documents
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Official bilateral sales agreements, RLMUA title deeds, and Irembo transfer bills.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{documents.length} Deeds on File</span>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-dim)] bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)]">
            <FileText size={28} className="mx-auto text-[var(--color-text-dim)] mb-2" />
            <p className="text-xs">No transaction contracts filed yet</p>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-0.5">
              Contracts, escrow vouchers, and notary certificates will populate automatically as deals advance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-[var(--color-brand-emerald)]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[var(--color-text-main)] line-clamp-1">{doc.title}</h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                      {doc.document_type_label || doc.document_type} • {doc.listing_title}
                    </p>
                  </div>
                </div>

                {doc.file_url ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-emerald-500/20 text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] transition-colors"
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

      {/* Contract Signing Desk Modal */}
      {contractDeal && (
        <ContractSigningDesk
          dealId={contractDeal.id}
          contract={contractDeal.contracts?.[0]}
          initialRole="seller"
          onClose={() => setContractDeal(null)}
          onContractUpdated={() => _refetch()}
        />
      )}
    </div>
  );
};
