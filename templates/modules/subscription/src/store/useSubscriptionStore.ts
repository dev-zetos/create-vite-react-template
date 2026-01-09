// src/store/useSubscriptionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  isSubscribed: boolean;
  expiresAt: string | null;
  setCurrentPlan: (plan: SubscriptionPlan | null) => void;
  setSubscriptionStatus: (isSubscribed: boolean, expiresAt?: string) => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      currentPlan: null,
      isSubscribed: false,
      expiresAt: null,
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      setSubscriptionStatus: (isSubscribed, expiresAt) =>
        set({ isSubscribed, expiresAt: expiresAt || null }),
      clearSubscription: () =>
        set({ currentPlan: null, isSubscribed: false, expiresAt: null }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
