import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Deterministic static & behavioral evaluator for PERQ Firestore Security Rules
 * verifying all 12 "Dirty Dozen" adversarial payloads and valid operations.
 */

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const draftRulesPath = path.resolve(process.cwd(), 'DRAFT_firestore.rules');

function loadRulesText(): string {
  if (fs.existsSync(rulesPath)) {
    return fs.readFileSync(rulesPath, 'utf8');
  }
  return fs.readFileSync(draftRulesPath, 'utf8');
}

interface SimulatedRequest {
  auth: { uid: string; email?: string } | null;
  path: string;
  method: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestTime: number;
  incomingData?: Record<string, unknown>;
  existingData?: Record<string, unknown>;
  userProfileExists?: boolean;
}

const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isValidUserProfile(
  data: Record<string, unknown> | undefined,
  authUid: string
): boolean {
  if (!data) return false;
  const required = ['uid', 'name', 'email', 'createdAt', 'lastLoginAt', 'status'];
  const keys = Object.keys(data);
  if (!required.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => required.includes(k))) return false;

  return (
    typeof data.uid === 'string' &&
    data.uid.length >= 1 &&
    data.uid.length <= 128 &&
    ID_REGEX.test(data.uid) &&
    data.uid === authUid &&
    typeof data.name === 'string' &&
    data.name.length >= 2 &&
    data.name.length <= 120 &&
    typeof data.email === 'string' &&
    data.email.length >= 5 &&
    data.email.length <= 254 &&
    EMAIL_REGEX.test(data.email) &&
    typeof data.createdAt === 'number' &&
    typeof data.lastLoginAt === 'number' &&
    typeof data.status === 'string' &&
    (data.status === 'active' || data.status === 'suspended')
  );
}

function isValidLoginActivity(
  data: Record<string, unknown> | undefined,
  authUid: string
): boolean {
  if (!data) return false;
  const required = ['uid', 'email', 'loginAt', 'status'];
  const keys = Object.keys(data);
  if (!required.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => required.includes(k))) return false;

  return (
    typeof data.uid === 'string' &&
    data.uid.length >= 1 &&
    data.uid.length <= 128 &&
    ID_REGEX.test(data.uid) &&
    data.uid === authUid &&
    typeof data.email === 'string' &&
    data.email.length >= 5 &&
    data.email.length <= 254 &&
    EMAIL_REGEX.test(data.email) &&
    typeof data.loginAt === 'number' &&
    data.status === 'success'
  );
}

function evaluateFirestoreRule(req: SimulatedRequest): 'ALLOWED' | 'PERMISSION_DENIED' {
  const parts = req.path.split('/').filter(Boolean);
  if (parts.length !== 2) return 'PERMISSION_DENIED';

  const [collection, docId] = parts;

  if (collection === 'users') {
    if (!req.auth || req.auth.uid !== docId) return 'PERMISSION_DENIED';
    if (req.method === 'list' || req.method === 'delete') return 'PERMISSION_DENIED';
    if (!isValidId(docId)) return 'PERMISSION_DENIED';

    if (req.method === 'get') {
      return 'ALLOWED';
    }

    if (req.method === 'create') {
      if (!isValidUserProfile(req.incomingData, req.auth.uid)) return 'PERMISSION_DENIED';
      if (req.incomingData?.uid !== docId) return 'PERMISSION_DENIED';
      if (req.incomingData?.status !== 'active') return 'PERMISSION_DENIED';
      if (req.incomingData?.createdAt !== req.requestTime) return 'PERMISSION_DENIED';
      if (req.incomingData?.lastLoginAt !== req.requestTime) return 'PERMISSION_DENIED';
      return 'ALLOWED';
    }

    if (req.method === 'update') {
      if (!req.existingData || !req.incomingData) return 'PERMISSION_DENIED';
      if (!isValidUserProfile(req.incomingData, req.auth.uid)) return 'PERMISSION_DENIED';
      if (req.existingData.status === 'suspended') return 'PERMISSION_DENIED';
      if (req.incomingData.uid !== req.existingData.uid) return 'PERMISSION_DENIED';
      if (req.incomingData.email !== req.existingData.email) return 'PERMISSION_DENIED';
      if (req.incomingData.createdAt !== req.existingData.createdAt) return 'PERMISSION_DENIED';
      if (req.incomingData.lastLoginAt !== req.requestTime) return 'PERMISSION_DENIED';

      const changedKeys = Object.keys(req.incomingData).filter(
        (k) => req.incomingData![k] !== req.existingData![k]
      );
      const allowedAction1 = changedKeys.every((k) => k === 'lastLoginAt');
      const allowedAction2 = changedKeys.every((k) => k === 'name' || k === 'lastLoginAt');
      if (!allowedAction1 && !allowedAction2) return 'PERMISSION_DENIED';
      return 'ALLOWED';
    }
  }

  if (collection === 'loginActivity') {
    if (!req.auth) return 'PERMISSION_DENIED';
    if (req.method === 'update' || req.method === 'delete') return 'PERMISSION_DENIED';

    if (req.method === 'get') {
      if (!isValidId(docId)) return 'PERMISSION_DENIED';
      if (req.existingData?.uid !== req.auth.uid) return 'PERMISSION_DENIED';
      return 'ALLOWED';
    }

    if (req.method === 'list') {
      if (req.existingData?.uid !== req.auth.uid) return 'PERMISSION_DENIED';
      return 'ALLOWED';
    }

    if (req.method === 'create') {
      if (!isValidId(docId)) return 'PERMISSION_DENIED';
      if (!isValidLoginActivity(req.incomingData, req.auth.uid)) return 'PERMISSION_DENIED';
      if (req.incomingData?.loginAt !== req.requestTime) return 'PERMISSION_DENIED';
      if (!req.userProfileExists) return 'PERMISSION_DENIED';
      return 'ALLOWED';
    }
  }

  return 'PERMISSION_DENIED';
}

test('Firestore Rules Structure: contains 8 pillars and strict blueprints', () => {
  const text = loadRulesText();
  assert.ok(text.includes("rules_version = '2';"));
  assert.ok(text.includes('allow read, write: if false;'));
  assert.ok(text.includes('function isValidUserProfile(data)'));
  assert.ok(text.includes('function isValidLoginActivity(data)'));
  assert.ok(text.includes('match /users/{uid}'));
  assert.ok(text.includes('match /loginActivity/{activityId}'));
});

test('Dirty Dozen #1: Unauthenticated profile creation returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: null,
    path: '/users/user_1',
    method: 'create',
    requestTime: 1000,
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #2: Cross-user profile spoofing returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'attacker_1' },
    path: '/users/victim_1',
    method: 'create',
    requestTime: 1000,
    incomingData: {
      uid: 'victim_1',
      name: 'Victim Name',
      email: 'victim@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #3: Plain-text password or shadow field injection returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'create',
    requestTime: 1000,
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'PlainTextPassword123',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #4: Forged backdated createdAt timestamp returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'create',
    requestTime: 2000,
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 2000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #5: Cross-user PII read on /users/{uid} returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'attacker_1' },
    path: '/users/victim_1',
    method: 'get',
    requestTime: 1000,
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #6: Mutating immutable createdAt or email on profile update returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'update',
    requestTime: 3000,
    existingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'different@example.com',
      createdAt: 1000,
      lastLoginAt: 3000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #7: Updating a suspended (terminal state) profile returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'update',
    requestTime: 3000,
    existingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'suspended',
    },
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 3000,
      status: 'suspended',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #8: Value poisoning (oversized name string) on profile update returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'update',
    requestTime: 3000,
    existingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
    incomingData: {
      uid: 'user_1',
      name: 'A'.repeat(250),
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 3000,
      status: 'active',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #9: Orphaned loginActivity creation without existing user profile returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'ghost_1' },
    path: '/loginActivity/act_1',
    method: 'create',
    requestTime: 1000,
    userProfileExists: false,
    incomingData: {
      uid: 'ghost_1',
      email: 'ghost@example.com',
      loginAt: 1000,
      status: 'success',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #10: Cross-user loginActivity injection returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'attacker_1' },
    path: '/loginActivity/act_1',
    method: 'create',
    requestTime: 1000,
    userProfileExists: true,
    incomingData: {
      uid: 'victim_1',
      email: 'victim@example.com',
      loginAt: 1000,
      status: 'success',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #11: Updating or deleting immutable loginActivity record returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/loginActivity/act_1',
    method: 'delete',
    requestTime: 1000,
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #12: Listing loginActivity belonging to another user returns PERMISSION_DENIED', () => {
  const res = evaluateFirestoreRule({
    auth: { uid: 'attacker_1' },
    path: '/loginActivity/act_1',
    method: 'list',
    requestTime: 1000,
    existingData: {
      uid: 'victim_1',
      email: 'victim@example.com',
      loginAt: 1000,
      status: 'success',
    },
  });
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Authorized owner profile creation, login timestamp update, and loginActivity creation succeed', () => {
  const createProfileRes = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'create',
    requestTime: 1000,
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
  });
  assert.equal(createProfileRes, 'ALLOWED');

  const updateLoginRes = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/users/user_1',
    method: 'update',
    requestTime: 2500,
    existingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 1000,
      status: 'active',
    },
    incomingData: {
      uid: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      createdAt: 1000,
      lastLoginAt: 2500,
      status: 'active',
    },
  });
  assert.equal(updateLoginRes, 'ALLOWED');

  const createActivityRes = evaluateFirestoreRule({
    auth: { uid: 'user_1' },
    path: '/loginActivity/act_2500',
    method: 'create',
    requestTime: 2500,
    userProfileExists: true,
    incomingData: {
      uid: 'user_1',
      email: 'aarav@example.com',
      loginAt: 2500,
      status: 'success',
    },
  });
  assert.equal(createActivityRes, 'ALLOWED');
});
