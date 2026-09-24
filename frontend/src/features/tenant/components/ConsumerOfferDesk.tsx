import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Handshake, AlertCircle, ArrowUpRight, CheckCircle2,
  Clock, XCircle, Filter, CornerDownLeft, MessageSquare, Phone, ShieldCheck
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import type { ConsumerOffer } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { CounterResponseModal } from './CounterResponseModal';
import { ContractSigningDesk } from '../../../components/contracts/ContractSigningDesk';

export const ConsumerOfferDesk: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'countered' | 'pending' | 'accepted'>('all');
  const [activeOfferForModal, setActiveOfferForModal] = useState<ConsumerOffer | null>(null);
  const [contractSigningOffer, setContractSigningOffer] = useState<ConsumerOffer | null>(null);

  const { data: offers = [], isLoading, refetch } = useQuery<ConsumerOffer[]>({
    queryKey: ['consumer-offers'],
    queryFn: async () => {
      const res = await api.consumer.offers();
      return res.data;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      offerId,
      action,
      newAmount,
      message,
    }: {
      offerId: number;
      action: 'accept' | 're_counter' | 'withdraw';
      newAmount?: number;
      message?: string;
    }) => {
      return api.consumer.respondOffer(offerId, {
        action,
        new_amount: newAmount,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumer-offers'] });
      queryClient.invalidateQueries({ queryKey: ['consumer-dashboard'] });
      refetch();
    },
  });

  const filteredOffers = offers.filter((o) => {
    if (filter === 'countered') return o.status === 'countered';
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'accepted') return o.status === 'accepted';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'countered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <CornerDownLeft size={12} /> Countered by Seller
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 size={12} /> Agreed & Locked
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock size={12} /> Pending Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Handshake className="text-purple-500" size={22} />
            <span>Offers & Negotiation Desk</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage purchase proposals, track seller responses, and adjust pricing terms.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'countered', label: 'Countered' },
            { id: 'pending', label: 'Pending' },
            { id: 'accepted', label: 'Accepted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your active offers...
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Handshake size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">No Offers Found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {filter === 'all'
              ? 'You have not submitted any formal purchase or rental offers yet. Browse properties and make an offer.'
              : `No offers currently under the "${filter}" filter.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const isCountered = offer.status === 'countered';

            return (
              <div
                key={offer.id}
                className={`p-5 rounded-3xl transition-all border ${
                  isCountered
                    ? 'bg-purple-500/[0.03] border-purple-500/40 shadow-lg shadow-purple-950/10'
                    : 'bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
              >
                {/* Upper Content: Property Details + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={offer.property_image}
                      alt={offer.property_title}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs text-zinc-400 truncate">{offer.property_location}</div>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                        {offer.property_title}
                      </h4>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Asking Price: <strong className="text-zinc-700 dark:text-zinc-300">{offer.asking_price.toLocaleString()} RWF</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getStatusBadge(offer.status)}
                  </div>
                </div>

                {/* Offer Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 uppercase block">Your Offer</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {offer.offer_amount.toLocaleString()} RWF
                    </span>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        offer.variance_pct <= 0 ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {offer.variance_pct}% vs Asking
                    </span>
                  </div>

                  {offer.counter_amount && (
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                      <span className="text-[10px] text-purple-400 uppercase block font-bold">
                        Counter Price
                      </span>
                      <span className="text-sm font-bold text-purple-300">
                        {offer.counter_amount.toLocaleString()} RWF
                      </span>
                      <span className="text-[10px] text-purple-400 block mt-0.5">Seller requested</span>
                    </div>
                  )}

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 uppercase block">Financing</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
                      {offer.financing_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Terms</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                    <span className="text-[10px] text-zinc-400 uppercase block">Date Submitted</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {offer.created_at || 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Accepted / Contract Signing Callout Bar */}
                {offer.status === 'accepted' && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-emerald-200">
                      <strong>Offer Accepted & Terms Locked!</strong> Digital contract is ready for statutory review and signing.
                    </div>
                    {offer.deal_id && (
                      <button
                        onClick={() => setContractSigningOffer(offer)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shrink-0 active:scale-95 shadow-md flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} /> Review & Sign Contract
                      </button>
                    )}
                  </div>
                )}

                {/* Seller / Counter Callout Bar */}
                {isCountered && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-purple-200">
                      <strong>Seller Counter-Offer Pending:</strong> The seller proposes closing at{' '}
                      <strong className="text-purple-100 font-mono">
                        {offer.counter_amount?.toLocaleString()} RWF
                      </strong>
                      .
                    </div>
                    <button
                      onClick={() => setActiveOfferForModal(offer)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shrink-0 active:scale-95 shadow-md"
                    >
                      Respond to Counter
                    </button>
                  </div>
                )}

                {/* Broker Footer */}
                {offer.agent && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-emerald-500" />
                      <span>
                        Broker: <strong className="text-zinc-700 dark:text-zinc-300">{offer.agent.name}</strong> ({offer.agent.phone})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Response Modal */}
      <CounterResponseModal
        offer={activeOfferForModal}
        isOpen={Boolean(activeOfferForModal)}
        onClose={() => setActiveOfferForModal(null)}
        onRespond={async (id, action, newAmount, message) => {
          await respondMutation.mutateAsync({ offerId: id, action, newAmount, message });
        }}
      />

      {/* Contract Signing Desk Modal */}
      {contractSigningOffer && contractSigningOffer.deal_id && (
        <ContractSigningDesk
          dealId={contractSigningOffer.deal_id}
          contract={contractSigningOffer.contracts?.[0]}
          initialRole="buyer"
          onClose={() => setContractSigningOffer(null)}
          onContractUpdated={() => refetch()}
        />
      )}
    </div>
  );
};
