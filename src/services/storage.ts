import { PotensiPajakEntry, PbbP2Entry, LibraryBerkasEntry, AppUser, RetribusiDaerahEntry, IkmSurveyEntry } from '../types';

export const CURRENT_USER_KEY = 'sipotensi_current_user';
export const POTENSI_KEY = 'sipotensi_potensi_list';
export const PBB_KEY = 'sipotensi_pbb_list';
export const LIBRARY_KEY = 'sipotensi_library_list';
export const RETRIBUSI_KEY = 'sipotensi_retribusi_list';
export const IKM_KEY = 'sipotensi_ikm_surveys';
export const SPREADSHEET_PASSCODE_KEY = 'sipotensi_spreadsheet_passcode';
export const DEFAULT_SPREADSHEET_PASSCODE = 'BP2RD2026';

// Daftar ID data demo lama yang harus dibersihkan dari LocalStorage & Firebase Firestore
export const DEMO_RECORD_IDS = {
  potensi_pajak: ['pot-001', 'pot-002', 'pot-003', 'pot-004', 'pot-005'],
  pbb_p2: ['pbb-001', 'pbb-002', 'pbb-003', 'pbb-004'],
  retribusi_daerah: ['ret-001', 'ret-002', 'ret-003', 'ret-004', 'ret-005', 'ret-006', 'ret-007', 'ret-008'],
  library_berkas: [
    'lib-reg-01', 'lib-reg-02', 'lib-reg-03',
    'lib-sop-01', 'lib-sop-02',
    'lib-blk-01', 'lib-blk-02',
    'lib-dpa-01', 'lib-dpa-02',
    'lib-obj-01', 'lib-obj-02',
    'lib-pbb-01', 'lib-pbb-02'
  ],
  survei_ikm: ['ikm-001', 'ikm-002', 'ikm-003', 'ikm-004'],
};

const ALL_DEMO_ID_SET = new Set<string>([
  ...DEMO_RECORD_IDS.potensi_pajak,
  ...DEMO_RECORD_IDS.pbb_p2,
  ...DEMO_RECORD_IDS.retribusi_daerah,
  ...DEMO_RECORD_IDS.library_berkas,
  ...DEMO_RECORD_IDS.survei_ikm,
]);

export function isDemoRecordId(id?: string): boolean {
  if (!id) return false;
  return ALL_DEMO_ID_SET.has(id);
}

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    name: 'Rija Paisal,S.Sos',
    email: 'rija.bp2rd@gmail.com',
    role: 'admin',
    nip: '19900709 202521 1 011',
    jabatan: 'Penata Layanan Operasional',
    wilayahTugas: 'Seluruh Wilayah Kabupaten Hulu Sungai Utara',
  },
  {
    id: 'user-field-1',
    name: 'Ahmad Faisal, S.AP',
    email: 'petugas.hsu@bp2rd-hsu.go.id',
    role: 'user',
    nip: '19920814 201902 1 004',
    jabatan: 'Petugas Surveyor & Pendataan Objek Pajak Lapangan',
    wilayahTugas: 'Kecamatan Amuntai Tengah & Sungai Pandan (Alabio)',
  },
  {
    id: 'user-field-2',
    name: 'Siti Nurhaliza, A.Md',
    email: 'siti.lapangan@bp2rd-hsu.go.id',
    role: 'user',
    nip: '19950322 202104 2 006',
    jabatan: 'Verifikator PBB-P2 & Validasi Titik Geospasial',
    wilayahTugas: 'Kecamatan Danau Panggang & Babirik',
  },
];

// Data demo dikosongkan sesuai permintaan pengguna
export const INITIAL_POTENSI_DATA: PotensiPajakEntry[] = [];
export const INITIAL_PBB_DATA: PbbP2Entry[] = [];
export const INITIAL_LIBRARY_DATA: LibraryBerkasEntry[] = [];
export const INITIAL_RETRIBUSI_DATA: RetribusiDaerahEntry[] = [];
export const INITIAL_IKM_DATA: IkmSurveyEntry[] = [];

// Helper functions for LocalStorage management
export function loadPotensiList(): PotensiPajakEntry[] {
  try {
    const raw = localStorage.getItem(POTENSI_KEY);
    if (!raw) {
      localStorage.setItem(POTENSI_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: PotensiPajakEntry[] = JSON.parse(raw);
    const filtered = parsed.filter(item => !isDemoRecordId(item.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(POTENSI_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error loading potensi list:', e);
    return [];
  }
}

export function savePotensiList(data: PotensiPajakEntry[]) {
  try {
    const filtered = data.filter(item => !isDemoRecordId(item.id));
    localStorage.setItem(POTENSI_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving potensi list:', e);
  }
}

export function loadPbbList(): PbbP2Entry[] {
  try {
    const raw = localStorage.getItem(PBB_KEY);
    if (!raw) {
      localStorage.setItem(PBB_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: PbbP2Entry[] = JSON.parse(raw);
    const filtered = parsed.filter(item => !isDemoRecordId(item.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(PBB_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error loading pbb list:', e);
    return [];
  }
}

export function savePbbList(data: PbbP2Entry[]) {
  try {
    const filtered = data.filter(item => !isDemoRecordId(item.id));
    localStorage.setItem(PBB_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving pbb list:', e);
  }
}

export function loadLibraryList(): LibraryBerkasEntry[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: LibraryBerkasEntry[] = JSON.parse(raw);
    const filtered = parsed.filter(item => !isDemoRecordId(item.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error loading library list:', e);
    return [];
  }
}

export function saveLibraryList(data: LibraryBerkasEntry[]) {
  const filtered = data.filter(item => !isDemoRecordId(item.id));
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
  } catch (e) {
    // Jika ukuran fileUrl melebihi kuota LocalStorage (~5MB), simpan metadata ke LocalStorage (file penuh tetap tersimpan di Firebase Firestore)
    try {
      const compact = filtered.map(item => ({
        ...item,
        fileUrl: item.fileUrl && item.fileUrl.length > 350000 ? undefined : item.fileUrl,
      }));
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(compact));
    } catch (innerErr) {
      console.error('Error saving library list:', innerErr);
    }
  }
}

export function loadCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user:', e);
    return null;
  }
}

export function saveCurrentUser(user: AppUser | null) {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving user:', e);
  }
}

export function loadRetribusiList(): RetribusiDaerahEntry[] {
  try {
    const raw = localStorage.getItem(RETRIBUSI_KEY);
    if (!raw) {
      localStorage.setItem(RETRIBUSI_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: RetribusiDaerahEntry[] = JSON.parse(raw);
    const filtered = parsed.filter(item => !isDemoRecordId(item.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(RETRIBUSI_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error loading retribusi list:', e);
    return [];
  }
}

export function saveRetribusiList(data: RetribusiDaerahEntry[]) {
  try {
    const filtered = data.filter(item => !isDemoRecordId(item.id));
    localStorage.setItem(RETRIBUSI_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving retribusi list:', e);
  }
}

export interface ConnectedSpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  connectionMode?: 'oauth' | 'appscript';
  scriptUrl?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  syncedCounts?: {
    potensi: number;
    retribusi: number;
    pbb: number;
  };
}

export const SPREADSHEET_CONFIG_KEY = 'sipotensi_spreadsheet_config';

export function loadSpreadsheetConfig(): ConnectedSpreadsheetConfig | null {
  try {
    const raw = localStorage.getItem(SPREADSHEET_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading spreadsheet config:', e);
    return null;
  }
}

export function saveSpreadsheetConfig(config: ConnectedSpreadsheetConfig | null) {
  try {
    if (config) {
      localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(SPREADSHEET_CONFIG_KEY);
    }
  } catch (e) {
    console.error('Error saving spreadsheet config:', e);
  }
}

export function loadSpreadsheetPasscode(): string {
  try {
    return localStorage.getItem(SPREADSHEET_PASSCODE_KEY) || DEFAULT_SPREADSHEET_PASSCODE;
  } catch {
    return DEFAULT_SPREADSHEET_PASSCODE;
  }
}

export function saveSpreadsheetPasscode(passcode: string) {
  try {
    const trimmed = passcode.trim();
    if (trimmed) {
      localStorage.setItem(SPREADSHEET_PASSCODE_KEY, trimmed);
    }
  } catch (e) {
    console.error('Error saving spreadsheet passcode:', e);
  }
}

export function loadIkmList(): IkmSurveyEntry[] {
  try {
    const raw = localStorage.getItem(IKM_KEY);
    if (!raw) {
      localStorage.setItem(IKM_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: IkmSurveyEntry[] = JSON.parse(raw);
    const filtered = parsed.filter(item => !isDemoRecordId(item.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(IKM_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    console.error('Error loading IKM list:', e);
    return [];
  }
}

export function saveIkmList(data: IkmSurveyEntry[]) {
  try {
    const filtered = data.filter(item => !isDemoRecordId(item.id));
    localStorage.setItem(IKM_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error saving IKM list:', e);
  }
}
