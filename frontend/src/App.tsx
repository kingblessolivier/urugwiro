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
import TenantLaunchpad from './features/tenant/TenantLaunchpad';
import AgentLaunchpad from './features/agent/AgentLaunchpad';
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
import { Button } from './components/ui/Button';
import { useAuth } from './context/AuthContext';
import { isAuthView, isPublicView, isAdminView, isViewAllowedForUser, type AppView } from './types/navigation';
import { cn } from './lib/utils';


function App() {
  const { user } = useAuth();
  const [view, setView] = useState<AppView>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [discoveryQuery, setDiscoveryQuery] = useState('');

  const navigateToListing = (id: string) => {
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
        return <ListingDetail listingId={selectedListingId || ''} onBack={() => setView('discovery')} />;
      case 'seller-dashboard':
        return <SellerDashboard onNavigate={setView} />;
      case 'seller-wizard':
        return <ListingWizard />;
      case 'admin':
        return <AdminHub setView={setView} />;
      case 'admin-listings':
        return <AdminListingsPage />;
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
        return <TenantLaunchpad />;
      case 'agent-dashboard':
        return <AgentLaunchpad />;
      case 'owner-dashboard':
        return <OwnerLaunchpad />;
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

  // Dedicated authorized launchpads (seller-dashboard, tenant-dashboard, agent-dashboard, owner-dashboard, seller-wizard)
  return (
    <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={false}>
      <div className="pt-4">
        {renderContent()}
      </div>
    </PublicLayout>
  );
}

export default App;
