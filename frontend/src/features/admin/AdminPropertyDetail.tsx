import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, ShieldCheck, MapPin, Building2,
  User, Zap, ListChecks, Phone, Mail, Layers, Trash2, AlertCircle, Save
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/endpoints';
import { cn } from '../../lib/utils';
import { AdminEditableSection } from './components/AdminEditableSection';
import { ResidentialSpecsForm, LandSpecsForm, VehicleSpecsForm, CommercialSpecsForm, HotelSpecsForm } from './components/AdminSpecFields';
import { AdminMediaManager } from './components/AdminMediaManager';

interface AdminPropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

const AdminPropertyDetail: React.FC<AdminPropertyDetailProps> = ({ propertyId, onBack }) => {
  const queryClient = useQueryClient();
  const [adminNote, setAdminNote] = useState('');

  const { data: property, isLoading } = useQuery({
    queryKey: ['admin-property-detail', propertyId],
    queryFn: async () => {
      const res = await api.admin.updateProperty(propertyId, {}); // Using as a fetcher if no dedicated detail endpoint
      return res.data;
    },
  });

  const { data: listing } = useQuery({
    queryKey: ['listing-detail', propertyId],
    queryFn: async () => {
      const res = await api.listings.get(propertyId);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => api.admin.updateProperty(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-property-detail', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['listing-detail', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => api.admin.updateProperty(propertyId, { admin_notes: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-property-detail', propertyId] });
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-[var(--color-text-muted)]">Loading Property Details...</div>;
  if (!propertyId || !listing) return <div className="min-h-screen flex items-center justify-center bg-transparent text-[var(--color-text-muted)]">Property Not Found or ID Missing</div>;

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
            onClick={() => { if(confirm('Are you sure you want to delete this property?')) { /* delete logic */ } }}
          >
            <Trash2 size={14} className="mr-2" /> Delete Property
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Info Section */}
          <AdminEditableSection
            title="General Information"
            icon={Building2}
            data={{
              title: listing.title,
              price: listing.price,
              currency: listing.currency,
              status: listing.status,
              address: listing.address
            }}
            onSave={async (newData) => {
              await updateMutation.mutateAsync(newData);
            }}
          >
            {(isEditing, data, setData) => (
              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Property Title</label>
                      <input
                        value={data.title}
                        onChange={e => setData({...data, title: e.target.value})}
                        className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Price ({data.currency})</label>
                      <input
                        type="number"
                        value={data.price}
                        onChange={e => setData({...data, price: Number(e.target.value)})}
                        className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Status</label>
                      <select
                        value={data.status}
                        onChange={e => setData({...data, status: e.target.value})}
                        className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                      >
                        <option value="listed">Listed</option>
                        <option value="under_negotiation">Under Offer</option>
                        <option value="sold">Sold</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Address</label>
                      <input
                        value={data.address}
                        onChange={e => setData({...data, address: e.target.value})}
                        className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </AdminEditableSection>

          {/* Technical Specifications Section */}
          <AdminEditableSection
            title="Technical Specifications"
            icon={Zap}
            data={asset}
            onSave={async (newData) => {
              await updateMutation.mutateAsync(newData);
            }}
          >
            {(isEditing, data, setData) => {
              const specType = listing.category?.toLowerCase();
              return (
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-border)]">
                      {specType === 'apartment' || specType === 'house' ? (
                        <ResidentialSpecsForm
                          data={data}
                          isEditing={isEditing}
                          onChange={(name, val) => setData({...data, [name]: val})}
                        />
                      ) : specType === 'land' ? (
                        <LandSpecsForm
                          data={data}
                          isEditing={isEditing}
                          onChange={(name, val) => setData({...data, [name]: val})}
                        />
                      ) : specType === 'car' || specType === 'motorbike' ? (
                        <VehicleSpecsForm
                          data={data}
                          isEditing={isEditing}
                          onChange={(name, val) => setData({...data, [name]: val})}
                        />
                      ) : specType === 'commercial' ? (
                        <CommercialSpecsForm
                          data={data}
                          isEditing={isEditing}
                          onChange={(name, val) => setData({...data, [name]: val})}
                        />
                      ) : specType === 'hotel' ? (
                        <HotelSpecsForm
                          data={data}
                          isEditing={isEditing}
                          onChange={(name, val) => setData({...data, [name]: val})}
                        />
                      ) : (
                        <div className="text-xs text-[var(--color-text-dim)] text-center py-4">No specific specification forms available for this category.</div>
                      )}
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
              );
            }}
          </AdminEditableSection>

          {/* Media Management Section */}
          <AdminEditableSection
            title="Media Assets"
            icon={Layers}
            data={listing.media || []}
            onSave={async () => {
              // Media management handles its own mutations
            }}
          >
            {(_, media) => (
              <AdminMediaManager listingId={propertyId} media={media} />
            )}
          </AdminEditableSection>

          {/* Description & Details Section */}
          <AdminEditableSection
            title="Property Details & Description"
            icon={FileText}
            data={{ description: listing.description }}
            onSave={async (newData) => {
              await updateMutation.mutateAsync({ description: newData.description });
            }}
          >
            {(isEditing, data, setData) => (
              <div className="space-y-4">
                {isEditing ? (
                  <textarea
                    value={data.description}
                    onChange={e => setData({...data, description: e.target.value})}
                    className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 resize-none"
                    placeholder="Detailed property description..."
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
                    {listing.description || 'No description provided.'}
                  </p>
                )}
              </div>
            )}
          </AdminEditableSection>

          {/* Legal & Trust Section */}
          <AdminEditableSection
            title="Legal & Verification"
            icon={ShieldCheck}
            data={{
              verification_level: listing.verification_level,
              upi_number: asset.upi_number,
              title_deed_number: asset.title_deed_number
            }}
            onSave={async (newData) => {
              await updateMutation.mutateAsync(newData);
            }}
          >
            {(isEditing, data, setData) => (
              <div className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Verification Level</label>
                      <select
                        value={data.verification_level}
                        onChange={e => setData({...data, verification_level: e.target.value})}
                        className="w-full p-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
                      >
                        <option value="None">None</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Verified">Verified</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">UPI Number</label>
                      <input
                        value={data.upi_number}
                        onChange={e => setData({...data, upi_number: e.target.value})}
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
              </div>
            )}
          </AdminEditableSection>
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
                  updateMutation.mutate({ agent_id: newAgentId });
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
                {listing.inquiries_count && listing.visits_count
                  ? ((listing.visits_count / listing.inquiries_count) * 100).toFixed(1) + '%'
                  : '0.0%'}
              </p>
            </div>
            {/* Verification Timeline */}
            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-[var(--color-brand-emerald)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Verification Timeline</span>
              </div>
              {listing.verification_history?.map((event: any, idx: number) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1" />
                    {idx !== listing.verification_history.length - 1 && <div className="w-px h-full bg-[var(--color-border)]" />}
                  </div>
                  <div className="pb-3">
                    <p className="font-bold text-[var(--color-text-muted)]">{event.status}</p>
                    <p className="text-[var(--color-text-dim)] font-mono text-[10px]">{event.date}</p>
                  </div>
                </div>
              )) || (
                <p className="text-xs text-[var(--color-text-dim)] italic">No history available.</p>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 space-y-4 shadow-[var(--shadow-depth-1)]">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-[var(--color-brand-emerald)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Admin Notes</h3>
            </div>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              className="w-full h-32 p-3 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] outline-none focus:border-emerald-500/50 resize-none"
              placeholder="Add internal administrative notes here..."
            />
            <Button
              variant="ghost"
              className="w-full py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-xl cursor-pointer flex items-center justify-center gap-2"
              onClick={() => saveNoteMutation.mutate(adminNote)}
              disabled={saveNoteMutation.isPending}
            >
              {saveNoteMutation.isPending ? 'Saving...' : <><Save size={14} /> Save Internal Note</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyDetail;
