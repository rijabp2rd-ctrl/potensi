import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestorePayload } from './firebase';
import { DEFAULT_SPREADSHEET_PASSCODE, saveSpreadsheetPasscode } from './storage';

export interface AppSecuritySettings {
  id: string;
  requireSaveCode: boolean;
  protectPotensi: boolean;
  protectPbb: boolean;
  protectRetribusi: boolean;
  saveCodeHash: string;
  saveCodeMasked: string;
  saveCodeHint: string;
  cloudflareEnabled: boolean;
  cloudflareMode: 'managed' | 'strict';
  spreadsheetPasscodeHash: string;
  spreadsheetPasscodeMasked: string;
  updatedAt: string;
  updatedBy: string;
}

const SECURITY_SETTINGS_STORAGE_KEY = 'sipotensi_security_settings_v1';
const HASH_SALT = 'SIPOTENSI_BP2RD_HSU_V1::';

// Default initial verification code when admin has not yet customized one
export const DEFAULT_SAVE_VERIFICATION_CODE = 'BP2RD2026';

// Precomputed deterministic fallback hash for environments without subtle crypto
function fallbackHash(str: string): string {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export async function hashVerificationCode(rawCode: string): Promise<string> {
  const normalized = rawCode.trim();
  const payload = `${HASH_SALT}${normalized}`;
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(payload);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback below
  }
  return `fb_${fallbackHash(payload)}`;
}

export function maskSecretCode(rawCode: string): string {
  const trimmed = rawCode.trim();
  if (trimmed.length <= 3) return '••••';
  if (trimmed.length <= 5) return `${trimmed[0]}${'•'.repeat(trimmed.length - 2)}${trimmed[trimmed.length - 1]}`;
  return `${trimmed.slice(0, 2)}${'•'.repeat(Math.min(6, trimmed.length - 4))}${trimmed.slice(-2)}`;
}

export async function verifyCodeAgainstHash(
  enteredCode: string,
  storedHash: string,
  fallbackPlainCode?: string
): Promise<boolean> {
  const trimmed = enteredCode.trim();
  if (!trimmed) return false;
  if (storedHash) {
    const enteredHash = await hashVerificationCode(trimmed);
    if (enteredHash === storedHash) return true;
  }
  if (fallbackPlainCode && !storedHash) {
    return trimmed === fallbackPlainCode;
  }
  return false;
}

export function getDefaultSecuritySettings(): AppSecuritySettings {
  return {
    id: 'security_config',
    requireSaveCode: true,
    protectPotensi: true,
    protectPbb: true,
    protectRetribusi: true,
    saveCodeHash: '', // Computed lazily / verified against DEFAULT_SAVE_VERIFICATION_CODE if empty
    saveCodeMasked: maskSecretCode(DEFAULT_SAVE_VERIFICATION_CODE),
    saveCodeHint: 'Hubungi Admin BP2RD Kab. HSU untuk mendapatkan Kode Verifikasi Simpan Data.',
    cloudflareEnabled: true,
    cloudflareMode: 'managed',
    spreadsheetPasscodeHash: '',
    spreadsheetPasscodeMasked: maskSecretCode(DEFAULT_SPREADSHEET_PASSCODE),
    updatedAt: new Date().toISOString(),
    updatedBy: 'Sistem Default BP2RD HSU',
  };
}

export function loadLocalSecuritySettings(): AppSecuritySettings {
  const defaults = getDefaultSecuritySettings();
  try {
    const raw = localStorage.getItem(SECURITY_SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      id: 'security_config',
    };
  } catch {
    return defaults;
  }
}

export function saveLocalSecuritySettings(settings: AppSecuritySettings): void {
  try {
    localStorage.setItem(SECURITY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Unable to cache security settings locally:', err);
  }
}

/**
 * Subscribe to real-time Admin Security Settings from Firebase Firestore (/app_settings/security_config)
 */
export function subscribeToSecuritySettings(
  onUpdate: (settings: AppSecuritySettings) => void
): () => void {
  const docRef = doc(db, 'app_settings', 'security_config');

  // Seed initial state from local cache immediately
  onUpdate(loadLocalSecuritySettings());

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const defaults = getDefaultSecuritySettings();
        const data = snap.data() as Partial<AppSecuritySettings>;
        const merged: AppSecuritySettings = {
          ...defaults,
          ...data,
          id: 'security_config',
        };
        saveLocalSecuritySettings(merged);
        onUpdate(merged);
      }
    },
    (error) => {
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        try {
          handleFirestoreError(error, OperationType.GET, 'app_settings/security_config');
        } catch {
          // Logged via handleFirestoreError
        }
      } else {
        console.warn('Security settings listener note:', error);
      }
    }
  );
}

/**
 * Fetch security settings directly once from Firestore
 */
export async function fetchSecuritySettingsFromFirestore(): Promise<AppSecuritySettings> {
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'security_config'));
    if (snap.exists()) {
      const merged: AppSecuritySettings = {
        ...getDefaultSecuritySettings(),
        ...(snap.data() as Partial<AppSecuritySettings>),
        id: 'security_config',
      };
      saveLocalSecuritySettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Fetch security settings note:', err);
  }
  return loadLocalSecuritySettings();
}

/**
 * Save Admin Security Settings to Firebase Firestore (/app_settings/security_config) & Local Cache
 */
export async function saveSecuritySettingsToFirestore(
  settings: AppSecuritySettings,
  newPlainSpreadsheetPasscode?: string
): Promise<{ syncedToFirebase: boolean; error?: string }> {
  const normalized: AppSecuritySettings = {
    ...settings,
    id: 'security_config',
    saveCodeHint: (settings.saveCodeHint || '').slice(0, 280),
    saveCodeMasked: (settings.saveCodeMasked || '').slice(0, 40),
    spreadsheetPasscodeMasked: (settings.spreadsheetPasscodeMasked || '').slice(0, 40),
    updatedBy: (settings.updatedBy || 'Administrator BP2RD HSU').slice(0, 120),
    updatedAt: new Date().toISOString(),
  };

  saveLocalSecuritySettings(normalized);
  if (newPlainSpreadsheetPasscode && newPlainSpreadsheetPasscode.trim().length >= 4) {
    saveSpreadsheetPasscode(newPlainSpreadsheetPasscode.trim());
  }

  try {
    const docRef = doc(db, 'app_settings', 'security_config');
    await setDoc(docRef, sanitizeFirestorePayload(normalized), { merge: true });
    return { syncedToFirebase: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Firestore security settings sync note:', msg);
    return { syncedToFirebase: false, error: msg };
  }
}

export async function verifySaveCode(
  enteredCode: string,
  settings: AppSecuritySettings
): Promise<boolean> {
  if (!settings.requireSaveCode) return true;
  if (settings.saveCodeHash) {
    return verifyCodeAgainstHash(enteredCode, settings.saveCodeHash);
  }
  // If admin hasn't saved a custom hash yet, compare against default initial code
  const defaultHash = await hashVerificationCode(DEFAULT_SAVE_VERIFICATION_CODE);
  return verifyCodeAgainstHash(enteredCode, defaultHash);
}

export async function verifySpreadsheetCodeWithSettings(
  enteredCode: string,
  settings: AppSecuritySettings,
  localFallbackCode: string
): Promise<boolean> {
  const trimmed = enteredCode.trim();
  if (!trimmed) return false;
  if (settings.spreadsheetPasscodeHash) {
    return verifyCodeAgainstHash(trimmed, settings.spreadsheetPasscodeHash);
  }
  return trimmed === localFallbackCode || trimmed.toUpperCase() === DEFAULT_SPREADSHEET_PASSCODE;
}
