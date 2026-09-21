import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, ListFilter, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../api/endpoints';

const AdminListingsPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-current-listings-page'],
        queryFn: async () => (await api.listings.list()).data,
    });

    const listings = Array.isArray(data) ? data : [];
    const filteredListings = useMemo(() => listings.filter((listing) => {
        const matchesSearch = !search || `${listing.title} ${listing.slug} ${listing.listing_type}`.toLowerCase().includes(search.toLowerCase());
        const matchesType = type === 'all' || listing.listing_type === type;
        return matchesSearch && matchesType;
    }), [listings, search, type]);

    return (
        <div className="min-h-screen bg-[#05070b] px-6 py-12 text-white lg:px-12">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Marketplace moderation</p><h1 className="mt-3 text-4xl font-bold">Unified listings</h1><p className="mt-3 text-zinc-400">Review current property, land, vehicle and service records from the unified listing model.</p></div><div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">{filteredListings.length} records</div></header>
                <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, slug or category" className="w-full rounded-xl border border-white/10 bg-[#10151d] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-amber-300/60" /></div><div className="relative"><ListFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={17} /><select value={type} onChange={(event) => setType(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-[#10151d] py-3 pl-11 pr-10 text-sm text-white outline-none focus:border-amber-300/60"><option value="all">All categories</option><option value="sale">Property sale</option><option value="rental">Rental</option><option value="land">Land</option><option value="vehicle">Vehicle</option><option value="service">Service</option></select></div></div>
                {isLoading && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-zinc-400">Loading current listings...</div>}
                {isError && <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-10 text-center text-red-200">The current listing API could not be loaded.</div>}
                {!isLoading && !isError && <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1219]"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-zinc-500"><tr><th className="px-6 py-4">Listing</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Trust</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-right">Views</th></tr></thead><tbody className="divide-y divide-white/10">{filteredListings.map((listing) => <tr key={listing.id} className="transition hover:bg-white/[0.03]"><td className="px-6 py-5"><p className="font-medium text-white">{listing.title}</p><p className="mt-1 text-xs text-zinc-500">/{listing.slug || listing.id}</p></td><td className="px-6 py-5 text-sm capitalize text-zinc-300">{listing.listing_type}</td><td className="px-6 py-5"><span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-300">{listing.status}</span></td><td className="px-6 py-5">{listing.verification_level === 'verified' ? <span className="inline-flex items-center gap-1 text-xs text-emerald-300"><ShieldCheck size={14} /> Verified</span> : <span className="text-xs text-zinc-500">{listing.verification_level || 'Not submitted'}</span>}</td><td className="px-6 py-5 text-right text-sm font-semibold text-amber-300">{Number(listing.price || 0).toLocaleString()} {listing.currency || 'RWF'}</td><td className="px-6 py-5 text-right text-sm text-zinc-400"><Eye className="mr-1 inline" size={14} />{listing.views_count ?? 0}</td></tr>)}</tbody></table>{filteredListings.length === 0 && <div className="p-12 text-center text-zinc-500">No current listings match the selected filters.</div>}</div></div>}
            </div>
        </div>
    );
};

export default AdminListingsPage;
