import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_REGISTERED_ACCOUNTS,
  validateLoginCredentials,
  validateRegistration,
  validatePasswordReset,
  isValidEmailFormat,
  getFirstName,
} from './auth.ts';

test('INITIAL_REGISTERED_ACCOUNTS has no hardcoded login accounts', () => {
  assert.equal(INITIAL_REGISTERED_ACCOUNTS.length, 0);
  const attempt = validateLoginCredentials(
    INITIAL_REGISTERED_ACCOUNTS,
    'unregistered@example.com',
    'Password123!'
  );
  assert.equal(attempt.ok, false);
});

test('isValidEmailFormat validates email syntax strictly', () => {
  assert.equal(isValidEmailFormat('priya@example.com'), true);
  assert.equal(isValidEmailFormat('user.name+tag@domain.co.in'), true);
  assert.equal(isValidEmailFormat('invalid-email'), false);
  assert.equal(isValidEmailFormat('missing@tld'), false);
  assert.equal(isValidEmailFormat('@nodomain.com'), false);
});

test('validateLoginCredentials returns exact error messages and errorField metadata for invalid inputs', () => {
  const reg = validateRegistration(
    [],
    'Rohan Verma',
    'rohan@example.com',
    'MyWalletPass99',
    'MyWalletPass99'
  );
  const accounts = reg.updatedAccounts!;

  const emptyEmail = validateLoginCredentials(accounts, '', 'MyWalletPass99');
  assert.equal(emptyEmail.ok, false);
  assert.equal(emptyEmail.errorField, 'email');
  assert.equal(emptyEmail.error, 'Please enter a valid email address.');

  const invalidEmail = validateLoginCredentials(accounts, 'not-an-email', 'MyWalletPass99');
  assert.equal(invalidEmail.ok, false);
  assert.equal(invalidEmail.errorField, 'email');
  assert.equal(invalidEmail.error, 'Please enter a valid email address.');

  const emptyPassword = validateLoginCredentials(accounts, 'rohan@example.com', '');
  assert.equal(emptyPassword.ok, false);
  assert.equal(emptyPassword.errorField, 'password');
  assert.equal(emptyPassword.error, 'Please enter your password.');

  const unknownUser = validateLoginCredentials(accounts, 'other@example.com', 'MyWalletPass99');
  assert.equal(unknownUser.ok, false);
  assert.equal(unknownUser.errorField, 'email');
  assert.equal(
    unknownUser.error,
    'No account found with this email address. Please create an account first.'
  );

  const wrongPassword = validateLoginCredentials(accounts, 'rohan@example.com', 'WrongPass');
  assert.equal(wrongPassword.ok, false);
  assert.equal(wrongPassword.errorField, 'credentials');
  assert.equal(
    wrongPassword.error,
    'Invalid email or password. Please check your details and try again.'
  );

  const validLogin = validateLoginCredentials(accounts, 'ROHAN@example.com', 'MyWalletPass99');
  assert.equal(validLogin.ok, true);
  assert.equal(validLogin.session?.fullName, 'Rohan Verma');
  assert.equal(validLogin.session?.email, 'rohan@example.com');
});

test('validateRegistration validates all required fields, matching passwords, and prevents duplicates', () => {
  const emptyName = validateRegistration([], '', 'priya@example.com', 'Secret123!', 'Secret123!');
  assert.equal(emptyName.ok, false);
  assert.equal(emptyName.errorField, 'fullName');

  const badEmail = validateRegistration([], 'Priya Sharma', 'not-an-email', 'Secret123!', 'Secret123!');
  assert.equal(badEmail.ok, false);
  assert.equal(badEmail.errorField, 'email');

  const shortPass = validateRegistration([], 'Priya Sharma', 'priya@example.com', '123', '123');
  assert.equal(shortPass.ok, false);
  assert.equal(shortPass.errorField, 'password');

  const mismatch = validateRegistration(
    [],
    'Priya Sharma',
    'priya@example.com',
    'Secret123!',
    'Different123!'
  );
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.errorField, 'confirmPassword');
  assert.equal(mismatch.updatedAccounts, undefined);

  const valid = validateRegistration(
    [],
    'Priya Sharma',
    'Priya@Example.com',
    'Secret123!',
    'Secret123!'
  );
  assert.equal(valid.ok, true);
  assert.equal(valid.account?.email, 'priya@example.com');
  assert.equal(valid.updatedAccounts?.length, 1);

  const duplicate = validateRegistration(
    valid.updatedAccounts!,
    'Priya Sharma',
    'PRIYA@example.com',
    'AnotherPass123!',
    'AnotherPass123!'
  );
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.errorField, 'email');
});

test('validatePasswordReset updates password for existing registered email', () => {
  const reg = validateRegistration(
    [],
    'Ananya Nair',
    'ananya@example.com',
    'OldPass123',
    'OldPass123'
  );
  const accounts = reg.updatedAccounts!;

  const unknownReset = validatePasswordReset(accounts, 'nobody@example.com', 'NewPass456', 'NewPass456');
  assert.equal(unknownReset.ok, false);
  assert.equal(unknownReset.errorField, 'email');

  const mismatchReset = validatePasswordReset(accounts, 'ananya@example.com', 'NewPass456', 'Mismatch');
  assert.equal(mismatchReset.ok, false);
  assert.equal(mismatchReset.errorField, 'confirmPassword');

  const validReset = validatePasswordReset(accounts, 'ananya@example.com', 'NewPass456', 'NewPass456');
  assert.equal(validReset.ok, true);

  const oldLogin = validateLoginCredentials(validReset.updatedAccounts!, 'ananya@example.com', 'OldPass123');
  assert.equal(oldLogin.ok, false);

  const newLogin = validateLoginCredentials(validReset.updatedAccounts!, 'ananya@example.com', 'NewPass456');
  assert.equal(newLogin.ok, true);
});

test('getFirstName extracts first name cleanly', () => {
  assert.equal(getFirstName('Priya Sharma'), 'Priya');
  assert.equal(getFirstName(''), 'Member');
});
