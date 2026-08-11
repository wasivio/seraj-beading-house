/**
 * Phone Number & Password Security Utilities for Siraj Bedding House
 */

export interface NormalizedPhoneResult {
  isValid: boolean;
  normalizedPhone: string; // e.g. "+919876543210"
  mobileNumber: string;    // e.g. "9876543210"
  countryCode: string;     // e.g. "+91"
  error?: string;
}

/**
 * Normalizes any Indian mobile number variation:
 * - "9876543210"
 * - "+91 9876543210"
 * - "919876543210"
 * - "09876543210"
 * - "+91-98765-43210"
 * Resolves all to:
 * countryCode: "+91", mobileNumber: "9876543210", normalizedPhone: "+919876543210"
 */
export const normalizeIndianPhone = (input: string | undefined): NormalizedPhoneResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalizedPhone: '',
      mobileNumber: '',
      countryCode: '+91',
      error: 'Please enter a valid mobile number.'
    };
  }

  // Remove all non-digit characters except leading '+'
  let cleaned = input.trim().replace(/[\s\-\(\)\.]/g, '');

  // Strip leading zero if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Strip +91 or 91 prefix if 12 digits
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Indian mobile numbers must be exactly 10 digits and start with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      normalizedPhone: '',
      mobileNumber: cleaned,
      countryCode: '+91',
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  const mobileNumber = cleaned;
  const countryCode = '+91';
  const normalizedPhone = `${countryCode}${mobileNumber}`;

  return {
    isValid: true,
    normalizedPhone,
    mobileNumber,
    countryCode
  };
};

/**
 * Converts a normalized phone into an internal secure auth identifier.
 * Example: "+919876543210" -> "user.919876543210@sirajbedding.auth"
 */
export const phoneToAuthIdentifier = (normalizedPhone: string): string => {
  const digits = normalizedPhone.replace(/\D/g, '');
  return `user.${digits}@sirajbedding.auth`;
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Password Policy Enforcement:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */
export const validatePasswordPolicy = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter.');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must include at least one special character (e.g. @, #, $, %).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
