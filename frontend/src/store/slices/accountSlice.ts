import { create } from 'zustand';

export interface AccountOwner {
  id: string;
  accountId: string;
  userId: string;
  ownershipShare: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Account {
  id: string;
  name: string;
  type: 'PERSONAL' | 'JOINT' | 'SAVINGS';
  householdId: string;
  initialBalance: number;
  owners: AccountOwner[];
  _count?: {
    transactions: number;
  };
  household?: {
    id: string;
    name: string;
    sharingMode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AccountState {
  accounts: Account[];
  currentAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  setAccounts: (accounts: Account[]) => void;
  setCurrentAccount: (account: Account | null) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAccounts: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,

  setAccounts: (accounts) => set({ accounts, isLoading: false }),

  setCurrentAccount: (account) => set({ currentAccount: account }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [account, ...state.accounts],
    })),

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      currentAccount:
        state.currentAccount?.id === id
          ? { ...state.currentAccount, ...updates }
          : state.currentAccount,
    })),

  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
      currentAccount:
        state.currentAccount?.id === id ? null : state.currentAccount,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  clearAccounts: () =>
    set({
      accounts: [],
      currentAccount: null,
      isLoading: false,
      error: null,
    }),
}));
