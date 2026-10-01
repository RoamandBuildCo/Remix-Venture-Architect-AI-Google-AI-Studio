import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppraisalDossier, RoadmapStep } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider with Google Sheets, Tasks, and Drive scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (CRITICAL: never store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local storage fallback.');
      return false;
    }
    // Non-fatal if test doc does not exist
    return true;
  }
}

// Initial connection test
testFirestoreConnection().catch(() => {});

// Google Sign-in flow
export async function googleSignIn(): Promise<{ user: User; accessToken: string } | null> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from credentials.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

// Token accessor
export async function getAccessToken(): Promise<string | null> {
  return cachedAccessToken;
}

// Sign-out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

// Auth State Listener
export function initAuth(
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
}

// Firestore Realtime Item Sync helpers
export async function syncItemToCloud(item: AppraisalDossier, userId: string): Promise<void> {
  const path = `users/${userId}/items/${item.id}`;
  try {
    const itemDocRef = doc(db, 'users', userId, 'items', item.id);
    await setDoc(
      itemDocRef,
      {
        ...item,
        ownerId: userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteItemFromCloud(itemId: string, userId: string): Promise<void> {
  const path = `users/${userId}/items/${itemId}`;
  try {
    const itemDocRef = doc(db, 'users', userId, 'items', itemId);
    await deleteDoc(itemDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncTaskToCloud(task: RoadmapStep, userId: string): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(
      taskDocRef,
      {
        ...task,
        ownerId: userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToCloudItems(
  userId: string,
  onItems: (items: AppraisalDossier[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'users', userId, 'items');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AppraisalDossier[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AppraisalDossier);
      });
      onItems(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/items`);
      } catch (err: any) {
        if (onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }
  );
}
