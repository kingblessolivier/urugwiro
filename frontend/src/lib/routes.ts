import type { AppView } from '../types/navigation';

export type NavigateViewOptions = {
  listingId?: string;
  sellerId?: string;
  customerId?: string;
  search?: string;
};

export type NavigateView = (view: AppView, options?: NavigateViewOptions) => void;

type StaticViews = Exclude<
  AppView,
  'listing-detail' | 'property-detail' | 'admin-property-detail' | 'admin-seller-detail' | 'admin-customer-detail'
>;

const VIEW_TO_PATH: Record<StaticViews, string> = {
  // Public
  home: '/',
  discover: '/discover',
  discovery: '/discover',
  saved: '/saved',
  updates: '/updates',
  about: '/about',
  contact: '/contact',
  'submit-proposal': '/sell',

  // Auth
  login: '/login',
  register: '/register',

  // Seller
  seller: '/seller',
  'seller-dashboard': '/seller',
  'seller-properties': '/seller/properties',
  'seller-property-new': '/seller/properties/new',
  'seller-wizard': '/seller/properties/new',
  'seller-conversations': '/seller/conversations',
  'seller-visits': '/seller/visits',
  'seller-offers': '/seller/offers',
  'seller-analytics': '/seller/analytics',
  'seller-documents': '/seller/documents',
  'seller-earnings': '/seller/earnings',
  'seller-profile': '/seller/profile',

  // Admin
  admin: '/admin',
  'admin-listings': '/admin/properties',
  'admin-properties': '/admin/properties',
  'admin-property-new': '/admin/properties/new',
  'admin-property-wizard': '/admin/properties/new',
  'admin-sellers': '/admin/sellers',
  'admin-customers': '/admin/customers',
  'admin-conversations': '/admin/conversations',
  'admin-leads': '/admin/leads',
  'admin-visits': '/admin/visits',
  'admin-offers': '/admin/offers',
  'admin-transactions': '/admin/transactions',
  'admin-revenue': '/admin/revenue',
  'admin-seller-payments': '/admin/seller-payments',
  'admin-expenses': '/admin/expenses',
  'admin-reports': '/admin/reports',
  'admin-documents': '/admin/documents',
  'admin-updates': '/admin/updates',
  'admin-users': '/admin/users',
  'admin-categories': '/admin/categories',
  'admin-activity-log': '/admin/activity-log',
  'admin-settings': '/admin/settings',
  'admin-verification': '/admin/verification',
  'admin-enquiries': '/admin/enquiries',
  'admin-inbox': '/admin/inbox',

  // Owner
  'owner-dashboard': '/owner',
};

const PATH_TO_VIEW: Record<string, AppView> = {
  ...Object.fromEntries(
    Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view as AppView])
  ),
  '/explore': 'discovery',
  '/properties': 'discovery',
  '/dashboard/seller': 'seller-dashboard',
  '/dashboard/owner': 'owner-dashboard',
};

export function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function pathForView(view: AppView, options?: NavigateViewOptions): string {
  if (view === 'listing-detail' || view === 'property-detail') {
    return options?.listingId
      ? `/listing/${encodeURIComponent(options.listingId)}`
      : '/discover';
  }
  if (view === 'admin-property-detail') {
    return options?.listingId
      ? `/admin/properties/${encodeURIComponent(options.listingId)}`
      : '/admin/properties';
  }
  if (view === 'admin-seller-detail') {
    return options?.sellerId
      ? `/admin/sellers/${encodeURIComponent(options.sellerId)}`
      : '/admin/sellers';
  }
  if (view === 'admin-customer-detail') {
    return options?.customerId
      ? `/admin/customers/${encodeURIComponent(options.customerId)}`
      : '/admin/customers';
  }

  const path = (VIEW_TO_PATH as Record<string, string>)[view] || '/';
  if ((view === 'discovery' || view === 'discover') && options?.search?.trim()) {
    const params = new URLSearchParams({ search: options.search.trim() });
    return `${path}?${params.toString()}`;
  }
  return path;
}

export function viewFromPathname(pathname: string): AppView {
  const normalized = normalizePathname(pathname);
  if (normalized.startsWith('/listing/')) return 'listing-detail';
  if (normalized.startsWith('/property/')) return 'property-detail';
  if (normalized === '/admin/properties/new' || normalized === '/admin/listings/new') return 'admin-property-wizard';
  if (/^\/admin\/properties\/[^/]+$/.test(normalized)) return 'admin-property-detail';
  if (/^\/admin\/listings\/[^/]+$/.test(normalized)) return 'admin-property-detail';
  if (/^\/admin\/sellers\/[^/]+$/.test(normalized)) return 'admin-seller-detail';
  if (/^\/admin\/customers\/[^/]+$/.test(normalized)) return 'admin-customer-detail';
  return PATH_TO_VIEW[normalized] ?? 'home';
}

export function isKnownPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return true;
  if (/^\/listing\/[^/]+$/.test(normalized)) return true;
  if (/^\/property\/[^/]+$/.test(normalized)) return true;
  if (normalized === '/admin/properties/new' || normalized === '/admin/listings/new') return true;
  if (/^\/admin\/properties\/[^/]+$/.test(normalized)) return true;
  if (/^\/admin\/listings\/[^/]+$/.test(normalized)) return true;
  if (/^\/admin\/sellers\/[^/]+$/.test(normalized)) return true;
  if (/^\/admin\/customers\/[^/]+$/.test(normalized)) return true;
  return Object.prototype.hasOwnProperty.call(PATH_TO_VIEW, normalized);
}

export function listingIdFromPathname(pathname: string): string | null {
  const listing = pathname.match(/^\/(?:listing|property)\/([^/]+)/);
  if (listing?.[1]) return decodeURIComponent(listing[1]);
  const admin = pathname.match(/^\/admin\/(?:properties|listings)\/([^/]+)/);
  if (admin?.[1] && admin[1] !== 'new') return decodeURIComponent(admin[1]);
  return null;
}

const APP_VIEW_SET = new Set<string>([
  ...Object.keys(VIEW_TO_PATH),
  'listing-detail',
  'property-detail',
  'admin-property-detail',
  'admin-seller-detail',
  'admin-customer-detail',
]);

export function isAppView(value: string): value is AppView {
  return APP_VIEW_SET.has(value);
}
