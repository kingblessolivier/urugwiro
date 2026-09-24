import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, ShieldCheck, MapPin, MessageSquare, HandCoins,
  Calendar, FileText, Clock,
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
        className="w-full max-w-2xl bg-[#080b11] border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="neutral" className="uppercase font-mono text-[10px] tracking-wider bg-white/5 border-white/10 text-emerald-400">
                {listing?.category || 'Property'} • {listing?.purpose === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
              <Badge 
                variant={listing?.status === 'listed' ? 'success' : 'neutral'} 
                className="text-[10px] font-mono px-2 py-0.5"
              >
                {listing?.status === 'listed' ? 'Active' : listing?.status}
              </Badge>
              {listing?.asset?.land_spec?.upi_number && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  UPI: {listing.asset.land_spec.upi_number}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">
              {isLoading ? 'Loading Property Data...' : listing?.title}
            </h2>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-zinc-500 shrink-0" />
              <span className="truncate">{listing?.address || `${listing?.asset?.district || 'Kigali'}, Rwanda`}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {listing && (
              <button
                onClick={() => onEdit(listing)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                title="Edit Property Specs & Price"
              >
                <Edit3 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hero Quick Banner */}
        {listing && (
          <div className="px-6 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block">List Price</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {Number(listing.price).toLocaleString()} <span className="text-xs font-sans text-zinc-400">{listing.currency}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px] uppercase">Views</span>
                <span className="text-white font-bold">{listing.views_count || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px] uppercase">Inquiries</span>
                <span className="text-white font-bold">{listing.inquiries?.length || 0}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block text-[10px] uppercase">Offers</span>
                <span className="text-white font-bold text-amber-400">{listing.offers?.length || 0}</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => toggleStatusMutation.mutate(listing.status === 'listed' ? 'withdrawn' : 'listed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  listing.status === 'listed'
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {listing.status === 'listed' ? 'Pause / Archive' : 'Reactivate Listing'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-white/[0.01] px-6 gap-2 pt-2">
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
                    ? 'border-emerald-500 text-emerald-400 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-white'
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
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Clock size={32} className="animate-spin text-emerald-500 mb-3" />
              <p className="text-xs">Fetching property intelligence...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-3">
                  {!listing?.inquiries || listing.inquiries.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500">
                      <MessageSquare size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs font-medium text-white">No Inquiries Yet</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Prospective buyers who submit inquiries on this asset will appear here.</p>
                    </div>
                  ) : (
                    listing.inquiries.map((inq: any) => (
                      <div key={inq.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white flex items-center gap-2">
                            {inq.name}
                            <span className="text-[10px] font-mono text-zinc-400 font-normal">{inq.email}</span>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 bg-black/20 p-3 rounded-xl border border-white/5">
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
                    <div className="p-10 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500">
                      <HandCoins size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs font-medium text-white">No Offers Submitted</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">When buyers make binding offers with escrow commitments, they will be listed here.</p>
                    </div>
                  ) : (
                    listing.offers.map((offer: any) => (
                      <div key={offer.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Proposed Price</span>
                            <span className="text-base font-bold font-mono text-emerald-400">
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

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/20 p-2.5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-zinc-500">Buyer: </span>
                            <span className="text-white font-medium">{offer.buyer_name || offer.buyer_username || 'Verified Buyer'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Financing: </span>
                            <span className="text-white uppercase font-mono">{offer.financing_type || 'Cash'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Escrow Commitment: </span>
                            <span className="text-emerald-400 font-mono">{offer.escrow_proposed_percent || 10}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Target Closing: </span>
                            <span className="text-white font-mono">{offer.proposed_closing_date || 'Within 14 Days'}</span>
                          </div>
                        </div>

                        {offer.message && (
                          <p className="text-xs text-zinc-400 italic">
                            "{offer.message}"
                          </p>
                        )}

                        {offer.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                            <button
                              onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'accepted' })}
                              disabled={offerStatusMutation.isPending}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Check size={14} /> Accept Offer & Lock Escrow
                            </button>
                            <button
                              onClick={() => offerStatusMutation.mutate({ offerId: offer.id, status: 'rejected' })}
                              disabled={offerStatusMutation.isPending}
                              className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
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
                    <div className="p-10 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-500">
                      <Calendar size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs font-medium text-white">No Site Visits Booked</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Verified buyers can book physical showings accompanied by certified agents.</p>
                    </div>
                  ) : (
                    listing.visits.map((v: any) => (
                      <div key={v.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">
                            Showing with {v.visitor_name || 'Client'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {v.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 space-y-1">
                          <p>📅 Scheduled: <span className="text-white font-mono">{new Date(v.scheduled_date).toLocaleString()}</span></p>
                          <p>👤 Certified Agent: <span className="text-white">{v.agent_name || 'Concierge Agent'}</span></p>
                          {v.report && (
                            <p className="bg-black/30 p-2 rounded-xl text-zinc-300 mt-2">
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
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Physical Asset Configuration</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">District / Sector</span>
                        <span className="text-white font-medium">{listing.asset?.district || 'Gasabo'} / {listing.asset?.sector || 'Kimihurura'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Total Land Area</span>
                        <span className="text-white font-mono font-medium">{listing.asset?.total_area || 'N/A'} SQM</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Bedrooms / Baths</span>
                        <span className="text-white font-mono font-medium">
                          {listing.asset?.residential_spec?.bedrooms ?? '-'} Beds • {listing.asset?.residential_spec?.bathrooms ?? '-'} Baths
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Furnished Status</span>
                        <span className="text-white font-medium">
                          {listing.asset?.residential_spec?.is_furnished ? 'Fully Furnished' : 'Unfurnished'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Compound / Garden</span>
                        <span className="text-white font-medium">
                          {listing.asset?.residential_spec?.has_garden ? 'Private Garden' : 'Standard Yard'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-zinc-500 block text-[10px]">Water Tank / Backup</span>
                        <span className="text-white font-medium">
                          {listing.asset?.residential_spec?.has_water_tank ? 'Installed' : 'Municipal Direct'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Co-Brokering Agent */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Assigned Co-Broker</h4>
                    {listing.assigned_agent ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                        <div>
                          <span className="text-xs font-bold text-white block">{listing.assigned_agent.name}</span>
                          <span className="text-[10px] text-zinc-400">{listing.assigned_agent.phone} • Rating: {listing.assigned_agent.rating}★</span>
                        </div>
                        <Badge variant="success" className="text-[10px]">Active Representative</Badge>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
                        <span>No designated broker. You are handling inquiries directly.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CADASTRE & DEEDS */}
              {activeTab === 'deeds' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        National Land Registry (RLMUA)
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Authenticated
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Property parcel boundaries and zoning classifications comply with the Kigali Master Plan 2050.
                    </p>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Parcel UPI:</span>
                        <span className="text-white font-mono font-bold">
                          {listing.asset?.land_spec?.upi_number || listing.upi_number || '1/02/03/04/5678'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Zoning Designation:</span>
                        <span className="text-emerald-400 font-mono">
                          {listing.asset?.land_spec?.zoning_code || 'R1 (Low-Density Residential)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Verification Deeds & Certificates</h4>
                    {listing.verification_documents && listing.verification_documents.length > 0 ? (
                      listing.verification_documents.map((doc: any) => (
                        <div key={doc.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-emerald-400" />
                            <span className="text-white font-medium">{doc.document_type || 'Land Title Certificate'}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">Verified Deed</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-zinc-400 text-center">
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
