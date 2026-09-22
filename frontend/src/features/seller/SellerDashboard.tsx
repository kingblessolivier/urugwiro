import React, { useState } from 'react';
import {
  LayoutDashboard, Package, MessageSquare, HandCoins,
  ShieldCheck, TrendingUp, Eye, Bell, User, LogOut, Plus,
  ArrowUpRight, Filter, Search, Sparkles, CheckCircle2,
  Clock, AlertCircle, ChevronRight, MapPin, Building,
  Car, FileText, ArrowRight, ExternalLink, Bot, Menu, X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { SellerOfferManager } from './SellerOfferManager';
import { SellerAiCopilot } from './SellerAiCopilot';
import { ChatWindow } from '../chat/ChatWindow';
import ListingWizard from './ListingWizard';

export type SellerTab = 'overview' | 'listings' | 'offers' | 'messages' | 'copilot' | 'verification' | 'new-listing';

interface SellerDashboardProps {
  onNavigate?: (view: any) => void;
  initialTab?: SellerTab;
}

interface ListingItem {
  id: string;
  title: string;
  category: 'house' | 'land' | 'car';
  location: string;
  price: number;
  currency: string;
  views: number;
  inquiries: number;
  offers: number;
  status: 'Active' | 'Under Offer' | 'Pending Verification' | 'Sold';
  upiNumber?: string;
  image: string;
  verified: boolean;
  updatedAt: string;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState<SellerTab>(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'house' | 'land' | 'car'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample verified listings
  const [listings] = useState<ListingItem[]>([
    {
      id: '1',
      title: 'Modern 5-Bed Villa with Panoramic Hills View',
      category: 'house',
      location: 'Nyarutarama, Kigali',
      price: 450000000,
      currency: 'RWF',
      views: 1420,
      inquiries: 18,
      offers: 2,
      status: 'Active',
      upiNumber: '1/03/05/02/1042',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      verified: true,
      updatedAt: '2h ago',
    },
    {
      id: '2',
      title: 'Prime Commercial Plot (Zoning C1) on Tarmac',
      category: 'land',
      location: 'Kicukiro, Sonatubes',
      price: 180000000,
      currency: 'RWF',
      views: 980,
      inquiries: 9,
      offers: 1,
      status: 'Under Offer',
      upiNumber: '1/02/09/01/5521',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      verified: true,
      updatedAt: '4h ago',
    },
    {
      id: '3',
      title: '2022 Toyota Land Cruiser Prado VXR',
      category: 'car',
      location: 'Gacuriro, Kigali',
      price: 85000000,
      currency: 'RWF',
      views: 2310,
      inquiries: 27,
      offers: 3,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      verified: true,
      updatedAt: '1d ago',
    },
    {
      id: '4',
      title: 'Luxury 4-Bed Duplex with Swimming Pool',
      category: 'house',
      location: 'Kibagabaga, Kigali',
      price: 290000000,
      currency: 'RWF',
      views: 640,
      inquiries: 5,
      offers: 0,
      status: 'Pending Verification',
      upiNumber: '1/03/04/05/8892',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      verified: false,
      updatedAt: '2d ago',
    }
  ]);

  const filteredListings = listings.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesQuery = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const totalValue = listings.reduce((acc, curr) => acc + curr.price, 0);
  const totalViews = listings.reduce((acc, curr) => acc + curr.views, 0);
  const totalInquiries = listings.reduce((acc, curr) => acc + curr.inquiries, 0);
  const totalOffers = listings.reduce((acc, curr) => acc + curr.offers, 0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: Package, badge: listings.length.toString() },
    { id: 'offers', label: 'Offers & Deals', icon: HandCoins, badge: '3 Active' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '2 New' },
    { id: 'copilot', label: 'AI Co-Pilot', icon: Sparkles, highlight: true },
    { id: 'verification', label: 'Trust & Verification', icon: ShieldCheck, badge: '98%' },
  ];

  return (
    <div className="flex h-screen bg-[#05070b] text-white font-sans antialiased overflow-hidden select-none">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-[#080b11]/90 backdrop-blur-2xl border-r border-white/10 hidden lg:flex flex-col p-6 sticky top-0 h-full shrink-0 z-20">
        
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate ? onNavigate('home') : null}
          className="flex items-center gap-3.5 px-3 py-3 mb-8 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all group"
        >
          <div className="relative">
            <img
              src="/urugwiro_logo_fav.png"
              alt="Urugwiro"
              className="h-9 w-9 rounded-xl object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#080b11] rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
              Urugwiro
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Seller
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 tracking-tight">Verified Estate Hub</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as SellerTab);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-emerald-400"
                        : item.highlight
                        ? "text-emerald-400 group-hover:text-emerald-300"
                        : "text-zinc-500 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : item.highlight
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-zinc-400 border-white/10"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Button */}
        <div className="pt-4 pb-4">
          <button
            onClick={() => setActiveTab('new-listing')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>List New Asset</span>
          </button>
        </div>

        {/* Seller Trust Profile */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Seller Avatar"
                className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30"
              />
              <CheckCircle2 size={12} className="absolute -bottom-1 -right-1 text-emerald-400 bg-[#080b11] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Kigali Prime Estates</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-mono">RLMUA Verified</span>
                <span className="text-[9px] text-zinc-500">•</span>
                <span className="text-[10px] text-zinc-400">98% Trust</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
            <button 
              onClick={() => onNavigate ? onNavigate('home') : null}
              className="hover:text-zinc-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <ArrowRight size={12} className="rotate-180" /> Public Portal
            </button>
            <button 
              onClick={() => onNavigate ? onNavigate('home') : null}
              className="hover:text-red-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#080b11] border-r border-white/10 h-full p-6 flex flex-col z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img src="/urugwiro_logo_fav.png" alt="Urugwiro" className="h-7 w-7 rounded-lg" />
                <span className="font-bold text-white">Seller Dashboard</span>
              </div>
              <button 
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as SellerTab);
                      setMobileNavOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-emerald-400" : "text-zinc-500"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setActiveTab('new-listing');
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
              >
                <Plus size={18} />
                <span>List New Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP NAVBAR */}
        <header className="h-16 lg:h-20 bg-[#080b11]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-10">
          
          <div className="flex items-center gap-3 lg:gap-4 flex-1">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
            >
              <Menu size={20} />
            </button>

            {/* Mobile / Desktop Brand pill when on smaller screens */}
            <div className="flex items-center gap-2 lg:hidden">
              <img src="/urugwiro_logo_fav.png" alt="Logo" className="w-6 h-6 rounded-md" />
              <span className="font-bold text-sm text-white">Urugwiro</span>
            </div>

            {/* Active view indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-600">Seller Workspace</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium capitalize">
                {activeTab === 'copilot' ? 'AI Co-Pilot' : activeTab}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick AI Trigger button */}
            <button
              onClick={() => setActiveTab('copilot')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                activeTab === 'copilot'
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/[0.03] text-zinc-300 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
              )}
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Notification bell */}
            <button
              onClick={() => setActiveTab('offers')}
              className="relative p-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#080b11]" />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            {/* Quick Public View */}
            <button
              onClick={() => onNavigate ? onNavigate('discovery') : null}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-all"
            >
              <span>Explore Market</span>
              <ExternalLink size={12} className="text-zinc-500" />
            </button>
          </div>
        </header>

        {/* MOBILE HORIZONTAL TAB BAR */}
        <div className="lg:hidden bg-[#080b11] border-b border-white/10 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SellerTab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                activeTab === item.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "bg-white/[0.02] text-zinc-400 border border-white/5"
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-400">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#05070b] via-[#080b11] to-[#05070b]">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              
              {/* Hero Banner with AI Valuation Insight */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/40 via-black/60 to-black/80 p-6 lg:p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      <Sparkles size={12} />
                      AI Market Intelligence Active
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-display">
                      Welcome Back, <span className="text-emerald-400">Kigali Prime</span>
                    </h1>
                    <p className="text-zinc-400 text-sm sm:text-base mt-1 max-w-2xl">
                      Your 4 assets have captured <span className="text-white font-semibold">5,350 views</span> and <span className="text-emerald-400 font-semibold">3 active buyer offers</span>. Land valuations in Gasabo and Kicukiro are trending +7.4% this quarter.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('new-listing')}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
                    >
                      <Plus size={16} />
                      List New Asset
                    </button>
                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-sm transition-all"
                    >
                      <Bot size={16} />
                      Consult AI Copilot
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Gross Portfolio</span>
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Building size={16} />
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {(totalValue / 1000000).toFixed(0)}M <span className="text-xs text-zinc-400 font-sans">RWF</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
                    <TrendingUp size={12} />
                    <span>+12.8% portfolio gain</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Live Traffic</span>
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Eye size={16} />
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-400 mt-2 font-medium">
                    <TrendingUp size={12} />
                    <span>+18% from last week</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Buyer Inquiries</span>
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <MessageSquare size={16} />
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {totalInquiries}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-400 mt-2 font-medium">
                    <Clock size={12} />
                    <span>Avg response: 18m</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between text-zinc-500 mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold">Active Offers</span>
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <HandCoins size={16} />
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {totalOffers} Deals
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-2 font-medium">
                    <Sparkles size={12} />
                    <span>AI Feasibility Analyzed</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN WORKSPACE: RECENT LISTINGS & QUICK ACTION CENTER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Listings Summary Column */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">Active Portfolio Overview</h3>
                      <p className="text-xs text-zinc-400">Manage real-time status, cadastre verification, and inquiries.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      View All Listings <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {listings.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/[0.03] hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h4>
                              {item.verified && (
                                <Badge variant="success" className="text-[9px] py-0 px-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                  RLMUA
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-zinc-500" />
                              {item.location}
                            </p>
                            <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                              {item.price.toLocaleString()} {item.currency}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="text-left sm:text-right text-xs">
                            <span className="text-zinc-400 font-medium block">
                              {item.views} views • {item.inquiries} inquiries
                            </span>
                            <span className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1",
                              item.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                              item.status === 'Under Offer' ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"
                            )}>
                              {item.status}
                            </span>
                          </div>

                          <button
                            onClick={() => setActiveTab('copilot')}
                            title="Analyze with AI Co-Pilot"
                            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/40 hover:text-emerald-400 text-zinc-400 transition-colors"
                          >
                            <Sparkles size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: AI Co-Pilot Recommendation & Quick Actions */}
                <div className="space-y-6">
                  
                  {/* AI Market Advisory Card */}
                  <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-black/40 p-6 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Bot size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">AI Pricing Recommendation</h4>
                        <span className="text-[10px] text-zinc-400">Updated 10m ago • Nyarutarama</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      "Your 5-bed Villa in Nyarutarama is priced at <span className="text-emerald-400 font-semibold">450M RWF</span>. High buyer search traffic indicates similar villas closed at <span className="text-white font-semibold">465M - 480M RWF</span> last week. You hold strong pricing power."
                    </p>
                    <button
                      onClick={() => setActiveTab('copilot')}
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Open Valuation Engine</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Trust & Cadastre Verification Status */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        Seller Credibility
                      </h4>
                      <span className="text-xs font-mono text-emerald-400 font-bold">98/100</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">RLMUA Cadastre UPI Registry</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Synced
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">National ID / Passport</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <span className="text-zinc-300">Milestone Escrow Vault</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Ready
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('verification')}
                      className="w-full py-2 text-center text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      View Title & Compliance Workspace →
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY LISTINGS INVENTORY */}
          {activeTab === 'listings' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white font-display">Asset Inventory</h1>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage your verified real estate parcels, villas, and vehicle fleets.</p>
                </div>
                <button
                  onClick={() => setActiveTab('new-listing')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
                >
                  <Plus size={16} />
                  <span>List New Asset</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All Assets' },
                    { id: 'house', label: 'Homes & Villas' },
                    { id: 'land', label: 'Titled Land' },
                    { id: 'car', label: 'Executive Cars' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setCategoryFilter(filter.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                        categoryFilter === filter.id
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or district..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Listing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-3xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 overflow-hidden flex flex-col transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge
                          variant={item.status === 'Active' ? 'success' : 'neutral'}
                          className={cn(
                            "text-[10px] uppercase font-mono px-2 py-0.5",
                            item.status === 'Active' ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40" : "bg-black/80 text-zinc-300 border border-white/20"
                          )}
                        >
                          {item.status}
                        </Badge>
                        {item.verified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                            <ShieldCheck size={10} /> RLMUA Verified
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <span className="text-lg font-bold font-mono text-white">
                          {item.price.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">{item.currency}</span>
                        </span>
                        {item.upiNumber && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                            UPI: {item.upiNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-zinc-500" />
                          {item.location}
                        </p>
                      </div>

                      {/* Performance Bar */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/30 border border-white/5 text-center">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block">Views</span>
                          <span className="text-xs font-mono font-bold text-white">{item.views}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block">Inquiries</span>
                          <span className="text-xs font-mono font-bold text-white">{item.inquiries}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block">Offers</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{item.offers}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveTab('copilot');
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Sparkles size={12} />
                          AI Optimization
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('messages');
                          }}
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                          title="View Inquiries"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: OFFERS & DEALS (INTEGRATED SELLER OFFER MANAGER) */}
          {activeTab === 'offers' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerOfferManager />
            </div>
          )}

          {/* TAB 4: REAL-TIME MESSAGING (INTEGRATED CHAT WINDOW) */}
          {activeTab === 'messages' && (
            <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] animate-fadeIn">
              <ChatWindow currentRole="seller" />
            </div>
          )}

          {/* TAB 5: SELLER AI CO-PILOT WORKSPACE */}
          {activeTab === 'copilot' && (
            <div className="max-w-7xl mx-auto animate-fadeIn">
              <SellerAiCopilot />
            </div>
          )}

          {/* TAB 6: TRUST & TITLE VERIFICATION WORKSPACE */}
          {activeTab === 'verification' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              
              <div className="border border-white/10 rounded-3xl bg-white/[0.02] p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      <ShieldCheck size={14} />
                      Urugwiro Sovereign Trust Bureau
                    </div>
                    <h2 className="text-2xl font-bold text-white font-display">Seller Legal & Cadastre Credentials</h2>
                    <p className="text-xs text-zinc-400 mt-1">Verified Rwandan land title registration, notary authorizations, and escrow compliance.</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Sovereign Tier Verified</span>
                      <span className="text-[10px] text-emerald-400 font-mono">RLMUA Cadastre + Irembo Sync</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Land Title (RLMUA UPI)</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      All land parcels in your portfolio are cross-checked with the National Land Authority registry. UPI boundaries and zoning classifications (R1, R2, C1) match the Kigali Master Plan 2050.
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Connected Registry: <span className="text-white">RLMUA / IremboGov</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Milestone Escrow Vault</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Buyer earnest deposits and purchase funds are secured through regulated tripartite escrow accounts with BNR-licensed banking partners in Rwanda.
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Deposit Guarantee: <span className="text-white">100% Insured</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">National ID / Passport (KYC)</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Authorized</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Beneficial ownership and identity verification completed via NIDA biometric lookup. You are legally qualified to sign conveyance deeds on Urugwiro.
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Doc Expiry: <span className="text-white">October 2030</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Electronic Notary Conveyance</span>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Ready</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      When an offer is accepted and paid into escrow, Urugwiro automatically drafts the bilateral deed and schedules the district land notary transfer appointment.
                    </p>
                    <div className="text-[11px] font-mono text-zinc-400">
                      District Office: <span className="text-white">Gasabo / Kicukiro Sector</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: NEW LISTING WIZARD */}
          {activeTab === 'new-listing' && (
            <div className="max-w-5xl mx-auto space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2">
                <button
                  onClick={() => setActiveTab('listings')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  ← Return to Inventory
                </button>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Sparkles size={14} />
                  <span>AI Co-Pilot Assists Every Step</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
                <ListingWizard />
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};
