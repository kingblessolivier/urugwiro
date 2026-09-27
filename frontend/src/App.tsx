import React, { useState, lazy, Suspense } from 'react';
import DiscoveryPage from './features/discovery/DiscoveryPage';
import ListingDetail from './features/discovery/ListingDetail';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AccessRestricted } from './components/auth/AccessRestricted';
import { useAuth } from './context/AuthContext';
import { isAuthView, isPublicView, isAdminView, isViewAllowedForUser, type AppView } from './types/navigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy load heavy dashboard components for code splitting
const ListingWizard = lazy(() => import('./features/seller/ListingWizard'));
const SellerDashboard = lazy(() => import('./features/seller/SellerDashboard'));
const VerificationWorkspace = lazy(() => import('./features/admin/VerificationWorkspace'));
const AdminHub = lazy(() => import('./features/admin/AdminHub'));
const AdminListingsPage = lazy(() => import('./features/admin/AdminListingsPage'));
const SystemSettings = lazy(() => import('./features/admin/SystemSettings'));
const AdminEnquiries = lazy(() => import('./features/admin/AdminEnquiries'));
const AdminOffers = lazy(() => import('./features/admin/AdminOffers'));
const AdminReports = lazy(() => import('./features/admin/AdminReports'));
const AdminUserManagement = lazy(() => import('./features/admin/AdminUserManagement'));
const AdminPropertyWizard = lazy(() => import('./features/admin/AdminPropertyWizard'));
const AdminInbox = lazy(() => import('./features/admin/AdminInbox'));
const AdminPropertyDetail = lazy(() => import('./features/admin/AdminPropertyDetail'));
const BuyerTenantDashboard = lazy(() => import('./features/tenant/BuyerTenantDashboard'));
const AgentDashboard = lazy(() => import('./features/agent/AgentDashboard'));
const OwnerLaunchpad = lazy(() => import('./features/owner/OwnerLaunchpad'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const AboutPage = lazy(() => import('./features/public/AboutPage'));
const ContactPage = lazy(() => import('./features/public/ContactPage'));
const UpdatesPage = lazy(() => import('./features/public/UpdatesPage'));
const HomePage = lazy(() => import('./features/public/HomePage'));
const LandInformationPage = lazy(() => import('./features/public/LandInformationPage'));
const ServicesPage = lazy(() => import('./features/public/ServicesPage'));
const AssetProposalPage = lazy(() => import('./features/public/AssetProposalPage'));

// Loading fallback for lazy components
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-xs tracking-widest uppercase text-[var(--color-text-dim)]">Loading...</span>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();
  const [view, setView] = useState<AppView>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as AppView;
      if (v) return v;
    } catch {}
    return 'home';
  });
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<AppView>('discovery');

  const navigateToListing = (id: string) => {
    setPreviousView(view);
    setSelectedListingId(id);
    setView('listing-detail');
  };

  const navigateToAdminPropertyDetail = (id: string) => {
    setPreviousView(view);
    setSelectedListingId(id);
    setView('admin-property-detail');
  };

  const goExplore = (query?: string) => {
    setView('discovery');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomePage onExplore={goExplore} onSell={() => setView('seller-wizard')} onNavigate={setView} onListingClick={navigateToListing} />;
      case 'discovery':
        return <DiscoveryPage initialQuery={''} onListingClick={navigateToListing} />;
      case 'listing-detail':
        return (
          <ErrorBoundary onReset={() => setView(previousView || 'discovery')}>
            <ListingDetail listingId={selectedListingId || ''} onBack={() => setView(previousView || 'discovery')} />
          </ErrorBoundary>
        );
      case 'admin-property-detail':
        return <AdminPropertyDetail propertyId={selectedListingId || ''} onBack={() => setView(previousView || 'admin-listings')} />;
      case 'seller-dashboard':
        return <SellerDashboard onNavigate={setView} onListingClick={navigateToListing} />;
      case 'seller-wizard':
        return <ListingWizard />;
      case 'admin':
        return <AdminHub setView={setView} />;
      case 'admin-listings':
        return <AdminListingsPage onListingClick={navigateToAdminPropertyDetail} />;
      case 'admin-verification':
        return <VerificationWorkspace />;
      case 'admin-settings':
        return <SystemSettings />;
      case 'admin-enquiries':
        return <AdminEnquiries />;
      case 'admin-offers':
        return <AdminOffers />;
      case 'admin-reports':
        return <AdminReports />;
      case 'admin-users':
        return <AdminUserManagement />;
      case 'admin-property-wizard':
        return <AdminPropertyWizard onNavigate={setView} />;
      case 'admin-inbox':
        return <AdminInbox />;
      case 'tenant-dashboard':
      case 'buyer-dashboard':
        return <BuyerTenantDashboard onNavigate={setView} onListingClick={navigateToListing} />;
      case 'agent-dashboard':
        return <AgentDashboard onNavigate={setView} />;
      case 'owner-dashboard':
        return <OwnerLaunchpad onListingClick={navigateToListing} />;
      case 'login':
        return <LoginPage onNavigate={setView} />;
      case 'register':
        return <RegisterPage onNavigate={setView} />;
      case 'about':
        return <AboutPage onNavigate={setView} />;
      case 'contact':
        return <ContactPage />;
      case 'updates':
        return <UpdatesPage onNavigate={setView} />;
      case 'land-information':
        return <LandInformationPage onNavigate={setView} />;
      case 'services':
        return <ServicesPage onNavigate={setView} />;
      case 'submit-proposal':
        return <AssetProposalPage onNavigate={setView} />;
      default:
        return <HomePage onExplore={goExplore} onSell={() => setView('submit-proposal')} onNavigate={setView} onListingClick={navigateToListing} />;
    }
  };

  const isAllowed = isViewAllowedForUser(view, user);

  if (!isAllowed) {
    return (
      <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={false}>
        <AccessRestricted view={view} onNavigate={setView} />
      </PublicLayout>
    );
  }

  if (isAuthView(view)) {
    return (
      <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={false}>
        {renderContent()}
      </PublicLayout>
    );
  }

  if (isAdminView(view)) {
    return (
      <AdminLayout currentView={view} onNavigate={setView}>
        {renderContent()}
      </AdminLayout>
    );
  }

  if (isPublicView(view)) {
    return (
      <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={view !== 'discovery'}>
        {renderContent()}
      </PublicLayout>
    );
  }

  if (view === 'seller-dashboard') {
    return <SellerDashboard onNavigate={setView} onListingClick={navigateToListing} />;
  }

  if (view === 'agent-dashboard') {
    return <AgentDashboard onNavigate={setView} />;
  }

  if (view === 'tenant-dashboard' || view === 'buyer-dashboard') {
    return <BuyerTenantDashboard onNavigate={setView} onListingClick={navigateToListing} />;
  }

  if (view === 'owner-dashboard') {
    return <OwnerLaunchpad onListingClick={navigateToListing} />;
  }

  return (
    <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={false}>
      <div className="pt-4">
        {renderContent()}
      </div>
    </PublicLayout>
  );
}

export default App;
