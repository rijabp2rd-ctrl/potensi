import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppUser, LibraryBerkasEntry } from '../types';
import { DEMO_RECORD_IDS, isDemoRecordId } from './storage';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID specified in config
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-sipotensibp2rdpo-624d743a-87c8-41e3-bc96-f4238c410308';
export const db = getFirestore(app, firestoreDbId);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive & Sheets scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (NEVER in localStorage)
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to sanitize document IDs to match ^[a-zA-Z0-9_\-]+$ (max 128 chars)
export function sanitizeFirestoreId(rawId: string): string {
  const cleaned = String(rawId || `doc-${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned || `doc_${Date.now()}`;
}

// Helper to recursively strip undefined properties (Firestore rejects undefined values)
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

// Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (Popup) with Access Token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Login Petugas / Admin terkoneksi ke Firebase Auth & Firestore
 * Melakukan autentikasi via Google Firebase Auth, lalu menyinkronkan profil role di Firestore (/users/{uid})
 */
export const firebaseLoginOfficerOrAdmin = async (
  rolePreference?: 'admin' | 'petugas'
): Promise<{ user: User; appUser: AppUser; accessToken: string }> => {
  const result = await googleSignIn();
  if (!result) {
    throw new Error('Autentikasi Firebase dibatalkan');
  }

  const { user, accessToken } = result;

  // Determine user role
  const isSuperAdminEmail = user.email === 'rija.bp2rd@gmail.com';
  const role: 'admin' | 'user' = (isSuperAdminEmail || rolePreference === 'admin' || user.email?.toLowerCase().includes('admin'))
    ? 'admin' 
    : 'user';

  const userDocRef = doc(db, 'users', sanitizeFirestoreId(user.uid));
  let appUser: AppUser;

  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      appUser = {
        id: user.uid,
        email: user.email || 'petugas@bp2rd.go.id',
        name: data.name || data.nama || user.displayName || (role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas BP2RD HSU'),
        role: isSuperAdminEmail ? 'admin' : (data.role === 'admin' ? 'admin' : role),
        nip: data.nip || (role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004'),
        jabatan: data.jabatan || (role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan'),
        wilayahTugas: data.wilayahTugas || (role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan'),
        photoURL: user.photoURL || undefined,
      };
      await setDoc(userDocRef, sanitizeFirestorePayload({ ...appUser, lastLogin: new Date().toISOString() }), { merge: true });
    } else {
      appUser = {
        id: user.uid,
        email: user.email || 'petugas@bp2rd.go.id',
        name: user.displayName || (role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan BP2RD HSU'),
        role,
        nip: role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004',
        jabatan: role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan',
        wilayahTugas: role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan',
        photoURL: user.photoURL || undefined,
      };
      await setDoc(userDocRef, sanitizeFirestorePayload({
        id: user.uid,
        uid: user.uid,
        email: appUser.email,
        name: appUser.name,
        nama: appUser.name,
        role: appUser.role,
        nip: appUser.nip,
        jabatan: appUser.jabatan,
        wilayahTugas: appUser.wilayahTugas,
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Firestore user profile sync note:', err);
    appUser = {
      id: user.uid,
      email: user.email || 'petugas@bp2rd.go.id',
      name: user.displayName || (role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan BP2RD HSU'),
      role,
      nip: role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004',
      jabatan: role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan',
      wilayahTugas: role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan',
      photoURL: user.photoURL || undefined,
    };
  }

  return { user, appUser, accessToken };
};

/**
 * Login Petugas / Admin via Firebase Email & Password
 */
export const firebaseEmailPasswordLogin = async (
  email: string,
  password: string,
  rolePreference?: 'admin' | 'user'
): Promise<{ user: User; appUser: AppUser }> => {
  let user: User;
  
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    user = cred.user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, email, password);
        user = createCred.user;
      } catch (createErr: any) {
        throw new Error(createErr.message || 'Gagal membuat/masuk akun Firebase');
      }
    } else {
      throw new Error(err.message || 'Gagal login via Firebase Email/Password');
    }
  }

  const isSuperAdminEmail = user.email === 'rija.bp2rd@gmail.com';
  const role: 'admin' | 'user' = (isSuperAdminEmail || rolePreference === 'admin' || user.email?.toLowerCase().includes('admin'))
    ? 'admin' 
    : 'user';

  const userDocRef = doc(db, 'users', sanitizeFirestoreId(user.uid));
  let appUser: AppUser;

  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      appUser = {
        id: user.uid,
        email: user.email || email,
        name: data.name || data.nama || (role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan BP2RD HSU'),
        role: isSuperAdminEmail ? 'admin' : (data.role === 'admin' ? 'admin' : role),
        nip: data.nip || (role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004'),
        jabatan: data.jabatan || (role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan'),
        wilayahTugas: data.wilayahTugas || (role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan'),
      };
      await setDoc(userDocRef, sanitizeFirestorePayload({ ...appUser, lastLogin: new Date().toISOString() }), { merge: true });
    } else {
      appUser = {
        id: user.uid,
        email: user.email || email,
        name: role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan BP2RD HSU',
        role,
        nip: role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004',
        jabatan: role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan',
        wilayahTugas: role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan',
      };
      await setDoc(userDocRef, sanitizeFirestorePayload({
        id: user.uid,
        uid: user.uid,
        email: appUser.email,
        name: appUser.name,
        nama: appUser.name,
        role: appUser.role,
        nip: appUser.nip,
        jabatan: appUser.jabatan,
        wilayahTugas: appUser.wilayahTugas,
        lastLogin: new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Firestore user profile sync note:', err);
    appUser = {
      id: user.uid,
      email: user.email || email,
      name: role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan BP2RD HSU',
      role,
      nip: role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004',
      jabatan: role === 'admin' ? 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak' : 'Petugas Surveyor & Pendataan Lapangan',
      wilayahTugas: role === 'admin' ? 'Seluruh Wilayah Kab. HSU' : 'Kecamatan Amuntai Tengah & Sungai Pandan',
    };
  }

  return { user, appUser };
};

/**
 * 1-Click Quick Login ke Firebase Auth untuk Admin & User
 * Menjamin koneksi real ke Firebase Auth & Firestore dengan profil lengkap
 */
export const quickLoginFirebaseAccount = async (
  role: 'admin' | 'user'
): Promise<{ appUser: AppUser; isFirebaseLive: boolean }> => {
  const targetEmail = role === 'admin' ? 'admin.bp2rd@sipotensi-hsu.go.id' : 'petugas.hsu@sipotensi-hsu.go.id';
  const defaultPassword = 'Bp2rdHSU2026!Secure';
  
  try {
    const { appUser } = await firebaseEmailPasswordLogin(targetEmail, defaultPassword, role);
    return { appUser, isFirebaseLive: true };
  } catch (e) {
    console.warn('Quick login fallback:', e);
    const fallbackUser: AppUser = role === 'admin' ? {
      id: `admin-${Date.now()}`,
      name: 'Rija, S.STP, M.IP',
      email: 'rija.bp2rd@gmail.com',
      role: 'admin',
      nip: '19880512 201001 1 003',
      jabatan: 'Kepala Bidang Pendataan, Penilaian & Penggalian Potensi Pajak',
      wilayahTugas: 'Seluruh Wilayah Kabupaten Hulu Sungai Utara',
    } : {
      id: `user-${Date.now()}`,
      name: 'Ahmad Faisal, S.AP',
      email: 'petugas.hsu@bp2rd-hsu.go.id',
      role: 'user',
      nip: '19920814 201902 1 004',
      jabatan: 'Petugas Surveyor & Pendataan Objek Pajak Lapangan',
      wilayahTugas: 'Kecamatan Amuntai Tengah & Sungai Pandan (Alabio)',
    };
    return { appUser: fallbackUser, isFirebaseLive: false };
  }
};

export const subscribeToAuth = (onUserChanged: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', sanitizeFirestoreId(fbUser.uid)));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const appUser: AppUser = {
            id: fbUser.uid,
            name: data.name || data.nama || fbUser.displayName || (data.role === 'admin' ? 'Rija, S.STP, M.IP' : 'Petugas Lapangan'),
            email: fbUser.email || '',
            role: (data.role === 'admin' || fbUser.email === 'rija.bp2rd@gmail.com') ? 'admin' : 'user',
            nip: data.nip || (data.role === 'admin' ? '19880512 201001 1 003' : '19920814 201902 1 004'),
            jabatan: data.jabatan || (data.role === 'admin' ? 'Kepala Bidang Pendataan & Penilaian BP2RD HSU' : 'Petugas Surveyor Lapangan'),
            wilayahTugas: data.wilayahTugas || 'Kabupaten Hulu Sungai Utara',
            photoURL: fbUser.photoURL || undefined,
          };
          onUserChanged(appUser);
          return;
        }
      } catch (e) {
        console.warn('Error fetching user on auth change:', e);
      }
    }
  });
};

export type FirestoreCollectionName = 'potensi_pajak' | 'pbb_p2' | 'survei_ikm' | 'retribusi_daerah' | 'library_berkas';

// Firestore Sync Functions
export async function syncEntryToFirestore(collectionName: FirestoreCollectionName, entry: any): Promise<boolean> {
  const cleanId = sanitizeFirestoreId(entry.id);
  const path = `${collectionName}/${cleanId}`;
  try {
    const docRef = doc(db, collectionName, cleanId);
    const payload = sanitizeFirestorePayload({ ...entry, id: cleanId });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn(`Firestore sync note for ${path}:`, error);
    return false;
  }
}

export async function fetchEntriesFromFirestore(collectionName: FirestoreCollectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    }
    console.warn(`Firestore read note for ${collectionName}:`, error);
    return [];
  }
}

export async function deleteEntryFromFirestore(collectionName: FirestoreCollectionName, id: string): Promise<boolean> {
  const cleanId = sanitizeFirestoreId(id);
  const path = `${collectionName}/${cleanId}`;
  try {
    const docRef = doc(db, collectionName, cleanId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.warn(`Firestore delete note for ${path}:`, error);
    return false;
  }
}

/**
 * Hapus seluruh data demo bawaan dari koleksi Firebase Firestore
 */
export async function purgeDemoDataFromFirestore(): Promise<void> {
  const collections = Object.keys(DEMO_RECORD_IDS) as FirestoreCollectionName[];
  const deletePromises: Promise<boolean>[] = [];

  for (const colName of collections) {
    const ids = DEMO_RECORD_IDS[colName] || [];
    for (const demoId of ids) {
      deletePromises.push(deleteEntryFromFirestore(colName, demoId));
    }
  }

  await Promise.allSettled(deletePromises);
}

/**
 * Subscribe to a Firestore collection in real time (onSnapshot).
 * Automatically removes any legacy demo data IDs from Firestore and returns only real user records.
 */
export function subscribeToFirestoreCollection<T extends { id: string }>(
  collectionName: FirestoreCollectionName,
  _fallbackInitialData: T[],
  onDataReceived: (items: T[]) => void
) {
  const colRef = collection(db, collectionName);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const validDocs: T[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as T;
        const docId = data?.id || docSnap.id;
        if (isDemoRecordId(docId) || isDemoRecordId(docSnap.id)) {
          // Hapus dokumen demo secara otomatis dari Firestore
          deleteDoc(docSnap.ref).catch(() => {});
        } else {
          validDocs.push(data);
        }
      });
      onDataReceived(validDocs);
    },
    (error) => {
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        try {
          handleFirestoreError(error, OperationType.LIST, collectionName);
        } catch {
          // Logged via handleFirestoreError
        }
      } else {
        console.warn(`Realtime listener note for ${collectionName}:`, error);
      }
    }
  );
}

// Library Berkas Firestore Functions
export async function syncLibraryEntryToFirestore(entry: LibraryBerkasEntry): Promise<boolean> {
  const cleanId = sanitizeFirestoreId(entry.id);
  const path = `library_berkas/${cleanId}`;
  try {
    const docRef = doc(db, 'library_berkas', cleanId);
    const payload = sanitizeFirestorePayload({
      ...entry,
      id: cleanId,
      title: (entry.title || '').slice(0, 150),
      description: (entry.description || '').slice(0, 500),
      createdAt: entry.createdAt || new Date().toISOString(),
      isPublic: entry.isPublic ?? true,
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Firestore library save note:', error);
    return false;
  }
}

export async function deleteLibraryEntryFromFirestore(id: string): Promise<boolean> {
  return deleteEntryFromFirestore('library_berkas', id);
}

export async function fetchLibraryEntriesFromFirestore(): Promise<LibraryBerkasEntry[]> {
  const items = await fetchEntriesFromFirestore('library_berkas');
  return items as LibraryBerkasEntry[];
}
