export type AppView =
  | 'home'
  | 'discovery'
  | 'listing-detail'
  | 'seller-dashboard'
  | 'seller-wizard'
  | 'admin'
  | 'admin-listings'
  | 'admin-verification'
  | 'admin-settings'
  | 'admin-enquiries'
  | 'admin-offers'
  | 'admin-reports'
  | 'admin-users'
  | 'admin-property-wizard'
  | 'login'
  | 'register'
  | 'about'
  | 'contact'
  | 'updates'
  | 'land-information'
  | 'services';

export const PUBLIC_VIEWS: AppView[] = [
  'home',
  'discovery',
  'listing-detail',
  'about',
  'contact',
  'updates',
  'land-information',
  'services',
];

export const AUTH_VIEWS: AppView[] = ['login', 'register'];

export function isPublicView(view: AppView): boolean {
  return PUBLIC_VIEWS.includes(view);
}

export function isAuthView(view: AppView): boolean {
  return AUTH_VIEWS.includes(view);
}
