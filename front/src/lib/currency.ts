export type Country = 'India' | 'USA' | 'UK';

export const COUNTRY_STORAGE_KEY = 'iqnaax_country';
export const DEFAULT_COUNTRY: Country = 'India';

// Fixed conversion constants (INR -> other)
export const INR_TO_USD = 0.012; // 1 INR = 0.012 USD
export const INR_TO_GBP = 0.009; // 1 INR = 0.009 GBP

export function getStoredCountry(): Country {
  if (typeof window === 'undefined') return DEFAULT_COUNTRY;
  const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
  if (stored === 'USA') return 'USA';
  if (stored === 'UK') return 'UK';
  return 'India';
}

export function setStoredCountry(country: Country) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, country);
  window.dispatchEvent(new CustomEvent('iqnaax-country-change', { detail: country }));
}

export function convertPrice(amountInINR: number, country: Country): number {
  switch (country) {
    case 'India':
      return amountInINR;
    case 'USA':
      return amountInINR * INR_TO_USD;
    case 'UK':
      return amountInINR * INR_TO_GBP;
    default:
      return amountInINR;
  }
}

export function formatPrice(amountInINR: number, country: Country): string {
  const value = convertPrice(amountInINR, country);
  let locale = 'en-IN';
  let currency = 'INR';
  switch (country) {
    case 'India':
      locale = 'en-IN';
      currency = 'INR';
      break;
    case 'USA':
      locale = 'en-US';
      currency = 'USD';
      break;
    case 'UK':
      locale = 'en-GB';
      currency = 'GBP';
      break;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export const COUNTRY_OPTIONS: { value: Country; label: string; flagEmoji: string; flagImage: string }[] = [
  { value: 'India', label: 'India', flagEmoji: '🇮🇳', flagImage: 'https://flagcdn.com/w20/in.png' },
  { value: 'USA', label: 'USA', flagEmoji: '🇺🇸', flagImage: 'https://flagcdn.com/w20/us.png' },
  { value: 'UK', label: 'UK', flagEmoji: '🇬🇧', flagImage: 'https://flagcdn.com/w20/gb.png' },
];
