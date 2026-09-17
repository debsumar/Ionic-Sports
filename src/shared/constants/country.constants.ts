export interface OnboardingCountry {
  label: string;
  code: string;
  currency: {
    label: string;
    code: string;
  };
}

export const ONBOARDING_COUNTRIES: OnboardingCountry[] = [
  { label: 'United States', code: 'US', currency: { label: 'US Dollar', code: 'USD' } },
  { label: 'Canada', code: 'CA', currency: { label: 'Canadian Dollar', code: 'CAD' } },
  { label: 'Mexico', code: 'MX', currency: { label: 'Mexican Peso', code: 'MXN' } },
  { label: 'United Kingdom', code: 'GB', currency: { label: 'British Pound', code: 'GBP' } },
  { label: 'Germany', code: 'DE', currency: { label: 'Euro', code: 'EUR' } },
  { label: 'France', code: 'FR', currency: { label: 'Euro', code: 'EUR' } },
  { label: 'Spain', code: 'ES', currency: { label: 'Euro', code: 'EUR' } },
  { label: 'Italy', code: 'IT', currency: { label: 'Euro', code: 'EUR' } },
  { label: 'Netherlands', code: 'NL', currency: { label: 'Euro', code: 'EUR' } },
  { label: 'Sweden', code: 'SE', currency: { label: 'Swedish Krona', code: 'SEK' } },
  { label: 'Norway', code: 'NO', currency: { label: 'Norwegian Krone', code: 'NOK' } },
  { label: 'Switzerland', code: 'CH', currency: { label: 'Swiss Franc', code: 'CHF' } },
  { label: 'India', code: 'IN', currency: { label: 'Indian Rupee', code: 'INR' } },
  { label: 'Singapore', code: 'SG', currency: { label: 'Singapore Dollar', code: 'SGD' } },
  { label: 'China', code: 'CN', currency: { label: 'Chinese Yuan', code: 'CNY' } },
  { label: 'South Korea', code: 'KR', currency: { label: 'South Korean Won', code: 'KRW' } },
  { label: 'Japan', code: 'JP', currency: { label: 'Japanese Yen', code: 'JPY' } },
  { label: 'Hong Kong', code: 'HK', currency: { label: 'Hong Kong Dollar', code: 'HKD' } },
  { label: 'Australia', code: 'AU', currency: { label: 'Australian Dollar', code: 'AUD' } },
  { label: 'New Zealand', code: 'NZ', currency: { label: 'New Zealand Dollar', code: 'NZD' } },
];
