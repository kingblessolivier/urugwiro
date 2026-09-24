import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles, Bot, Send, DollarSign,
  FileText, Check, Copy,
  RefreshCw, TrendingUp
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const SellerAiCopilot: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'chat' | 'pricing' | 'narrative' | 'negotiation'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Welcome to Urugwiro AI Support (Seller Workspace).\n\nI can help you price your property against current Kigali comps, generate luxury marketing descriptions, advise on counter-offers, and verify RLMUA zoning codes.\n\nWhat would you like to work on today?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ── 1. PRICING ADVISOR STATE ──
  const [pricingForm, setPricingForm] = useState({
    category: 'house',
    district: 'Gasabo / Nyarutarama',
    sizeSqm: '450',
    bedrooms: '4',
    targetPrice: '450000000',
  });
  const [pricingResult, setPricingResult] = useState<string | null>(null);

  // ── 2. NARRATIVE STUDIO STATE ──
  const [narrativeForm, setNarrativeForm] = useState({
    title: '',
    category: 'house',
    district: 'Nyarutarama',
    highlights: 'Panoramic hillside view, private pool, solar backup, clean UPI title deed',
    price: '480000000',
  });
  const [narrativeResult, setNarrativeResult] = useState<{ title: string; narrative: string } | null>(null);

  // ── 3. NEGOTIATION STATE ──
  const [negotiationForm, setNegotiationForm] = useState({
    askingPrice: '480000000',
    buyerOffer: '420000000',
    propertyTitle: 'Modern Villa, Nyarutarama',
  });
  const [negotiationResult, setNegotiationResult] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // General Chat Mutation
  const chatMutation = useMutation({
    mutationFn: async (updatedMessages: ChatMessage[]) => {
      const res = await api.ai.chat(updatedMessages, 'seller');
      return res.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    },
  });

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatMutation.isPending) return;

    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: chatInput.trim() }];
    setMessages(newMsgs);
    setChatInput('');
    chatMutation.mutate(newMsgs);
  };

  // Pricing Advisor Run
  const pricingMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Evaluate pricing for a ${pricingForm.category} in ${pricingForm.district} with ${pricingForm.sizeSqm} sqm and ${pricingForm.bedrooms} bedrooms. Target price is ${pricingForm.targetPrice} RWF. Compare against Kigali market medians, calculate variance, and suggest the optimal list price.`;
      const res = await api.ai.chat([{ role: 'user', content: prompt }], 'seller');
      return res.data;
    },
    onSuccess: (data) => {
      setPricingResult(data.reply);
    },
  });

  // Narrative Studio Run
  const narrativeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.seller.generateNarrative({
        title: narrativeForm.title,
        category: narrativeForm.category,
        district: narrativeForm.district,
        specs: narrativeForm.highlights,
        price: narrativeForm.price,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNarrativeResult(data);
    },
  });

  // Negotiation Strategist Run
  const negotiationMutation = useMutation({
    mutationFn: async () => {
      const asking = parseFloat(negotiationForm.askingPrice);
      const offer = parseFloat(negotiationForm.buyerOffer);
      const discount = Math.round(((asking - offer) / asking) * 100);
      const prompt = `A buyer offered ${offer.toLocaleString()} RWF on my property '${negotiationForm.propertyTitle}' (asking price ${asking.toLocaleString()} RWF, a ${discount}% discount). Analyze feasibility in Rwanda, recommend an exact counter-offer with escrow terms, and write a professional counter-offer letter.`;
      const res = await api.ai.chat([{ role: 'user', content: prompt }], 'seller');
      return res.data;
    },
    onSuccess: (data) => {
      setNegotiationResult(data.reply);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER: SELLER CO-PILOT MODES ── */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#070a10] to-[#070a10] p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Seller AI Co-Pilot</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  NVIDIA NIM Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Autonomous pricing intelligence, marketing copywriting, and offer negotiation strategist.</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'chat', label: 'AI Advisor', icon: Bot },
              { id: 'pricing', label: 'Pricing Engine', icon: DollarSign },
              { id: 'narrative', label: 'Copy Studio', icon: FileText },
              { id: 'negotiation', label: 'Negotiator', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveMode(id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap",
                  activeMode === id
                    ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODE 1: INTERACTIVE CONVERSATIONAL ADVISOR ── */}
      {activeMode === 'chat' && (
        <div className="h-[560px] flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                  {!isUser && (
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-lg",
                      isUser
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                        : "bg-black/40 text-zinc-200 border border-white/10 rounded-tl-sm backdrop-blur-md"
                    )}
                  >
                    <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap break-words font-sans">
                      {(msg.content || '').replace(/\*\*/g, '').replace(/\*/g, '')}
                    </div>
                  </div>
                </div>
              );
            })}

            {chatMutation.isPending && (
              <div className="flex gap-3 items-center text-xs text-zinc-400">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-1 bg-black/40 border border-white/10 px-3 py-2 rounded-2xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-zinc-400 ml-1">Analyzing Rwanda market data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 mr-1">Quick Inquiries:</span>
            {[
              "What is the average price per sqm in Nyarutarama?",
              "How do I verify zoning R2 on my Gasabo land?",
              "A buyer offered a 15% discount, how should I counter?",
              "Write a short luxury caption for my 4-bedroom villa"
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setChatInput(prompt);
                }}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-zinc-300 hover:text-white text-[11px] transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 sm:p-4 border-t border-white/10 bg-[#070a10]">
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-1.5 focus-within:border-emerald-400/50 transition-colors">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your AI Co-Pilot anything about pricing, zoning, or buyer negotiations..."
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!chatInput.trim() || chatMutation.isPending}
                className="shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Send</span>
                <Send size={14} />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODE 2: PRICING ADVISOR ── */}
      {activeMode === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              <span>Asset Valuation & Market Comps</span>
            </h3>
            <p className="text-xs text-zinc-400">Evaluate whether your target listing price aligns with active transactions in Kigali.</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Asset Category</label>
                <select
                  value={pricingForm.category}
                  onChange={(e) => setPricingForm({ ...pricingForm, category: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-white outline-none"
                >
                  <option value="house" className="bg-[#0b0e14]">Residential House / Villa</option>
                  <option value="land" className="bg-[#0b0e14]">Titled Land Parcel</option>
                  <option value="apartment" className="bg-[#0b0e14]">Modern Apartment</option>
                  <option value="commercial" className="bg-[#0b0e14]">Commercial Property</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">District / Enclave</label>
                <input
                  type="text"
                  value={pricingForm.district}
                  onChange={(e) => setPricingForm({ ...pricingForm, district: e.target.value })}
                  placeholder="e.g. Gasabo / Nyarutarama"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Total Size (sqm)</label>
                  <input
                    type="number"
                    value={pricingForm.sizeSqm}
                    onChange={(e) => setPricingForm({ ...pricingForm, sizeSqm: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Bedrooms / Units</label>
                  <input
                    type="number"
                    value={pricingForm.bedrooms}
                    onChange={(e) => setPricingForm({ ...pricingForm, bedrooms: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Your Target Price (RWF)</label>
                <input
                  type="number"
                  value={pricingForm.targetPrice}
                  onChange={(e) => setPricingForm({ ...pricingForm, targetPrice: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none font-mono font-semibold text-emerald-400"
                />
              </div>

              <Button
                variant="primary"
                onClick={() => pricingMutation.mutate()}
                disabled={pricingMutation.isPending}
                className="w-full mt-3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {pricingMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Evaluate Pricing Against Market Comps</span>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles size={15} />
                AI Valuation Comps Report
              </span>
              {pricingResult && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(pricingResult)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </h4>
            <div className="flex-1 overflow-y-auto text-xs text-zinc-300 leading-relaxed space-y-3 prose prose-invert prose-xs max-w-none">
              {pricingResult ? (
                <div className="whitespace-pre-wrap">{pricingResult}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-2">
                  <DollarSign size={28} className="text-zinc-600" />
                  <p>Enter your property details and click evaluate to view AI comps and price feasibility.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 3: NARRATIVE STUDIO ── */}
      {activeMode === 'narrative' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              <span>Luxury Listing Narrative Studio</span>
            </h3>
            <p className="text-xs text-zinc-400">Generate high-prestige listing titles and compelling descriptions using NVIDIA NIM.</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Working Title (optional)</label>
                <input
                  type="text"
                  value={narrativeForm.title}
                  onChange={(e) => setNarrativeForm({ ...narrativeForm, title: e.target.value })}
                  placeholder="e.g. 5-Bed Hillside Residence"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={narrativeForm.category}
                    onChange={(e) => setNarrativeForm({ ...narrativeForm, category: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                  >
                    <option value="house" className="bg-[#0b0e14]">Villa / House</option>
                    <option value="land" className="bg-[#0b0e14]">Titled Land</option>
                    <option value="car" className="bg-[#0b0e14]">Executive SUV</option>
                    <option value="motorbike" className="bg-[#0b0e14]">Bike / Fleet</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">District / Location</label>
                  <input
                    type="text"
                    value={narrativeForm.district}
                    onChange={(e) => setNarrativeForm({ ...narrativeForm, district: e.target.value })}
                    placeholder="e.g. Nyarutarama"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Key Selling Points & Specs</label>
                <textarea
                  rows={3}
                  value={narrativeForm.highlights}
                  onChange={(e) => setNarrativeForm({ ...narrativeForm, highlights: e.target.value })}
                  placeholder="List unique highlights: views, finishes, swimming pool, clean title..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Price (RWF)</label>
                <input
                  type="text"
                  value={narrativeForm.price}
                  onChange={(e) => setNarrativeForm({ ...narrativeForm, price: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              <Button
                variant="primary"
                onClick={() => narrativeMutation.mutate()}
                disabled={narrativeMutation.isPending}
                className="w-full mt-3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {narrativeMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Generate Luxury Narrative</span>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles size={15} />
                AI Generated Marketing Narrative
              </span>
              {narrativeResult && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${narrativeResult.title}\n\n${narrativeResult.narrative}`)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </h4>

            {narrativeResult ? (
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">Generated Title:</p>
                  <p className="text-sm font-bold text-white">{narrativeResult.title}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 leading-relaxed whitespace-pre-wrap">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Marketing Narrative:</p>
                  {narrativeResult.narrative}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-2">
                <FileText size={28} className="text-zinc-600" />
                <p>Fill out the specs and generate compelling marketing copy for your listing.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODE 4: NEGOTIATION STRATEGIST ── */}
      {activeMode === 'negotiation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4 backdrop-blur-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>Offer Strategy & Counter-Offer Generator</span>
            </h3>
            <p className="text-xs text-zinc-400">Analyze buyer discounts, determine commercial viability, and draft an airtight counter-offer.</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Property Title</label>
                <input
                  type="text"
                  value={negotiationForm.propertyTitle}
                  onChange={(e) => setNegotiationForm({ ...negotiationForm, propertyTitle: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Asking Price (RWF)</label>
                  <input
                    type="number"
                    value={negotiationForm.askingPrice}
                    onChange={(e) => setNegotiationForm({ ...negotiationForm, askingPrice: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-white outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Buyer Offered Price (RWF)</label>
                  <input
                    type="number"
                    value={negotiationForm.buyerOffer}
                    onChange={(e) => setNegotiationForm({ ...negotiationForm, buyerOffer: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-amber-400 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => negotiationMutation.mutate()}
                disabled={negotiationMutation.isPending}
                className="w-full mt-3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {negotiationMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Analyze Offer & Generate Counter</span>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles size={15} />
                Strategic Counter Recommendation
              </span>
              {negotiationResult && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(negotiationResult)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </h4>
            <div className="flex-1 overflow-y-auto text-xs text-zinc-300 leading-relaxed space-y-3 prose prose-invert prose-xs max-w-none">
              {negotiationResult ? (
                <div className="whitespace-pre-wrap">{negotiationResult}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-2">
                  <TrendingUp size={28} className="text-zinc-600" />
                  <p>Enter the asking price and buyer offer to receive an AI negotiation strategy and letter draft.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SellerAiCopilot;
