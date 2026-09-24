import React, { useState } from 'react';
import DiscoveryPage from './features/discovery/DiscoveryPage';
import ListingDetail from './features/discovery/ListingDetail';
import ListingWizard from './features/seller/ListingWizard';
import { SellerDashboard } from './features/seller/SellerDashboard';
import VerificationWorkspace from './features/admin/VerificationWorkspace';
import AdminHub from './features/admin/AdminHub';
import AdminListingsPage from './features/admin/AdminListingsPage';
import SystemSettings from './features/admin/SystemSettings';
import AdminEnquiries from './features/admin/AdminEnquiries';
import AdminOffers from './features/admin/AdminOffers';
import AdminReports from './features/admin/AdminReports';
import AdminUserManagement from './features/admin/AdminUserManagement';
import AdminPropertyWizard from './features/admin/AdminPropertyWizard';
import AdminInbox from './features/admin/AdminInbox';
import { BuyerTenantDashboard } from './features/tenant/BuyerTenantDashboard';
import { AgentDashboard } from './features/agent/AgentDashboard';
import OwnerLaunchpad from './features/owner/OwnerLaunchpad';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import AboutPage from './features/public/AboutPage';
import ContactPage from './features/public/ContactPage';
import UpdatesPage from './features/public/UpdatesPage';
import HomePage from './features/public/HomePage';
import LandInformationPage from './features/public/LandInformationPage';
import ServicesPage from './features/public/ServicesPage';
import AssetProposalPage from './features/public/AssetProposalPage';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AccessRestricted } from './components/auth/AccessRestricted';
import { useAuth } from './context/AuthContext';
import { isAuthView, isPublicView, isAdminView, isViewAllowedForUser, type AppView } from './types/navigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';


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
  const [discoveryQuery, setDiscoveryQuery] = useState('');

  const [previousView, setPreviousView] = useState<AppView>('discovery');

  const navigateToListing = (id: string) => {
    setPreviousView(view);
    setSelectedListingId(id);
    setView('listing-detail');
  };

  const goExplore = (query?: string) => {
    setDiscoveryQuery(query || '');
    setView('discovery');
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomePage onExplore={goExplore} onSell={() => setView('seller-wizard')} onNavigate={setView} onListingClick={navigateToListing} />;
      case 'discovery':
        return <DiscoveryPage initialQuery={discoveryQuery} onListingClick={navigateToListing} />;
      case 'listing-detail':
        return (
          <ErrorBoundary onReset={() => setView(previousView || 'discovery')}>
            <ListingDetail listingId={selectedListingId || ''} onBack={() => setView(previousView || 'discovery')} />
          </ErrorBoundary>
        );
      case 'seller-dashboard':
        return <SellerDashboard onNavigate={setView} onListingClick={navigateToListing} />;
      case 'seller-wizard':
        return <ListingWizard />;
      case 'admin':
        return <AdminHub setView={setView} />;
      case 'admin-listings':
        return <AdminListingsPage onListingClick={navigateToListing} />;
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

  // Role-Based Access Control Guard
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

  // Dedicated authorized launchpads (seller-dashboard, tenant-dashboard, buyer-dashboard, agent-dashboard, owner-dashboard)
  // Render full-screen workspace without public consumer marketplace navbar
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
