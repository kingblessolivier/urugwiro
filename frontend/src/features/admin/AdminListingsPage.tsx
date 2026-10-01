import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState, type VisibilityState } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, CheckSquare, Columns3, Edit3, Eye, ExternalLink, LayoutGrid, ListFilter, MapPin, Plus, Search, ShieldCheck, Square, Table2, Trash2, X } from 'lucide-react';
import { api } from '../../api/endpoints';
import { Pagination } from '../../components/ui/Pagination';
import { tableHead, tableTh, tableBody, tableTr } from '../../components/ui/Dashboard';
import { cn } from '../../lib/utils';

interface AdminListingsPageProps {
  onListingClick?: (id: string) => void;
}

const AdminListingsPage: React.FC<AdminListingsPageProps> = ({ onListingClick }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inspectListing, setInspectListing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showColumns, setShowColumns] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ category: true, location: true, price: true, status: true, verification: true, views: true });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-current-listings-page'],
    queryFn: async () => (await api.admin.properties()).data,
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

  const listings = Array.isArray(data) ? data : (data?.results || []);
  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesSearch = !search || `${listing.title} ${listing.slug} ${listing.listing_type} ${listing.address}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === 'all' || listing.listing_type === type;
    return matchesSearch && matchesType;
  }), [listings, search, type]);

  const getListingImage = (listing: any): string | null => (
    listing.featured_image || listing.media?.[0]?.url || listing.media?.[0]?.file || listing.image || null
  );

  const getListingLocation = (listing: any): string => (
    listing.address || listing.district || listing.city || 'Location not provided'
  );

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: 'id', id: 'id', header: 'ID' },
    { accessorKey: 'title', id: 'property', header: 'Property' },
    { accessorKey: 'listing_type', id: 'category', header: 'Category' },
    { accessorFn: getListingLocation, id: 'location', header: 'Location' },
    { accessorFn: (listing) => Number(listing.price || 0), id: 'price', header: 'Price' },
    { accessorKey: 'status', id: 'status', header: 'Status' },
    { accessorKey: 'verification_level', id: 'verification', header: 'Verification' },
    { accessorFn: (listing) => listing.views_count ?? 0, id: 'views', header: 'Views' },
  ], []);

  const table = useReactTable({
    data: filteredListings,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return table.getRowModel().rows.slice(start, start + pageSize);
  }, [table, page, pageSize, filteredListings, sorting]);

  const pageIds = paginatedRows.map((row) => String(row.original.id));
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const togglePageSelection = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const toggleListingSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const bulkDelete = () => {
    selectedIds.forEach((id) => deleteMutation.mutate(id));
    setSelectedIds(new Set());
  };
  const sortButton = (id: string, label: string) => {
    const column = table.getColumn(id);
    const direction = column?.getIsSorted();
    return (
      <button type="button" onClick={() => column?.toggleSorting()} className="inline-flex items-center gap-1.5 hover:text-[var(--color-text-main)]" title={`Sort by ${label}`}>
        {label}{direction === 'asc' ? <ArrowUp size={13} /> : direction === 'desc' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} className="text-[var(--color-text-dim)]" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-transparent px-6 py-10 text-[var(--color-text-main)] lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] tracking-tight">Properties</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{filteredListings.length} listings</p>
          </div>
          <button
            onClick={() => navigate('/admin/properties/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-emerald)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Property
          </button>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl p-4 md:flex-row shadow-[var(--shadow-depth-1)]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, slug, address or category..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2.5 pl-11 pr-4 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} />
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
              className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2.5 pl-11 pr-10 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50 transition-all font-medium"
            >
              <option value="all">All categories</option>
              <option value="sale">Property sale</option>
              <option value="rental">Rental</option>
              <option value="land">Land</option>
              <option value="vehicle">Vehicle</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-emerald-500 text-black' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]'
              }`}
              title="List view"
              aria-label="List view"
            >
              <Table2 size={15} />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'cards' ? 'bg-emerald-500 text-black' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]'
              }`}
              title="Cards view"
              aria-label="Cards view"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumns((current) => !current)}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]"
              title="Choose columns"
            >
              <Columns3 size={15} />
              <span className="hidden sm:inline">Columns</span>
            </button>
            {showColumns && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2 shadow-[var(--shadow-depth-1)]">
                {['category', 'location', 'price', 'status', 'verification', 'views'].map((id) => {
                  const column = table.getColumn(id);
                  return (
                    <label key={id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs capitalize text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card-hover)]">
                      <input type="checkbox" checked={column?.getIsVisible() ?? true} onChange={column?.getToggleVisibilityHandler()} className="accent-emerald-500" />
                      {id}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {selectedIds.size > 0 && (
            <button type="button" onClick={bulkDelete} className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25" title="Delete selected listings">
              <Trash2 size={15} /> Delete {selectedIds.size}
            </button>
          )}
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl p-12 text-center text-[var(--color-text-muted)] font-medium">
            Loading current listings...
          </div>
        )}
        {isError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-10 text-center text-red-700 font-medium dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            The current listing API could not be loaded.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {viewMode === 'list' ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl shadow-[var(--shadow-depth-1)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className={tableHead}>
                      <tr>
                        <th className={tableTh}><button type="button" onClick={togglePageSelection} title="Select current page" aria-label="Select current page">{allPageSelected ? <CheckSquare size={16} className="text-[var(--color-brand-emerald)]" /> : <Square size={16} className="text-[var(--color-text-dim)]" />}</button></th>
                        <th className={tableTh}>{sortButton('id', 'ID')}</th>
                        <th className={tableTh}>Image</th>
                        <th className={tableTh}>{sortButton('property', 'Property')}</th>
                        {columnVisibility.category && <th className={tableTh}>{sortButton('category', 'Category')}</th>}
                        {columnVisibility.location && <th className={tableTh}>{sortButton('location', 'Location')}</th>}
                        {columnVisibility.price && <th className={cn(tableTh, 'text-right')}>{sortButton('price', 'Price')}</th>}
                        {columnVisibility.status && <th className={tableTh}>{sortButton('status', 'Status')}</th>}
                        {columnVisibility.verification && <th className={tableTh}>{sortButton('verification', 'Verification')}</th>}
                        {columnVisibility.views && <th className={cn(tableTh, 'text-right')}>{sortButton('views', 'Views')}</th>}
                        <th className={cn(tableTh, 'text-right')}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={cn(tableBody, 'text-sm')}>
                      {paginatedRows.map((row) => {
                        const listing = row.original;
                        const image = getListingImage(listing);
                        return (
                          <tr
                            key={listing.id}
                            onClick={() => onListingClick?.(String(listing.id))}
                            className={cn(tableTr, 'group cursor-pointer')}
                          >
                            <td className="px-5 py-5"><button type="button" onClick={(event) => { event.stopPropagation(); toggleListingSelection(String(listing.id)); }} title={`Select listing ${listing.id}`} aria-label={`Select listing ${listing.id}`}>{selectedIds.has(String(listing.id)) ? <CheckSquare size={16} className="text-[var(--color-brand-emerald)]" /> : <Square size={16} className="text-[var(--color-text-dim)]" />}</button></td>
                            <td className="px-5 py-5 font-mono text-xs text-[var(--color-text-muted)]">#{listing.id}</td>
                            <td className="px-5 py-5">
                              <div className="h-14 w-20 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                                {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Building2 className="m-auto h-full text-[var(--color-text-dim)]" />}
                              </div>
                            </td>
                            <td className="max-w-[230px] px-5 py-5">
                              <p className="truncate font-semibold text-[var(--color-text-main)] transition-colors group-hover:text-[var(--color-brand-emerald)]">{listing.title || 'Untitled listing'}</p>
                              <p className="mt-1 truncate text-xs text-[var(--color-text-dim)]">{listing.description || 'No description provided'}</p>
                            </td>
                            {columnVisibility.category && <td className="px-5 py-5 capitalize text-[var(--color-text-muted)] font-medium">{listing.listing_type || 'Property'}</td>}
                            {columnVisibility.location && <td className="max-w-[190px] px-5 py-5 text-xs text-[var(--color-text-muted)]"><span className="flex items-center gap-1.5"><MapPin size={13} className="shrink-0 text-[var(--color-brand-emerald)]" />{getListingLocation(listing)}</span></td>}
                            {columnVisibility.price && <td className="px-5 py-5 text-right font-mono text-sm font-bold text-[var(--color-brand-emerald)]">{Number(listing.price || 0).toLocaleString()} {listing.currency || 'RWF'}</td>}
                            {columnVisibility.status && <td className="px-5 py-5"><span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">{listing.status || 'Pending'}</span></td>}
                            {columnVisibility.verification && <td className="px-5 py-5">{listing.verification_level === 'verified' ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-emerald)]"><ShieldCheck size={14} /> Verified</span> : <span className="text-xs text-[var(--color-text-muted)]">{listing.verification_level || 'Not submitted'}</span>}</td>}
                            {columnVisibility.views && <td className="px-5 py-5 text-right font-mono text-sm text-[var(--color-text-muted)]"><Eye className="mr-1 inline text-[var(--color-text-muted)]" size={14} />{listing.views_count ?? 0}</td>}
                            <td className="px-5 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => onListingClick?.(String(listing.id))} className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-card-hover)] hover:text-[var(--color-text-main)]" title="View listing"><Eye size={15} /></button>
                                <button onClick={() => setDeletingId(listing.id)} className="rounded-lg border border-red-500/30 p-1.5 text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-300" title="Delete listing"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredListings.length === 0 && <div className="p-12 text-center text-[var(--color-text-muted)]">No current listings match the selected filters.</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedRows.map((row) => {
                  const listing = row.original;
                  const image = getListingImage(listing);
                  return (
                    <article key={listing.id} onClick={() => onListingClick?.(String(listing.id))} className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-[var(--color-bg-card-hover)]">
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-elevated)]">
                        {image ? <img src={image} alt={listing.title || 'Listing'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Building2 className="absolute inset-0 m-auto h-10 w-10 text-[var(--color-text-dim)]" />}
                        <span className="absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 font-mono text-[11px] font-bold text-[#fff]">#{listing.id}</span>
                        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase text-[#e4e4e7]">{listing.status || 'Pending'}</span>
                        <button type="button" onClick={(event) => { event.stopPropagation(); toggleListingSelection(String(listing.id)); }} className="absolute bottom-3 right-3 rounded-lg bg-black/60 p-2 text-[#fff] backdrop-blur-sm" title="Select listing" aria-label={`Select listing ${listing.id}`}>
                          {selectedIds.has(String(listing.id)) ? <CheckSquare size={16} className="text-[#34d399]" /> : <Square size={16} />}
                        </button>
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-emerald)]">{listing.title || 'Untitled listing'}</h3>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--color-text-muted)]"><MapPin size={12} className="shrink-0 text-[var(--color-brand-emerald)]" />{getListingLocation(listing)}</p>
                          </div>
                          <p className="shrink-0 text-right font-mono text-sm font-bold text-[var(--color-brand-emerald)]">{Number(listing.price || 0).toLocaleString()}<span className="ml-1 text-[10px] font-normal text-[var(--color-text-muted)]">{listing.currency || 'RWF'}</span></p>
                        </div>
                        <p className="line-clamp-2 min-h-10 text-xs leading-relaxed text-[var(--color-text-muted)]">{listing.description || 'No description provided'}</p>
                        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs">
                          <span className="capitalize text-[var(--color-text-muted)]">{listing.listing_type || 'Property'}</span>
                          {listing.verification_level === 'verified' ? <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand-emerald)]"><ShieldCheck size={13} /> Verified</span> : <span className="text-[var(--color-text-dim)]">{listing.verification_level || 'Not submitted'}</span>}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--color-text-dim)]"><span><Eye size={13} className="mr-1 inline" />{listing.views_count ?? 0} views</span><span>Open details <ExternalLink size={12} className="ml-1 inline" /></span></div>
                      </div>
                    </article>
                  );
                })}
                {filteredListings.length === 0 && <div className="col-span-full rounded-2xl border border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">No current listings match the selected filters.</div>}
              </div>
            )}

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
          <div className="w-full max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-depth-1)] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
              <div>
                <span className="font-mono text-[var(--color-brand-emerald)] font-bold text-xs uppercase tracking-wider">
                  Property Details #{inspectListing.id}
                </span>
                <h3 className="text-xl font-bold text-[var(--color-text-main)] mt-1">
                  {inspectListing.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                  /{inspectListing.slug || inspectListing.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] bg-[var(--color-bg-elevated)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-[var(--color-text-main)] capitalize mt-0.5 block">{inspectListing.listing_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold">Price</span>
                <span className="font-mono font-bold text-[var(--color-brand-emerald)] text-sm mt-0.5 block">
                  {Number(inspectListing.price || 0).toLocaleString()} {inspectListing.currency || 'RWF'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold">Status</span>
                <span className="font-semibold text-[var(--color-text-main)] capitalize mt-0.5 block">{inspectListing.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <span className="text-[var(--color-text-dim)] block text-[10px] uppercase font-bold">Verification</span>
                <span className="font-semibold text-[var(--color-brand-emerald)] mt-0.5 block">
                  {inspectListing.verification_level === 'verified' ? 'Verified Trust' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Location & Details */}
            {inspectListing.address && (
              <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                <MapPin size={14} className="text-[var(--color-brand-emerald)] shrink-0" />
                <span>{inspectListing.address}</span>
              </div>
            )}

            {inspectListing.description && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-dim)] block">Description</span>
                <p className="leading-relaxed">{inspectListing.description}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectListing(null)}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
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
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-[#fff] font-bold text-xs shadow-[var(--shadow-emerald-soft)] transition-all"
                  >
                    <span>Inspect Public Detail</span>
                    <ExternalLink size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeletingId(inspectListing.id)}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
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
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--color-bg-surface)] p-6 space-y-4 shadow-[var(--shadow-depth-1)]">
            <h3 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Trash2 className="text-red-600 dark:text-red-400" size={18} />
              Confirm Deletion
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to permanently delete listing #{deletingId}? This will remove the listing from the public catalog and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-[#fff] text-xs font-bold transition-colors"
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
