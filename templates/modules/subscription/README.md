# Subscription Module

Stripe payment integration for subscription management.

## Features

- Subscription plans display
- Stripe Checkout integration
- Customer portal for subscription management
- Subscription status tracking

## Setup

### 1. Environment Variables

Add to your `.env` files:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 2. Backend Requirements

Your backend needs to implement these endpoints:

- `GET /v1/subscription/plans` - List available plans
- `POST /v1/subscription/checkout` - Create Stripe checkout session
- `GET /v1/subscription/status` - Get current subscription status
- `POST /v1/subscription/cancel` - Cancel subscription
- `POST /v1/subscription/portal` - Create customer portal session

### 3. Add Route

In `src/router/routes.tsx`:

```tsx
import Subscription from '../pages/Subscription';

// Add to routes
{ path: 'subscription', element: withSuspense(Subscription) }
```

## Usage

```tsx
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

const Component = () => {
  const { isSubscribed, currentPlan } = useSubscriptionStore();

  if (!isSubscribed) {
    return <UpgradePrompt />;
  }

  return <PremiumContent />;
};
```

## Stripe Integration

The module uses Stripe Checkout for secure payment processing:

1. User selects a plan
2. Backend creates a Checkout Session
3. User is redirected to Stripe's hosted checkout page
4. After payment, user is redirected back with success/cancel status
5. Webhook updates subscription status in your database
