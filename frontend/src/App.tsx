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
import { Button } from './components/ui/Button';
import { isAuthView, isPublicView, isAdminView, type AppView } from './types/navigation';
import { cn } from './lib/utils';


function App() {
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
        return <SellerDashboard />;
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

  return (
    <div className="min-h-screen bg-[#05070b] text-zinc-100 font-sans antialiased w-full max-w-full overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0d12]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button type="button" className="flex items-center gap-2" onClick={() => setView('home')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">U</div>
            <span className="text-xl font-bold tracking-tight text-white">Urugwiro</span>
          </button>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink active={view === 'seller-dashboard'} onClick={() => setView('seller-dashboard')}>Dashboard</NavLink>
            <NavLink active={view === 'seller-wizard'} onClick={() => setView('seller-wizard')}>List asset</NavLink>
            <NavLink active={view === 'admin'} onClick={() => setView('admin')}>Admin</NavLink>
            <Button
              variant="secondary"
              className="ml-4"
              onClick={() => setView('home')}
            >
              Public site
            </Button>
          </div>
        </div>
      </nav>
      <div className="pt-16">{renderContent()}</div>
    </div>
  );
}

const NavLink = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
      active ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
    )}
  >
    {children}
  </button>
);

export default App;
