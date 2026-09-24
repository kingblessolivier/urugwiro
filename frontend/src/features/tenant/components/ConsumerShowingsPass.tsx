import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QrCode, Calendar, MapPin, Phone, MessageCircle, Navigation,
  Clock, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import type { ConsumerVisit } from '../types';
import { Badge } from '../../../components/ui/Badge';

interface ConsumerShowingsPassProps {
  onNavigate?: (view: any) => void;
}

export const ConsumerShowingsPass: React.FC<ConsumerShowingsPassProps> = ({ onNavigate }) => {
  const queryClient = useQueryClient();
  const [selectedPass, setSelectedPass] = useState<ConsumerVisit | null>(null);

  const { data: visits = [], isLoading, refetch } = useQuery<ConsumerVisit[]>({
    queryKey: ['consumer-visits'],
    queryFn: async () => {
      const res = await api.consumer.visits();
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (visitId: number) => {
      return api.consumer.cancelVisit(visitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumer-visits'] });
      queryClient.invalidateQueries({ queryKey: ['consumer-dashboard'] });
      refetch();
    },
  });

  const handleCancel = async (visitId: number) => {
    if (!window.confirm('Cancel this scheduled property showing?')) return;
    try {
      await cancelMutation.mutateAsync(visitId);
    } catch {
      alert('Could not cancel showing. Please contact your broker.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <QrCode className="text-emerald-500" size={22} />
            <span>Digital Showing Passes</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified VIP inspection tickets with GPS coordinates and certified broker dispatch.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('discovery')}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-md active:scale-95"
        >
          <Calendar size={14} />
          <span>Book New Showing</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your verified showing passes...
        </div>
      ) : visits.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <Calendar size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">No Scheduled Passes</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You don't have any upcoming property visits. Select any property in the discovery catalog to issue a free VIP showing pass.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('discovery')}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5 shadow-md"
          >
            <span>Explore Properties</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visits.map((visit) => {
            const isScheduled = visit.status === 'scheduled';
            const isCancelled = visit.status === 'cancelled';

            return (
              <div
                key={visit.id}
                className={`relative overflow-hidden rounded-3xl border transition-all ${
                  isCancelled
                    ? 'opacity-60 bg-zinc-100 dark:bg-white/[0.01] border-zinc-200 dark:border-white/5'
                    : 'bg-white dark:bg-gradient-to-br dark:from-[#0d1424] dark:to-[#090d16] border-zinc-200 dark:border-white/10 hover:border-emerald-500/40 shadow-xl'
                }`}
              >
                {/* Boarding Pass Header Tear-off Strip */}
                <div className="px-5 py-3.5 bg-emerald-500/10 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Urugwiro VIP Pass
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {visit.pass_code}
                  </div>
                </div>

                {/* Main Pass Body */}
                <div className="p-5 space-y-4">
                  {/* Property Info */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={visit.property_image}
                      alt={visit.property_title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-500" />
                        <span className="truncate">{visit.property_location}</span>
                      </div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white truncate mt-0.5">
                        {visit.property_title}
                      </h4>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                        {visit.property_price.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Date / Time */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Date</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {visit.scheduled_date}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Time</span>
                      <span className="text-xs font-bold text-emerald-500 font-mono">
                        {visit.scheduled_time} CAT
                      </span>
                    </div>
                  </div>

                  {/* Assigned Broker Details */}
                  {visit.agent && (
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={visit.agent.avatar}
                          alt={visit.agent.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {visit.agent.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            License: {visit.agent.license_number}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${visit.agent.phone}`}
                          className="p-2 rounded-xl bg-zinc-200 dark:bg-white/10 hover:bg-emerald-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
                          title="Call Broker"
                        >
                          <Phone size={14} />
                        </a>
                        <a
                          href={visit.agent.whatsapp_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white transition-colors"
                          title="WhatsApp Broker"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Pass Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={visit.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Navigation size={14} />
                      <span>Google Maps GPS</span>
                    </a>

                    {isScheduled && (
                      <button
                        onClick={() => handleCancel(visit.id)}
                        className="py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] hover:bg-red-500/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 text-xs font-medium transition-all"
                        title="Cancel Showing"
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Watermark Barcode Bottom Visual */}
                <div className="px-5 py-2.5 bg-zinc-100 dark:bg-black/40 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>CADASTRAL GATEWAY PASS</span>
                  <span>RW-KGL-2026</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
