import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, ListFilter, Search, ShieldCheck, Trash2, ExternalLink, X, MapPin } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';

interface AdminListingsPageProps {
  onListingClick?: (id: string) => void;
}

const AdminListingsPage: React.FC<AdminListingsPageProps> = ({ onListingClick }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inspectListing, setInspectListing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-current-listings-page'],
    queryFn: async () => (await api.listings.list()).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      return api.admin.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-current-listings-page'] });
      setDeletingId(null);
      if (inspectListing && inspectListing.id === deletingId) {
        setInspectListing(null);
      }
    },
  });

  const listings = Array.isArray(data) ? data : [];
  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesSearch = !search || `${listing.title} ${listing.slug} ${listing.listing_type} ${listing.address}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || listing.listing_type === type;
    return matchesSearch && matchesType;
  }), [listings, search, type]);

  const paginatedListings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, page, pageSize]);

  return (
    <div className="min-h-screen bg-transparent px-6 py-10 text-white lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Marketplace Moderation</p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-white tracking-tight">Unified Listings</h1>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-4 py-2 text-xs font-mono font-bold text-emerald-400 shadow-sm">
            {filteredListings.length} records
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 md:flex-row shadow-lg shadow-black/20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, slug, address or category..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-400 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-10 text-sm text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
            >
              <option value="all">All categories</option>
              <option value="sale">Property sale</option>
              <option value="rental">Rental</option>
              <option value="land">Land</option>
              <option value="vehicle">Vehicle</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 text-center text-zinc-300 font-medium">
            Loading current listings...
          </div>
        )}
        {isError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-300 font-medium">
            The current listing API could not be loaded.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-[0.14em] font-bold text-zinc-300">
                    <tr>
                      <th className="px-6 py-4">Listing</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Trust</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Views</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08] text-sm">
                    {paginatedListings.map((listing) => (
                      <tr
                        key={listing.id}
                        onClick={() => onListingClick?.(String(listing.id))}
                        className="transition hover:bg-white/[0.04] cursor-pointer group"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {listing.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400 font-mono">
                            /{listing.slug || listing.id}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-sm capitalize text-zinc-200 font-medium">
                          {listing.listing_type}
                        </td>
                        <td className="px-6 py-5">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-200">
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {listing.verification_level === 'verified' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                              <ShieldCheck size={14} /> Verified
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400">{listing.verification_level || 'Not submitted'}</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold font-mono text-emerald-400">
                          {Number(listing.price || 0).toLocaleString()} {listing.currency || 'RWF'}
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-zinc-300 font-mono">
                          <Eye className="mr-1 inline text-zinc-400" size={14} />
                          {listing.views_count ?? 0}
                        </td>
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onListingClick?.(String(listing.id))}
                              className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                              title="View Full Property Page"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingId(listing.id)}
                              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredListings.length === 0 && (
                  <div className="p-12 text-center text-zinc-400">
                    No current listings match the selected filters.
                  </div>
                )}
              </div>
            </div>

            {/* Glassmorphic Pagination */}
            <Pagination
              currentPage={page}
              totalItems={filteredListings.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="listings"
            />
          </div>
        )}
      </div>

      {/* Listing Inspection Modal */}
      {inspectListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b101b] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  Listing Dossier #{inspectListing.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {inspectListing.title}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  /{inspectListing.slug || inspectListing.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{inspectListing.listing_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Price</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                  {Number(inspectListing.price || 0).toLocaleString()} {inspectListing.currency || 'RWF'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Status</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{inspectListing.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Verification</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {inspectListing.verification_level === 'verified' ? 'Verified Trust' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Location & Details */}
            {inspectListing.address && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <span>{inspectListing.address}</span>
              </div>
            )}

            {inspectListing.description && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Description</span>
                <p className="leading-relaxed">{inspectListing.description}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {onListingClick && (
                  <button
                    type="button"
                    onClick={() => {
                      onListingClick(inspectListing.slug || String(inspectListing.id));
                      setInspectListing(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <span>Inspect Public Detail</span>
                    <ExternalLink size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeletingId(inspectListing.id)}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0e131f] p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="text-red-400" size={18} />
              Confirm Deletion
            </h3>
            <p className="text-xs text-zinc-300">
              Are you sure you want to permanently delete listing #{deletingId}? This will remove the listing from the public catalog and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListingsPage;
