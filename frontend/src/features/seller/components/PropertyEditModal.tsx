import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Building, MapPin, DollarSign, Layers } from 'lucide-react';
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
      <div className="w-full max-w-2xl bg-[#080b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Edit Property Specifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Asking Price ({listing.currency || 'RWF'})</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Purpose & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Transaction Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-[#0d121c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="sale">For Sale (Direct Conveyance)</option>
                <option value="rent">For Rent (Lease Agreement)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0d121c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
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
              <label className="text-xs font-semibold text-zinc-300">Address / Neighborhood</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Sector</label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Total Land / Floor Size (SQM)</label>
              <input
                type="number"
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Amenities & Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Features & Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.is_furnished}
                  onChange={(e) => setFormData({ ...formData, is_furnished: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                Furnished
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.has_garden}
                  onChange={(e) => setFormData({ ...formData, has_garden: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                Garden / Compound
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.has_swimming_pool}
                  onChange={(e) => setFormData({ ...formData, has_swimming_pool: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                Swimming Pool
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.has_water_tank}
                  onChange={(e) => setFormData({ ...formData, has_water_tank: e.target.checked })}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                Water Tank
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Detailed Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
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
