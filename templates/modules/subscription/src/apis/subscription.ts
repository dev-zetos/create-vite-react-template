// src/apis/subscription.ts
import service from '@/utils/https';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// Get available subscription plans
export const getSubscriptionPlans = () => {
  return service.get<ApiResponse<SubscriptionPlan[]>>('/v1/subscription/plans');
};

// Create checkout session for Stripe
export const createCheckoutSession = (planId: string) => {
  return service.post<ApiResponse<CheckoutSession>>('/v1/subscription/checkout', {
    plan_id: planId,
  });
};

// Get current subscription status
export const getSubscriptionStatus = () => {
  return service.get<ApiResponse<{
    is_subscribed: boolean;
    current_plan: SubscriptionPlan | null;
    expires_at: string | null;
  }>>('/v1/subscription/status');
};

// Cancel subscription
export const cancelSubscription = () => {
  return service.post<ApiResponse<{ success: boolean }>>('/v1/subscription/cancel');
};

// Create customer portal session (for managing subscription)
export const createPortalSession = () => {
  return service.post<ApiResponse<{ url: string }>>('/v1/subscription/portal');
};
