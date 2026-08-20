export type PasswordCheck = {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
  };
  
  const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/~`\\]/;
  
  export function checkPassword(password: string): PasswordCheck {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
      hasSpecial: SPECIAL_CHARS_REGEX.test(password),
    };
  }
  
  export function isPasswordValid(check: PasswordCheck): boolean {
    return Object.values(check).every(Boolean);
  }