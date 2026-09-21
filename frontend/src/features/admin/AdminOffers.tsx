import React from 'react';
import {
  Building2, User, UserCheck, TrendingUp,
  Search, Filter, MoreVertical, ArrowUpRight,
  ChevronRight, FileText, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface Offer {
  id: string;
  propertyTitle: string;
  buyerName: string;
  sellerName: string;
  agentName: string;
  amount: number;
  counterAmount?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
}

const MOCK_OFFERS: Offer[] = [
  { id: '1', propertyTitle: 'Modern Villa Kicukiro', buyerName: 'Jean Paul', sellerName: 'Olivier N.', agentName: 'Agent Sarah', amount: 75000000, counterAmount: 80000000, status: 'countered', createdAt: '2026-09-15' },
  { id: '2', propertyTitle: 'Prime Plot Gasabo', buyerName: 'Marie Claire', sellerName: 'Jean B.', agentName: 'Agent Mark', amount: 40000000, status: 'pending', createdAt: '2026-09-18' },
  { id: '3', propertyTitle: 'Toyota RAV4 2021', buyerName: 'Eric Kabera', sellerName: 'Alice W.', agentName: '-', amount: 25000000, status: 'accepted', createdAt: '2026-09-10' },
  { id: '4', propertyTitle: 'Luxury Apartment Nyarutarama', buyerName: 'David K.', sellerName: 'Olivier N.', agentName: 'Agent Sarah', amount: 120000000, status: 'rejected', createdAt: '2026-09-12' },
];

const AdminOffers: React.FC = () => {
  return (
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Marketplace Orchestration</p>
            <h1 className="text-4xl font-bold tracking-tight text-white">Offer <span className="text-emerald-500">Management</span></h1>
            <p className="text-zinc-400 mt-1">Moderate and track all purchase offers, counter-proposals, and transaction statuses.</p>
          </div>
        </div>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Offers', value: MOCK_OFFERS.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pending', value: MOCK_OFFERS.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Accepted', value: MOCK_OFFERS.filter(o => o.status === 'accepted').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Rejected', value: MOCK_OFFERS.filter(o => o.status === 'rejected').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all hover:border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  {React.createElement(stat.icon as any, { size: 24 })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offers Table Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search properties or buyers..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <Button variant="ghost" className="p-2 rounded-xl text-zinc-500 hover:text-white border border-white/10">
                <Filter size={18} />
              </Button>
            </div>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              Export Data <ArrowUpRight size={16} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold border-b border-white/10">
                <tr className="bg-white/[0.01]">
                  <th className="px-6 py-4 font-semibold">Property</th>
                  <th className="px-6 py-4 font-semibold">Participants</th>
                  <th className="px-6 py-4 font-semibold text-right">Offer Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Counter Offer</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_OFFERS.map(offer => (
                  <tr key={offer.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <Building2 size={18} />
                        </div>
                        <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{offer.propertyTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <User size={14} className="text-zinc-500" />
                          <span>Buyer: {offer.buyerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <UserCheck size={14} className="text-emerald-500" />
                          <span>Seller: {offer.sellerName}</span>
                        </div>
                        {offer.agentName !== '-' && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500 italic">
                            <User size={12} /> Agent: {offer.agentName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-white">
                      {offer.amount.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-bold text-emerald-400">
                      {offer.counterAmount ? `${offer.counterAmount.toLocaleString()} RWF` : '—'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge
                        variant="neutral"
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          offer.status === 'pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                          offer.status === 'accepted' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          offer.status === 'rejected' ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        )}
                      >
                        {offer.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-white" title="Manage Offer">
                          <MoreVertical size={16} />
                        </Button>
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400" title="View History">
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;
