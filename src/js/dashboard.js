/**
 * Superadmin Dashboard Entry Point
 * Proxies getDashboardHTML and initDashboard to modular subcomponents.
 */

import { getDashboardHTML as getHTML } from './dashboard/template.js';
import { initDashboard as initDB } from './dashboard/index.js';

/**
 * Returns the HTML template for the Superadmin dashboard.
 * @returns {string} HTML Template string.
 */
export function getDashboardHTML() {
  return getHTML();
}

/**
 * Initializes the dashboard view elements and bindings.
 * @param {Function} onLogout - Callback function triggered upon logging out.
 */
export function initDashboard(onLogout) {
  initDB(onLogout);
}
