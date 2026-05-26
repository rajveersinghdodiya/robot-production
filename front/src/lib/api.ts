// API Configuration for IQNAAX Backend Connection
// This file centralizes all backend API endpoints and configuration

export const API_CONFIG = {
  // Backend base URL - change this for different environments
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    ROOT: '/api/',
    // Products endpoints (to be implemented in Phase 2)
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id: number | string) => `/api/products/${id}`,
    PRODUCT_BY_SLUG: (slug: string) => `/api/products/${slug}`,
    // Blogs
    BLOGS: '/api/blogs',
    BLOG_BY_ID: (id: number | string) => `/api/blogs/${id}`,
    // Contact endpoints (to be implemented in Phase 2)
    CONTACT: '/api/contact',
    // Lab setup endpoints (to be implemented in Phase 2)
    LAB_SETUP: '/api/lab-setup',
  },
  
  // Request configuration
  TIMEOUT: 10000, // 10 seconds
};

export type Currency = 'USD' | 'INR';
export const CURRENCY_STORAGE_KEY = 'iqnaax_currency';
export const DEFAULT_CURRENCY: Currency = 'USD';
export const USD_INR_RATE = 83;

export function getStoredCurrency(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return stored === 'INR' ? 'INR' : 'USD';
}

export function setStoredCurrency(currency: Currency) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent('iqnaax-currency-change', { detail: currency }));
}

export function formatCurrency(value: number, currency: Currency) {
  const amount = currency === 'INR' ? value * USD_INR_RATE : value;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function resolveRemoteUrl(value?: string) {
  if (!value) return undefined;
  return value.startsWith('/') ? `${API_CONFIG.BASE_URL}${value}` : value;
}

export interface ApiOptions extends RequestInit {
  auth?: boolean;
}

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth) {
    const token = localStorage.getItem('iqnaax_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const defaultOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // ignore JSON parsing errors for error responses
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Health check function
export async function checkBackendHealth(): Promise<{
  status: string;
  service: string;
  timestamp: string;
  version: string;
}> {
  return apiCall(API_CONFIG.ENDPOINTS.HEALTH);
}
