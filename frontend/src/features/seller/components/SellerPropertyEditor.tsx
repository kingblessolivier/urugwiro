import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, MapPin, Zap, Layers, FileText, Archive,
  ShieldCheck, ListChecks
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../api/endpoints';
import { AdminEditableSection } from '../../admin/components/AdminEditableSection';
import {
  ResidentialSpecsForm, LandSpecsForm, VehicleSpecsForm,
  CommercialSpecsForm, HotelSpecsForm,
} from '../../admin/components/AdminSpecFields';
import { SellerMediaManager } from './SellerMediaManager';
import { listingStatusLabel, sellerStatusAction } from '../listingStatus';

interface SellerPropertyEditorProps {
  listingId: string | number;
  onBack: () => void;
  onChanged?: () => void;
}

const inputCls =
  'w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50';
const labelCls = 'text-[10px] uppercase font-bold text-[var(--color-text-dim)]';

const SellerPropertyEditor: React.FC<SellerPropertyEditorProps> = ({ listingId, onBack, onChanged }) => {
  const queryClient = useQueryClient();

  const { data: listing, isLoading, refetch } = useQuery({
    queryKey: ['seller-listing-detail', String(listingId)],
    queryFn: async () => {
      const res = await api.seller.listingDetail(listingId);
      return res.data;
    },
    enabled: !!listingId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', String(listingId)] });
    queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
    onChanged?.();
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => api.seller.updateListing(listingId, data),
    onSuccess: invalidate,
    onError: (err: any) => alert(`Save failed: ${err?.response?.data?.message || err?.response?.data?.error || err.message}`),
  });

  const archiveMutation = useMutation({
    mutationFn: async () => api.seller.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      onChanged?.();
      onBack();
    },
    onError: (err: any) => alert(`Archive failed: ${err?.response?.data?.message || err.message}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--color-text-muted)] text-sm">
        Loading property editor...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--color-text-muted)]">
        <p className="text-sm">Property not found.</p>
        <Button onClick={onBack} variant="ghost" className="text-xs border border-[var(--color-border)] rounded-xl cursor-pointer">
          ← Back to Inventory
        </Button>
      </div>
    );
  }

  const asset = listing.asset || {};
  const category = (listing.category || '').toLowerCase();
  const statusAction = sellerStatusAction(listing.status);

  const specForm = () => {
    if (category === 'house' || category === 'apartment') {
      return { key: 'residential_spec', Form: ResidentialSpecsForm };
    }
    if (category === 'land') return { key: 'land_spec', Form: LandSpecsForm };
    if (category === 'car' || category === 'motorbike') return { key: 'vehicle_spec', Form: VehicleSpecsForm };
    if (category === 'hotel') return { key: 'hotel_spec', Form: HotelSpecsForm };
    if (category === 'commercial') return { key: 'commercial_spec', Form: CommercialSpecsForm };
    return null;
  };
  const spec = specForm();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors shrink-0 cursor-pointer"
            title="Back to inventory"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] truncate">{listing.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20 text-[10px] font-bold uppercase">
                {listingStatusLabel(listing.status)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-dim)] font-mono">
              Property ID: {listing.id} · {listing.category} · {listing.purpose === 'rent' ? 'For Rent' : 'For Sale'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {statusAction && statusAction.nextStatus === 'submitted' && (
            <Button
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ status: statusAction.nextStatus })}
              className="text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
            >
              {updateMutation.isPending ? 'Submitting...' : statusAction.label}
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={archiveMutation.isPending}
            onClick={() => {
              if (confirm('Archive this property? It will no longer appear on the public marketplace.')) {
                archiveMutation.mutate();
              }
            }}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
          >
            <Archive size={14} />
            {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <AdminEditableSection
            title="General Information"
            icon={Building2}
            data={{
              title: listing.title || '',
              price: listing.price ?? '',
              currency: listing.currency || 'RWF',
              purpose: listing.purpose || 'sale',
              category: listing.category || 'house',
              address: listing.address || '',
              rental_frequency: listing.rental_frequency || '',
              security_deposit: (listing as any).security_deposit ?? '',
              negotiable: !!(listing as any).negotiable,
            }}
            onSave={async (d: any) => {
              const payload: any = { ...d };
              if (payload.security_deposit === '' || payload.security_deposit === null) {
                payload.security_deposit = null;
              } else if (payload.security_deposit !== undefined) {
                payload.security_deposit = Number(payload.security_deposit);
              }
              await updateMutation.mutateAsync(payload);
            }}
          >
            {(isEditing, data, setData) => (
              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className={labelCls}>Property Title</label>
                      <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Price</label>
                      <input type="number" value={data.price} onChange={(e) => setData({ ...data, price: Number(e.target.value) })} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Currency</label>
                      <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} className={inputCls}>
                        <option value="RWF">RWF</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Purpose</label>
                      <select value={data.purpose} onChange={(e) => setData({ ...data, purpose: e.target.value })} className={inputCls}>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Category</label>
                      <select value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} className={inputCls}>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="car">Car</option>
                        <option value="motorbike">Motorbike</option>
                        <option value="commercial">Commercial</option>
                        <option value="hotel">Hotel</option>
                      </select>
                    </div>
                    {data.purpose === 'rent' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelCls}>Rental Frequency</label>
                          <select value={(data as any).rental_frequency} onChange={(e) => setData({ ...data, rental_frequency: e.target.value })} className={inputCls}>
                            <option value="">—</option>
                            <option value="per_day">Per Day</option>
                            <option value="per_month">Per Month</option>
                            <option value="per_year">Per Year</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelCls}>Security Deposit</label>
                          <input type="number" value={(data as any).security_deposit} onChange={(e) => setData({ ...data, security_deposit: e.target.value === '' ? '' : Number(e.target.value) } as any)} className={inputCls} placeholder="e.g. 500000" />
                        </div>
                      </>
                    )}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className={labelCls}>Address</label>
                      <input value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} className={inputCls} />
                    </div>
                    <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] md:col-span-2">
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-main)]">Price Negotiable</p>
                        <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider mt-0.5">Show "Negotiable" on listing</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, negotiable: !(data as any).negotiable } as any)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors ${(data as any).negotiable ? 'bg-emerald-500' : 'bg-[var(--color-border)]'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${(data as any).negotiable ? 'translate-x-5' : 'translate-x-0.5'} mt-[1px]`} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Title</span>
                      <span className="text-sm font-medium text-[var(--color-text-main)]">{listing.title}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Price</span>
                      <span className="text-sm font-mono text-[var(--color-brand-emerald)] font-bold">
                        {Number(listing.price).toLocaleString()} {listing.currency}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Purpose</span>
                      <span className="text-sm text-[var(--color-text-main)] capitalize">{listing.purpose}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Status</span>
                      <span className="text-sm text-[var(--color-text-main)]">{listingStatusLabel(listing.status)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Category</span>
                      <span className="text-sm text-[var(--color-text-main)] capitalize">{listing.category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Negotiable</span>
                      <span className={`text-sm font-bold ${(listing as any).negotiable ? 'text-[var(--color-brand-emerald)]' : 'text-[var(--color-text-dim)]'}`}>
                        {(listing as any).negotiable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {listing.purpose === 'rent' && (
                      <>
                        <div className="flex flex-col gap-1">
                          <span className={labelCls}>Rent Freq.</span>
                          <span className="text-sm text-[var(--color-text-main)]">{(listing as any).rental_frequency || '—'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={labelCls}>Security Deposit</span>
                          <span className="text-sm font-mono text-[var(--color-text-main)]">
                            {(listing as any).security_deposit !== undefined && (listing as any).security_deposit !== null
                              ? Number((listing as any).security_deposit).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col gap-1 sm:col-span-3">
                      <span className={labelCls}>Address</span>
                      <span className="text-sm text-[var(--color-text-muted)]">{listing.address || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AdminEditableSection>

          {/* Location & Parcel */}
          <AdminEditableSection
            title="Location & Parcel"
            icon={MapPin}
            data={{
              province: asset.province || '',
              district: asset.district || '',
              sector: asset.sector || '',
              cell: asset.cell || '',
              village: asset.village || '',
              total_area: asset.total_area ?? '',
              latitude: asset.latitude ?? '',
              longitude: asset.longitude ?? '',
            }}
            onSave={async (d) => { await updateMutation.mutateAsync(d); }}
          >
            {(isEditing, data, setData) => (
              isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['province', 'district', 'sector', 'cell', 'village'] as const).map((f) => (
                    <div key={f} className="flex flex-col gap-1.5">
                      <label className={labelCls}>{f}</label>
                      <input value={(data as any)[f]} onChange={(e) => setData({ ...data, [f]: e.target.value })} className={inputCls} />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Total Area (SQM)</label>
                    <input type="number" value={data.total_area} onChange={(e) => setData({ ...data, total_area: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Latitude</label>
                    <input value={data.latitude} onChange={(e) => setData({ ...data, latitude: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Longitude</label>
                    <input value={data.longitude} onChange={(e) => setData({ ...data, longitude: e.target.value })} className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {(['province', 'district', 'sector', 'cell', 'village'] as const).map((f) => (
                    <div key={f} className="flex flex-col gap-1">
                      <span className={labelCls}>{f}</span>
                      <span className="text-sm text-[var(--color-text-main)] capitalize">{(asset as any)[f] || '—'}</span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <span className={labelCls}>Total Area</span>
                    <span className="text-sm font-mono text-[var(--color-text-muted)]">{asset.total_area ? `${asset.total_area} SQM` : '—'}</span>
                  </div>
                </div>
              )
            )}
          </AdminEditableSection>

          {/* Technical Specifications */}
          <AdminEditableSection
            title="Technical Specifications"
            icon={Zap}
            data={(spec ? (asset as any)[spec.key] : null) || {}}
            onSave={async (d) => { await updateMutation.mutateAsync(d); }}
          >
            {(isEditing, data, setData) => {
              if (!spec) {
                return (
                  <p className="text-xs text-[var(--color-text-dim)] text-center py-4">
                    No specification form available for category "{listing.category}".
                  </p>
                );
              }
              const Form = spec.Form;
              return (
                <div className={isEditing ? 'bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-border)]' : ''}>
                  <Form data={data} isEditing={isEditing} onChange={(name: string, val: any) => setData({ ...data, [name]: val })} />
                </div>
              );
            }}
          </AdminEditableSection>

          {/* Description */}
          <AdminEditableSection
            title="Description"
            icon={FileText}
            data={{ description: listing.description || '' }}
            onSave={async (d) => { await updateMutation.mutateAsync({ description: d.description }); }}
          >
            {(isEditing, data, setData) => (
              isEditing ? (
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Detailed property description..."
                />
              ) : (
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
                  {listing.description || 'No description provided.'}
                </p>
              )
            )}
          </AdminEditableSection>

          {/* Legal & Verification */}
          <AdminEditableSection
            title="Legal & Verification"
            icon={ShieldCheck}
            data={{
              upi_number: asset.land_spec?.upi_number || '',
              title_deed_number: asset.land_spec?.title_deed_number || '',
            }}
            onSave={async (d) => { await updateMutation.mutateAsync(d); }}
          >
            {(isEditing, data, setData) => (
              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>UPI Number</label>
                      <input
                        value={data.upi_number}
                        onChange={(e) => setData({ ...data, upi_number: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Title Deed Number</label>
                      <input
                        value={data.title_deed_number}
                        onChange={(e) => setData({ ...data, title_deed_number: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Verification Level</span>
                      <span className="text-sm font-bold text-[var(--color-text-main)] capitalize">{listing.verification_level || 'none'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>UPI Number</span>
                      <span className="text-sm font-mono text-[var(--color-text-muted)]">{asset.land_spec?.upi_number || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={labelCls}>Title Deed</span>
                      <span className="text-sm font-mono text-[var(--color-text-muted)]">{asset.land_spec?.title_deed_number || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AdminEditableSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Media Management */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Media Assets</h3>
            </div>
            <SellerMediaManager
              listingId={listingId}
              media={(listing.media as any) || []}
              onRefresh={() => refetch()}
            />
          </div>

          {/* Engagement Stats */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Engagement</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Views</p>
                <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.views_count || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Inquiries</p>
                <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.inquiries_count || 0}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
              <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Saved</p>
              <p className="text-lg font-mono font-bold text-[var(--color-brand-emerald)]">{listing.likes_count || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPropertyEditor;
