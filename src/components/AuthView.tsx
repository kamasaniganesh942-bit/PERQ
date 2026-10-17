import React, { useState, useRef } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  UserAccount,
  AuthSession,
  AuthErrorField,
  validateLoginCredentials,
  validateRegistration,
  validatePasswordReset,
} from '../utils/auth';
import { PerqLogo } from './PerqLogo';
import { AuthAnimatedBackground } from './AuthAnimatedBackground';

interface AuthViewProps {
  accounts: UserAccount[];
  onAccountsUpdated: (updatedAccounts: UserAccount[]) => void;
  onAuthenticated: (session: AuthSession, updatedAccounts?: UserAccount[]) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  accounts,
  onAccountsUpdated,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<AuthErrorField | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const clearErrorState = () => {
    if (error) setError('');
    if (errorField) setErrorField(undefined);
  };

  const handleSwitchMode = (nextMode: 'login' | 'register' | 'reset', preserveEmail = false) => {
    if (isSubmitting) return;
    setMode(nextMode);
    setError('');
    setErrorField(undefined);
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
    if (!preserveEmail) {
      setEmail((prev) => prev.trim());
    }
    if (nextMode === 'register') {
      setFullName('');
    }
  };

  const handleTryAgain = () => {
    const targetField = errorField;
    setError('');
    setErrorField(undefined);
    setPassword('');
    if (mode !== 'login') {
      setConfirmPassword('');
    }

    // Keep the entered email address so the user does not have to retype it,
    // and focus the appropriate field based on the failure reason.
    setTimeout(() => {
      if (targetField === 'fullName' && fullNameInputRef.current) {
        fullNameInputRef.current.focus();
      } else if (targetField === 'email' && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (targetField === 'confirmPassword' && confirmPasswordInputRef.current) {
        confirmPasswordInputRef.current.focus();
      } else if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      } else if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setErrorField(undefined);
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const result = validateLoginCredentials(accounts, email, password);
        if (!result.ok || !result.session) {
          setError(
            result.error ||
              'Invalid email or password. Please check your details and try again.'
          );
          setErrorField(result.errorField || 'credentials');
          return;
        }
        onAuthenticated(result.session);
        return;
      }

      if (mode === 'register') {
        const result = validateRegistration(
          accounts,
          fullName,
          email,
          password,
          confirmPassword
        );
        if (!result.ok || !result.updatedAccounts || !result.account) {
          setError(result.error || 'Registration failed. Please check all fields.');
          setErrorField(result.errorField);
          return;
        }

        onAccountsUpdated(result.updatedAccounts);
        setMode('login');
        setEmail(result.account.email);
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setSuccessMessage(
          result.message ||
            'Account created successfully! Please sign in with your registered email and password.'
        );
        return;
      }

      if (mode === 'reset') {
        const result = validatePasswordReset(
          accounts,
          email,
          password,
          confirmPassword
        );
        if (!result.ok || !result.updatedAccounts || !result.account) {
          setError(result.error || 'Password reset failed.');
          setErrorField(result.errorField);
          return;
        }

        onAccountsUpdated(result.updatedAccounts);
        setMode('login');
        setEmail(result.account.email);
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage(
          result.message ||
            'Password updated successfully. Please sign in with your new password.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFullNameInvalid = Boolean(error && errorField === 'fullName');
  const isEmailInvalid = Boolean(
    error && (errorField === 'email' || errorField === 'credentials')
  );
  const isPasswordInvalid = Boolean(
    error && (errorField === 'password' || errorField === 'credentials')
  );
  const isConfirmPasswordInvalid = Boolean(error && errorField === 'confirmPassword');

  return (
    <div className="relative min-h-screen bg-[#080808] text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Flowing Monochrome Background filling the entire viewport */}
      <AuthAnimatedBackground />

      {/* Centered Single-Card Authentication Viewport */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <section
          data-testid="auth-centered-card"
          aria-label={
            mode === 'login'
              ? 'Sign In Form'
              : mode === 'register'
              ? 'Create Account Form'
              : 'Reset Password Form'
          }
          className="w-full max-w-[460px] mx-auto rounded-2xl bg-[#121212]/90 backdrop-blur-xl border border-[#303030] p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.8)] flex flex-col justify-between"
        >
          <div>
            {/* Compact, tasteful PERQ Brand Header inside the centered card */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#262626]">
              <PerqLogo size="sm" showText showTagline />
            </div>

            {/* Sign In / Create Account Mode Switcher Tabs */}
            <div
              role="tablist"
              aria-label="Authentication Mode"
              className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#080808] border border-[#303030] mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => handleSwitchMode('login', true)}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'login'
                    ? 'bg-[#FFFFFF] text-[#080808]'
                    : 'bg-transparent text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => handleSwitchMode('register', false)}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  mode === 'register'
                    ? 'bg-[#FFFFFF] text-[#080808]'
                    : 'bg-transparent text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Heading & Description */}
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight">
                {mode === 'login'
                  ? 'Welcome back to PERQ'
                  : mode === 'register'
                  ? 'Create your PERQ account'
                  : 'Reset your password'}
              </h1>
              <p className="text-xs text-[#B8B8B8] mt-1.5 leading-relaxed">
                {mode === 'login'
                  ? 'Enter your registered email address and password to access your dashboard.'
                  : mode === 'register'
                  ? 'Complete all fields below to register your account and sign in to PERQ.'
                  : 'Enter your registered email address and choose a new password.'}
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div
                role="status"
                data-testid="auth-success-alert"
                className="mb-4 p-3.5 rounded-xl bg-[#1C1C1C] border border-[#FFFFFF] text-xs text-[#FFFFFF] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Red Error Alert with Try Again Action */}
            {error && (
              <div
                role="alert"
                data-testid="auth-error-alert"
                className="auth-error-alert-box mb-4 p-4 rounded-xl border text-xs space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium text-[#FCA5A5]">
                    {error}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {error.includes('create an account') && mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register', true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#303030] hover:bg-[#2E2E2E] hover:border-[#FFFFFF] text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Create Account</span>
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="auth-try-again-button"
                    onClick={handleTryAgain}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-fullname-input"
                    className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isFullNameInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                      }`}
                      aria-hidden="true"
                    />
                    <input
                      ref={fullNameInputRef}
                      id="auth-fullname-input"
                      type="text"
                      autoComplete="name"
                      aria-invalid={isFullNameInvalid}
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearErrorState();
                      }}
                      className={`w-full rounded-xl bg-[#080808] border pl-10 pr-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none transition-colors ${
                        isFullNameInvalid
                          ? 'auth-input-error'
                          : 'border-[#303030] focus:border-[#FFFFFF]'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isEmailInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                    }`}
                    aria-hidden="true"
                  />
                  <input
                    ref={emailInputRef}
                    id="auth-email-input"
                    type="email"
                    autoComplete="email"
                    aria-invalid={isEmailInvalid}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearErrorState();
                    }}
                    className={`w-full rounded-xl bg-[#080808] border pl-10 pr-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none transition-colors ${
                      isEmailInvalid
                        ? 'auth-input-error'
                        : 'border-[#303030] focus:border-[#FFFFFF]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password-input"
                    className="block text-xs font-medium text-[#FFFFFF]"
                  >
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('reset', true)}
                      className="text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  {mode === 'reset' ? (
                    <KeyRound
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isPasswordInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                      }`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isPasswordInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <input
                    ref={passwordInputRef}
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    aria-invalid={isPasswordInvalid}
                    placeholder={
                      mode === 'reset'
                        ? 'Enter new password (min. 6 characters)'
                        : mode === 'register'
                        ? 'Create password (min. 6 characters)'
                        : 'Enter your password'
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearErrorState();
                    }}
                    className={`w-full rounded-xl bg-[#080808] border pl-10 pr-10 py-2.5 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none transition-colors ${
                      isPasswordInvalid
                        ? 'auth-input-error'
                        : 'border-[#303030] focus:border-[#FFFFFF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#858585] hover:text-[#FFFFFF] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {(mode === 'register' || mode === 'reset') && (
                <div>
                  <label
                    htmlFor="auth-confirm-password-input"
                    className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                  >
                    {mode === 'reset' ? 'Confirm New Password' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isConfirmPasswordInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                      }`}
                      aria-hidden="true"
                    />
                    <input
                      ref={confirmPasswordInputRef}
                      id="auth-confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={isConfirmPasswordInvalid}
                      placeholder={
                        mode === 'reset' ? 'Confirm new password' : 'Confirm your password'
                      }
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearErrorState();
                      }}
                      className={`w-full rounded-xl bg-[#080808] border pl-10 pr-10 py-2.5 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none transition-colors ${
                        isConfirmPasswordInvalid
                          ? 'auth-input-error'
                          : 'border-[#303030] focus:border-[#FFFFFF]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#858585] hover:text-[#FFFFFF] cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="auth-submit-button"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#D4D4D4] disabled:opacity-60 text-xs font-semibold text-[#080808] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#080808]" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? 'Sign In to PERQ'
                        : mode === 'register'
                        ? 'Create Account'
                        : 'Update Password'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#080808]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Account Switch Link */}
          <div className="pt-5 mt-6 border-t border-[#262626]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {mode === 'login' ? (
                <>
                  <span className="text-[#858585]">
                    Don&apos;t have a PERQ account yet?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register', false)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#2E2E2E] hover:border-[#FFFFFF] text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Create Account</span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[#858585]">
                    Already have a registered PERQ account?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login', true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#2E2E2E] hover:border-[#FFFFFF] text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Back to Sign In</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Centered Footer */}
      <footer className="relative z-10 px-4 sm:px-8 py-4 text-center text-xs text-[#858585]">
        <strong className="text-[#FFFFFF] font-semibold">PERQ</strong> — Smarter Cards. Bigger Rewards.
      </footer>
    </div>
  );
};
