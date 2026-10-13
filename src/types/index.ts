export type UserRole = 'admin' | 'user' | 'public';

export type VerificationStatus = 
  | 'Menunggu Verifikasi' 
  | 'Verifikasi' 
  | 'Setuju'
  | 'Terverifikasi' 
  | 'Menunggu Validasi' 
  | 'Perlu Survei Lapangan'
  | 'Dalam Proses'
  | 'Disetujui';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  nip?: string;
  jabatan?: string;
  wilayahTugas?: string;
  photoURL?: string;
}

export type JenisPajak = 
  | 'PBB-P2'
  | 'Pajak Reklame'
  | 'Pajak Restoran / PBJT Makanan & Minuman'
  | 'Pajak Hotel / Jasa Perhotelan'
  | 'Pajak Air Tanah'
  | 'Pajak MBLB (Mineral Bukan Logam & Batuan)'
  | 'Pajak Hiburan / Jasa Kesenian'
  | 'Pajak Parkir / Jasa Parkir'
  | 'Pajak Penerangan Jalan / PBJT Tenaga Listrik'
  | 'Pajak Sarang Burung Walet';

export interface PotensiPajakEntry {
  id: string;
  nomorFormulir: string;
  tanggalPendataan: string;
  namaWajibPajak: string;
  npwpd: string;
  nikPemilik?: string;
  namaUsaha: string;
  jenisPajak: JenisPajak;
  kecamatan: string;
  kelurahanDesa: string;
  alamatLengkap: string;
  // Geolocation
  latitude: number;
  longitude: number;
  akurasiGps?: number;
  isCustomCoord?: boolean;
  // Financial Potential
  potensiRupiahBulanan: number;
  potensiRupiahTahunan: number;
  statusVerifikasi: VerificationStatus;
  petugasPendata: string;
  catatanPetugas?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  catatanVerifikasi?: string;
  fotoObjekUrl?: string;
  fotoObjekName?: string;
  fotoObjekSize?: string;
  dpaFileUrl?: string;
  dpaFileName?: string;
  dpaFileSize?: string;
  dokumenPendukungUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PbbP2Entry {
  id: string;
  nop: string; // Nomor Objek Pajak (18 digit atau 'TIDAK ADA NOP')
  statusNop?: 'ada' | 'tidak_ada'; // Status kepemilikan NOP: ada (isikan NOP) atau tidak ada
  tahunPajak: number;
  namaWajibPajak: string;
  nikWajibPajak?: string;
  kecamatan: string;
  kelurahanDesa: string;
  alamatObjek: string;
  luasBumiM2: number;
  njopBumiPerM2: number;
  luasBangunanM2: number;
  njopBangunanPerM2: number;
  njopTotal: number;
  pbbTerhutang: number;
  statusPembayaran: 'LUNAS' | 'BELUM LUNAS' | 'PIUTANG';
  statusVerifikasi?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  catatanVerifikasi?: string;
  tanggalBayar?: string;
  bankTempatBayar?: string;
  nomorStruk?: string;
  strukBayarUrl?: string;
  strukBayarName?: string;
  fotoObjekPbbUrl?: string;
  fotoObjekPbbName?: string;
  fotoObjekPbbSize?: string;
  // Geolocation
  latitude: number;
  longitude: number;
  akurasiGps?: number;
  petugasValidasi: string;
  createdAt: string;
  updatedAt: string;
}

export type GolonganRetribusi = 
  | 'Retribusi Jasa Umum'
  | 'Retribusi Jasa Usaha'
  | 'Retribusi Perizinan Tertentu';

export interface RetribusiDaerahEntry {
  id: string;
  nomorRegister: string;
  tanggalPendataan: string;
  golonganRetribusi: GolonganRetribusi;
  subRekening: string;
  subObjekRetribusi: string;
  keterangan: string;
  namaPengelola?: string;
  nomorKontrakOrSK?: string;
  tarifSatuan: number;
  jumlahSatuan: number;
  satuanTarif: string;
  potensiPerbulan: number;
  potensiPertahun: number;
  kecamatan: string;
  kelurahanDesa: string;
  alamatLengkap: string;
  latitude: number;
  longitude: number;
  akurasiGps?: number;
  fotoObjekRetribusiUrl?: string;
  fotoObjekRetribusiName?: string;
  fotoObjekRetribusiSize?: string;
  statusVerifikasi: VerificationStatus;
  petugasPendata: string;
  verifiedBy?: string;
  verifiedAt?: string;
  catatanVerifikasi?: string;
  createdAt: string;
  updatedAt: string;
}

export type LibraryCategory = 
  | 'regulasi' // Perda dan Regulasi
  | 'sop'      // SOP & Juknis
  | 'blanko'   // Formulir Blanko
  | 'dpa'      // DPA / ARKAS
  | 'objek'    // Foto Objek
  | 'pbb';     // Struk Bayar PBB

export interface LibraryBerkasEntry {
  id: string;
  title: string;
  category: LibraryCategory;
  categoryLabel?: string;
  nomorBerkas: string;
  description: string;
  fileName: string;
  fileSize?: string;
  fileType: 'pdf' | 'doc' | 'image' | 'xlsx' | 'zip';
  fileUrl?: string;
  isPublic: boolean; // true for regulasi, sop, blanko; false for dpa, objek, pbb
  uploadedBy: string;
  uploadedRole: 'admin' | 'user' | 'system';
  tanggalUpload: string;
  statusVerifikasi?: 'Aktif' | 'Arsip' | 'Revisi';
  tags?: string[];
  nomorSurat?: string;
  sizeStr?: string;
  date?: string;
  authorOrWp?: string;
  status?: string;
  statusColor?: string;
  previewUrl?: string;
  driveUrl?: string;
  catatanVerifikasi?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface GpsCoordinateResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  isWithinHsu: boolean;
  kecamatanTerdekat?: string;
  jarakKmKePusatAmuntai?: number;
  source: 'gps_device' | 'preset_kecamatan' | 'preset_landmark' | 'manual_picker';
  timestamp: number;
}
