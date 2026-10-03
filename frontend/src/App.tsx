import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DiscoveryPage from './features/discovery/DiscoveryPage';
import ListingDetail from './features/discovery/ListingDetail';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { AccessRestricted } from './components/auth/AccessRestricted';
import { useAuth } from './context/AuthContext';
import {
  isViewAllowedForUser,
  type AppView,
} from './types/navigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useNavigateView } from './hooks/useNavigateView';
import {
  isAppView,
  listingIdFromPathname,
  pathForView,
} from './lib/routes';

// Lazy-loaded components
const ListingWizard = lazy(() => import('./features/seller/ListingWizard'));
const SellerDashboard = lazy(() => import('./features/seller/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const VerificationWorkspace = lazy(() => import('./features/admin/VerificationWorkspace'));
const AdminHub = lazy(() => import('./features/admin/AdminHub'));
const AdminListingsPage = lazy(() => import('./features/admin/AdminListingsPage'));
const SystemSettings = lazy(() => import('./features/admin/SystemSettings'));
const AdminEnquiries = lazy(() => import('./features/admin/AdminEnquiries'));
const AdminOffers = lazy(() => import('./features/admin/AdminOffers'));
const AdminReports = lazy(() => import('./features/admin/AdminReports'));
const AdminUserManagement = lazy(() => import('./features/admin/AdminUserManagement'));
const AdminCustomers = lazy(() => import('./features/admin/AdminCustomers'));
const AdminSellerManager = lazy(() => import('./features/admin/AdminSellerManager'));
const AdminPropertyWizard = lazy(() => import('./features/admin/AdminPropertyWizard'));
const AdminInbox = lazy(() => import('./features/admin/AdminInbox'));
const AdminPropertyDetail = lazy(() => import('./features/admin/AdminPropertyDetail'));
const AnnouncementManager = lazy(() => import('./features/admin/AnnouncementManager'));
const SystemLogsPage = lazy(() => import('./features/admin/SystemLogsPage'));

const OwnerLaunchpad = lazy(() => import('./features/owner/OwnerLaunchpad'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const AboutPage = lazy(() => import('./features/public/AboutPage'));
const ContactPage = lazy(() => import('./features/public/ContactPage'));
const UpdatesPage = lazy(() => import('./features/public/UpdatesPage'));
const HomePage = lazy(() => import('./features/public/HomePage'));
const AssetProposalPage = lazy(() => import('./features/public/AssetProposalPage'));
const LandInfoPage = lazy(() => import('./features/public/LandInfoPage'));
const ServicesPage = lazy(() => import('./features/public/ServicesPage'));
const InvestmentCalculator = lazy(() => import('./features/public/InvestmentCalculator'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading" aria-live="polite">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" aria-hidden="true" />
      <span className="text-xs tracking-widest uppercase text-[var(--color-text-dim)]">Loading...</span>
    </div>
  </div>
);

/* ─── Guard: checks user permission for a view ─── */
function ViewGuard({ view, children }: { view: AppView; children: React.ReactNode }) {
  const { user } = useAuth();
  const setView = useNavigateView();
  const goExplore = (q?: string) => setView('discovery', { search: q });

  if (!isViewAllowedForUser(view, user)) {
    return (
      <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={false}>
        <AccessRestricted view={view} onNavigate={setView} />
      </PublicLayout>
    );
  }
  return <>{children}</>;
}

/* ─── Layout wrappers for each route type ─── */

function AdminRoute({ view, children }: { view: AppView; children: React.ReactNode }) {
  const setView = useNavigateView();
  const routerNavigate = useNavigate();
  const location = useLocation();
  const goBack = (fallback: AppView) => {
    if (location.key !== 'default') { routerNavigate(-1); return; }
    setView(fallback);
  };
  return (
    <ViewGuard view={view}>
      <AdminLayout currentView={view} onNavigate={setView}>
        <ErrorBoundary key={location.pathname} onReset={() => goBack('admin')}>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </AdminLayout>
    </ViewGuard>
  );
}

function SellerRoute({ view, children }: { view: AppView; children: React.ReactNode }) {
  const setView = useNavigateView();
  const routerNavigate = useNavigate();
  const location = useLocation();
  const goBack = (fallback: AppView) => {
    if (location.key !== 'default') { routerNavigate(-1); return; }
    setView(fallback);
  };
  return (
    <ViewGuard view={view}>
      <SellerLayout currentView={view} onNavigate={setView}>
        <ErrorBoundary key={location.pathname} onReset={() => goBack('seller-dashboard')}>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </SellerLayout>
    </ViewGuard>
  );
}

function PublicRoute({ view, showFooter = true, children }: { view: AppView; showFooter?: boolean; children: React.ReactNode }) {
  const setView = useNavigateView();
  const goExplore = (q?: string) => setView('discovery', { search: q });
  return (
    <ViewGuard view={view}>
      <PublicLayout view={view} onNavigate={setView} onSearch={goExplore} showFooter={showFooter}>
        <ErrorBoundary onReset={() => setView('home')}>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </PublicLayout>
    </ViewGuard>
  );
}

/* ─── Composed page-routes that need hook props ─── */

function HomePageRoute() {
  const setView = useNavigateView();
  const goExplore = (q?: string) => setView('discovery', { search: q });
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  return (
    <PublicRoute view="home">
      <HomePage onExplore={goExplore} onSell={() => setView('submit-proposal')} onNavigate={setView} onListingClick={navigateToListing} />
    </PublicRoute>
  );
}

function DiscoveryRoute() {
  const setView = useNavigateView();
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  return (
    <PublicRoute view="discovery" showFooter={false}>
      <DiscoveryPage onListingClick={navigateToListing} />
    </PublicRoute>
  );
}

function ListingDetailRoute() {
  const setView = useNavigateView();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const listingId = listingIdFromPathname(location.pathname) || '';
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  const goBack = () => { if (location.key !== 'default') { routerNavigate(-1); return; } setView('discovery'); };
  return (
    <PublicRoute view="listing-detail">
      <ListingDetail listingId={listingId} onBack={goBack} onListingClick={navigateToListing} />
    </PublicRoute>
  );
}

function SavedRoute() {
  const setView = useNavigateView();
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  return (
    <PublicRoute view="saved" showFooter={false}>
      <DiscoveryPage onListingClick={navigateToListing} initialSavedOnly={true} />
    </PublicRoute>
  );
}

function AdminListingsRoute() {
  const setView = useNavigateView();
  return (
    <AdminRoute view="admin-listings">
      <AdminListingsPage onListingClick={(id: string) => setView('admin-property-detail', { listingId: id })} />
    </AdminRoute>
  );
}

function AdminPropertyDetailRoute() {
  const setView = useNavigateView();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const propertyId = listingIdFromPathname(location.pathname) || '';
  const goBack = () => { if (location.key !== 'default') { routerNavigate(-1); return; } setView('admin-listings'); };
  return (
    <AdminRoute view="admin-property-detail">
      <AdminPropertyDetail propertyId={propertyId} onBack={goBack} />
    </AdminRoute>
  );
}

function SellerDashboardRoute({ tab }: { tab: 'overview' | 'listings' | 'messages' | 'visits' | 'offers' | 'earnings' }) {
  const setView = useNavigateView();
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  const view: AppView = tab === 'listings' ? 'seller-properties'
    : tab === 'messages' ? 'seller-conversations'
    : tab === 'visits' ? 'seller-visits'
    : tab === 'offers' ? 'seller-offers'
    : tab === 'earnings' ? 'seller-earnings'
    : 'seller-dashboard';
  return (
    <SellerRoute view={view}>
      <SellerDashboard key={tab} onNavigate={setView} onListingClick={navigateToListing} initialTab={tab} hideShell={true} />
    </SellerRoute>
  );
}

function OwnerDashboardRoute() {
  const setView = useNavigateView();
  const navigateToListing = (id: string) => setView('listing-detail', { listingId: id });
  return (
    <AdminRoute view="owner-dashboard">
      <OwnerLaunchpad onListingClick={navigateToListing} />
    </AdminRoute>
  );
}

function LegacyRedirect() {
  const location = useLocation();
  const legacyView = new URLSearchParams(location.search).get('view');
  if (legacyView && isAppView(legacyView) && legacyView !== 'home') {
    return <Navigate to={pathForView(legacyView)} replace />;
  }
  return <HomePageRoute />;
}

/* ─── Main router ─── */

function RoutedApp() {
  const setView = useNavigateView();

  return (
    <Routes>
      {/* Home / Legacy */}
      <Route path="/" element={<LegacyRedirect />} />

      {/* Public */}
      <Route path="/discover" element={<DiscoveryRoute />} />
      <Route path="/listing/:id" element={<ListingDetailRoute />} />
      <Route path="/property/:id" element={<ListingDetailRoute />} />
      <Route path="/saved" element={<SavedRoute />} />
      <Route path="/about" element={<PublicRoute view="about"><AboutPage onNavigate={setView} /></PublicRoute>} />
      <Route path="/contact" element={<PublicRoute view="contact"><ContactPage /></PublicRoute>} />
      <Route path="/updates" element={<PublicRoute view="updates"><UpdatesPage onNavigate={setView} /></PublicRoute>} />
      <Route path="/sell" element={<PublicRoute view="submit-proposal"><AssetProposalPage onNavigate={setView} /></PublicRoute>} />
      <Route path="/explore" element={<Navigate to="/discover" replace />} />
      <Route path="/properties" element={<Navigate to="/discover" replace />} />
      <Route path="/land-info" element={<PublicRoute view="about"><LandInfoPage /></PublicRoute>} />
      <Route path="/services" element={<PublicRoute view="about"><ServicesPage /></PublicRoute>} />
      <Route path="/tools/calculator" element={<PublicRoute view="about"><InvestmentCalculator /></PublicRoute>} />

      {/* Auth */}
      <Route path="/login" element={<PublicRoute view="login" showFooter={false}><LoginPage onNavigate={setView} /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute view="register" showFooter={false}><RegisterPage onNavigate={setView} /></PublicRoute>} />

      {/* Seller */}
      <Route path="/seller" element={<SellerDashboardRoute tab="overview" />} />
      <Route path="/seller/properties" element={<SellerDashboardRoute tab="listings" />} />
      <Route path="/seller/properties/new" element={<SellerRoute view="seller-property-new"><ListingWizard /></SellerRoute>} />
      <Route path="/seller/conversations" element={<SellerDashboardRoute tab="messages" />} />
      <Route path="/seller/visits" element={<SellerDashboardRoute tab="visits" />} />
      <Route path="/seller/offers" element={<SellerDashboardRoute tab="offers" />} />
      <Route path="/seller/earnings" element={<SellerDashboardRoute tab="earnings" />} />
      <Route path="/seller/analytics" element={<Navigate to="/seller" replace />} />
      <Route path="/seller/documents" element={<Navigate to="/seller" replace />} />
      <Route path="/seller/profile" element={<Navigate to="/seller" replace />} />
      <Route path="/dashboard/seller" element={<Navigate to="/seller" replace />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute view="admin"><AdminHub setView={setView} /></AdminRoute>} />
      <Route path="/admin/properties" element={<AdminListingsRoute />} />
      <Route path="/admin/properties/new" element={<AdminRoute view="admin-property-new"><AdminPropertyWizard onNavigate={setView} /></AdminRoute>} />
      <Route path="/admin/properties/:id" element={<AdminPropertyDetailRoute />} />
      <Route path="/admin/sellers" element={<AdminRoute view="admin-sellers"><AdminSellerManager /></AdminRoute>} />
      <Route path="/admin/sellers/:id" element={<AdminRoute view="admin-sellers"><AdminSellerManager /></AdminRoute>} />
      <Route path="/admin/customers" element={<AdminRoute view="admin-customers"><AdminCustomers /></AdminRoute>} />
      <Route path="/admin/customers/:id" element={<AdminRoute view="admin-customers"><AdminCustomers /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute view="admin-users"><AdminUserManagement /></AdminRoute>} />
      <Route path="/admin/conversations" element={<AdminRoute view="admin-conversations"><AdminInbox /></AdminRoute>} />
      <Route path="/admin/inbox" element={<Navigate to="/admin/conversations" replace />} />
      <Route path="/admin/enquiries" element={<AdminRoute view="admin-enquiries"><AdminEnquiries /></AdminRoute>} />
      <Route path="/admin/leads" element={<Navigate to="/admin/enquiries" replace />} />
      <Route path="/admin/offers" element={<AdminRoute view="admin-offers"><AdminOffers key="offers" initialTab="offers" /></AdminRoute>} />
      <Route path="/admin/visits" element={<AdminRoute view="admin-offers"><AdminOffers key="visits" initialTab="visits" /></AdminRoute>} />
      <Route path="/admin/verification" element={<AdminRoute view="admin-verification"><VerificationWorkspace /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/transactions" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/revenue" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/seller-payments" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/expenses" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/documents" element={<AdminRoute view="admin-reports"><AdminReports /></AdminRoute>} />
      <Route path="/admin/updates" element={<AdminRoute view="admin-settings"><AnnouncementManager /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminListingsRoute />} />
      <Route path="/admin/activity-log" element={<AdminRoute view="admin-settings"><SystemLogsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute view="admin-settings"><SystemSettings /></AdminRoute>} />

      {/* Owner */}
      <Route path="/owner" element={<OwnerDashboardRoute />} />
      <Route path="/dashboard/owner" element={<Navigate to="/owner" replace />} />

      {/* Agent */}
      <Route path="/agent/visits" element={<Navigate to="/admin/visits" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
