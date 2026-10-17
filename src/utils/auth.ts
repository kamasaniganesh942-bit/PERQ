export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  fullName: string;
  email: string;
  signedInAt?: string;
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
  message?: string;
  session?: AuthSession;
  account?: UserAccount;
  updatedAccounts?: UserAccount[];
}

export const ACCOUNTS_STORAGE_KEY = 'perq_registered_accounts_v2';
export const SESSION_STORAGE_KEY = 'perq_active_session_v2';

export const INITIAL_REGISTERED_ACCOUNTS: UserAccount[] = [];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  const clean = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

export function getFirstName(fullName: string): string {
  const clean = fullName.trim();
  if (!clean) return 'Member';
  return clean.split(/\s+/)[0];
}

export function validateLoginCredentials(
  accounts: UserAccount[],
  emailInput: string,
  passwordInput: string
): AuthValidationResult {
  const email = normalizeEmail(emailInput);

  if (!email) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }
  if (!isValidEmailFormat(email)) {
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

  const matched = accounts.find((acc) => normalizeEmail(acc.email) === email);
  if (!matched) {
    return {
      ok: false,
      errorField: 'email',
      error: 'No account found with this email address. Please create an account first.',
    };
  }

  if (matched.password !== passwordInput) {
    return {
      ok: false,
      errorField: 'credentials',
      error: 'Invalid email or password. Please check your details and try again.',
    };
  }

  return {
    ok: true,
    session: {
      userId: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      signedInAt: new Date().toISOString(),
    },
  };
}

export function validateRegistration(
  accounts: UserAccount[],
  fullNameInput: string,
  emailInput: string,
  passwordInput: string,
  confirmPasswordInput: string
): AuthValidationResult {
  const fullName = fullNameInput.trim();
  const email = normalizeEmail(emailInput);

  if (!fullName) {
    return {
      ok: false,
      errorField: 'fullName',
      error: 'Please enter your full name.',
    };
  }
  if (fullName.length < 2) {
    return {
      ok: false,
      errorField: 'fullName',
      error: 'Full name must be at least 2 characters long.',
    };
  }
  if (!email) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }
  if (!isValidEmailFormat(email)) {
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

  const exists = accounts.some((acc) => normalizeEmail(acc.email) === email);
  if (exists) {
    return {
      ok: false,
      errorField: 'email',
      error: 'An account with this email address already exists. Please sign in instead.',
    };
  }

  const newAccount: UserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fullName,
    email,
    password: passwordInput,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return {
    ok: true,
    message: `Account created successfully for ${newAccount.email}. Please sign in with your password.`,
    account: newAccount,
    session: {
      userId: newAccount.id,
      fullName: newAccount.fullName,
      email: newAccount.email,
      signedInAt: new Date().toISOString(),
    },
    updatedAccounts: [...accounts, newAccount],
  };
}

export function validatePasswordReset(
  accounts: UserAccount[],
  emailInput: string,
  newPasswordInput: string,
  confirmPasswordInput: string
): AuthValidationResult {
  const email = normalizeEmail(emailInput);

  if (!email) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }
  if (!isValidEmailFormat(email)) {
    return {
      ok: false,
      errorField: 'email',
      error: 'Please enter a valid email address.',
    };
  }
  if (!newPasswordInput) {
    return {
      ok: false,
      errorField: 'password',
      error: 'Please enter a new password.',
    };
  }
  if (newPasswordInput.length < 6) {
    return {
      ok: false,
      errorField: 'password',
      error: 'New password must be at least 6 characters long.',
    };
  }
  if (!confirmPasswordInput) {
    return {
      ok: false,
      errorField: 'confirmPassword',
      error: 'Please confirm your new password.',
    };
  }
  if (newPasswordInput !== confirmPasswordInput) {
    return {
      ok: false,
      errorField: 'confirmPassword',
      error: 'New passwords do not match.',
    };
  }

  const accountIndex = accounts.findIndex((acc) => normalizeEmail(acc.email) === email);
  if (accountIndex === -1) {
    return {
      ok: false,
      errorField: 'email',
      error: 'No account found with this email address. Please create an account first.',
    };
  }

  const updatedAccount: UserAccount = {
    ...accounts[accountIndex],
    password: newPasswordInput,
  };

  const updatedAccounts = accounts.map((acc, idx) =>
    idx === accountIndex ? updatedAccount : acc
  );

  return {
    ok: true,
    message: 'Password updated successfully. Please sign in with your new password.',
    account: updatedAccount,
    updatedAccounts,
  };
}

export function loadRegisteredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return INITIAL_REGISTERED_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return INITIAL_REGISTERED_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_REGISTERED_ACCOUNTS;
    return parsed.filter(
      (item): item is UserAccount =>
        Boolean(
          item &&
            typeof item.id === 'string' &&
            typeof item.fullName === 'string' &&
            typeof item.email === 'string' &&
            typeof item.password === 'string'
        )
    );
  } catch {
    return INITIAL_REGISTERED_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function loadPersistedSession(accounts: UserAccount[]): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed || typeof parsed.email !== 'string' || typeof parsed.userId !== 'string') {
      return null;
    }
    const matched = accounts.find(
      (acc) =>
        acc.id === parsed.userId ||
        normalizeEmail(acc.email) === normalizeEmail(parsed.email!)
    );
    if (!matched) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return {
      userId: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      signedInAt: parsed.signedInAt,
    };
  } catch {
    return null;
  }
}

export function savePersistedSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

export function clearPersistedSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
