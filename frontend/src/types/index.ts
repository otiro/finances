// Types principaux de l'application

export type TransactionType = 'DEBIT' | 'CREDIT';
export type AccountType = 'CHECKING' | 'SAVINGS' | 'JOINT';
export type SharingMode = 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM';
export type HouseholdRole = 'ADMIN' | 'MEMBER';
export type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RecurringFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BalancingStatus = 'PENDING' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  monthlyIncome: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  sharingMode: SharingMode;
  createdAt: string;
  updatedAt: string;
}

export interface UserHousehold {
  id: string;
  userId: string;
  householdId: string;
  role: HouseholdRole;
  joinedAt: string;
  user?: User;
  household?: Household;
}

export interface Account {
  id: string;
  householdId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  household?: Household;
  owners?: AccountOwner[];
}

export interface AccountOwner {
  id: string;
  accountId: string;
  userId: string;
  ownershipPercentage: number;
  account?: Account;
  user?: User;
}

export interface Category {
  id: string;
  householdId?: string;
  name: string;
  color: string;
  icon?: string;
  parentCategoryId?: string;
  isSystem: boolean;
  createdAt: string;
  household?: Household;
  parentCategory?: Category;
  subCategories?: Category[];
}

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringPatternId?: string;
  attachmentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  user?: User;
  category?: Category;
  recurringPattern?: RecurringPattern;
}

export interface RecurringPattern {
  id: string;
  name: string;
  frequency: RecurringFrequency;
  expectedAmount: number;
  categoryId: string;
  nextExpectedDate: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
}

export interface Budget {
  id: string;
  householdId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  household?: Household;
  category?: Category;
}

export interface CategorizationRule {
  id: string;
  householdId: string;
  keyword: string;
  categoryId: string;
  priority: number;
  createdAt: string;
  household?: Household;
  category?: Category;
}

export interface BalancingRecord {
  id: string;
  householdId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: BalancingStatus;
  createdAt: string;
  household?: Household;
  fromUser?: User;
  toUser?: User;
}

// DTOs (Data Transfer Objects)
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  monthlyIncome: number;
}

export interface CreateTransactionDTO {
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  description: string;
  transactionDate: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface UpdateTransactionDTO {
  categoryId?: string;
  amount?: number;
  description?: string;
  transactionDate?: string;
  notes?: string;
}

export interface CreateAccountDTO {
  householdId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency?: string;
}

export interface CreateBudgetDTO {
  householdId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Analytics types
export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: CategoryExpense[];
  recentTransactions: Transaction[];
}
