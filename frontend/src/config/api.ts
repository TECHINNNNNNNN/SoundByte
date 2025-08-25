// API configuration with proper environment handling
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API URL configuration
export const API_URL = isProduction
  ? import.meta.env.VITE_API_URL // Required in production
  : import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Stripe public key - must be set via environment variable
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Validate configuration
if (isProduction && !import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is required in production');
}

if (!STRIPE_PUBLIC_KEY) {
  console.error('⚠️ VITE_STRIPE_PUBLIC_KEY is not set. Stripe payments will not work.');
}

// Log configuration (only in development)
if (isDevelopment) {
  console.log('🔗 API Configuration:', {
    environment: isDevelopment ? 'development' : 'production',
    apiUrl: API_URL,
    stripeKey: STRIPE_PUBLIC_KEY ? '✓ Set' : '✗ Not set'
  });
}