import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmailFormat,
  isValidBlueprintUid,
  getFirstName,
  validateLoginInput,
  validateRegistrationInput,
  validatePasswordResetEmailInput,
  mapFirebaseAuthError,
} from './auth.ts';

test('isValidEmailFormat validates email syntax and blueprint length bounds strictly', () => {
  assert.equal(isValidEmailFormat('priya@example.com'), true);
  assert.equal(isValidEmailFormat('user.name+tag@domain.co.in'), true);
  assert.equal(isValidEmailFormat('invalid-email'), false);
  assert.equal(isValidEmailFormat('missing@tld'), false);
  assert.equal(isValidEmailFormat('@nodomain.com'), false);
});

test('isValidBlueprintUid enforces blueprint UID pattern and length bounds', () => {
  assert.equal(isValidBlueprintUid('usr_123-ABC'), true);
  assert.equal(isValidBlueprintUid(''), false);
  assert.equal(isValidBlueprintUid('invalid space uid'), false);
  assert.equal(isValidBlueprintUid('a'.repeat(129)), false);
});

test('validateLoginInput validates email and password fields and returns errorField metadata', () => {
  const emptyEmail = validateLoginInput('', 'MyWalletPass99');
  assert.equal(emptyEmail.ok, false);
  assert.equal(emptyEmail.errorField, 'email');
  assert.equal(emptyEmail.error, 'Please enter a valid email address.');

  const invalidEmail = validateLoginInput('not-an-email', 'MyWalletPass99');
  assert.equal(invalidEmail.ok, false);
  assert.equal(invalidEmail.errorField, 'email');
  assert.equal(invalidEmail.error, 'Please enter a valid email address.');

  const emptyPassword = validateLoginInput('rohan@example.com', '');
  assert.equal(emptyPassword.ok, false);
  assert.equal(emptyPassword.errorField, 'password');
  assert.equal(emptyPassword.error, 'Please enter your password.');

  const valid = validateLoginInput('  ROHAN@Example.com ', 'MyWalletPass99');
  assert.equal(valid.ok, true);
  assert.equal(valid.normalizedEmail, 'rohan@example.com');
});

test('validateRegistrationInput validates required fields, minimum lengths, and matching passwords', () => {
  const emptyName = validateRegistrationInput('', 'priya@example.com', 'Secret123!', 'Secret123!');
  assert.equal(emptyName.ok, false);
  assert.equal(emptyName.errorField, 'fullName');

  const shortName = validateRegistrationInput('A', 'priya@example.com', 'Secret123!', 'Secret123!');
  assert.equal(shortName.ok, false);
  assert.equal(shortName.errorField, 'fullName');

  const badEmail = validateRegistrationInput(
    'Priya Sharma',
    'not-an-email',
    'Secret123!',
    'Secret123!'
  );
  assert.equal(badEmail.ok, false);
  assert.equal(badEmail.errorField, 'email');

  const shortPass = validateRegistrationInput(
    'Priya Sharma',
    'priya@example.com',
    '123',
    '123'
  );
  assert.equal(shortPass.ok, false);
  assert.equal(shortPass.errorField, 'password');

  const mismatch = validateRegistrationInput(
    'Priya Sharma',
    'priya@example.com',
    'Secret123!',
    'Different123!'
  );
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.errorField, 'confirmPassword');

  const valid = validateRegistrationInput(
    '  Priya   Sharma ',
    'Priya@Example.com',
    'Secret123!',
    'Secret123!'
  );
  assert.equal(valid.ok, true);
  assert.equal(valid.sanitizedName, 'Priya Sharma');
  assert.equal(valid.normalizedEmail, 'priya@example.com');
});

test('validatePasswordResetEmailInput validates reset email', () => {
  const bad = validatePasswordResetEmailInput('bad-email');
  assert.equal(bad.ok, false);
  assert.equal(bad.errorField, 'email');

  const ok = validatePasswordResetEmailInput('Ananya@Example.com');
  assert.equal(ok.ok, true);
  assert.equal(ok.normalizedEmail, 'ananya@example.com');
});

test('mapFirebaseAuthError maps Firebase Auth error codes accurately', () => {
  const wrongCreds = mapFirebaseAuthError({ code: 'auth/invalid-credential' }, 'login');
  assert.equal(wrongCreds.ok, false);
  assert.equal(wrongCreds.errorField, 'credentials');
  assert.equal(
    wrongCreds.error,
    'Invalid email or password. Please check your details and try again.'
  );

  const duplicateEmail = mapFirebaseAuthError({ code: 'auth/email-already-in-use' }, 'register');
  assert.equal(duplicateEmail.ok, false);
  assert.equal(duplicateEmail.errorField, 'email');
  assert.equal(
    duplicateEmail.error,
    'An account with this email address already exists. Please sign in instead.'
  );

  const notFound = mapFirebaseAuthError({ code: 'auth/user-not-found' }, 'login');
  assert.equal(notFound.ok, false);
  assert.equal(notFound.errorField, 'email');
  assert.equal(
    notFound.error,
    'No account found with this email address. Please create an account first.'
  );

  const providerDisabled = mapFirebaseAuthError(
    { code: 'auth/operation-not-allowed' },
    'register',
    'round-parity-fw2pc'
  );
  assert.equal(providerDisabled.ok, false);
  assert.equal(providerDisabled.isProviderNotEnabled, true);
  assert.ok(providerDisabled.error?.includes('round-parity-fw2pc'));
});

test('getFirstName extracts first name cleanly', () => {
  assert.equal(getFirstName('Priya Sharma'), 'Priya');
  assert.equal(getFirstName(''), 'Member');
});
