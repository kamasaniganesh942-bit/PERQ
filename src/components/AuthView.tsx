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
  RotateCcw,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  AuthSession,
  AuthErrorField,
  validateLoginInput,
  validateRegistrationInput,
  validatePasswordResetEmailInput,
  mapFirebaseAuthError,
} from '../utils/auth';
import {
  FIREBASE_PROJECT_ID,
  registerUserWithEmailAndFirestore,
  signInUserWithEmailAndFirestore,
  signInWithGoogleAndFirestore,
  sendFirebasePasswordReset,
} from '../firebase';
import { PerqLogo } from './PerqLogo';
import { AuthAnimatedBackground } from './AuthAnimatedBackground';

interface AuthViewProps {
  onRegistrationStateChange?: (isRegistering: boolean) => void;
  onAuthenticated: (session: AuthSession) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onRegistrationStateChange,
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
  const [isProviderNotEnabled, setIsProviderNotEnabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const clearErrorState = () => {
    if (error) setError('');
    if (errorField) setErrorField(undefined);
    if (isProviderNotEnabled) setIsProviderNotEnabled(false);
  };

  const handleSwitchMode = (nextMode: 'login' | 'register' | 'reset', preserveEmail = false) => {
    if (isSubmitting || isGoogleSubmitting) return;
    setMode(nextMode);
    setError('');
    setErrorField(undefined);
    setIsProviderNotEnabled(false);
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
    setIsProviderNotEnabled(false);
    setPassword('');
    if (mode !== 'login') {
      setConfirmPassword('');
    }

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

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleSubmitting) return;
    setIsGoogleSubmitting(true);
    setError('');
    setErrorField(undefined);
    setIsProviderNotEnabled(false);
    setSuccessMessage('');

    try {
      const profile = await signInWithGoogleAndFirestore();
      onAuthenticated({
        uid: profile.uid,
        fullName: profile.name,
        email: profile.email,
        status: 'active',
        lastLoginAt: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = mapFirebaseAuthError(err, 'login', FIREBASE_PROJECT_ID);
      setError(
        mapped.error || 'Google Sign-In could not be completed. Please try again.'
      );
      setErrorField(mapped.errorField || 'credentials');
      setIsProviderNotEnabled(Boolean(mapped.isProviderNotEnabled));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGoogleSubmitting) return;

    setError('');
    setErrorField(undefined);
    setIsProviderNotEnabled(false);
    setSuccessMessage('');

    if (mode === 'login') {
      const validation = validateLoginInput(email, password);
      if (!validation.ok) {
        setError(
          validation.error ||
            'Invalid email or password. Please check your details and try again.'
        );
        setErrorField(validation.errorField || 'credentials');
        return;
      }

      setIsSubmitting(true);
      try {
        const profile = await signInUserWithEmailAndFirestore(email, password);
        onAuthenticated({
          uid: profile.uid,
          fullName: profile.name,
          email: profile.email,
          status: 'active',
          lastLoginAt: new Date().toISOString(),
        });
      } catch (err) {
        const mapped = mapFirebaseAuthError(err, 'login', FIREBASE_PROJECT_ID);
        setError(
          mapped.error ||
            'Invalid email or password. Please check your details and try again.'
        );
        setErrorField(mapped.errorField || 'credentials');
        setIsProviderNotEnabled(Boolean(mapped.isProviderNotEnabled));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'register') {
      const validation = validateRegistrationInput(
        fullName,
        email,
        password,
        confirmPassword
      );
      if (!validation.ok) {
        setError(validation.error || 'Registration failed. Please check all fields.');
        setErrorField(validation.errorField);
        return;
      }

      setIsSubmitting(true);
      onRegistrationStateChange?.(true);
      try {
        const registered = await registerUserWithEmailAndFirestore(
          fullName,
          email,
          password
        );
        setMode('login');
        setEmail(registered.email);
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setSuccessMessage(
          `Account created for ${registered.email} and saved to Firestore. Please sign in with your password.`
        );
      } catch (err) {
        const mapped = mapFirebaseAuthError(err, 'register', FIREBASE_PROJECT_ID);
        setError(mapped.error || 'Registration failed. Please check all fields.');
        setErrorField(mapped.errorField || 'email');
        setIsProviderNotEnabled(Boolean(mapped.isProviderNotEnabled));
      } finally {
        onRegistrationStateChange?.(false);
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'reset') {
      const validation = validatePasswordResetEmailInput(email);
      if (!validation.ok) {
        setError(validation.error || 'Please enter a valid email address.');
        setErrorField(validation.errorField || 'email');
        return;
      }

      setIsSubmitting(true);
      try {
        const targetEmail = await sendFirebasePasswordReset(email);
        setMode('login');
        setEmail(targetEmail);
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage(
          `Password reset link sent to ${targetEmail}. Check your inbox and sign in with your updated password.`
        );
      } catch (err) {
        const mapped = mapFirebaseAuthError(err, 'reset', FIREBASE_PROJECT_ID);
        setError(mapped.error || 'Password reset failed.');
        setErrorField(mapped.errorField || 'email');
        setIsProviderNotEnabled(Boolean(mapped.isProviderNotEnabled));
      } finally {
        setIsSubmitting(false);
      }
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

  const firebaseAuthConsoleUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

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
                  ? 'Complete all fields below to register your account in Firebase and Cloud Firestore.'
                  : 'Enter your registered email address to receive a Firebase password reset link.'}
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

                {isProviderNotEnabled && (
                  <div className="p-3 rounded-lg bg-[#080808]/90 border border-[#EF4444]/40 text-[11px] text-[#E5E5E5] space-y-2">
                    <div className="font-semibold text-[#FFFFFF]">
                      Action required in Firebase Console ({FIREBASE_PROJECT_ID}):
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[#B8B8B8]">
                      <li>Open Firebase Authentication Sign-in providers.</li>
                      <li>Click <strong className="text-[#FFFFFF]">Email/Password</strong>, toggle <strong className="text-[#FFFFFF]">Enable</strong> on, and click <strong className="text-[#FFFFFF]">Save</strong>.</li>
                    </ol>
                    <a
                      href={firebaseAuthConsoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFFFFF] underline underline-offset-4 hover:text-[#D4D4D4]"
                    >
                      <span>Open Firebase Auth Providers ({FIREBASE_PROJECT_ID})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

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

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password-input"
                      className="block text-xs font-medium text-[#FFFFFF]"
                    >
                      Password
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
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isPasswordInvalid ? 'text-[#F87171]' : 'text-[#858585]'
                      }`}
                      aria-hidden="true"
                    />
                    <input
                      ref={passwordInputRef}
                      id="auth-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      aria-invalid={isPasswordInvalid}
                      placeholder={
                        mode === 'register'
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
              )}

              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password-input"
                    className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                  >
                    Confirm Password
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
                      placeholder="Confirm your password"
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
                disabled={isSubmitting || isGoogleSubmitting}
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
                        : 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#080808]" />
                  </>
                )}
              </button>
            </form>

            {mode !== 'reset' && (
              <div className="mt-4">
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-[#262626] w-full" />
                  <span className="bg-[#121212] px-3 text-[11px] text-[#858585] whitespace-nowrap">
                    or continue with Firebase Auth
                  </span>
                  <div className="border-t border-[#262626] w-full" />
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || isGoogleSubmitting}
                  data-testid="auth-google-button"
                  onClick={handleGoogleSignIn}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] hover:border-[#FFFFFF] disabled:opacity-60 text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isGoogleSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <span>Continue with Google</span>
                  )}
                </button>
              </div>
            )}
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
