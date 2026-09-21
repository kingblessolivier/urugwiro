import React, { useState } from 'react';
import { Mail, Eye, Archive, Trash2, Search, CheckCircle2, Reply, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  propertyTitle: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

const MOCK_ENQUIRIES: Enquiry[] = [
  { id: '1', name: 'Jean Paul', email: 'jp@example.com', propertyTitle: 'Modern Villa Kicukiro', message: 'I am interested in this property. Is the price negotiable?', status: 'unread', createdAt: '2026-09-18T10:00:00Z' },
  { id: '2', name: 'Marie Claire', email: 'mc@example.com', propertyTitle: 'Prime Plot Gasabo', message: 'Does this plot have a registered title deed?', status: 'read', createdAt: '2026-09-17T14:30:00Z' },
  { id: '3', name: 'Eric Kabera', email: 'ek@example.com', propertyTitle: 'Toyota RAV4 2021', message: 'Can I schedule a viewing for this weekend?', status: 'archived', createdAt: '2026-09-15T09:15:00Z' },
  { id: '4', name: 'Sarah Umutoni', email: 'su@example.com', propertyTitle: 'Modern Villa Kicukiro', message: 'Is there a payment plan available for this house?', status: 'unread', createdAt: '2026-09-19T08:00:00Z' },
];

const AdminEnquiries: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unread' | 'read' | 'archived'>('unread');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEnquiries = MOCK_ENQUIRIES.filter(e =>
    e.status === activeTab &&
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: 'unread', label: 'Unread', color: 'bg-red-500/10 text-red-400 border-red-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'unread').length },
    { id: 'read', label: 'Read', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'read').length },
    { id: 'archived', label: 'Archived', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30', count: MOCK_ENQUIRIES.filter(e => e.status === 'archived').length },
  ];

  return (
    <div className="p-8 lg:p-12 bg-[#05070b] min-h-screen text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Communications</p>
            <h1 className="text-4xl font-bold tracking-tight text-white">Customer <span className="text-emerald-500">Enquiries</span></h1>
            <p className="text-zinc-400 mt-1">Manage and respond to incoming property inquiries from potential buyers.</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {tabs.map(tab => (
            <div key={tab.id} className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">{tab.label}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{tab.count}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl", tab.color)}>
                  <Mail size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Enquiry Table Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search enquiries..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    activeTab === tab.id
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Property</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnquiries.map(enquiry => (
                  <tr key={enquiry.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium text-zinc-200 group-hover:text-white transition-colors">{enquiry.name}</p>
                        <p className="text-xs text-zinc-500">{enquiry.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-zinc-300 font-medium">{enquiry.propertyTitle}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-zinc-400 truncate max-w-xs">{enquiry.message}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge
                        variant="neutral"
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          enquiry.status === 'unread' ? "bg-red-500/10 text-red-400 border-red-500/30" :
                          enquiry.status === 'read' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                          "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                        )}
                      >
                        {enquiry.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-emerald-400" title="Reply">
                          <Reply size={16} />
                        </Button>
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-white" title="View">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300" title="Archive">
                          <Archive size={16} />
                        </Button>
                        <Button variant="ghost" className="p-2 rounded-lg text-zinc-500 hover:text-red-400" title="Delete">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-sm text-zinc-500">
                      <div className="flex flex-col items-center gap-3">
                        <Mail size={40} className="text-zinc-700" />
                        <p>No enquiries found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
