/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password", "12345678", "admin123", "qwerty123",
    "password123", "admin", "letmein", "welcome"
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common. Please choose a more unique password");
  }

  // Calculate strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (errors.length === 0) {
    const hasMultipleUppercase = (password.match(/[A-Z]/g) || []).length > 1;
    const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length > 1;
    const hasMultipleSpecial = (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length > 1;
    const isLongEnough = password.length >= 12;

    const strengthScore = [
      hasMultipleUppercase,
      hasMultipleNumbers,
      hasMultipleSpecial,
      isLongEnough,
    ].filter(Boolean).length;

    if (strengthScore >= 3) {
      strength = "strong";
    } else if (strengthScore >= 2) {
      strength = "medium";
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function generatePasswordRequirementsText(): string {
  const requirements = [];
  
  if (PASSWORD_REQUIREMENTS.minLength) {
    requirements.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    requirements.push("One uppercase letter");
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    requirements.push("One lowercase letter");
  }
  if (PASSWORD_REQUIREMENTS.requireNumbers) {
    requirements.push("One number");
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    requirements.push("One special character");
  }

  return requirements.join(", ");
}

