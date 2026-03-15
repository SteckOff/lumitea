import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { ReactNode } from 'react';

// Stripe publishable key - test mode
const stripePromise = loadStripe('pk_test_51RU5upQuiZH39Uf8nXoLNWMGBrQ2r8zUkHoCErfQs5cawWRKkNzsthEi0CCvt43y1AlvevcuB7jOqj5HPAq6WvA800GPLrkddU');

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
