import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Building } from 'lucide-react';
import { api } from '../../../api/endpoints';

interface PropertyEditModalProps {
  listing: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: listing?.title || '',
    price: listing?.price || '',
    description: listing?.description || '',
    purpose: listing?.purpose || 'sale',
    category: listing?.category || 'house',
    address: listing?.address || '',
    district: listing?.asset?.district || '',
    sector: listing?.asset?.sector || '',
    bedrooms: listing?.asset?.residential_spec?.bedrooms ?? '',
    bathrooms: listing?.asset?.residential_spec?.bathrooms ?? '',
    total_area: listing?.asset?.total_area ?? '',
    is_furnished: listing?.asset?.residential_spec?.is_furnished ?? false,
    has_swimming_pool: listing?.asset?.residential_spec?.has_swimming_pool ?? false,
    has_garden: listing?.asset?.residential_spec?.has_garden ?? false,
    has_water_tank: listing?.asset?.residential_spec?.has_water_tank ?? false,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.seller.updateListing(listing.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-database-listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-listing-detail', String(listing?.id)] });
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      alert(`Update failed: ${err?.response?.data?.message || err.message}`);
    }
  });

  if (!isOpen || !listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-[var(--shadow-depth-1)]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-elevated)]">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-[var(--color-brand-emerald)]" />
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Edit Property Specifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Asking Price ({listing.currency || 'RWF'})</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-brand-emerald)] font-mono font-bold focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Purpose & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Transaction Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
              >
                <option value="sale">For Sale (Direct Conveyance)</option>
                <option value="rent">For Rent (Lease Agreement)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
              >
                <option value="house">House / Residential Villa</option>
                <option value="land">Titled Land Parcel</option>
                <option value="car">Executive Vehicle</option>
                <option value="hotel">Commercial / Hotel</option>
              </select>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Address / Neighborhood</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Sector</label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Total Land / Floor Size (SQM)</label>
              <input
                type="number"
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)]">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text-main)] font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Amenities & Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Features & Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-card-hover)] text-xs text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={formData.is_furnished}
                  onChange={(e) => setFormData({ ...formData, is_furnished: e.target.checked })}
                  className="rounded border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500/30"
                />
                Furnished
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-card-hover)] text-xs text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={formData.has_garden}
                  onChange={(e) => setFormData({ ...formData, has_garden: e.target.checked })}
                  className="rounded border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500/30"
                />
                Garden / Compound
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-card-hover)] text-xs text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={formData.has_swimming_pool}
                  onChange={(e) => setFormData({ ...formData, has_swimming_pool: e.target.checked })}
                  className="rounded border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500/30"
                />
                Swimming Pool
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-card-hover)] text-xs text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={formData.has_water_tank}
                  onChange={(e) => setFormData({ ...formData, has_water_tank: e.target.checked })}
                  className="rounded border-[var(--color-border)] text-emerald-500 focus:ring-emerald-500/30"
                />
                Water Tank
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Detailed Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card-hover)] text-xs font-semibold text-[var(--color-text-muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] text-xs font-semibold flex items-center gap-2 shadow-[var(--shadow-emerald-soft)] transition-all"
            >
              <Save size={14} />
              <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save & Publish Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
