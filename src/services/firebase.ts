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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with database ID specified in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive & Sheets scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

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
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or config needs check.');
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
  const role: 'admin' | 'petugas' = isSuperAdminEmail 
    ? 'admin' 
    : (rolePreference || (user.email?.toLowerCase().includes('admin') ? 'admin' : 'petugas'));

  const userDocRef = doc(db, 'users', user.uid);
  let appUser: AppUser;

  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      appUser = {
        id: user.uid,
        email: user.email || 'petugas@bp2rd.go.id',
        nama: data.nama || user.displayName || 'Petugas BP2RD',
        role: isSuperAdminEmail ? 'admin' : (data.role || role),
        nip: data.nip || (role === 'admin' ? '198005122005011003' : '198709142010011002'),
        jabatan: data.jabatan || (role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Survey & Uji Petik Lapangan'),
        unitKerja: data.unitKerja || 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      // update lastLogin
      await setDoc(userDocRef, { ...appUser, photoURL: user.photoURL || '', lastLogin: new Date().toISOString() }, { merge: true });
    } else {
      appUser = {
        id: user.uid,
        email: user.email || 'petugas@bp2rd.go.id',
        nama: user.displayName || 'Petugas BP2RD',
        role,
        nip: role === 'admin' ? '198005122005011003' : '198709142010011002',
        jabatan: role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Survey & Uji Petik Lapangan',
        unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      await setDoc(userDocRef, {
        uid: user.uid,
        email: appUser.email,
        nama: appUser.nama,
        role: appUser.role,
        nip: appUser.nip,
        jabatan: appUser.jabatan,
        unitKerja: appUser.unitKerja,
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Firestore user profile sync note:', err);
    appUser = {
      id: user.uid,
      email: user.email || 'petugas@bp2rd.go.id',
      nama: user.displayName || 'Petugas BP2RD',
      role,
      nip: role === 'admin' ? '198005122005011003' : '198709142010011002',
      jabatan: role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Survey & Uji Petik Lapangan',
      unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
    };
  }

  return { user, appUser, accessToken };
};

/**
 * Login Petugas / Admin via Firebase Email & Password
 * Mendukung autentikasi Firebase langsung dan pembuatan akun jika pertama kali
 */
export const firebaseEmailPasswordLogin = async (
  email: string,
  password: string,
  rolePreference?: 'admin' | 'petugas'
): Promise<{ user: User; appUser: AppUser }> => {
  let user: User;
  
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    user = cred.user;
  } catch (err: any) {
    // If user does not exist yet in Firebase Auth, create it
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
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
  const role: 'admin' | 'petugas' = isSuperAdminEmail 
    ? 'admin' 
    : (rolePreference || (user.email?.toLowerCase().includes('admin') ? 'admin' : 'petugas'));

  const userDocRef = doc(db, 'users', user.uid);
  let appUser: AppUser;

  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data();
      appUser = {
        id: user.uid,
        email: user.email || email,
        nama: data.nama || (role === 'admin' ? 'Rija (Administrator BP2RD)' : 'Petugas Lapangan BP2RD'),
        role: isSuperAdminEmail ? 'admin' : (data.role || role),
        nip: data.nip || (role === 'admin' ? '198005122005011003' : '198709142010011002'),
        jabatan: data.jabatan || (role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Uji Petik Lapangan'),
        unitKerja: data.unitKerja || 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      await setDoc(userDocRef, { ...appUser, lastLogin: new Date().toISOString() }, { merge: true });
    } else {
      appUser = {
        id: user.uid,
        email: user.email || email,
        nama: role === 'admin' ? 'Rija (Administrator BP2RD)' : 'Petugas Lapangan BP2RD',
        role,
        nip: role === 'admin' ? '198005122005011003' : '198709142010011002',
        jabatan: role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Uji Petik Lapangan',
        unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      await setDoc(userDocRef, {
        uid: user.uid,
        email: appUser.email,
        nama: appUser.nama,
        role: appUser.role,
        nip: appUser.nip,
        jabatan: appUser.jabatan,
        unitKerja: appUser.unitKerja,
        lastLogin: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Firestore user profile sync note:', err);
    appUser = {
      id: user.uid,
      email: user.email || email,
      nama: role === 'admin' ? 'Rija (Administrator BP2RD)' : 'Petugas Lapangan BP2RD',
      role,
      nip: role === 'admin' ? '198005122005011003' : '198709142010011002',
      jabatan: role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Uji Petik Lapangan',
      unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
    };
  }

  return { user, appUser };
};

// Firestore Sync Functions
export async function syncEntryToFirestore(collectionName: 'potensi_pajak' | 'pbb_p2' | 'survei_ikm', entry: any) {
  try {
    const docRef = doc(db, collectionName, entry.id);
    await setDoc(docRef, entry, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Firestore sync note for ${collectionName}:`, error);
    return false;
  }
}

export async function fetchEntriesFromFirestore(collectionName: 'potensi_pajak' | 'pbb_p2' | 'survei_ikm') {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    console.warn(`Firestore read note for ${collectionName}:`, error);
    return [];
  }
}

// Library Berkas Firestore Functions
export async function syncLibraryEntryToFirestore(entry: LibraryBerkasEntry): Promise<boolean> {
  try {
    // Sanitizing ID to match Firestore rule regex ^[a-zA-Z0-9_\-]+$
    const cleanId = entry.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const docRef = doc(db, 'library_berkas', cleanId);
    
    // Prepare data fitting Firestore rules
    const payload = {
      id: cleanId,
      title: entry.title.slice(0, 256),
      category: entry.category,
      nomorSurat: entry.nomorSurat || '',
      fileType: entry.fileType || 'Dokumen',
      sizeStr: entry.sizeStr || '',
      date: entry.date,
      authorOrWp: entry.authorOrWp || 'BP2RD',
      status: entry.status || 'Tersedia',
      statusColor: entry.statusColor || '',
      description: (entry.description || '').slice(0, 2048),
      previewUrl: entry.previewUrl || '',
      driveUrl: entry.driveUrl || '',
      uploadedBy: entry.uploadedBy || 'Admin BP2RD',
      createdAt: entry.createdAt || new Date().toISOString(),
      tags: entry.tags || [],
      isPublic: entry.isPublic ?? true,
    };
    
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('Firestore library save note:', error);
    return false;
  }
}

export async function deleteLibraryEntryFromFirestore(id: string): Promise<boolean> {
  try {
    const cleanId = id.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const docRef = doc(db, 'library_berkas', cleanId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn('Firestore library delete note:', error);
    return false;
  }
}

export async function fetchLibraryEntriesFromFirestore(): Promise<LibraryBerkasEntry[]> {
  try {
    const colRef = collection(db, 'library_berkas');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as LibraryBerkasEntry);
  } catch (error) {
    console.warn('Firestore library fetch note:', error);
    return [];
  }
}
