/**
 * Reusable UI style tokens and class strings
 * Use these throughout the app for consistency
 */

export const tableStyles = {
  wrapper: 'overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm',
  table: 'min-w-full text-sm',
  thead: 'bg-neutral-50',
  th: 'px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200',
  tbody: '',
  tr: 'border-b border-neutral-200 transition-colors',
  trEven: 'bg-neutral-50/60',
  trOdd: 'bg-white',
  trHover: 'hover:bg-blue-50/40',
  td: 'px-4 py-3 text-neutral-900',
  emptyState: 'text-center py-12 text-neutral-500',
  loadingRow: 'animate-pulse',
};

export const sidebarStyles = {
  container: 'h-full w-full p-4 overflow-y-auto bg-white/50',
  section: 'mt-6 mb-2 px-2',
  sectionHeader: 'text-xs font-semibold uppercase tracking-wider text-neutral-500',
  navItem: 'flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  navItemActive: 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm',
  navItemIcon: 'text-lg flex-shrink-0',
  navItemText: 'flex-1',
  navItemSub: 'pl-8 text-xs',
};

export const buttonStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  secondary: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  danger: 'bg-red-600 text-white hover:bg-red-700 rounded-lg px-4 py-2 font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  small: 'px-3 py-1.5 text-sm',
};

export const badgeStyles = {
  base: 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-neutral-100 text-neutral-800',
};

export const inputStyles = {
  base: 'w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
};

export const cardStyles = {
  base: 'rounded-xl border border-neutral-200 bg-white shadow-sm',
  padding: 'p-6',
  spacing: 'space-y-6',
};

export const pageStyles = {
  container: 'p-6',
  title: 'text-2xl font-bold text-neutral-900 mb-1',
  subtitle: 'text-sm text-neutral-500 mb-6',
  section: 'space-y-6',
};
