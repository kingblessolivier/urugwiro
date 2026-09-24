import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Landmark, KeyRound, FileText, CheckCircle2,
  Smartphone, Wrench,
  CreditCard, Plus
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import type { PurchasedAsset, ConsumerLease, RentPayment, MaintenanceTicket } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { RentPaymentModal } from './RentPaymentModal';
import { MaintenanceTicketModal } from './MaintenanceTicketModal';

export const ConsumerAssetsAndLeases: React.FC = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'leases' | 'purchased'>('leases');
  const [payRentModalOpen, setPayRentModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<ConsumerLease | null>(null);

  // Leases
  const { data: leases = [], isLoading: leasesLoading } = useQuery<ConsumerLease[]>({
    queryKey: ['consumer-leases'],
    queryFn: async () => {
      const res = await api.consumer.leases();
      return res.data;
    },
  });

  // Purchased Deals & Deeds
  const { data: purchasedAssets = [], isLoading: purchasedLoading } = useQuery<PurchasedAsset[]>({
    queryKey: ['consumer-purchased-assets'],
    queryFn: async () => {
      const res = await api.consumer.purchasedAssets();
      return res.data;
    },
  });

  // Payments History
  const { data: payments = [], refetch: refetchPayments } = useQuery<RentPayment[]>({
    queryKey: ['consumer-payments'],
    queryFn: async () => {
      const res = await api.consumer.payments();
      return res.data;
    },
  });

  // Maintenance Requests
  const { data: maintenanceRequests = [], refetch: refetchMaintenance } = useQuery<MaintenanceTicket[]>({
    queryKey: ['consumer-maintenance'],
    queryFn: async () => {
      const res = await api.consumer.maintenanceRequests();
      return res.data;
    },
  });

  const payRentMutation = useMutation({
    mutationFn: async (payload: { amount: number; payment_method: 'momo' | 'airtel' | 'card'; phone_number: string }) => {
      return api.consumer.payRent({
        ...payload,
        lease_id: selectedLease?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['consumer-dashboard'] });
      refetchPayments();
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (payload: { title: string; description: string; listing_id?: number }) => {
      return api.consumer.createMaintenance(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumer-maintenance'] });
      refetchMaintenance();
    },
  });

  const _activeLease = leases.length > 0 ? leases[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Landmark className="text-sky-500" size={22} />
            <span>Vault: Properties & Leases</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your legal deeds, active residential leases, and official conveyance documents.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('leases')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'leases'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <KeyRound size={13} />
            <span>Active Leases ({leases.length})</span>
          </button>

          <button
            onClick={() => setSubTab('purchased')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'purchased'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Landmark size={13} />
            <span>Acquired Deeds ({purchasedAssets.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'leases' ? (
        /* LEASES TAB */
        <div className="space-y-6">
          {leasesLoading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading tenancy agreements...
            </div>
          ) : leases.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                <KeyRound size={28} />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">No Active Leases</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                You currently do not have any registered residential or commercial tenancies under management.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leases.map((lease) => (
                <div
                  key={lease.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={lease.image}
                        alt={lease.property_title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="text-xs text-zinc-400">{lease.location}</div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                          {lease.property_title}
                        </h4>
                        <div className="text-xs text-sky-500 font-mono font-bold mt-0.5">
                          {lease.rent_amount.toLocaleString()} RWF / month
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLease(lease);
                          setPayRentModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Smartphone size={14} />
                        <span>Pay Rent via MoMo</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLease(lease);
                          setMaintenanceModalOpen(true);
                        }}
                        className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Wrench size={14} />
                        <span>Issue Ticket</span>
                      </button>
                    </div>
                  </div>

                  {/* Lease Countdown Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase block">Term Remaining</span>
                      <span className="text-base font-bold text-sky-500">
                        {lease.days_remaining} days
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase block">Start Date</span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">
                        {lease.start_date || '01 Jan 2026'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase block">Expiry Date</span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">
                        {lease.end_date || '31 Dec 2026'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase block">Agreement</span>
                      <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} /> Executed
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Maintenance Tickets & Payment History Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
                {/* Maintenance Tickets */}
                <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Wrench size={16} className="text-amber-500" />
                      <span>Maintenance Tickets</span>
                    </h4>
                    <button
                      onClick={() => setMaintenanceModalOpen(true)}
                      className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1"
                    >
                      <Plus size={13} /> Report Issue
                    </button>
                  </div>

                  {maintenanceRequests.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 text-center">
                      No active maintenance issues reported.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {maintenanceRequests.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {ticket.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {ticket.request_date || 'Recently reported'}
                            </div>
                          </div>
                          <Badge
                            variant={
                              ticket.status === 'completed'
                                ? 'success'
                                : ticket.status === 'in_progress'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rent Payments History */}
                <div className="p-5 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={16} className="text-emerald-500" />
                      <span>Rent Payment Ledger</span>
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-mono">Verified MTNs</span>
                  </div>

                  {payments.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 text-center">
                      No payment receipts logged yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <div className="text-zinc-900 dark:text-white font-bold">
                              {p.amount.toLocaleString()} RWF
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {p.transaction_reference}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-bold">
                              {p.payment_method}
                            </span>
                            <div className="text-[10px] text-zinc-400 mt-1">{p.date_paid}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ACQUIRED DEEDS & ASSETS TAB */
        <div className="space-y-5">
          {purchasedLoading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Retrieving cadastral conveyance deeds...
            </div>
          ) : purchasedAssets.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                <Landmark size={28} />
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">No Acquired Properties Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Once a purchase offer reaches notarization and title deed transfer, your sovereign RLMUA certificates and bilateral sales contracts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchasedAssets.map((asset) => (
                <div
                  key={asset.deal_id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={asset.property_image}
                        alt={asset.property_title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="text-xs text-zinc-400">{asset.property_location}</div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                          {asset.property_title}
                        </h4>
                        <div className="text-xs font-mono text-emerald-500 font-bold mt-0.5">
                          Agreed Price: {asset.agreed_price.toLocaleString()} RWF
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                        UPI: {asset.land_upi}
                      </span>
                    </div>
                  </div>

                  {/* Documents Archive */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-white/10">
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                      Official Paperwork & Conveyance Certifications:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { title: 'RLMUA e-Title Deed', type: 'UPI Deed', verified: true },
                        { title: 'Bilateral Sales Agreement', type: 'Contract', verified: true },
                        { title: 'Irembo Notary Receipt', type: 'Tax Clearance', verified: true },
                      ].map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={16} className="text-sky-400 shrink-0" />
                            <div className="truncate">
                              <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                {doc.title}
                              </div>
                              <div className="text-[10px] text-zinc-400">{doc.type}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-500 font-mono font-bold shrink-0">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RentPaymentModal
        isOpen={payRentModalOpen}
        onClose={() => setPayRentModalOpen(false)}
        defaultAmount={selectedLease?.rent_amount || 450000}
        propertyTitle={selectedLease?.property_title}
        onPay={async (payload) => {
          return payRentMutation.mutateAsync(payload);
        }}
      />

      <MaintenanceTicketModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        listingId={selectedLease?.listing_id}
        onSubmit={async (payload) => {
          await maintenanceMutation.mutateAsync(payload);
        }}
      />
    </div>
  );
};
