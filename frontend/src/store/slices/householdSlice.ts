import { create } from 'zustand';

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    monthlyIncome: number;
  };
}

export interface Household {
  id: string;
  name: string;
  sharingMode: 'EQUAL' | 'PROPORTIONAL' | 'CUSTOM';
  members: HouseholdMember[];
  userRole?: 'ADMIN' | 'MEMBER';
  _count?: {
    accounts: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface HouseholdState {
  households: Household[];
  currentHousehold: Household | null;
  isLoading: boolean;
  error: string | null;
  setHouseholds: (households: Household[]) => void;
  setCurrentHousehold: (household: Household | null) => void;
  addHousehold: (household: Household) => void;
  updateHousehold: (id: string, updates: Partial<Household>) => void;
  removeHousehold: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearHouseholds: () => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  households: [],
  currentHousehold: null,
  isLoading: false,
  error: null,

  setHouseholds: (households) => set({ households, isLoading: false }),

  setCurrentHousehold: (household) => set({ currentHousehold: household }),

  addHousehold: (household) =>
    set((state) => ({
      households: [household, ...state.households],
    })),

  updateHousehold: (id, updates) =>
    set((state) => ({
      households: state.households.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
      currentHousehold:
        state.currentHousehold?.id === id
          ? { ...state.currentHousehold, ...updates }
          : state.currentHousehold,
    })),

  removeHousehold: (id) =>
    set((state) => ({
      households: state.households.filter((h) => h.id !== id),
      currentHousehold:
        state.currentHousehold?.id === id ? null : state.currentHousehold,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  clearHouseholds: () =>
    set({
      households: [],
      currentHousehold: null,
      isLoading: false,
      error: null,
    }),
}));
