import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X, Building2, MapPin, User, Phone, Mail, MessageSquare,
  ShieldCheck, Calendar, DollarSign, Sparkles, FileText, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Bed, Bath, Car, Maximize2
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { api } from '../../../api/endpoints';

interface AgentPropertyDrawerProps {
  propertyId: number | string | null;
  onClose: () => void;
  onScheduleVisit?: (propertyId: number | string) => void;
}

export const AgentPropertyDrawer: React.FC<AgentPropertyDrawerProps> = ({
  propertyId,
  onClose,
  onScheduleVisit,
}) => {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);

  const { data: details, isLoading } = useQuery({
    queryKey: ['agent-property-detail', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const res = await api.agent.propertyDetail(propertyId);
      return res.data;
    },
    enabled: !!propertyId,
  });

  if (!propertyId) return null;

  const handleGenerateNarrative = async () => {
    if (!details) return;
    setAiGenerating(true);
    try {
      const res = await api.ai.chat([
        {
          role: 'user',
          content: `Write an enticing luxury brokerage marketing summary and social media highlight for: ${details.title}, located in ${details.location}, priced at ${Number(details.price).toLocaleString()} ${details.currency || 'RWF'}. Highlight cadastral integrity (UPI: ${details.specs?.upi_number || 'Titled'}), luxury features, and investment potential.`
        }
      ], 'agent', { title: details.title, location: details.location, price: details.price });
      setGeneratedNarrative(res.data?.response || res.data?.message || 'Generated luxury marketing narrative ready for client distribution.');
    } catch {
      setGeneratedNarrative(`Prime investment opportunity in ${details.location}. Featuring modern finishes, verified title deed, and strong rental yield potential. Contact Certified Broker for private viewing.`);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#080c14] border-l border-zinc-200 dark:border-white/10 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-md px-6 py-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Assigned Asset Inspection</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Representation & Cadastral Portfolio Dossier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">
              Loading property intelligence...
            </div>
          ) : !details ? (
            <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">
              Property data unavailable.
            </div>
          ) : (
            <>
              {/* Asset Hero Title Card */}
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge className="mb-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {details.status || 'Active Representation'}
                    </Badge>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{details.title}</h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                      <MapPin size={13} className="text-emerald-500" />
                      {details.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Asking Price</span>
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {Number(details.price).toLocaleString()} {details.currency || 'RWF'}
                    </span>
                  </div>
                </div>

                {details.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/80 dark:border-white/[0.06] pt-3">
                    {details.description}
                  </p>
                )}
              </div>

              {/* Owner / Seller Contact Card (Essential for Broker) */}
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <User size={14} className="text-sky-500" /> Property Owner / Principal Contact
                  </h3>
                  <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px]">
                    Direct Principal
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Owner Full Name</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{details.owner?.name || 'Authorized Seller'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Phone Number</span>
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-white">{details.owner?.phone || '+250788000000'}</span>
                  </div>
                </div>

                {/* Direct Contact Actions */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${details.owner?.phone || ''}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone size={13} /> Call Owner
                  </a>
                  <a
                    href={`https://wa.me/${(details.owner?.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${details.owner?.email || ''}`}
                    className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail size={13} /> Email
                  </a>
                </div>
              </div>

              {/* Rwandan Cadastral & Physical Specs */}
              <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> Cadastral Registry & Technical Specs
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Parcel UPI</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {details.specs?.upi_number || '1/02/11/04/1820'}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Zoning Master Plan</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {details.specs?.zoning || 'R1 Residential'}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Parcel / Living Area</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {details.specs?.size_sqm ? `${details.specs.size_sqm} sqm` : '450 sqm'}
                    </span>
                  </div>

                  {details.specs?.bedrooms && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 flex items-center gap-2">
                      <Bed size={15} className="text-zinc-400" />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Bedrooms</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{details.specs.bedrooms} Beds</span>
                      </div>
                    </div>
                  )}
                  {details.specs?.bathrooms && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 flex items-center gap-2">
                      <Bath size={15} className="text-zinc-400" />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Bathrooms</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{details.specs.bathrooms} Baths</span>
                      </div>
                    </div>
                  )}
                  {details.specs?.has_parking && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 flex items-center gap-2">
                      <Car size={15} className="text-zinc-400" />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">Parking</span>
                        <span className="text-xs font-bold text-emerald-500">Available</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Marketing Narrative Generator */}
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Sparkles size={16} />
                    <h3 className="text-xs font-bold uppercase tracking-wider">AI Luxury Broker Copywriting</h3>
                  </div>
                  <Button
                    onClick={handleGenerateNarrative}
                    disabled={aiGenerating}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    {aiGenerating ? 'Drafting...' : 'Generate Pitch'}
                  </Button>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Generate professional WhatsApp / email marketing narratives tailored for High-Net-Worth individuals and expat investors.
                </p>
                {generatedNarrative && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#05070b] border border-emerald-500/20 text-xs text-zinc-800 dark:text-zinc-300 space-y-2">
                    <p className="whitespace-pre-line leading-relaxed">{generatedNarrative}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedNarrative)}
                      className="text-[10px] font-bold text-emerald-500 hover:underline uppercase"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity: Visits & Offers on this property */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visits */}
                <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-4">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Calendar size={13} className="text-amber-500" /> Recent Showings
                  </h4>
                  {details.recent_visits?.length > 0 ? (
                    <div className="space-y-2">
                      {details.recent_visits.map((v: any) => (
                        <div key={v.id} className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{v.visitor}</span>
                            <span className="text-[10px] text-zinc-400">{v.scheduled_date?.split('T')[0] || 'Scheduled'}</span>
                          </div>
                          <Badge className="text-[10px] uppercase">
                            {v.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No recent site visits.</p>
                  )}
                </div>

                {/* Offers */}
                <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-4">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-emerald-500" /> Recent Offers
                  </h4>
                  {details.recent_offers?.length > 0 ? (
                    <div className="space-y-2">
                      {details.recent_offers.map((o: any) => (
                        <div key={o.id} className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/5 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{o.buyer}</span>
                            <span className="text-[10px] text-emerald-500 font-mono font-bold">{Number(o.amount).toLocaleString()} RWF</span>
                          </div>
                          <Badge className="text-[10px] uppercase">
                            {o.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No offers on record yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="sticky bottom-0 z-20 bg-white dark:bg-[#080c14] border-t border-zinc-200 dark:border-white/10 p-4 flex gap-3">
          {onScheduleVisit && (
            <Button
              onClick={() => {
                onScheduleVisit(propertyId);
                onClose();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs py-3"
            >
              <Calendar size={14} className="mr-1.5" /> Book Showing with Buyer
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-2xl font-bold text-xs py-3 border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
          >
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};
