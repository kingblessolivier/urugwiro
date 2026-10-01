import React, { useMemo } from 'react';
import {
  Building2, Users, MessageSquare, Calendar, TrendingUp,
  Activity, RefreshCw, ShieldCheck, 
  Clock, CheckCircle2, ChevronRight, DollarSign
} from 'lucide-react';
import { api } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { AppView } from '../../types/navigation';

interface AdminHubProps {
  setView: (view: AppView) => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({ setView }) => {
  // Fetch data
  const { data: propertiesData, isLoading: isLoadingProps } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => (await api.admin.properties()).data,
  });

  const { data: sellersData, isLoading: isLoadingSellers } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: async () => (await api.admin.sellers()).data,
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => (await api.admin.customers()).data,
  });

  const { data: offersData, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => (await api.admin.offers()).data,
  });

  const { data: visitsData, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['admin-visits'],
    queryFn: async () => (await api.admin.visits()).data,
  });

  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => (await api.admin.conversations()).data,
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => (await api.admin.transactions()).data,
  });

  const { data: enquiriesData, isLoading: isLoadingEnquiries } = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: async () => (await api.admin.enquiries()).data,
  });

  // Normalize arrays
  const properties = useMemo(() => Array.isArray(propertiesData) ? propertiesData : propertiesData?.results || [], [propertiesData]);
  const sellers = useMemo(() => Array.isArray(sellersData) ? sellersData : sellersData?.results || [], [sellersData]);
  const customers = useMemo(() => Array.isArray(customersData) ? customersData : customersData?.results || [], [customersData]);
  const offers = useMemo(() => Array.isArray(offersData) ? offersData : offersData?.results || [], [offersData]);
  const visits = useMemo(() => Array.isArray(visitsData) ? visitsData : visitsData?.results || [], [visitsData]);
  const conversations = useMemo(() => Array.isArray(conversationsData) ? conversationsData : conversationsData?.results || [], [conversationsData]);
  const transactions = useMemo(() => Array.isArray(transactionsData) ? transactionsData : transactionsData?.results || [], [transactionsData]);
  const enquiries = useMemo(() => Array.isArray(enquiriesData) ? enquiriesData : enquiriesData?.results || [], [enquiriesData]);

  const isLoading = isLoadingProps || isLoadingSellers || isLoadingCustomers || isLoadingOffers || isLoadingVisits || isLoadingConversations || isLoadingTransactions || isLoadingEnquiries;

  // Metrics
  const metrics = useMemo(() => {
    const activeListings = properties.filter((l: any) => l.status === 'published' || l.status === 'listed').length;
    const pendingOffers = offers.filter((o: any) => o.status === 'pending' || o.status === 'new').length;
    const upcomingVisits = visits.filter((v: any) => v.status === 'requested' || v.status === 'confirmed').length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const revenueThisMonth = transactions
      .filter((t: any) => {
        if (t.status !== 'completed') return false;
        const d = new Date(t.created_at || t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

    const pendingVerification = properties.filter((l: any) => l.status === 'under_review').length;

    return {
      activeListings,
      totalSellers: sellers.length,
      totalCustomers: customers.length,
      pendingOffers,
      upcomingVisits,
      activeConversations: conversations.length,
      revenueThisMonth,
      pendingVerification
    };
  }, [properties, sellers, customers, offers, visits, conversations, transactions]);

  // Pending Actions
  const pendingActions = useMemo(() => {
    const actions: { id: string; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; view: AppView }[] = [];
    
    const newEnquiries = enquiries.filter((e: any) => e.status === 'new' || e.status === 'pending');
    if (newEnquiries.length > 0) {
      actions.push({ id: 'enquiries', label: `${newEnquiries.length} New Enquiries`, desc: 'Require response', icon: MessageSquare, view: 'admin-enquiries' as AppView });
    }

    const newVisits = visits.filter((v: any) => v.status === 'requested');
    if (newVisits.length > 0) {
      actions.push({ id: 'visits', label: `${newVisits.length} Visits to Confirm`, desc: 'Pending approval', icon: Calendar, view: 'admin-visits' as AppView });
    }

    const newOffers = offers.filter((o: any) => o.status === 'new' || o.status === 'pending');
    if (newOffers.length > 0) {
      actions.push({ id: 'offers', label: `${newOffers.length} Offers to Review`, desc: 'Awaiting decision', icon: TrendingUp, view: 'admin-offers' as AppView });
    }

    const reviewProps = properties.filter((p: any) => p.status === 'under_review');
    if (reviewProps.length > 0) {
      actions.push({ id: 'properties', label: `${reviewProps.length} Listings for Review`, desc: 'Need verification', icon: ShieldCheck, view: 'admin-verification' as AppView });
    }

    return actions;
  }, [enquiries, visits, offers, properties]);

  // Activity Feed
  const recentActivity = useMemo(() => {
    const activities = [
      ...properties.map((p: any) => ({ id: `p-${p.id}`, type: 'property', title: `New property: ${p.title || 'Untitled'}`, date: new Date(p.created_at || Date.now()), icon: Building2 })),
      ...offers.map((o: any) => ({ id: `o-${o.id}`, type: 'offer', title: `New offer: ${o.amount} RWF`, date: new Date(o.created_at || Date.now()), icon: TrendingUp })),
      ...visits.map((v: any) => ({ id: `v-${v.id}`, type: 'visit', title: `Visit requested for ${v.property_title || 'Property'}`, date: new Date(v.created_at || Date.now()), icon: Calendar })),
    ];
    
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [properties, offers, visits]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-[var(--color-brand-emerald)]">
          <RefreshCw size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-bg-deep)] pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Key metrics and pending actions.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Active Listings" value={metrics.activeListings} icon={Building2} />
          <KPICard label="Total Sellers" value={metrics.totalSellers} icon={Users} />
          <KPICard label="Total Customers" value={metrics.totalCustomers} icon={Users} />
          <KPICard label="Pending Offers" value={metrics.pendingOffers} icon={TrendingUp} />
          <KPICard label="Upcoming Visits" value={metrics.upcomingVisits} icon={Calendar} />
          <KPICard label="Conversations" value={metrics.activeConversations} icon={MessageSquare} />
          <KPICard label="Revenue (Month)" value={`${(metrics.revenueThisMonth / 1000000).toFixed(1)}M`} icon={DollarSign} />
          <KPICard label="To Verify" value={metrics.pendingVerification} icon={ShieldCheck} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Pending Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-main)] flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Pending Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pendingActions.length > 0 ? pendingActions.map(action => (
                <div key={action.id} onClick={() => setView(action.view)} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer transition-all flex items-start gap-4 group">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <action.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--color-text-main)] truncate">{action.label}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-amber-500" />
                </div>
              )) : (
                <div className="col-span-2 p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-surface)]">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-[var(--color-text-main)] font-medium">All caught up!</p>
                  <p className="text-sm text-[var(--color-text-muted)]">No pending actions require your attention.</p>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <h2 className="text-lg font-semibold text-[var(--color-text-main)] flex items-center gap-2 mt-8">
              <Activity size={18} className="text-blue-500" /> Quick Stats
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">Properties by Status</h3>
                <div className="space-y-3">
                  {['published', 'draft', 'under_review', 'sold'].map(status => {
                    const count = properties.filter((p: any) => p.status === status).length;
                    const total = properties.length || 1;
                    const percent = (count / total) * 100;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className="w-24 text-xs capitalize text-[var(--color-text-main)]">{status.replace('_', ' ')}</div>
                        <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="w-8 text-right text-xs text-[var(--color-text-muted)]">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">Financial Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-main)]">Total Earned</span>
                    <span className="text-sm font-bold text-emerald-500">
                      {((transactions.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0)) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-main)]">Pending Payments</span>
                    <span className="text-sm font-bold text-amber-500">
                      {((transactions.filter((t: any) => t.status === 'pending').reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0)) / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-main)]">Total Transactions</span>
                    <span className="text-sm font-medium text-[var(--color-text-main)]">{transactions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-main)] flex items-center gap-2">
              <RefreshCw size={18} className="text-purple-500" /> Recent Activity
            </h2>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
              <div className="divide-y divide-[var(--color-border)]">
                {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                  <div key={`${activity.id}-${i}`} className="p-4 flex gap-3 hover:bg-[var(--color-bg-elevated)] transition-colors">
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)]">
                      <activity.icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-main)]">{activity.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl flex items-center gap-4">
    <div className="h-12 w-12 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-brand-emerald)] border border-[var(--color-border)]">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="text-xl font-bold text-[var(--color-text-main)]">{value}</p>
    </div>
  </div>
);

export default AdminHub;
