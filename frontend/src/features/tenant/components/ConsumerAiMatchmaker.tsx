import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles, CheckCircle2, ArrowRight,
  MapPin, ShieldCheck
} from 'lucide-react';
import { api } from '../../../api/endpoints';
import type { AiRecommendation } from '../types';

interface ConsumerAiMatchmakerProps {
  onNavigate?: (view: any) => void;
  onScheduleVisit?: (listingId: number) => void;
}

export const ConsumerAiMatchmaker: React.FC<ConsumerAiMatchmakerProps> = ({
  onNavigate,
  onScheduleVisit: _onScheduleVisit,
}) => {
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [category, setCategory] = useState('house');
  const [district, setDistrict] = useState('Gasabo');
  const [maxBudget, setMaxBudget] = useState(150000000);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const matchMutation = useMutation({
    mutationFn: async () => {
      const res = await api.consumer.aiRecommendations({
        purpose,
        category,
        district,
        max_budget: maxBudget,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      setHasRun(true);
    },
  });

  const handleRunMatch = (e: React.FormEvent) => {
    e.preventDefault();
    matchMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} /> Deep Learning Matchmaker
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          AI Investment & Residence Recommender
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tell us your budget, preferred district, and goals to discover scientifically ranked Kigali properties with tailored financial rationales.
        </p>
      </div>

      {/* Interactive Questionnaire Form */}
      <form
        onSubmit={handleRunMatch}
        className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-lg space-y-5"
      >
        {/* Purpose & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              I Want To
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPurpose('sale');
                  if (maxBudget < 20000000) setMaxBudget(150000000);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all ${
                  purpose === 'sale'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Buy & Invest
              </button>
              <button
                type="button"
                onClick={() => {
                  setPurpose('rent');
                  if (maxBudget > 5000000) setMaxBudget(800000);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all ${
                  purpose === 'rent'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Rent a Home
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Property Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="house">Residential Villa / House</option>
              <option value="apartment">Modern Apartment / Flat</option>
              <option value="land">Titled Land Parcel</option>
              <option value="commercial">Commercial / Office</option>
            </select>
          </div>
        </div>

        {/* District & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Target District in Kigali
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['All', 'Gasabo', 'Kicukiro', 'Nyarugenge'].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setDistrict(dist)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                    district === dist
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-transparent'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Max Budget Target
              </label>
              <span className="font-mono text-xs font-bold text-emerald-500">
                {maxBudget.toLocaleString()} RWF {purpose === 'rent' ? '/ mo' : ''}
              </span>
            </div>
            <input
              type="range"
              min={purpose === 'rent' ? 100000 : 10000000}
              max={purpose === 'rent' ? 5000000 : 800000000}
              step={purpose === 'rent' ? 50000 : 5000000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={matchMutation.isPending}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
        >
          {matchMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={16} />
              <span>Synthesize AI Recommendations</span>
            </>
          )}
        </button>
      </form>

      {/* Results Section */}
      {hasRun && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>Recommended Properties Ranked for You</span>
            </h4>
            <span className="text-xs text-zinc-400 font-mono">
              {recommendations.length} Best Matches
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 text-zinc-400 text-xs">
              No direct listings met this exact filter threshold. Try expanding your budget range or selecting 'All' districts.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 hover:border-emerald-500/40 shadow-lg space-y-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={rec.image}
                        alt={rec.title}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs text-zinc-400 flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-500" />
                            <span className="truncate">{rec.location}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                            {rec.match_score}% MATCH
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {rec.title}
                        </h5>
                        <div className="text-xs font-mono font-bold text-emerald-500 mt-1">
                          {rec.price.toLocaleString()} RWF
                        </div>
                      </div>
                    </div>

                    {/* AI Rationale Box */}
                    <div className="p-3.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <div className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1 mb-1">
                        <Sparkles size={11} /> AI Match Rationale
                      </div>
                      <p>{rec.ai_rationale}</p>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5">
                      {rec.key_highlights.map((h, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-white/[0.04] text-[11px] text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/5 flex items-center gap-1"
                        >
                          <ShieldCheck size={11} className="text-emerald-500" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onNavigate && onNavigate('discovery')}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>View Asset</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
