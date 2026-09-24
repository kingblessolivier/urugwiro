export type AppView =
  | 'home'
  | 'discovery'
  | 'listing-detail'
  | 'seller-dashboard'
  | 'seller-wizard'
  | 'tenant-dashboard'
  | 'buyer-dashboard'
  | 'agent-dashboard'
  | 'owner-dashboard'
  | 'admin'
  | 'admin-listings'
  | 'admin-verification'
  | 'admin-settings'
  | 'admin-enquiries'
  | 'admin-offers'
  | 'admin-reports'
  | 'admin-users'
  | 'admin-property-wizard'
  | 'admin-inbox'
  | 'login'
  | 'register'
  | 'about'
  | 'contact'
  | 'updates'
  | 'land-information'
  | 'services'
  | 'submit-proposal';

export const PUBLIC_VIEWS: AppView[] = [
  'home',
  'discovery',
  'listing-detail',
  'about',
  'contact',
  'updates',
  'land-information',
  'services',
  'submit-proposal',
];

export const AUTH_VIEWS: AppView[] = ['login', 'register'];

export function isPublicView(view: AppView): boolean {
  return PUBLIC_VIEWS.includes(view);
}

export function isAuthView(view: AppView): boolean {
  return AUTH_VIEWS.includes(view);
}

export function isAdminView(view: AppView): boolean {
  return view === 'admin' || view.startsWith('admin-');
}

export interface UserRoleLike {
  role?: string;
  is_staff?: boolean;
}

/**
 * Returns the human-friendly name of a view.
 */
export function getViewFriendlyName(view: AppView): string {
  switch (view) {
    case 'admin':
      return 'Admin Executive Cockpit';
    case 'admin-listings':
      return 'Admin Unified Listings';
    case 'admin-verification':
      return 'Admin Title Verification Bureau';
    case 'admin-settings':
      return 'System Settings & Telemetry';
    case 'admin-enquiries':
      return 'Admin Customer Inquiries';
    case 'admin-offers':
      return 'Admin Deal Pipeline & Offers';
    case 'admin-reports':
      return 'Admin Reports & Telemetry';
    case 'admin-users':
      return 'Admin User Directory';
    case 'admin-property-wizard':
      return 'Admin Asset Registration';
    case 'admin-inbox':
      return 'Admin Command Inbox';
    case 'seller-dashboard':
      return 'Seller Studio & Inventory';
    case 'seller-wizard':
      return 'Seller Asset Wizard';
    case 'tenant-dashboard':
    case 'buyer-dashboard':
      return 'Resident & Buyer Studio';
    case 'agent-dashboard':
      return 'Broker Showing Desk';
    case 'owner-dashboard':
      return 'Owner Portfolio Launchpad';
    case 'submit-proposal':
      return 'Asset Acquisition / Proposal Portal';
    case 'discovery':
      return 'Property Discovery';
    case 'home':
      return 'Public Marketplace';
    default:
      return view;
  }
}

/**
 * Returns the required platform role to access a view.
 */
export function getRequiredRoleForView(view: AppView): string {
  if (isPublicView(view) || isAuthView(view)) {
    return 'Public';
  }
  if (isAdminView(view)) {
    return 'Admin';
  }
  if (view === 'seller-dashboard' || view === 'seller-wizard') {
    return 'Seller';
  }
  if (view === 'tenant-dashboard' || view === 'buyer-dashboard') {
    return 'Tenant / Buyer';
  }
  if (view === 'agent-dashboard') {
    return 'Agent';
  }
  if (view === 'owner-dashboard') {
    return 'Owner';
  }
  return 'Authenticated';
}

/**
 * Checks whether a given user is allowed to access a specific view.
 */
export function isViewAllowedForUser(view: AppView, user: UserRoleLike | null | undefined): boolean {
  if (isPublicView(view) || isAuthView(view)) {
    return true;
  }

  if (!user) {
    return false;
  }

  const role = (user.role || '').toLowerCase();
  const isAdmin = role === 'admin' || Boolean(user.is_staff);

  // Platform Admins have sovereign access to every view
  if (isAdmin) {
    return true;
  }

  // Admin views can only be viewed by Admin
  if (isAdminView(view)) {
    return false;
  }

  // Dedicated Launchpads
  if (view === 'seller-dashboard' || view === 'seller-wizard') {
    return role === 'seller';
  }
  if (view === 'tenant-dashboard' || view === 'buyer-dashboard') {
    return role === 'tenant' || role === 'buyer' || role === 'consumer' || role === 'client' || role === 'resident';
  }
  if (view === 'agent-dashboard') {
    return role === 'agent';
  }
  if (view === 'owner-dashboard') {
    return role === 'owner';
  }

  return false;
}

/**
 * Resolves the primary dashboard view for an authenticated user role.
 */
export function getDefaultDashboardForUser(user: UserRoleLike | null | undefined): AppView {
  if (!user) {
    return 'discovery';
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || user.is_staff) {
    return 'admin';
  }
  if (role === 'seller') {
    return 'seller-dashboard';
  }
  if (role === 'tenant') {
    return 'tenant-dashboard';
  }
  if (role === 'buyer' || role === 'consumer' || role === 'client') {
    return 'buyer-dashboard';
  }
  if (role === 'agent') {
    return 'agent-dashboard';
  }
  if (role === 'owner') {
    return 'owner-dashboard';
  }

  // Fallback to buyer dashboard for authenticated members
  return 'buyer-dashboard';
}
