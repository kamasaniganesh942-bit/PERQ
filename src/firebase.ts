import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  FirestoreUserProfileRecord,
  FirestoreLoginActivityRecord,
  normalizeEmail,
  sanitizeFullName,
  isValidBlueprintUid,
  isValidEmailFormat,
} from './utils/auth';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

function formatFirestoreTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function deriveSafeDisplayName(nameInput: string | null | undefined, email: string): string {
  const cleaned = sanitizeFullName(nameInput || '');
  if (cleaned.length >= 2) {
    return cleaned;
  }
  const emailPrefix = email.split('@')[0]?.replace(/[^a-zA-Z0-9 ]/g, ' ').trim() || 'PERQ Member';
  return emailPrefix.length >= 2 ? sanitizeFullName(emailPrefix) : 'PERQ Member';
}

/**
 * Creates a new Firebase Auth account with Email/Password and saves the user profile
 * in the Firestore `users/{uid}` collection.
 * Signs out immediately afterward so the user can log in with their registered credentials.
 */
export async function registerUserWithEmailAndFirestore(
  fullNameInput: string,
  emailInput: string,
  passwordInput: string
): Promise<{ uid: string; name: string; email: string }> {
  const email = normalizeEmail(emailInput);
  const name = deriveSafeDisplayName(fullNameInput, email);

  const credential = await createUserWithEmailAndPassword(auth, email, passwordInput);
  const user = credential.user;

  if (!isValidBlueprintUid(user.uid) || !isValidEmailFormat(email)) {
    throw new Error('Authenticated user payload failed blueprint validation constraints.');
  }

  try {
    await updateProfile(user, { displayName: name });
  } catch {
    // Non-fatal if Auth displayName update fails; Firestore profile is authoritative
  }

  const userDocPath = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      status: 'active',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userDocPath);
  }

  await signOut(auth);

  return {
    uid: user.uid,
    name,
    email,
  };
}

/**
 * Syncs `lastLoginAt` on `users/{uid}` (creating the profile if missing)
 * and writes an immutable login event in `loginActivity/{activityId}`.
 */
export async function syncUserProfileAndRecordLoginActivity(
  user: User,
  fallbackName?: string
): Promise<{ uid: string; name: string; email: string }> {
  const email = normalizeEmail(user.email || '');
  if (!isValidBlueprintUid(user.uid) || !isValidEmailFormat(email)) {
    throw new Error('Authenticated user does not have a valid UID or email address.');
  }

  const userDocRef = doc(db, 'users', user.uid);
  const userDocPath = `users/${user.uid}`;

  let existingSnap;
  try {
    existingSnap = await getDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  let resolvedName = deriveSafeDisplayName(
    fallbackName || user.displayName,
    email
  );

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    if (typeof data.name === 'string' && data.name.trim().length >= 2) {
      resolvedName = sanitizeFullName(data.name);
    }
    try {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userDocPath);
    }
  } else {
    try {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: resolvedName,
        email,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        status: 'active',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userDocPath);
    }
  }

  const activityId = `login_${user.uid.slice(0, 24)}_${Date.now()}`;
  const activityPath = `loginActivity/${activityId}`;
  try {
    await setDoc(doc(db, 'loginActivity', activityId), {
      uid: user.uid,
      email,
      loginAt: serverTimestamp(),
      status: 'success',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, activityPath);
  }

  return {
    uid: user.uid,
    name: resolvedName,
    email,
  };
}

/**
 * Signs in an existing user with Email/Password, updates `lastLoginAt` in `users/{uid}`,
 * and records a new entry in `loginActivity`.
 */
export async function signInUserWithEmailAndFirestore(
  emailInput: string,
  passwordInput: string
): Promise<{ uid: string; name: string; email: string }> {
  const email = normalizeEmail(emailInput);
  const credential = await signInWithEmailAndPassword(auth, email, passwordInput);
  return syncUserProfileAndRecordLoginActivity(credential.user);
}

/**
 * Signs in with Google via Firebase Auth popup, ensures `users/{uid}` exists and
 * has an updated `lastLoginAt`, and records a new entry in `loginActivity`.
 */
export async function signInWithGoogleAndFirestore(): Promise<{
  uid: string;
  name: string;
  email: string;
}> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return syncUserProfileAndRecordLoginActivity(credential.user);
}

/**
 * Sends a Firebase Authentication password reset email.
 */
export async function sendFirebasePasswordReset(emailInput: string): Promise<string> {
  const email = normalizeEmail(emailInput);
  await sendPasswordResetEmail(auth, email);
  return email;
}

/**
 * Signs out the active Firebase user session.
 */
export async function signOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to the authenticated user's profile document at `users/{uid}`.
 */
export function subscribeToUserProfile(
  uid: string,
  onProfile: (profile: FirestoreUserProfileRecord | null) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onProfile(null);
        return;
      }
      const data = snapshot.data();
      onProfile({
        uid: String(data.uid || uid),
        name: String(data.name || 'PERQ Member'),
        email: String(data.email || ''),
        createdAt: formatFirestoreTimestamp(data.createdAt),
        lastLoginAt: formatFirestoreTimestamp(data.lastLoginAt),
        status: data.status === 'suspended' ? 'suspended' : 'active',
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes to the authenticated user's login activity records in `loginActivity`.
 */
export function subscribeToUserLoginActivity(
  uid: string,
  onActivities: (records: FirestoreLoginActivityRecord[]) => void
): () => void {
  const path = 'loginActivity';
  const q = query(collection(db, 'loginActivity'), where('uid', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: FirestoreLoginActivityRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          uid: String(data.uid || uid),
          email: String(data.email || ''),
          loginAt: formatFirestoreTimestamp(data.loginAt),
          status: 'success',
        };
      });
      records.sort((a, b) => b.loginAt.localeCompare(a.loginAt));
      onActivities(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export { onAuthStateChanged };
export type { User };
