// Application constants

export const APP_NAME = 'Finances Familiales';
export const APP_VERSION = '1.0.0';

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const MONTH_YEAR_FORMAT = 'MMMM yyyy';

// Currency
export const DEFAULT_CURRENCY = 'EUR';
export const CURRENCY_SYMBOL = '€';

// Transaction types
export const TRANSACTION_TYPES = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
} as const;

// Account types
export const ACCOUNT_TYPES = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  JOINT: 'JOINT',
} as const;

// Sharing modes
export const SHARING_MODES = {
  EQUAL: 'EQUAL',
  PROPORTIONAL: 'PROPORTIONAL',
  CUSTOM: 'CUSTOM',
} as const;

// Budget periods
export const BUDGET_PERIODS = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;

// Recurring frequencies
export const RECURRING_FREQUENCIES = {
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;

// Default categories with colors
export const DEFAULT_CATEGORIES = [
  { name: 'Alimentation', color: '#4caf50', icon: 'restaurant' },
  { name: 'Logement', color: '#2196f3', icon: 'home' },
  { name: 'Transport', color: '#ff9800', icon: 'directions_car' },
  { name: 'Santé', color: '#f44336', icon: 'local_hospital' },
  { name: 'Loisirs', color: '#9c27b0', icon: 'sports_esports' },
  { name: 'Habillement', color: '#e91e63', icon: 'checkroom' },
  { name: 'Éducation', color: '#3f51b5', icon: 'school' },
  { name: 'Services', color: '#00bcd4', icon: 'miscellaneous_services' },
  { name: 'Épargne', color: '#8bc34a', icon: 'savings' },
  { name: 'Divers', color: '#9e9e9e', icon: 'category' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
