import type { AppView } from '../types/navigation';

export type NavigateViewOptions = {
  listingId?: string;
  search?: string;
};

export type NavigateView = (view: AppView, options?: NavigateViewOptions) => void;

const VIEW_TO_PATH: Record<Exclude<AppView, 'listing-detail' | 'admin-property-detail'>, string> = {
  home: '/',
  discovery: '/explore',
  'seller-dashboard': '/dashboard/seller',
  'seller-wizard': '/sell/new',
  'tenant-dashboard': '/dashboard/tenant',
  'buyer-dashboard': '/dashboard/buyer',
  'agent-dashboard': '/dashboard/agent',
  'owner-dashboard': '/dashboard/owner',
  admin: '/admin',
  'admin-listings': '/admin/listings',
  'admin-verification': '/admin/verification',
  'admin-settings': '/admin/settings',
  'admin-enquiries': '/admin/enquiries',
  'admin-offers': '/admin/offers',
  'admin-reports': '/admin/reports',
  'admin-users': '/admin/users',
  'admin-property-wizard': '/admin/listings/new',
  'admin-inbox': '/admin/inbox',
  login: '/login',
  register: '/register',
  about: '/about',
  contact: '/contact',
  updates: '/updates',
  'land-information': '/land-information',
  services: '/services',
  'submit-proposal': '/sell',
};

const PATH_TO_VIEW: Record<string, AppView> = {
  ...Object.fromEntries(
    Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view as AppView])
  ),
  '/discovery': 'discovery',
  '/properties': 'discovery',
};

export function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

export function pathForView(view: AppView, options?: NavigateViewOptions): string {
  if (view === 'listing-detail') {
    return options?.listingId
      ? `/listing/${encodeURIComponent(options.listingId)}`
      : '/explore';
  }
  if (view === 'admin-property-detail') {
    return options?.listingId
      ? `/admin/listings/${encodeURIComponent(options.listingId)}`
      : '/admin/listings';
  }

  const path = VIEW_TO_PATH[view] || '/';
  if (view === 'discovery' && options?.search?.trim()) {
    const params = new URLSearchParams({ search: options.search.trim() });
    return `${path}?${params.toString()}`;
  }
  return path;
}

export function viewFromPathname(pathname: string): AppView {
  const normalized = normalizePathname(pathname);
  if (normalized.startsWith('/listing/')) return 'listing-detail';
  if (normalized === '/admin/listings/new') return 'admin-property-wizard';
  if (/^\/admin\/listings\/[^/]+$/.test(normalized)) return 'admin-property-detail';
  return PATH_TO_VIEW[normalized] ?? 'home';
}

export function isKnownPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return true;
  if (/^\/listing\/[^/]+$/.test(normalized)) return true;
  if (normalized === '/admin/listings/new') return true;
  if (/^\/admin\/listings\/[^/]+$/.test(normalized)) return true;
  return Object.prototype.hasOwnProperty.call(PATH_TO_VIEW, normalized);
}

export function listingIdFromPathname(pathname: string): string | null {
  const listing = pathname.match(/^\/listing\/([^/]+)/);
  if (listing?.[1]) return decodeURIComponent(listing[1]);
  const admin = pathname.match(/^\/admin\/listings\/([^/]+)/);
  if (admin?.[1] && admin[1] !== 'new') return decodeURIComponent(admin[1]);
  return null;
}

const APP_VIEW_SET = new Set<string>([
  ...Object.keys(VIEW_TO_PATH),
  'listing-detail',
  'admin-property-detail',
]);

export function isAppView(value: string): value is AppView {
  return APP_VIEW_SET.has(value);
}
