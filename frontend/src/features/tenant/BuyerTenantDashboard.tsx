import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Handshake, QrCode, Landmark, TrendingUp,
  Sparkles, Heart, MessageSquare, Sun, Moon, LogOut,
  ArrowUpRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/endpoints';
import type { ConsumerPersona, ConsumerTab, ConsumerDashboardData } from './types';

// Subcomponents
import { ConsumerOverview } from './components/ConsumerOverview';
import { ConsumerOfferDesk } from './components/ConsumerOfferDesk';
import { ConsumerShowingsPass } from './components/ConsumerShowingsPass';
import { ConsumerAssetsAndLeases } from './components/ConsumerAssetsAndLeases';
import { ConsumerMarketTrends } from './components/ConsumerMarketTrends';
import { ConsumerAiMatchmaker } from './components/ConsumerAiMatchmaker';
import { ConsumerSavedWatchlist } from './components/ConsumerSavedWatchlist';
import { ChatWindow } from '../chat/ChatWindow';

interface BuyerTenantDashboardProps {
  onNavigate?: (view: any) => void;
  onListingClick?: (id: string) => void;
  initialTab?: ConsumerTab;
}

export const BuyerTenantDashboard: React.FC<BuyerTenantDashboardProps> = ({
  onNavigate,
  onListingClick,
  initialTab = 'overview',
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [persona, setPersona] = useState<ConsumerPersona>('buyer');
  const [activeTab, setActiveTab] = useState<ConsumerTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    user?.full_name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) ||
    'Consumer Member';

  // Live Metrics & Counter-Offer Alerts
  const { data: dashboardData, refetch: _refetchDashboard } = useQuery<ConsumerDashboardData>({
    queryKey: ['consumer-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.consumer.dashboard();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  // Chat contacts for live unread count
  const { data: chatData } = useQuery({
    queryKey: ['consumer-chat-contacts'],
    queryFn: async () => {
      try {
        const res = await api.chat.contacts();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const unreadMessagesCount = chatData?.total_unread || 0;
  const counteredOffersCount = dashboardData?.metrics?.countered_offers || 0;
  const upcomingVisitsCount = dashboardData?.metrics?.upcoming_visits || 0;
  const savedCount = dashboardData?.metrics?.saved_properties || 0;

  const navItems: Array<{
    id: ConsumerTab;
    label: string;
    mobileLabel: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview Cockpit', mobileLabel: 'Home', icon: LayoutDashboard },
    {
      id: 'offers',
      label: 'Negotiation & Offers',
      mobileLabel: 'Offers',
      icon: Handshake,
      badge: counteredOffersCount > 0 ? counteredOffersCount : undefined,
      badgeColor: 'bg-purple-500 text-white animate-pulse',
    },
    {
      id: 'showings',
      label: 'Digital Showing Passes',
      mobileLabel: 'Showings',
      icon: QrCode,
      badge: upcomingVisitsCount > 0 ? upcomingVisitsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'assets',
      label: persona === 'buyer' ? 'Deeds & Assets Vault' : 'Tenancies & Rent',
      mobileLabel: 'Vault',
      icon: Landmark,
    },
    {
      id: 'trends',
      label: 'Market Trends & SQM',
      mobileLabel: 'Trends',
      icon: TrendingUp,
    },
    {
      id: 'matchmaker',
      label: 'AI Matchmaker',
      mobileLabel: 'AI Match',
      icon: Sparkles,
    },
    {
      id: 'saved',
      label: 'Saved Watchlist',
      mobileLabel: 'Saved',
      icon: Heart,
      badge: savedCount > 0 ? savedCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'messages',
      label: 'Sovereign Chat',
      mobileLabel: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-sky-500 text-white',
    },
  ];

  // Mobile Bottom Bar subset (5 primary touchpoints)
  const mobileBottomItems = [
    { id: 'overview', label: 'Cockpit', icon: LayoutDashboard },
    {
      id: 'offers',
      label: 'Offers',
      icon: Handshake,
      badge: counteredOffersCount > 0 ? counteredOffersCount : undefined,
    },
    {
      id: 'showings',
      label: 'Passes',
      icon: QrCode,
      badge: upcomingVisitsCount > 0 ? upcomingVisitsCount : undefined,
    },
    { id: 'assets', label: 'Vault', icon: Landmark },
    { id: 'matchmaker', label: 'AI Match', icon: Sparkles },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ConsumerOverview
            data={dashboardData || null}
            persona={persona}
            onSelectTab={setActiveTab}
            onNavigate={onNavigate}
          />
        );
      case 'offers':
        return <ConsumerOfferDesk />;
      case 'showings':
        return <ConsumerShowingsPass onNavigate={onNavigate} />;
      case 'assets':
        return <ConsumerAssetsAndLeases />;
      case 'trends':
        return (
          <ConsumerMarketTrends
            onExploreDistrict={(_dist) => {
              if (onNavigate) onNavigate('discovery');
            }}
          />
        );
      case 'matchmaker':
        return <ConsumerAiMatchmaker onNavigate={onNavigate} />;
      case 'saved':
        return <ConsumerSavedWatchlist onNavigate={onNavigate} onListingClick={onListingClick} />;
      case 'messages':
        return (
          <div className="h-[calc(100vh-160px)] rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm">
            <ChatWindow />
          </div>
        );
      default:
        return (
          <ConsumerOverview
            data={dashboardData || null}
            persona={persona}
            onSelectTab={setActiveTab}
            onNavigate={onNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#05070b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3 flex justify-between items-center transition-colors">
        {/* Left: Brand + Persona Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            onClick={() => onNavigate && onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/20">
              U
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-zinc-900 dark:text-white block leading-none">
                Urugwiro
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Resident & Buyer
              </span>
            </div>
          </div>

          {/* Persona Switcher Pill (One UI Style) */}
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200/80 dark:border-white/10 text-xs font-semibold ml-2">
            <button
              onClick={() => setPersona('buyer')}
              className={`px-3 py-1 rounded-xl transition-all ${
                persona === 'buyer'
                  ? 'bg-white dark:bg-emerald-600 text-zinc-900 dark:text-white shadow-sm font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Buyer / Investor
            </button>
            <button
              onClick={() => setPersona('tenant')}
              className={`px-3 py-1 rounded-xl transition-all ${
                persona === 'tenant'
                  ? 'bg-white dark:bg-sky-600 text-zinc-900 dark:text-white shadow-sm font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Tenant / Resident
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chat Shortcut */}
          <button
            onClick={() => setActiveTab('messages')}
            className="relative p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Sovereign Broker Chat"
          >
            <MessageSquare size={18} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center font-mono ring-2 ring-white dark:ring-[#080c14]">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">
                {displayName}
              </div>
              <div className="text-[10px] text-zinc-400 capitalize">{persona} Account</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar (Left Navigation) */}
        <aside className="hidden lg:flex flex-col w-64 p-5 border-r border-zinc-200 dark:border-white/10 space-y-6 shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
          {/* Persona Switcher in Sidebar */}
          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Active Persona
            </span>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                onClick={() => setPersona('buyer')}
                className={`py-1.5 px-2 rounded-xl font-medium transition-all ${
                  persona === 'buyer'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => setPersona('tenant')}
                className={`py-1.5 px-2 rounded-xl font-medium transition-all ${
                  persona === 'tenant'
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Tenant
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        item.badgeColor || 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar CTAs */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-2">
            <button
              onClick={() => onNavigate && onNavigate('discovery')}
              className="w-full py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-between transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={logout}
              className="w-full py-2 px-3 rounded-2xl text-zinc-400 hover:text-red-500 text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
            <div className="w-72 bg-white dark:bg-[#0c121e] h-full p-5 flex flex-col justify-between border-r border-zinc-200 dark:border-white/10 animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/10">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">Navigation Hub</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Switch Role</span>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <button
                      onClick={() => setPersona('buyer')}
                      className={`py-1.5 rounded-xl font-medium ${
                        persona === 'buyer' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-500'
                      }`}
                    >
                      Buyer
                    </button>
                    <button
                      onClick={() => setPersona('tenant')}
                      className={`py-1.5 rounded-xl font-medium ${
                        persona === 'tenant' ? 'bg-sky-600 text-white font-bold' : 'text-zinc-500'
                      }`}
                    >
                      Tenant
                    </button>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white font-mono">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-white/10">
                <button
                  onClick={logout}
                  className="w-full py-2.5 text-zinc-400 hover:text-red-500 text-xs font-medium flex items-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-12 max-w-6xl w-full mx-auto overflow-x-hidden">
          {renderContent()}
        </main>
      </div>

      {/* Samsung One UI Persistent Bottom Navigation Bar for Mobile */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080c14]/95 backdrop-blur-2xl border-t border-zinc-200 dark:border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl transition-colors"
        aria-label="Mobile Navigation"
      >
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ConsumerTab)}
              className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active Indicator Pill */}
              <div
                className={`p-1.5 rounded-2xl transition-all ${
                  isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              >
                <Icon size={20} />
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>

              {/* Badge Counter */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center font-mono ring-2 ring-white dark:ring-[#080c14]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
