'use client';

import { useState, FormEvent, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { createPayment } from '@/lib/api';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};

interface PaymentFormProps {
  amount: number;
  currency: string;
  customerId: string;
  connectedAccountId: string;
  onSuccess: (paymentIntentId: string, status: string) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function PaymentFormInner({
  amount,
  currency,
  customerId,
  connectedAccountId,
  onSuccess,
  onError,
  loading,
  setLoading,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        setIsDarkMode(
          document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
        );
      }
    };

    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please wait.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      // Create payment method using Stripe Elements
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError || !paymentMethod) {
        onError(pmError?.message || 'Failed to create payment method');
        setLoading(false);
        return;
      }

      // Send payment method ID to backend
      const payment = await createPayment(
        amount * 100, // Convert dollars to cents
        currency,
        customerId,
        connectedAccountId,
        paymentMethod.id
      );

      onSuccess(payment.paymentIntentId, payment.status);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#e5e7eb' : '#1f2937', // Light gray for dark mode, dark gray for light mode
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '500',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: isDarkMode ? '#9ca3af' : '#6b7280', // Lighter placeholder for better visibility
        },
      },
      invalid: {
        color: '#ef4444', // Red for errors
        iconColor: '#ef4444',
      },
      complete: {
        color: isDarkMode ? '#10b981' : '#059669', // Green when complete
        iconColor: isDarkMode ? '#10b981' : '#059669',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Details <span  className="text-red-500">*</span>
        </label>
        <div className="px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
          <CardElement key={isDarkMode ? 'dark' : 'light'} options={cardElementOptions} />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Test card: 4242 4242 4242 4242 (always succeeds)
        </p>
      </div>
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing Payment...
          </>
        ) : (
          'Create Payment & Transfer'
        )}
      </button>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300 text-sm">
          Stripe publishable key is not set. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your local env file.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={getStripe()}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}

