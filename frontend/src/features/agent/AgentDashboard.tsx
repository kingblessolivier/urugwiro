import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Building2, Calendar, Handshake, Landmark,
  Wallet, MessageSquare, Award, User, LogOut, Sun, Moon,
  Menu, X, ShieldCheck, ArrowUpRight, Bell, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/endpoints';

// Agent Sub-features
import { AgentLaunchpad } from './AgentLaunchpad';
import { AgentPropertyManager } from './AgentPropertyManager';
import { AgentVisitKanban } from './AgentVisitKanban';
import { AgentOfferManager } from './AgentOfferManager';
import { AgentDealsPipeline } from './components/AgentDealsPipeline';
import { AgentEarningsLedger } from './components/AgentEarningsLedger';
import { AgentLeadsManager } from './components/AgentLeadsManager';
import { AgentProfileSettings } from './components/AgentProfileSettings';
import { ChatWindow } from '../chat/ChatWindow';

export type AgentTab =
  | 'overview'
  | 'portfolio'
  | 'visits'
  | 'offers'
  | 'deals'
  | 'earnings'
  | 'leads'
  | 'messages'
  | 'profile';

interface AgentDashboardProps {
  onNavigate?: (view: any) => void;
  initialTab?: AgentTab;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  onNavigate,
  initialTab = 'overview',
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AgentTab>(initialTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const displayName =
    user?.full_name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username) ||
    'Certified Broker';

  // Live unread chat count
  const { data: contactsData } = useQuery({
    queryKey: ['agent-chat-contacts'],
    queryFn: async () => {
      try {
        const res = await api.chat.contacts();
        return res.data;
      } catch {
        return null;
      }
    },
  });
  const unreadMessagesCount = contactsData?.total_unread || 0;

  // Live dashboard badge metrics
  const { data: dashboardData } = useQuery({
    queryKey: ['agent-dashboard'],
    queryFn: async () => {
      try {
        const res = await api.agent.dashboard();
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const pendingVisits = dashboardData?.metrics?.scheduled_visits || 0;
  const pendingOffers = dashboardData?.metrics?.pending_offers || 0;
  const unreadLeads = dashboardData?.metrics?.unread_leads || 0;

  const navItems: Array<{
    id: AgentTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview Cockpit', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Assigned Portfolio', icon: Building2 },
    {
      id: 'visits',
      label: 'Site Visits',
      icon: Calendar,
      badge: pendingVisits > 0 ? pendingVisits : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'offers',
      label: 'Offers & Negotiation',
      icon: Handshake,
      badge: pendingOffers > 0 ? pendingOffers : undefined,
      badgeColor: 'bg-purple-500 text-white',
    },
    { id: 'deals', label: 'Legal Conveyance', icon: Landmark },
    { id: 'earnings', label: 'Commissions', icon: Wallet },
    {
      id: 'leads',
      label: 'Buyer Leads CRM',
      icon: MessageSquare,
      badge: unreadLeads > 0 ? unreadLeads : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'messages',
      label: 'Sovereign Chat',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-sky-500 text-white',
    },
    { id: 'profile', label: 'Broker Profile', icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AgentLaunchpad onSelectTab={(tab) => setActiveTab(tab as AgentTab)} />;
      case 'portfolio':
        return <AgentPropertyManager onScheduleVisit={() => setActiveTab('visits')} />;
      case 'visits':
        return <AgentVisitKanban />;
      case 'offers':
        return <AgentOfferManager />;
      case 'deals':
        return <AgentDealsPipeline />;
      case 'earnings':
        return <AgentEarningsLedger />;
      case 'leads':
        return <AgentLeadsManager onScheduleVisit={() => setActiveTab('visits')} />;
      case 'messages':
        return (
          <div className="h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm">
            <ChatWindow />
          </div>
        );
      case 'profile':
        return <AgentProfileSettings />;
      default:
        return <AgentLaunchpad onSelectTab={(tab) => setActiveTab(tab as AgentTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#05070b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080c14]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 sm:px-8 py-3.5 flex justify-between items-center transition-colors">
        {/* Left: Brand + Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
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
                Broker Studio
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            <ShieldCheck size={13} /> Certified Fiduciary
          </div>
        </div>

        {/* Right: Actions & User Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title={isDark ? 'Switch to White Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Quick Exit to Marketplace */}
          {onNavigate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('discovery')}
              className="hidden sm:inline-flex rounded-2xl text-xs font-bold py-2 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
            >
              Public Marketplace <ArrowUpRight size={13} className="ml-1" />
            </Button>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-medium">Licensed Broker</span>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Desktop Sidebar (Samsung One UI Navigation Drawer) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-1">
          <div className="p-3 rounded-3xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 shadow-sm space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-white' : 'text-zinc-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                        item.badgeColor || 'bg-zinc-200 text-zinc-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Help Callout */}
          <div className="mt-4 p-4 rounded-3xl border border-zinc-200 dark:border-white/10 bg-zinc-100/70 dark:bg-white/[0.01] text-xs space-y-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Regulatory Compliance</span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All sale deeds require bilateral IremboGov notarization and title searches via Rwanda Land Management and Use Authority (RLMUA).
            </p>
          </div>
        </aside>

        {/* Mobile Slide-In Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
            <div className="w-72 bg-white dark:bg-[#080c14] border-r border-zinc-200 dark:border-white/10 h-full p-6 space-y-4 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-white/10">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">Broker Navigation</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all',
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', item.badgeColor)}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {onNavigate && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onNavigate('discovery');
                    setMobileNavOpen(false);
                  }}
                  className="rounded-2xl text-xs font-bold w-full"
                >
                  Exit to Marketplace
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Studio Workspace Content */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
