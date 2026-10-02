export interface PotensiPajakEntry {
  id: string;
  tanggal: string;
  namaObjek: string; // e.g. "Pajak Restoran - RM Minang Raya", "Pajak Reklame - Billboard Simpang Lima"
  kategoriObjek: string; // e.g. "Pajak Restoran", "Pajak Reklame", "Pajak Hotel", dll
  namaWajibPajak: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  noWhatsapp: string;
  estimasiPotensiTahunan?: number;
  
  // File Uploads
  fileDpaArkas?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
  fileObjek?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
  
  // Koordinat
  koordinatLat?: number;
  koordinatLng?: number;
  alamatGps?: string;
  
  // Fitur Validasi Otomatis
  statusValidasi: 'Tervalidasi Otomatis' | 'Perlu Perbaikan' | 'Menunggu Review';
  skorKelayakan: number; // 0 - 100
  catatanValidasi: string[];
  
  // Status Dashboard Admin
  statusAdmin: 'Menunggu Validasi' | 'Diverifikasi' | 'Perlu Survey Lapangan' | 'Disetujui' | 'Ditolak';
  catatanPetugas?: string;
  petugasSurvey?: string;
  
  sumberData: 'Form Publik' | 'Petugas Lapangan';
  createdAt: string;
  syncedToGoogleSheets: boolean;
}

export interface PbbP2Entry {
  id: string;
  tanggal: string;
  namaWajibPajak: string;
  nik: string;
  statusNop: 'ada' | 'tidak_ada';
  nop?: string; // e.g. "32.73.010.002.015-0089.0"
  lokasiObjek: string;
  rtRw?: string;
  kelurahanDesa: string;
  kecamatan: string;
  tahunPajak: number;
  nominalBayar?: number;
  
  buktiBayar?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
  
  statusVerifikasi: 'Lunas & Sah' | 'Menunggu Verifikasi' | 'Data Tidak Sesuai';
  catatanVerifikasi?: string;
  createdAt: string;
  syncedToGoogleSheets: boolean;
}

export interface IkmEntry {
  id: string;
  tanggal: string;
  namaWajibPajak: string;
  alamat: string;
  bidangUsaha?: string;
  nomorKontak?: string;
  
  // 5 Unsur Penilaian Skala 1 - 5
  skorKemudahan: number; // 1-5 Persyaratan & Prosedur
  skorKecepatan: number; // 1-5 Kecepatan Pelayanan
  skorKesopanan: number; // 1-5 Kesopanan & Kompetensi Petugas
  skorTransparansi: number; // 1-5 Transparansi Tarif Pajak
  skorSarana: number; // 1-5 Fasilitas & Kemudahan Sistem Digital
  
  skorRataRata: number; // Skala 1-5
  nilaiKonversi: number; // Skala 25 - 100
  kategoriMutu: 'A (Sangat Baik)' | 'B (Baik)' | 'C (Kurang Baik)' | 'D (Tidak Baik)';
  
  saranMasukan: string;
  createdAt: string;
  syncedToGoogleSheets: boolean;
}

export interface LibraryBerkasEntry {
  id: string;
  title: string;
  category: 'regulasi' | 'sop' | 'dpa' | 'blanko' | 'objek' | 'pbb';
  nomorSurat?: string;
  fileType: string;
  sizeStr: string;
  date: string;
  authorOrWp: string;
  status: string;
  statusColor?: string;
  description: string;
  previewUrl?: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  driveUrl?: string;
  isPublic: boolean;
  tags?: string[];
  statusVerifikasi: 'Menunggu Verifikasi' | 'Terverifikasi & Sah' | 'Perlu Perbaikan' | 'Ditolak';
  catatanVerifikasi?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  nama: string;
  role: 'admin' | 'petugas' | 'user';
  nip?: string;
  jabatan?: string;
  unitKerja?: string;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  spreadsheetId: string;
  sheetNamePotensi: string;
  sheetNamePbb: string;
  sheetNameIkm: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncCount: number;
  isConnected: boolean;
}
