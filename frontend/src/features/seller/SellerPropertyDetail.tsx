import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, ShieldCheck, MapPin, Building2,
  User, Zap, ListChecks, Phone, Mail, Layers, Trash2, AlertCircle, Save, Plus, X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';

interface SellerPropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

const SellerPropertyDetail: React.FC<SellerPropertyDetailProps> = ({ propertyId, onBack }) => {
  const queryClient = useQueryClient();
  const [sellerNote, setSellerNote] = useState('');
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [editingLegal, setEditingLegal] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [specsData, setSpecsData] = useState<any>({});
  const [legalData, setLegalData] = useState<any>({});
  const [descriptionText, setDescriptionText] = useState('');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['seller-property-detail', propertyId],
    queryFn: async () => {
      const res = await api.seller.listingDetail(propertyId);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => api.seller.updateListing(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-property-detail', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => api.seller.updateListing(propertyId, { seller_notes: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-property-detail', propertyId] });
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-[var(--color-text-muted)]">Loading Property Details...</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-transparent text-[var(--color-text-muted)]">Property Not Found</div>;

  const asset = listing.asset || {};
  const propertyType = listing.category?.toLowerCase();

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-text-main)] p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="p-2 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[var(--color-text-main)]">{listing.title}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-[var(--color-brand-emerald)] dark:border-emerald-500/20 text-[10px] font-bold uppercase">
                {listing.status}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-dim)] font-mono">Property ID: {listing.id} · {listing.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold rounded-xl cursor-pointer"
            onClick={async () => {
              if (!confirm('Are you sure you want to delete this property?')) return;
              try {
                await api.seller.deleteListing(listing.id);
                alert('Property deleted successfully.');
                onBack();
              } catch (err) {
                alert('Failed to delete property. Please try again.');
              }
            }}
          >
            <Trash2 size={14} className="mr-2" /> Delete Property
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Info Section */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">General Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Title</span>
                <span className="text-sm font-medium text-[var(--color-text-main)]">{listing.title}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Price</span>
                <span className="text-sm font-mono text-[var(--color-brand-emerald)] font-bold">{listing.price?.toLocaleString()} {listing.currency}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Status</span>
                <span className="text-sm text-[var(--color-text-main)]">{listing.status}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Address</span>
                <span className="text-sm text-[var(--color-text-muted)]">{listing.address}</span>
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Technical Specifications</h3>
              </div>
              <Button
                variant="ghost"
                className="text-xs text-[var(--color-brand-emerald)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                onClick={() => setEditingSpecs(!editingSpecs)}
              >
                {editingSpecs ? 'Cancel' : 'Edit Specs'}
              </Button>
            </div>
            {editingSpecs ? (
              <div className="bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-border)]">
                <div className="grid grid-cols-2 gap-4">
                  {propertyType === 'apartment' || propertyType === 'house' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Bedrooms</label>
                        <input
                          type="number"
                          value={specsData.bedrooms || asset.residential_spec?.bedrooms || ''}
                          onChange={e => setSpecsData({...specsData, bedrooms: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Bathrooms</label>
                        <input
                          type="number"
                          value={specsData.bathrooms || asset.residential_spec?.bathrooms || ''}
                          onChange={e => setSpecsData({...specsData, bathrooms: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Built Area (m²)</label>
                        <input
                          type="number"
                          value={specsData.built_up_area_sqm || asset.residential_spec?.built_up_area_sqm || ''}
                          onChange={e => setSpecsData({...specsData, built_up_area_sqm: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Year Built</label>
                        <input
                          type="number"
                          value={specsData.year_built || asset.residential_spec?.year_built || ''}
                          onChange={e => setSpecsData({...specsData, year_built: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </>
                  ) : propertyType === 'land' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Plot Size (m²)</label>
                        <input
                          type="number"
                          value={specsData.plot_size_sqm || asset.land_spec?.plot_size_sqm || ''}
                          onChange={e => setSpecsData({...specsData, plot_size_sqm: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Land Use</label>
                        <input
                          value={specsData.land_use_category || asset.land_spec?.land_use_category || ''}
                          onChange={e => setSpecsData({...specsData, land_use_category: e.target.value})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </>
                  ) : propertyType === 'car' || propertyType === 'motorbike' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Make</label>
                        <input
                          value={specsData.make || asset.vehicle_spec?.make || ''}
                          onChange={e => setSpecsData({...specsData, make: e.target.value})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Model</label>
                        <input
                          value={specsData.model || asset.vehicle_spec?.model || ''}
                          onChange={e => setSpecsData({...specsData, model: e.target.value})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Year</label>
                        <input
                          type="number"
                          value={specsData.year || asset.vehicle_spec?.year || ''}
                          onChange={e => setSpecsData({...specsData, year: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Mileage (km)</label>
                        <input
                          type="number"
                          value={specsData.mileage || asset.vehicle_spec?.mileage || ''}
                          onChange={e => setSpecsData({...specsData, mileage: Number(e.target.value)})}
                          className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-[var(--color-text-dim)] text-center py-4">No specific specification forms available for this category.</div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="primary"
                    className="text-xs font-bold rounded-xl cursor-pointer"
                    onClick={async () => {
                      await updateMutation.mutateAsync(specsData);
                      setEditingSpecs(false);
                    }}
                  >
                    Save Specifications
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {Object.entries(asset).map(([key, value]) => {
                  if (typeof value !== 'string' && typeof value !== 'number' && (key === 'residential_spec' || key === 'land_spec' || key === 'vehicle_spec')) return null;
                  if (key === 'id' || key === 'name') return null;
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-mono text-[var(--color-text-muted)]">{String(value || '—')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Media Management Section */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Media Assets</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(listing.media || []).map((m: any, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                  <img src={m.file || m.url} alt={m.caption || `Media ${idx + 1}`} className="w-full h-full object-cover" />
                  {m.media_type && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase">
                      {m.media_type}
                    </span>
                  )}
                </div>
              ))}
              {(listing.media || []).length === 0 && (
                <div className="col-span-full p-8 text-center text-[var(--color-text-dim)]">
                  <Layers size={32} className="mx-auto mb-2" />
                  <p className="text-sm">No media assets uploaded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Description & Details Section */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Property Details & Description</h3>
              </div>
              <Button
                variant="ghost"
                className="text-xs text-[var(--color-brand-emerald)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                onClick={() => setEditingDescription(!editingDescription)}
              >
                {editingDescription ? 'Cancel' : 'Edit Description'}
              </Button>
            </div>
            {editingDescription ? (
              <div className="space-y-4">
                <textarea
                  value={descriptionText || listing.description || ''}
                  onChange={e => setDescriptionText(e.target.value)}
                  className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Detailed property description..."
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    className="text-xs font-bold rounded-xl cursor-pointer"
                    onClick={async () => {
                      await updateMutation.mutateAsync({ description: descriptionText });
                      setEditingDescription(false);
                    }}
                  >
                    Save Description
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Legal & Trust Section */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Legal & Verification</h3>
              </div>
              <Button
                variant="ghost"
                className="text-xs text-[var(--color-brand-emerald)] hover:text-[var(--color-text-main)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                onClick={() => setEditingLegal(!editingLegal)}
              >
                {editingLegal ? 'Cancel' : 'Edit Legal'}
              </Button>
            </div>
            {editingLegal ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Verification Level</label>
                  <select
                    value={legalData.verification_level || listing.verification_level || 'none'}
                    onChange={e => setLegalData({...legalData, verification_level: e.target.value})}
                    className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                  >
                    <option value="none">None</option>
                    <option value="submitted">Submitted</option>
                    <option value="verified">Verified</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">UPI Number</label>
                  <input
                    value={legalData.upi_number || asset.upi_number || ''}
                    onChange={e => setLegalData({...legalData, upi_number: e.target.value})}
                    className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Verification Level</span>
                  <span className="text-sm font-bold text-[var(--color-brand-emerald)]">{listing.verification_level}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">UPI Number</span>
                  <span className="text-sm font-mono text-[var(--color-text-muted)]">{asset.upi_number || '—'}</span>
                </div>
              </div>
            )}
            {editingLegal && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="primary"
                  className="text-xs font-bold rounded-xl cursor-pointer"
                  onClick={async () => {
                    await updateMutation.mutateAsync(legalData);
                    setEditingLegal(false);
                  }}
                >
                  Save Legal Info
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Management */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Assigned Agent</h3>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                {listing.owner?.full_name ? listing.owner.full_name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{listing.owner?.full_name || 'No agent assigned'}</p>
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Primary Contact</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-xl cursor-pointer"
              onClick={() => {
                const newAgentId = prompt('Enter new Agent ID:');
                if (newAgentId) {
                  api.seller.assignAgent(propertyId, { agent_id: Number(newAgentId) });
                }
              }}
            >
              Reassign Agent
            </Button>
          </div>

          {/* Inquiries & Leads Activity */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Inquiries & Leads Activity</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Inquiries</p>
                <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.inquiries_count || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
                <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Visits</p>
                <p className="text-lg font-mono font-bold text-[var(--color-text-main)]">{listing.visits_count || 0}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-center">
              <p className="text-[10px] text-[var(--color-text-dim)] uppercase font-bold">Engagement Rate</p>
              <p className="text-lg font-mono font-bold text-[var(--color-brand-emerald)]">
                {listing.visits_count && listing.inquiries_count
                  ? ((listing.inquiries_count / listing.visits_count) * 100).toFixed(1) + '%'
                  : '0.0%'}
              </p>
            </div>
          </div>

          {/* Seller Notes */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Seller Notes</h3>
            </div>
            <textarea
              value={sellerNote}
              onChange={e => setSellerNote(e.target.value)}
              className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] outline-none focus:border-emerald-500/50 resize-none"
              placeholder="Add internal notes about this property..."
            />
            <Button
              variant="ghost"
              className="w-full py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-xl cursor-pointer flex items-center justify-center gap-2"
              onClick={() => saveNoteMutation.mutate(sellerNote)}
              disabled={saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? 'Saving...' : <><Save size={14} /> Save Note</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPropertyDetail;
