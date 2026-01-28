import { z } from 'zod';

// Common country codes mapping
export const COUNTRY_CODES: Record<string, string> = {
  'United States': '+1',
  'Canada': '+1',
  'United Kingdom': '+44',
  'Australia': '+61',
  'India': '+91',
  'Nepal': '+977',
  'China': '+86',
  'Japan': '+81',
  'Germany': '+49',
  'France': '+33',
  'Italy': '+39',
  'Spain': '+34',
  'Mexico': '+52',
  'Brazil': '+55',
  'Russia': '+7',
  'South Korea': '+82',
  'Netherlands': '+31',
  'Sweden': '+46',
  'Norway': '+47',
  'Denmark': '+45',
  'Finland': '+358',
  'Poland': '+48',
  'Turkey': '+90',
  'Saudi Arabia': '+966',
  'UAE': '+971',
  'Singapore': '+65',
  'Malaysia': '+60',
  'Thailand': '+66',
  'Vietnam': '+84',
  'Philippines': '+63',
  'Indonesia': '+62',
  'Pakistan': '+92',
  'Bangladesh': '+880',
  'Sri Lanka': '+94',
  'South Africa': '+27',
  'Nigeria': '+234',
  'Kenya': '+254',
  'Egypt': '+20',
};

export const signupSchema = z.object({
  firstName: z
    .string({
      required_error: 'First name is required',
    })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name is too long')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string({
      required_error: 'Last name is required',
    })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name is too long')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format')
    .min(1, 'Email cannot be empty')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(12, 'Password must be at least 12 characters long')
    .max(128, 'Password is too long'),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .min(1, 'Country cannot be empty')
    .max(100, 'Country name is too long')
    .trim(),
  countryCode: z
    .string({
      required_error: 'Country code is required',
    })
    .regex(/^\+\d{1,4}$/, 'Country code must start with + followed by 1-4 digits'),
  phoneNumber: z
    .string({
      required_error: 'Phone number is required',
    })
    .min(6, 'Phone number is too short')
    .max(15, 'Phone number is too long')
    .regex(/^\d+$/, 'Phone number can only contain digits'),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format')
    .min(1, 'Email cannot be empty')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password cannot be empty'),
});

export type LoginInput = z.infer<typeof loginSchema>;
