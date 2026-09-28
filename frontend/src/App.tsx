import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, useLocation, useNavigate } from 'react-router-dom';
import DiscoveryPage from './features/discovery/DiscoveryPage';
import ListingDetail from './features/discovery/ListingDetail';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AccessRestricted } from './components/auth/AccessRestricted';
import { useAuth } from './context/AuthContext';
import { isAuthView, isPublicView, isAdminView, isViewAllowedForUser, type AppView } from './types/navigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useNavigateView } from './hooks/useNavigateView';
import {
  isAppView,
  isKnownPath,
  listingIdFromPathname,
  pathForView,
  viewFromPathname,
} from './lib/routes';

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

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-xs tracking-widest uppercase text-[var(--color-text-dim)]">Loading...</span>
    </div>
  </div>
);

function RoutedApp() {
  const { user } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const setView = useNavigateView();

  const legacyView = new URLSearchParams(location.search).get('view');
  if (location.pathname === '/' && legacyView && isAppView(legacyView) && legacyView !== 'home') {
    return <Navigate to={pathForView(legacyView)} replace />;
  }

  if (!isKnownPath(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  const view = viewFromPathname(location.pathname);
  const selectedListingId = listingIdFromPathname(location.pathname);

  const navigateToListing = (id: string) => {
    setView('listing-detail', { listingId: id });
  };

  const navigateToAdminPropertyDetail = (id: string) => {
    setView('admin-property-detail', { listingId: id });
  };

  const goExplore = (query?: string) => {
    setView('discovery', { search: query });
  };

  const goBack = (fallback: AppView) => {
    if (location.key !== 'default') {
      routerNavigate(-1);
      return;
    }
    setView(fallback);
  };

  const renderContent = () => (
    <Suspense fallback={<PageLoader />}>
      {(() => {
        switch (view) {
          case 'home':
            return (
              <HomePage
                onExplore={goExplore}
                onSell={() => setView('seller-wizard')}
                onNavigate={setView}
                onListingClick={navigateToListing}
              />
            );
          case 'discovery':
            return <DiscoveryPage onListingClick={navigateToListing} />;
          case 'listing-detail':
            return (
              <ErrorBoundary onReset={() => goBack('discovery')}>
                <ListingDetail
                  listingId={selectedListingId || ''}
                  onBack={() => goBack('discovery')}
                  onListingClick={navigateToListing}
                />
              </ErrorBoundary>
            );
          case 'admin-property-detail':
            return (
              <AdminPropertyDetail
                propertyId={selectedListingId || ''}
                onBack={() => goBack('admin-listings')}
              />
            );
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
            return (
              <HomePage
                onExplore={goExplore}
                onSell={() => setView('submit-proposal')}
                onNavigate={setView}
                onListingClick={navigateToListing}
              />
            );
        }
      })()}
    </Suspense>
  );

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
      <div className="pt-4">{renderContent()}</div>
    </PublicLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}

export default App;
