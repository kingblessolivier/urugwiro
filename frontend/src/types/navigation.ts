export type AppView =
  // Public
  | 'home'
  | 'discovery'
  | 'discover'
  | 'listing-detail'
  | 'property-detail'
  | 'saved'
  | 'updates'
  | 'about'
  | 'contact'
  | 'submit-proposal'
  // Auth
  | 'login'
  | 'register'
  // Seller
  | 'seller'
  | 'seller-dashboard'
  | 'seller-wizard'
  | 'seller-properties'
  | 'seller-property-new'
  | 'seller-conversations'
  | 'seller-visits'
  | 'seller-offers'
  | 'seller-analytics'
  | 'seller-documents'
  | 'seller-earnings'
  | 'seller-profile'
  // Admin (also used by Owner / Staff)
  | 'admin'
  | 'admin-listings'
  | 'admin-properties'
  | 'admin-property-new'
  | 'admin-property-wizard'
  | 'admin-property-detail'
  | 'admin-sellers'
  | 'admin-seller-detail'
  | 'admin-customers'
  | 'admin-customer-detail'
  | 'admin-conversations'
  | 'admin-leads'
  | 'admin-visits'
  | 'admin-offers'
  | 'admin-transactions'
  | 'admin-revenue'
  | 'admin-seller-payments'
  | 'admin-expenses'
  | 'admin-reports'
  | 'admin-documents'
  | 'admin-updates'
  | 'admin-users'
  | 'admin-categories'
  | 'admin-activity-log'
  | 'admin-settings'
  | 'admin-verification'
  | 'admin-enquiries'
  | 'admin-inbox'
  // Owner
  | 'owner-dashboard';

export const PUBLIC_VIEWS: AppView[] = [
  'home',
  'discovery',
  'discover',
  'listing-detail',
  'property-detail',
  'saved',
  'about',
  'contact',
  'updates',
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

export function isSellerView(view: AppView): boolean {
  return view === 'seller' || view.startsWith('seller-');
}

export interface UserRoleLike {
  role?: string;
  is_staff?: boolean;
  username?: string;
  is_superuser?: boolean;
}

/**
 * Returns the human-friendly name of a view.
 */
export function getViewFriendlyName(view: AppView): string {
  switch (view) {
    case 'admin':
      return 'Admin Overview';
    case 'admin-listings':
    case 'admin-properties':
      return 'Properties Management';
    case 'admin-property-wizard':
    case 'admin-property-new':
      return 'Add Property';
    case 'admin-sellers':
      return 'Sellers Directory';
    case 'admin-customers':
      return 'Customers';
    case 'admin-conversations':
      return 'Customer Conversations';
    case 'admin-leads':
      return 'Follow-ups & Leads';
    case 'admin-visits':
      return 'Scheduled Visits';
    case 'admin-offers':
      return 'Customer Offers';
    case 'admin-transactions':
      return 'Completed Deals';
    case 'admin-revenue':
      return 'Revenue & Commission';
    case 'admin-seller-payments':
      return 'Seller Payouts';
    case 'admin-expenses':
      return 'Business Expenses';
    case 'admin-reports':
      return 'Reports & Analytics';
    case 'admin-documents':
      return 'Document Generator';
    case 'admin-users':
      return 'User Management';
    case 'admin-categories':
      return 'Categories & Specs';
    case 'admin-activity-log':
      return 'System Audit Log';
    case 'admin-settings':
      return 'System Settings';
    case 'admin-verification':
      return 'Verification Workspace';
    case 'admin-enquiries':
      return 'Public Enquiries';
    case 'admin-inbox':
      return 'Internal Inbox';
    case 'seller':
    case 'seller-dashboard':
      return 'Seller Dashboard';
    case 'seller-wizard':
    case 'seller-property-new':
      return 'Create Listing';
    case 'seller-properties':
      return 'My Listings';
    case 'seller-conversations':
      return 'Buyer Messages';
    case 'seller-visits':
      return 'Property Visits';
    case 'seller-offers':
      return 'Received Offers';
    case 'seller-analytics':
      return 'Performance Analytics';
    case 'seller-documents':
      return 'My Documents';
    case 'seller-earnings':
      return 'Earnings & Payments';
    case 'seller-profile':
      return 'Seller Profile';
    case 'owner-dashboard':
      return 'Owner Executive Dashboard';
    case 'submit-proposal':
      return 'List Your Asset';
    case 'discovery':
    case 'discover':
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
  if (isSellerView(view)) {
    return 'Seller';
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
  const isSuper = Boolean(user.is_superuser);
  const isStaff = Boolean(user.is_staff);
  const isAdmin = role === 'admin' || role === 'owner' || role === 'finance' || role === 'staff' || isStaff || isSuper;

  // Platform Admins/Owners/Staff have full access
  if (isAdmin) {
    return true;
  }

  // Admin views can only be viewed by Admin/Staff/Owner/Finance
  if (isAdminView(view)) {
    return false;
  }

  // Owner dashboard
  if (view === 'owner-dashboard') {
    return role === 'owner' || isAdmin;
  }

  // Seller Studio
  if (isSellerView(view)) {
    return role === 'seller' || isAdmin;
  }

  return true;
}

/**
 * Resolves the primary dashboard view for an authenticated user role.
 */
export function getDefaultDashboardForUser(user: UserRoleLike | null | undefined): AppView {
  if (!user) {
    return 'discovery';
  }

  const role = (user.role || '').toLowerCase();
  const isSuper = Boolean(user.is_superuser);
  const isStaff = Boolean(user.is_staff);

  if (role === 'owner') {
    return 'owner-dashboard';
  }
  if (role === 'admin' || role === 'staff' || role === 'finance' || isStaff || isSuper) {
    return 'admin';
  }
  if (role === 'seller') {
    return 'seller-dashboard';
  }

  return 'discovery';
}
