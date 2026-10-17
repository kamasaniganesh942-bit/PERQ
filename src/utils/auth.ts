export interface AuthSession {
  uid: string;
  fullName: string;
  email: string;
  status: 'active' | 'suspended';
  createdAt?: string;
  lastLoginAt?: string;
}

export interface FirestoreUserProfileRecord {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'suspended';
}

export interface FirestoreLoginActivityRecord {
  id: string;
  uid: string;
  email: string;
  loginAt: string;
  status: 'success';
}

export type AuthErrorField =
  | 'email'
  | 'password'
  | 'fullName'
  | 'confirmPassword'
  | 'credentials';

export interface AuthValidationResult {
  ok: boolean;
  error?: string;
  errorField?: AuthErrorField;
  errorCode?: string;
  isProviderNotEnabled?: boolean;
  normalizedEmail?: string;
  sanitizedName?: string;
}

// Verbatim constants & regexes synchronized with firebase-blueprint.json
export const BLUEPRINT_UID_MIN_LEN = 1;
export const BLUEPRINT_UID_MAX_LEN = 128;
export const BLUEPRINT_UID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export const BLUEPRINT_NAME_MIN_LEN = 2;
export const BLUEPRINT_NAME_MAX_LEN = 120;

export const BLUEPRINT_EMAIL_MIN_LEN = 5;
export const BLUEPRINT_EMAIL_MAX_LEN = 254;
export const BLUEPRINT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LEGACY_ACCOUNTS_STORAGE_KEY = 'perq_registered_accounts_v2';
const LEGACY_SESSION_STORAGE_KEY = 'perq_active_session_v2';

/**
 * Purges any legacy local storage keys so plain-text passwords are never stored in browser storage.
 */
export function clearLegacyLocalStorageAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_ACCOUNTS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage access errors in restricted environments
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, BLUEPRINT_EMAIL_MAX_LEN);
}

export function sanitizeFullName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, BLUEPRINT_NAME_MAX_LEN);
}

export function isValidEmailFormat(email: string): boolean {
  const clean = email.trim().toLowerCase();
  return (
    clean.length >= BLUEPRINT_EMAIL_MIN_LEN &&
    clean.length <= BLUEPRINT_EMAIL_MAX_LEN &&
    BLUEPRINT_EMAIL_REGEX.test(clean)
  );
}

export function isValidBlueprintUid(uid: string): boolean {
  return (
    typeof uid === 'string' &&
    uid.length >= BLUEPRINT_UID_MIN_LEN &&
    uid.length <= BLUEPRINT_UID_MAX_LEN &&
    BLUEPRINT_UID_REGEX.test(uid)
  );
}

export function getFirstName(fullName: string): string {
  const clean = fullName.trim();
  if (!clean) return 'Member';
  return clean.split(/\s+/)[0];
}

export function validateLoginInput(
  emailInput: string,
  passwordInput: string
): AuthValidationResult {
  const email = normalizeEmail(emailInput);

  if (!email || !isValidEmailFormat(email)) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }

  if (!passwordInput) {
    return {
      ok: false,
      errorField: 'password',
      error: 'Please enter your password.',
    };
  }

  return {
    ok: true,
    normalizedEmail: email,
  };
}

export function validateRegistrationInput(
  fullNameInput: string,
  emailInput: string,
  passwordInput: string,
  confirmPasswordInput: string
): AuthValidationResult {
  const fullName = sanitizeFullName(fullNameInput);
  const email = normalizeEmail(emailInput);

  if (!fullName) {
    return {
      ok: false,
      errorField: 'fullName',
      error: 'Please enter your full name.',
    };
  }

  if (fullName.length < BLUEPRINT_NAME_MIN_LEN) {
    return {
      ok: false,
      errorField: 'fullName',
      error: `Full name must be at least ${BLUEPRINT_NAME_MIN_LEN} characters long.`,
    };
  }

  if (!email || !isValidEmailFormat(email)) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }

  if (!passwordInput) {
    return {
      ok: false,
      errorField: 'password',
      error: 'Please enter your password.',
    };
  }

  if (passwordInput.length < 6) {
    return {
      ok: false,
      errorField: 'password',
      error: 'Password must be at least 6 characters long.',
    };
  }

  if (!confirmPasswordInput) {
    return {
      ok: false,
      errorField: 'confirmPassword',
      error: 'Please confirm your password.',
    };
  }

  if (passwordInput !== confirmPasswordInput) {
    return {
      ok: false,
      errorField: 'confirmPassword',
      error: 'Passwords do not match. Please make sure both password fields are identical.',
    };
  }

  return {
    ok: true,
    normalizedEmail: email,
    sanitizedName: fullName,
  };
}

export function validatePasswordResetEmailInput(emailInput: string): AuthValidationResult {
  const email = normalizeEmail(emailInput);
  if (!email || !isValidEmailFormat(email)) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address to receive a password reset link.',
    };
  }

  return {
    ok: true,
    normalizedEmail: email,
  };
}

export function mapFirebaseAuthError(
  error: unknown,
  mode: 'login' | 'register' | 'reset',
  projectId = 'round-parity-fw2pc'
): AuthValidationResult {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const rawMessage =
    error instanceof Error ? error.message : String(error || 'Authentication failed');

  if (
    code === 'auth/operation-not-allowed' ||
    rawMessage.includes('OPERATION_NOT_ALLOWED') ||
    rawMessage.includes('auth/operation-not-allowed')
  ) {
    return {
      ok: false,
      errorCode: 'auth/operation-not-allowed',
      errorField: 'credentials',
      isProviderNotEnabled: true,
      error: `Email/Password sign-in is not yet enabled in Firebase Console for project "${projectId}". Enable the Email/Password provider in Firebase Authentication → Sign-in method, or use Continue with Google below.`,
    };
  }

  if (code === 'auth/email-already-in-use' || rawMessage.includes('EMAIL_EXISTS')) {
    return {
      ok: false,
      errorCode: 'auth/email-already-in-use',
      errorField: 'email',
      error: 'An account with this email address already exists. Please sign in instead.',
    };
  }

  if (code === 'auth/invalid-email' || rawMessage.includes('INVALID_EMAIL')) {
    return {
      ok: false,
      errorCode: 'auth/invalid-email',
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }

  if (code === 'auth/weak-password' || rawMessage.includes('WEAK_PASSWORD')) {
    return {
      ok: false,
      errorCode: 'auth/weak-password',
      errorField: 'password',
      error: 'Password is too weak. Please choose a password with at least 6 characters.',
    };
  }

  if (code === 'auth/user-not-found' || rawMessage.includes('EMAIL_NOT_FOUND')) {
    return {
      ok: false,
      errorCode: 'auth/user-not-found',
      errorField: 'email',
      error: 'No account found with this email address. Please create an account first.',
    };
  }

  if (
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials' ||
    rawMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
    rawMessage.includes('INVALID_PASSWORD')
  ) {
    return {
      ok: false,
      errorCode: code || 'auth/invalid-credential',
      errorField: 'credentials',
      error: 'Invalid email or password. Please check your details and try again.',
    };
  }

  if (code === 'auth/user-disabled' || rawMessage.includes('USER_DISABLED')) {
    return {
      ok: false,
      errorCode: 'auth/user-disabled',
      errorField: 'email',
      error: 'This account has been suspended. Please contact support.',
    };
  }

  if (code === 'auth/too-many-requests' || rawMessage.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
    return {
      ok: false,
      errorCode: 'auth/too-many-requests',
      errorField: 'credentials',
      error: 'Too many failed attempts. Please wait a moment and try again.',
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      ok: false,
      errorCode: 'auth/popup-closed-by-user',
      errorField: 'credentials',
      error: 'Google Sign-In window was closed before completing authentication.',
    };
  }

  return {
    ok: false,
    errorCode: code || 'auth/unknown',
    errorField: mode === 'register' ? 'email' : 'credentials',
    error:
      mode === 'login'
        ? 'Invalid email or password. Please check your details and try again.'
        : mode === 'register'
        ? 'Unable to create account right now. Please verify your details and try again.'
        : 'Unable to send password reset email. Please verify your email address.',
  };
}
