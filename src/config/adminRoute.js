/**
 * Secret Encrypted Admin Access Route
 * Replaces public /admin URLs with an encrypted/obfuscated path to prevent unauthorized discovery.
 * Access URLs:
 *   - /71354caa6bea2251
 *   - /71354caa6bea2251/login
 *   - /71354caa6bea2251/dashboard
 */
export const ADMIN_SECRET_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_SECRET_PATH)
  ? import.meta.env.VITE_ADMIN_SECRET_PATH.replace(/^\/+/, '')
  : '71354caa6bea2251';

export const ADMIN_PATH = `/${ADMIN_SECRET_KEY}`;
export const ADMIN_LOGIN_PATH = `/${ADMIN_SECRET_KEY}/login`;
export const ADMIN_DASHBOARD_PATH = `/${ADMIN_SECRET_KEY}/dashboard`;

export function isAdminRoute(pathname) {
  if (!pathname) return false;
  const clean = pathname.split('?')[0].replace(/\/+$/, '');
  return (
    clean === ADMIN_PATH ||
    clean === ADMIN_LOGIN_PATH ||
    clean === ADMIN_DASHBOARD_PATH
  );
}

export function isAdminDashboardRoute(pathname) {
  if (!pathname) return false;
  const clean = pathname.split('?')[0].replace(/\/+$/, '');
  return clean === ADMIN_PATH || clean === ADMIN_DASHBOARD_PATH;
}

export function isAdminLoginRoute(pathname) {
  if (!pathname) return false;
  const clean = pathname.split('?')[0].replace(/\/+$/, '');
  return clean === ADMIN_LOGIN_PATH;
}
