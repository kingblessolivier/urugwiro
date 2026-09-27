import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, ShieldCheck, MapPin, MessageSquare, HandCoins,
  Calendar, FileText, Clock, User, Zap, Layers,
  Edit3, Check, Ban, TrendingUp
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';

interface PropertyInspectionDrawerProps {
  listingId: string | null;
  onClose: () => void;
  onEdit: (listing: any) => void;
  onRefresh: () => void;
}

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5">
    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
      <Icon size={14} />
    </div>
    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-main)]">{title}</h4>
  </div>
);

export const PropertyInspectionDrawer: React.FC<PropertyInspectionDrawerProps> = ({
  listingId,
  onClose,
  onEdit,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inquiries' | 'offers' | 'visits' | 'specs' | 'deeds'>('inquiries');

  // Fetch full details of the specific property
  const { data: listing, isLoading } = useQuery({
    queryKey: ['seller-listing-detail', listingId],
    queryFn: async () => {
      if (!listingId) return null;
      const res = await api.seller.listingDetail(listingId);
      return res.data;
    },
    enabled: !!listingId,
  });

  // Offer Action Mutation (Accept / Reject)
  const offerStatusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: number | string; status: 'accepted' | 'rejected' }) => {
      return api.offers.updateStatus(offerId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', listingId] });
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-deals-earnings'] });
      onRefresh();
    },
  });

  // Toggle status mutation (Listed / Withdrawn)
  const toggleStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!listingId) return;
      return api.seller.toggleStatus(listingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', listingId] });
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      onRefresh();
    },
  });

  if (!listingId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] h-full flex flex-col shadow-[var(--shadow-depth-1)] relative animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-start justify-between bg-[var(--color-bg-elevated)]">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="neutral" className="uppercase font-mono text-[10px] tracking-wider bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-brand-emerald)]">
                {listing?.category || 'Property'} • {listing?.purpose === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
              <Badge 
                variant={listing?.status === 'listed' ? 'success' : 'neutral'} 
                className="text-[10px] font-mono px-2 py-0.5"
              >
                {listing?.status === 'listed' ? 'Active' : listing?.status}
              </Badge>
              {listing?.asset?.land_spec?.upi_number && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20">
                  UPI: {listing.asset.land_spec.upi_number}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-main)] tracking-tight line-clamp-1">
              {isLoading ? 'Loading Property Data...' : listing?.title}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-[var(--color-text-dim)] shrink-0" />
              <span className="truncate">{listing?.address || `${listing?.asset?.district || 'Kigali'}, Rwanda`}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {listing && (
              <button
                onClick={() => onEdit(listing)}
                className="p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] transition-colors"
                title="Edit Property Specs & Price"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hero Quick Banner */}
        {listing && (
          <div className="px-6 py-4 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--color-text-muted)] block">List Price</span>
              <span className="text-lg font-bold font-mono text-[var(--color-brand-emerald)]">
                {Number(listing.price).toLocaleString()} <span className="text-xs font-sans text-[var(--color-text-muted)]">{listing.currency}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase">Views</span>
                <span className="text-[var(--color-text-main)] font-bold">{listing.views_count || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase">Inquiries</span>
                <span className="text-[var(--color-text-main)] font-bold">{listing.inquiries?.length || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase">Offers</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{listing.offers?.length || 0}</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => toggleStatusMutation.mutate(listing.status === 'listed' ? 'withdrawn' : 'listed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  listing.status === 'listed'
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20'
                }`}
              >
                {listing.status === 'listed' ? 'Pause / Archive' : 'Reactivate Listing'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 gap-2 pt-2">
          {[
            { id: 'inquiries', label: `Inquiries (${listing?.inquiries?.length || 0})`, icon: MessageSquare },
            { id: 'offers', label: `Offers (${listing?.offers?.length || 0})`, icon: HandCoins },
            { id: 'visits', label: `Site Visits (${listing?.visits?.length || 0})`, icon: Calendar },
            { id: 'specs', label: 'Specs & Features', icon: TrendingUp },
            { id: 'deeds', label: 'Cadastre / Deeds', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-emerald-500 text-[var(--color-brand-emerald)] font-semibold'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-dim)]">
              <Clock size={32} className="animate-spin text-emerald-600 dark:text-emerald-500 mb-3" />
              <p className="text-xs">Fetching property details...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-3">
                  {!listing?.inquiries || listing.inquiries.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                      <MessageSquare size={32} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                      <p className="text-xs font-medium text-[var(--color-text-main)]">No Inquiries Yet</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Prospective buyers who submit inquiries on this asset will appear here.</p>
                    </div>
                  ) : (
                    listing.inquiries.map((inq: any) => (
                      <div key={inq.id} className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[var(--color-text-main)] flex items-center gap-2">
                            {inq.name}
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">{inq.email}</span>
                          </span>
                          <span className="text-[10px] text-[var(--color-text-dim)] font-mono">
                            {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] p-3 rounded-xl border border-[var(--color-border)]">
                          "{inq.message}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: BUYER OFFERS */}
              {activeTab === 'offers' && (
                <div className="space-y-3">
                  {!listing?.offers || listing.offers.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                      <HandCoins size={32} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                      <p className="text-xs font-medium text-[var(--color-text-main)]">No Offers Submitted</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">When buyers make binding offers with escrow commitments, they will be listed here.</p>
                    </div>
                  ) : (
                    listing.offers.map((offer: any) => (
                      <div key={offer.id} className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[var(--color-text-dim)] uppercase font-mono block">Proposed Price</span>
                            <span className="text-base font-bold font-mono text-[var(--color-brand-emerald)]">
                              {Number(offer.amount).toLocaleString()} {listing.currency}
                            </span>
                          </div>
                          <Badge 
                            variant={offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'error' : 'neutral'}
                            className="text-[10px] font-mono uppercase"
                          >
                            {offer.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-[var(--color-bg-surface)] p-2.5 rounded-xl border border-[var(--color-border)]">
                          <div>
                            <span className="text-[var(--color-text-dim)]">Buyer: </span>
                            <span className="text-[var(--color-text-main)] font-medium">{offer.buyer_name || offer.buyer_username || 'Verified Buyer'}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-text-dim)]">Financing: </span>
                            <span className="text-[var(--color-text-main)] uppercase font-mono">{offer.financing_type || 'Cash'}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-text-dim)]">Escrow Commitment: </span>
                            <span className="text-[var(--color-brand-emerald)] font-mono">{offer.escrow_proposed_percent || 10}%</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-text-dim)]">Target Closing: </span>
                            <span className="text-[var(--color-text-main)] font-mono">{offer.proposed_closing_date || 'Within 14 Days'}</span>
                          </div>
                        </div>

                        {offer.message && (
                          <p className="text-xs text-[var(--color-text-muted)] italic">
                            "{offer.message}"
                          </p>
                        )}

                        {offer.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
                            <button
                              onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                              disabled={offerStatusMutation.isPending}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Check size={14} /> Accept Offer & Lock Escrow
                            </button>
                            <button
                              onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'rejected' })}
                              disabled={offerStatusMutation.isPending}
                              className="py-1.5 px-3 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Ban size={14} /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: SITE VISITS */}
              {activeTab === 'visits' && (
                <div className="space-y-3">
                  {!listing?.visits || listing.visits.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                      <Calendar size={32} className="mx-auto text-[var(--color-text-dim)] mb-2" />
                      <p className="text-xs font-medium text-[var(--color-text-main)]">No Site Visits Booked</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Verified buyers can book physical showings accompanied by certified agents.</p>
                    </div>
                  ) : (
                    listing.visits.map((v: any) => (
                      <div key={v.id} className="p-4 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[var(--color-text-main)]">
                            Showing with {v.visitor_name || 'Client'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 dark:text-[var(--color-brand-emerald)] dark:bg-emerald-500/10 dark:border-emerald-500/20">
                            {v.status}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] space-y-1.5">
                          <p className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[var(--color-text-dim)] shrink-0" />
                            Scheduled: <span className="text-[var(--color-text-main)] font-mono">{new Date(v.scheduled_date).toLocaleString()}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <User size={12} className="text-[var(--color-text-dim)] shrink-0" />
                            Certified Agent: <span className="text-[var(--color-text-main)]">{v.agent_name || 'Concierge Agent'}</span>
                          </p>
                          {v.report && (
                            <p className="flex items-start gap-1.5 bg-[var(--color-bg-surface)] p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] mt-2">
                              <FileText size={12} className="text-[var(--color-text-dim)] shrink-0 mt-0.5" />
                              Report: {v.report}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: PHYSICAL SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-depth-1)] space-y-4">
                    <SectionHeader icon={Zap} title="Physical Asset Configuration" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">District / Sector</span>
                        <span className="text-[var(--color-text-main)] font-medium">{listing.asset?.district || 'Gasabo'} / {listing.asset?.sector || 'Kimihurura'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">Total Land Area</span>
                        <span className="text-[var(--color-text-main)] font-mono font-medium">{listing.asset?.total_area || 'N/A'} SQM</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">Bedrooms / Baths</span>
                        <span className="text-[var(--color-text-main)] font-mono font-medium">
                          {listing.asset?.residential_spec?.bedrooms ?? '-'} Beds • {listing.asset?.residential_spec?.bathrooms ?? '-'} Baths
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">Furnished Status</span>
                        <span className="text-[var(--color-text-main)] font-medium">
                          {listing.asset?.residential_spec?.is_furnished ? 'Fully Furnished' : 'Unfurnished'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">Compound / Garden</span>
                        <span className="text-[var(--color-text-main)] font-medium">
                          {listing.asset?.residential_spec?.has_garden ? 'Private Garden' : 'Standard Yard'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold mb-1">Water Tank / Backup</span>
                        <span className="text-[var(--color-text-main)] font-medium">
                          {listing.asset?.residential_spec?.has_water_tank ? 'Installed' : 'Municipal Direct'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Co-Brokering Agent */}
                  <div className="p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-depth-1)] space-y-3">
                    <SectionHeader icon={User} title="Assigned Co-Broker" />
                    {listing.assigned_agent ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-accent-soft-bg)] border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0">
                            {listing.assigned_agent.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[var(--color-text-main)] block">{listing.assigned_agent.name}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{listing.assigned_agent.phone} • Rating: {listing.assigned_agent.rating}★</span>
                          </div>
                        </div>
                        <Badge variant="success" className="text-[10px]">Active Representative</Badge>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center justify-between">
                        <span>No designated broker. You are handling inquiries directly.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CADASTRE & DEEDS */}
              {activeTab === 'deeds' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-depth-1)] space-y-3">
                    <div className="flex items-center justify-between">
                      <SectionHeader icon={ShieldCheck} title="National Land Registry (RLMUA)" />
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 dark:text-[var(--color-brand-emerald)] dark:bg-emerald-500/10 dark:border-emerald-500/20">
                        Authenticated
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Property parcel boundaries and zoning classifications comply with the Kigali Master Plan 2050.
                    </p>
                    <div className="p-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-dim)]">Parcel UPI:</span>
                        <span className="text-[var(--color-text-main)] font-mono font-bold">
                          {listing.asset?.land_spec?.upi_number || listing.upi_number || '1/02/03/04/5678'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-dim)]">Zoning Designation:</span>
                        <span className="text-[var(--color-brand-emerald)] font-mono">
                          {listing.asset?.land_spec?.zoning_code || 'R1 (Low-Density Residential)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents */}
                  <div className="space-y-2">
                    <SectionHeader icon={Layers} title="Verification Deeds & Certificates" />
                    {listing.verification_documents && listing.verification_documents.length > 0 ? (
                      listing.verification_documents.map((doc: any) => (
                        <div key={doc.id} className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[var(--color-brand-emerald)]" />
                            <span className="text-[var(--color-text-main)] font-medium">{doc.document_type || 'Land Title Certificate'}</span>
                          </div>
                          <span className="text-[10px] text-[var(--color-brand-emerald)] font-mono">Verified Deed</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] text-center">
                        Standard cadastral records on file. Additional deeds can be uploaded in the Title Workspace.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
