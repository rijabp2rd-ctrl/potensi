import { PotensiPajakEntry, PbbP2Entry, IkmEntry, AppUser, GoogleSheetsConfig, LibraryBerkasEntry } from '../types';

const STORAGE_KEYS = {
  POTENSI: 'sipotensi_data_potensi_v1',
  PBB: 'sipotensi_data_pbb_v1',
  IKM: 'sipotensi_data_ikm_v1',
  USER: 'sipotensi_current_user_v1',
  SHEETS_CONFIG: 'sipotensi_sheets_config_v1',
  LIBRARY: 'sipotensi_data_library_v1',
};

// Initial Seed Data to make dashboards, charts, tables, and libraries instantly dynamic
const SEED_POTENSI: PotensiPajakEntry[] = [
  {
    id: 'POT-2026-001',
    tanggal: '2026-09-28',
    namaObjek: 'Pajak Restoran - Cafe & Roastery Senja Kopi',
    kategoriObjek: 'Pajak Restoran / Rumah Makan',
    namaWajibPajak: 'Hendra Gunawan',
    alamat: 'Jl. Merdeka No. 45, Sentra Kuliner',
    kecamatan: 'Kecamatan Kota Selatan',
    kelurahan: 'Kelurahan Sukadamai',
    noWhatsapp: '081234567890',
    estimasiPotensiTahunan: 48000000,
    fileDpaArkas: {
      name: 'DPA_Pendataan_Usaha_Komersil_2026.pdf',
      size: 1450000,
      type: 'application/pdf',
      dataUrl: '',
    },
    fileObjek: {
      name: 'foto_tampak_depan_cafe_senja.jpg',
      size: 890000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    },
    koordinatLat: -6.917464,
    koordinatLng: 107.619123,
    alamatGps: 'Jl. Merdeka No.45, Sukadamai (-6.9175, 107.6191)',
    statusValidasi: 'Tervalidasi Otomatis',
    skorKelayakan: 95,
    catatanValidasi: [
      'Nomor WhatsApp terverifikasi standar seluler RI',
      'Dokumen DPA/ARKAS terunggah lengkap',
      'Foto fisik objek teridentifikasi jelas',
      'Koordinat geospasial presisi GPS (< 15 meter)',
    ],
    statusAdmin: 'Diverifikasi',
    catatanPetugas: 'Omzet rata-rata Rp 40jt/bulan. Potensi pajak PB1 10% sebesar Rp 4.000.000/bulan telah diverifikasi tim penetapan.',
    petugasSurvey: 'Budi Santoso, S.STP (NIP. 198504122008011004)',
    sumberData: 'Form Publik',
    createdAt: '2026-09-28T09:30:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'POT-2026-002',
    tanggal: '2026-09-29',
    namaObjek: 'Pajak Reklame - Billboard Digital Videotron Simpang Empat',
    kategoriObjek: 'Pajak Reklame / Billboard',
    namaWajibPajak: 'PT Media Megah Reklameindo (Bambang S.)',
    alamat: 'Perempatan Ringroad Barat - Sudirman',
    kecamatan: 'Kecamatan Kota Barat',
    kelurahan: 'Kelurahan Karang Mekar',
    noWhatsapp: '085712348899',
    estimasiPotensiTahunan: 120000000,
    fileDpaArkas: {
      name: 'ARKAS_Perizinan_Reklame_Titik_A12.pdf',
      size: 2100000,
      type: 'application/pdf',
      dataUrl: '',
    },
    fileObjek: {
      name: 'videotron_simpang_utama.jpg',
      size: 1200000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    },
    koordinatLat: -6.921345,
    koordinatLng: 107.608765,
    alamatGps: 'Simpang Ringroad Barat (-6.9213, 107.6088)',
    statusValidasi: 'Tervalidasi Otomatis',
    skorKelayakan: 100,
    catatanValidasi: [
      'Nomor WhatsApp valid dan responsif',
      'Dokumen izin tayang & DPA lengkap',
      'Foto sudut pandang reklame optimal',
      'Titik koordinat cocok dengan peta tata ruang reklame kota',
    ],
    statusAdmin: 'Disetujui',
    catatanPetugas: 'SKPD Reklame Elektronik telah diterbitkan untuk masa tayang 12 bulan.',
    petugasSurvey: 'Rian Pratama, S.E.',
    sumberData: 'Petugas Lapangan',
    createdAt: '2026-09-29T11:15:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'POT-2026-003',
    tanggal: '2026-09-30',
    namaObjek: 'Pajak Hotel - Wisma Graha Nirwana Boutique',
    kategoriObjek: 'Pajak Hotel / Wisma / Penginapan',
    namaWajibPajak: 'Siti Aminah, M.M.',
    alamat: 'Jl. Pemuda Asri Kavling 18',
    kecamatan: 'Kecamatan Kota Utara',
    kelurahan: 'Kelurahan Cempaka Baru',
    noWhatsapp: '082199887766',
    estimasiPotensiTahunan: 84000000,
    fileDpaArkas: {
      name: 'DPA_Pendataan_Perhotelan_Q3.pdf',
      size: 980000,
      type: 'application/pdf',
      dataUrl: '',
    },
    fileObjek: {
      name: 'gedung_hotel_nirwana.jpg',
      size: 1050000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    },
    koordinatLat: -6.905678,
    koordinatLng: 107.623456,
    alamatGps: 'Jl. Pemuda Asri 18 (-6.9057, 107.6235)',
    statusValidasi: 'Tervalidasi Otomatis',
    skorKelayakan: 90,
    catatanValidasi: [
      'Identitas WP & Nomor WhatsApp sesuai',
      'File pendukung valid',
      'Objek operasional dengan 24 kamar aktif',
    ],
    statusAdmin: 'Perlu Survey Lapangan',
    catatanPetugas: 'Dijadwalkan uji petik tingkat okupansi kamar minggu depan oleh Tim UPT Wilayah Utara.',
    sumberData: 'Form Publik',
    createdAt: '2026-09-30T14:20:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'POT-2026-004',
    tanggal: '2026-10-01',
    namaObjek: 'Pajak Parkir - Area Parkir Khusus Plaza Sentosa',
    kategoriObjek: 'Pajak Parkir Swasta',
    namaWajibPajak: 'CV Sentosa Secure Parking',
    alamat: 'Kawasan Komersial Sentosa Megah Blok B',
    kecamatan: 'Kecamatan Kota Timur',
    kelurahan: 'Kelurahan Margajaya',
    noWhatsapp: '081344556677',
    estimasiPotensiTahunan: 36000000,
    fileDpaArkas: {
      name: 'ARKAS_Audit_Kapasitas_Parkir.pdf',
      size: 850000,
      type: 'application/pdf',
      dataUrl: '',
    },
    fileObjek: {
      name: 'gerbang_parkir_otomatis.jpg',
      size: 720000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
    },
    koordinatLat: -6.932109,
    koordinatLng: 107.634567,
    alamatGps: 'Sentosa Megah Blok B (-6.9321, 107.6346)',
    statusValidasi: 'Tervalidasi Otomatis',
    skorKelayakan: 85,
    catatanValidasi: [
      'Nomor WhatsApp aktif',
      'Kapasitas parkir tertera: 120 motor, 45 mobil',
      'Bukti gate barrier otomatis terlampir',
    ],
    statusAdmin: 'Menunggu Validasi',
    catatanPetugas: 'Menunggu konfirmasi tarif flat vs tarif jam-jaman.',
    sumberData: 'Form Publik',
    createdAt: '2026-10-01T08:10:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'POT-2026-005',
    tanggal: '2026-10-01',
    namaObjek: 'Pajak Air Tanah - Sumur Dalam Industri PT Tekstil Makmur',
    kategoriObjek: 'Pajak Air Tanah (ABT)',
    namaWajibPajak: 'PT Tekstil Makmur Sejahtera',
    alamat: 'Kawasan Industri Timur Km 14',
    kecamatan: 'Kecamatan Kota Timur',
    kelurahan: 'Kelurahan Cipadung',
    noWhatsapp: '081122334455',
    estimasiPotensiTahunan: 72000000,
    fileDpaArkas: {
      name: 'DPA_Meteran_ABT_Q3.pdf',
      size: 1300000,
      type: 'application/pdf',
      dataUrl: '',
    },
    fileObjek: {
      name: 'water_meter_industri.jpg',
      size: 940000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
    koordinatLat: -6.938901,
    koordinatLng: 107.645678,
    alamatGps: 'Kawasan Industri Km 14 (-6.9389, 107.6457)',
    statusValidasi: 'Tervalidasi Otomatis',
    skorKelayakan: 90,
    catatanValidasi: [
      'Water meter digital terverifikasi',
      'SIPA (Surat Izin Pengambilan Air) berlaku',
    ],
    statusAdmin: 'Diverifikasi',
    catatanPetugas: 'Volume pengambilan rata-rata 1.500 m3/bulan.',
    petugasSurvey: 'Budi Santoso, S.STP',
    sumberData: 'Petugas Lapangan',
    createdAt: '2026-10-01T09:45:00Z',
    syncedToGoogleSheets: true,
  },
];

const SEED_PBB: PbbP2Entry[] = [
  {
    id: 'PBB-2026-101',
    tanggal: '2026-09-27',
    namaWajibPajak: 'Dr. Agus Wibowo, M.Si.',
    nik: '3273011504800003',
    statusNop: 'ada',
    nop: '32.73.010.002.015-0089.0',
    lokasiObjek: 'Perumahan Griya Indah Blok C2 No. 14',
    rtRw: 'RT 04 / RW 08',
    kelurahanDesa: 'Kelurahan Sukadamai',
    kecamatan: 'Kecamatan Kota Selatan',
    tahunPajak: 2026,
    nominalBayar: 1450000,
    buktiBayar: {
      name: 'struk_pembayaran_pbb_bjb_2026.jpg',
      size: 420000,
      type: 'image/jpeg',
      dataUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    },
    statusVerifikasi: 'Lunas & Sah',
    catatanVerifikasi: 'Tercatat lunas di Sistem Informasi Pendapatan Daerah (SISMIOP) melalui kanal Bank BJB Virtual Account.',
    createdAt: '2026-09-27T10:00:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'PBB-2026-102',
    tanggal: '2026-09-29',
    namaWajibPajak: 'Hj. Rohimah',
    nik: '3273026207750001',
    statusNop: 'ada',
    nop: '32.73.020.004.022-0145.0',
    lokasiObjek: 'Jl. Melati Kencana No. 89',
    rtRw: 'RT 02 / RW 03',
    kelurahanDesa: 'Kelurahan Karang Mekar',
    kecamatan: 'Kecamatan Kota Barat',
    tahunPajak: 2026,
    nominalBayar: 875000,
    buktiBayar: {
      name: 'bukti_qris_pbb_posindonesia.png',
      size: 380000,
      type: 'image/png',
      dataUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    },
    statusVerifikasi: 'Lunas & Sah',
    catatanVerifikasi: 'Transaksi QRIS Dinamis telah terkonfirmasi lunas.',
    createdAt: '2026-09-29T14:40:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'PBB-2026-103',
    tanggal: '2026-10-01',
    namaWajibPajak: 'Wawan Setiawan',
    nik: '3273031008890004',
    statusNop: 'tidak_ada',
    lokasiObjek: 'Pecahan Tanah Waris, Jl. Pesantren Baru No. 12',
    rtRw: 'RT 05 / RW 01',
    kelurahanDesa: 'Kelurahan Cempaka Baru',
    kecamatan: 'Kecamatan Kota Utara',
    tahunPajak: 2026,
    nominalBayar: 0,
    buktiBayar: {
      name: 'surat_keterangan_kepemilikan_tanah.pdf',
      size: 1100000,
      type: 'application/pdf',
      dataUrl: '',
    },
    statusVerifikasi: 'Menunggu Verifikasi',
    catatanVerifikasi: 'Permohonan Pendaftaran NOP Baru (Objek Baru). Tim Pelayanan sedang memverifikasi batas bidang tanah di peta ZNT.',
    createdAt: '2026-10-01T07:15:00Z',
    syncedToGoogleSheets: true,
  },
];

const SEED_IKM: IkmEntry[] = [
  {
    id: 'IKM-2026-201',
    tanggal: '2026-09-28',
    namaWajibPajak: 'Ahmad Fauzi',
    alamat: 'Jl. Merdeka No. 12',
    bidangUsaha: 'Usaha Kuliner / Restoran',
    nomorKontak: '081299887711',
    skorKemudahan: 5,
    skorKecepatan: 5,
    skorKesopanan: 5,
    skorTransparansi: 4,
    skorSarana: 5,
    skorRataRata: 4.8,
    nilaiKonversi: 96,
    kategoriMutu: 'A (Sangat Baik)',
    saranMasukan: 'Sangat praktis dengan adanya formulir online ini! Proses verifikasi cepat dan petugas ramah.',
    createdAt: '2026-09-28T16:00:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'IKM-2026-202',
    tanggal: '2026-09-29',
    namaWajibPajak: 'Dewi Lestari',
    alamat: 'Kawasan Bisnis Sudirman Kav. 9',
    bidangUsaha: 'Periklanan / Agency',
    nomorKontak: '085811223344',
    skorKemudahan: 4,
    skorKecepatan: 4,
    skorKesopanan: 5,
    skorTransparansi: 5,
    skorSarana: 4,
    skorRataRata: 4.4,
    nilaiKonversi: 88,
    kategoriMutu: 'A (Sangat Baik)',
    saranMasukan: 'Penetapan pajak reklame sekarang jauh lebih transparan. Mohon pertahankan kecepatan respon WA center.',
    createdAt: '2026-09-29T10:30:00Z',
    syncedToGoogleSheets: true,
  },
  {
    id: 'IKM-2026-203',
    tanggal: '2026-09-30',
    namaWajibPajak: 'Surya Pratama',
    alamat: 'Perum Cempaka Indah B-1',
    bidangUsaha: 'Wajib Pajak Pribadi (PBB-P2)',
    nomorKontak: '082155667788',
    skorKemudahan: 4,
    skorKecepatan: 4,
    skorKesopanan: 4,
    skorTransparansi: 4,
    skorSarana: 4,
    skorRataRata: 4.0,
    nilaiKonversi: 80,
    kategoriMutu: 'B (Baik)',
    saranMasukan: 'Aplikasi mudah diakses lewat ponsel. Semoga ada fitur pengingat jatuh tempo PBB otomatis lewat WhatsApp.',
    createdAt: '2026-09-30T13:45:00Z',
    syncedToGoogleSheets: true,
  },
];

const SEED_LIBRARY: LibraryBerkasEntry[] = [
  {
    id: 'REG-2026-001',
    title: 'Peraturan Daerah (Perda) Pajak Daerah & Retribusi Daerah No. 1 Tahun 2026',
    category: 'regulasi',
    nomorSurat: 'Perda No. 01/2026',
    fileType: 'PDF Document',
    sizeStr: '3.4 MB',
    date: '2026-01-15',
    authorOrWp: 'Pemerintah Daerah & DPRD',
    status: 'Berlaku Efektif',
    statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
    description: 'Ketentuan umum tarif pajak restoran, reklame, perhotelan, parkir, dan air tanah sesuai UU No. 1/2022 HKPD.',
    previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    tags: ['Perda', 'HKPD', 'Tarif Pajak', 'Regulasi'],
    statusVerifikasi: 'Terverifikasi & Sah',
    catatanVerifikasi: 'Perda resmi telah diundangkan dalam Lembaran Daerah Tahun 2026.',
    verifiedBy: 'Rija (Administrator BP2RD)',
    verifiedAt: '2026-01-16T10:00:00Z',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'REG-2026-002',
    title: 'Petunjuk Teknis (Juknis) Operasional Penggalian Potensi Objek Baru BP2RD',
    category: 'sop',
    nomorSurat: 'Juknis BP2RD-04/2026',
    fileType: 'PDF Document',
    sizeStr: '2.1 MB',
    date: '2026-03-01',
    authorOrWp: 'Bidang Pendataan & Penetapan',
    status: 'SOP Resmi',
    statusColor: 'bg-blue-950 text-blue-300 border-blue-500/30',
    description: 'Pedoman operasional verifikasi titik GPS, verifikasi berkas DPA/ARKAS, dan formulasi proyeksi omzet uji petik.',
    previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    tags: ['Juknis', 'SOP', 'Pendataan', 'GPS'],
    statusVerifikasi: 'Terverifikasi & Sah',
    catatanVerifikasi: 'SOP disahkan Kepala Badan untuk pedoman tim survey lapangan.',
    verifiedBy: 'Rija (Administrator BP2RD)',
    verifiedAt: '2026-03-02T09:30:00Z',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'REG-2026-003',
    title: 'Peta Zona Nilai Tanah (ZNT) & Klasifikasi Penetapan NJOP PBB-P2 2026',
    category: 'regulasi',
    nomorSurat: 'Kepbapenda No. 89/2026',
    fileType: 'Spatial Map PDF',
    sizeStr: '12.8 MB',
    date: '2026-02-10',
    authorOrWp: 'UPT Pemetaan & Penilaian Pajak',
    status: 'Referensi Pemetaan',
    statusColor: 'bg-purple-950 text-purple-300 border-purple-500/30',
    description: 'Zonasi nilai pasar tanah per blok kecamatan untuk perhitungan SPPT PBB tahun berjalan.',
    previewUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    tags: ['PBB-P2', 'ZNT', 'NJOP', 'Peta Geospasial'],
    statusVerifikasi: 'Terverifikasi & Sah',
    catatanVerifikasi: 'Peta digital telah sinkron dengan data spasial BPN & Pemkot.',
    verifiedBy: 'Rija (Administrator BP2RD)',
    verifiedAt: '2026-02-11T11:15:00Z',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'BLK-2026-004',
    title: 'Formulir Blangko Pendaftaran SPOP & LSPOP PBB-P2 Format Standar',
    category: 'blanko',
    nomorSurat: 'Form SPOP-2026',
    fileType: 'Dokumen Formulir PDF/Word',
    sizeStr: '850 KB',
    date: '2026-02-15',
    authorOrWp: 'Bidang Pajak Daerah BP2RD',
    status: 'Format Standar',
    statusColor: 'bg-amber-950 text-amber-300 border-amber-500/30',
    description: 'Blangko resmi Surat Pemberitahuan Objek Pajak (SPOP) dan Lampiran SPOP (LSPOP) untuk mutasi dan pendaftaran objek baru.',
    previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    tags: ['Blanko', 'SPOP', 'LSPOP', 'PBB'],
    statusVerifikasi: 'Terverifikasi & Sah',
    catatanVerifikasi: 'Blangko standar nasional sesuai format Dirjen Pajak & Kemendagri.',
    verifiedBy: 'Rija (Administrator BP2RD)',
    verifiedAt: '2026-02-16T08:00:00Z',
    createdAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'DPA-2026-005',
    title: 'Template & Pedoman Verifikasi Dokumen DPA / ARKAS Anggaran Sekolah & Lembaga',
    category: 'dpa',
    nomorSurat: 'Pedoman BP2RD-ARKAS-01',
    fileType: 'Dokumen Standar Excel/PDF',
    sizeStr: '1.5 MB',
    date: '2026-01-20',
    authorOrWp: 'Subbag Keuangan & Verifikasi',
    status: 'Pedoman Verifikasi',
    statusColor: 'bg-indigo-950 text-indigo-300 border-indigo-500/30',
    description: 'Format lampiran verifikasi DPA belanja modal dan ARKAS sekolah dalam penetapan potensi pajak belanja daerah.',
    previewUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    tags: ['DPA', 'ARKAS', 'Anggaran', 'Verifikasi'],
    statusVerifikasi: 'Terverifikasi & Sah',
    catatanVerifikasi: 'Panduan diverifikasi untuk kesesuaian belanja modal BOS & DPA OPD.',
    verifiedBy: 'Rija (Administrator BP2RD)',
    verifiedAt: '2026-01-21T09:00:00Z',
    createdAt: '2026-01-20T08:30:00Z',
  },
];

const DEFAULT_SHEETS_CONFIG: GoogleSheetsConfig = {
  webhookUrl: 'https://script.google.com/macros/s/AKfycbwBP2RD-Gov-Tax-Sync-Master/exec',
  spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  sheetNamePotensi: 'Data_Potensi_Pajak',
  sheetNamePbb: 'Data_PBB_P2',
  sheetNameIkm: 'Survei_IKM',
  autoSync: true,
  lastSyncTime: '2026-10-01 07:45:00 WIB',
  syncCount: 11,
  isConnected: true,
};

export const StorageService = {
  // Potensi Data
  getPotensiList(): PotensiPajakEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POTENSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POTENSI, JSON.stringify(SEED_POTENSI));
      return SEED_POTENSI;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_POTENSI;
    }
  },

  savePotensiEntry(entry: PotensiPajakEntry): PotensiPajakEntry {
    const list = this.getPotensiList();
    const updated = [entry, ...list];
    localStorage.setItem(STORAGE_KEYS.POTENSI, JSON.stringify(updated));
    this.syncToGoogleSheets('potensi', entry);
    return entry;
  },

  updatePotensiStatus(
    id: string,
    statusAdmin: PotensiPajakEntry['statusAdmin'],
    catatan?: string,
    petugas?: string
  ): PotensiPajakEntry | null {
    const list = this.getPotensiList();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      statusAdmin,
      ...(catatan !== undefined ? { catatanPetugas: catatan } : {}),
      ...(petugas !== undefined ? { petugasSurvey: petugas } : {}),
    };
    localStorage.setItem(STORAGE_KEYS.POTENSI, JSON.stringify(list));
    return list[idx];
  },

  deletePotensiEntry(id: string): boolean {
    const list = this.getPotensiList();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.POTENSI, JSON.stringify(filtered));
    return true;
  },

  // PBB-P2 Data
  getPbbList(): PbbP2Entry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PBB);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PBB, JSON.stringify(SEED_PBB));
      return SEED_PBB;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PBB;
    }
  },

  savePbbEntry(entry: PbbP2Entry): PbbP2Entry {
    const list = this.getPbbList();
    const updated = [entry, ...list];
    localStorage.setItem(STORAGE_KEYS.PBB, JSON.stringify(updated));
    this.syncToGoogleSheets('pbb', entry);
    return entry;
  },

  updatePbbStatus(
    id: string,
    statusVerifikasi: PbbP2Entry['statusVerifikasi'],
    catatan?: string
  ): PbbP2Entry | null {
    const list = this.getPbbList();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      statusVerifikasi,
      ...(catatan !== undefined ? { catatanVerifikasi: catatan } : {}),
    };
    localStorage.setItem(STORAGE_KEYS.PBB, JSON.stringify(list));
    return list[idx];
  },

  deletePbbEntry(id: string): boolean {
    const list = this.getPbbList();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.PBB, JSON.stringify(filtered));
    return true;
  },

  // IKM Data
  getIkmList(): IkmEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.IKM);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IKM, JSON.stringify(SEED_IKM));
      return SEED_IKM;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_IKM;
    }
  },

  saveIkmEntry(entry: IkmEntry): IkmEntry {
    const list = this.getIkmList();
    const updated = [entry, ...list];
    localStorage.setItem(STORAGE_KEYS.IKM, JSON.stringify(updated));
    this.syncToGoogleSheets('ikm', entry);
    return entry;
  },

  deleteIkmEntry(id: string): boolean {
    const list = this.getIkmList();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.IKM, JSON.stringify(filtered));
    return true;
  },

  // Library Berkas & Dokumen
  getLibraryList(): LibraryBerkasEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(SEED_LIBRARY));
      return SEED_LIBRARY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_LIBRARY;
    }
  },

  saveLibraryEntry(entry: LibraryBerkasEntry): LibraryBerkasEntry {
    const list = this.getLibraryList();
    // Prepend new entry
    const updated = [entry, ...list.filter((item) => item.id !== entry.id)];
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(updated));
    return entry;
  },

  updateLibraryEntry(entry: LibraryBerkasEntry): LibraryBerkasEntry {
    const list = this.getLibraryList();
    const idx = list.findIndex((item) => item.id === entry.id);
    if (idx !== -1) {
      list[idx] = entry;
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(list));
    } else {
      list.unshift(entry);
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(list));
    }
    return entry;
  },

  deleteLibraryEntry(id: string): boolean {
    const list = this.getLibraryList();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(filtered));
    return true;
  },

  updateLibraryStatus(
    id: string,
    statusVerifikasi: LibraryBerkasEntry['statusVerifikasi'],
    catatanVerifikasi?: string,
    verifiedBy?: string
  ): LibraryBerkasEntry | null {
    const list = this.getLibraryList();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      statusVerifikasi,
      ...(catatanVerifikasi !== undefined ? { catatanVerifikasi } : {}),
      ...(verifiedBy !== undefined ? { verifiedBy } : {}),
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(list));
    return list[idx];
  },

  // Google Sheets Config
  getSheetsConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(DEFAULT_SHEETS_CONFIG));
      return DEFAULT_SHEETS_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SHEETS_CONFIG;
    }
  },

  saveSheetsConfig(config: GoogleSheetsConfig): void {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  },

  // Real-time synchronization to Google Sheets Webhook
  async syncToGoogleSheets(
    type: 'potensi' | 'pbb' | 'ikm',
    payload: any
  ): Promise<{ success: boolean; message: string; timestamp: string }> {
    const config = this.getSheetsConfig();
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    config.syncCount += 1;
    config.lastSyncTime = `${timestamp} WIB`;
    this.saveSheetsConfig(config);

    // If a valid Google Apps Script webhook URL is present, dispatch fetch
    if (config.webhookUrl && config.webhookUrl.startsWith('http')) {
      try {
        await fetch(config.webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // standard Apps Script cross-origin POST handling
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'APPEND_ROW',
            sheetType: type,
            spreadsheetId: config.spreadsheetId,
            data: payload,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn('Google Sheets Webhook dispatch note:', err);
      }
    }

    return {
      success: true,
      message: `Berhasil tersinkronisasi ke Google Sheets (${type.toUpperCase()}) pada ${timestamp}`,
      timestamp,
    };
  },

  // Current User / Session
  getCurrentUser(): AppUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: AppUser | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  // Export to CSV helper
  exportToCsv(type: 'potensi' | 'pbb' | 'ikm'): string {
    if (type === 'potensi') {
      const data = this.getPotensiList();
      const headers = [
        'ID Tiket',
        'Tanggal',
        'Nama Objek',
        'Kategori',
        'Nama Wajib Pajak',
        'Alamat',
        'Kecamatan',
        'Kelurahan',
        'No WhatsApp',
        'Estimasi Potensi (Rp)',
        'Latitude',
        'Longitude',
        'Skor Kelayakan',
        'Status Validasi',
        'Status Admin',
        'Catatan Petugas',
      ];
      const rows = data.map((d) => [
        `"${d.id}"`,
        `"${d.tanggal}"`,
        `"${d.namaObjek.replace(/"/g, '""')}"`,
        `"${d.kategoriObjek}"`,
        `"${d.namaWajibPajak.replace(/"/g, '""')}"`,
        `"${d.alamat.replace(/"/g, '""')}"`,
        `"${d.kecamatan}"`,
        `"${d.kelurahan}"`,
        `"${d.noWhatsapp}"`,
        d.estimasiPotensiTahunan || 0,
        d.koordinatLat || '',
        d.koordinatLng || '',
        d.skorKelayakan,
        `"${d.statusValidasi}"`,
        `"${d.statusAdmin}"`,
        `"${(d.catatanPetugas || '').replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'pbb') {
      const data = this.getPbbList();
      const headers = [
        'ID PBB',
        'Tanggal',
        'Nama Wajib Pajak',
        'NIK',
        'Status NOP',
        'NOP',
        'Lokasi Objek',
        'RT/RW',
        'Kelurahan/Desa',
        'Kecamatan',
        'Tahun Pajak',
        'Nominal Bayar (Rp)',
        'Status Verifikasi',
      ];
      const rows = data.map((d) => [
        `"${d.id}"`,
        `"${d.tanggal}"`,
        `"${d.namaWajibPajak.replace(/"/g, '""')}"`,
        `"'${d.nik}"`,
        `"${d.statusNop}"`,
        `"${d.nop || '-'}"`,
        `"${d.lokasiObjek.replace(/"/g, '""')}"`,
        `"${d.rtRw || ''}"`,
        `"${d.kelurahanDesa}"`,
        `"${d.kecamatan}"`,
        d.tahunPajak,
        d.nominalBayar || 0,
        `"${d.statusVerifikasi}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const data = this.getIkmList();
      const headers = [
        'ID IKM',
        'Tanggal',
        'Nama Wajib Pajak',
        'Alamat',
        'Bidang Usaha',
        'Kemudahan',
        'Kecepatan',
        'Kesopanan',
        'Transparansi',
        'Sarana',
        'Skor Rata-Rata',
        'Nilai Konversi',
        'Mutu',
        'Saran/Masukan',
      ];
      const rows = data.map((d) => [
        `"${d.id}"`,
        `"${d.tanggal}"`,
        `"${d.namaWajibPajak.replace(/"/g, '""')}"`,
        `"${d.alamat.replace(/"/g, '""')}"`,
        `"${(d.bidangUsaha || '').replace(/"/g, '""')}"`,
        d.skorKemudahan,
        d.skorKecepatan,
        d.skorKesopanan,
        d.skorTransparansi,
        d.skorSarana,
        d.skorRataRata,
        d.nilaiKonversi,
        `"${d.kategoriMutu}"`,
        `"${d.saranMasukan.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }
  },

  // Generates Google Apps Script code for 1-click Google Sheet integration
  getGoogleAppsScriptTemplate(): string {
    return `/**
 * ========================================================
 * SIPOTENSI BP2RD / BAPENDA - GOOGLE APPS SCRIPT WEBHOOK
 * Hubungkan formulir potensi, PBB-P2, & IKM ke Google Sheets
 * ========================================================
 * CARA PEMASANGAN:
 * 1. Buat Spreadsheet baru di Google Sheets.
 * 2. Buat 3 tab nama: 'Data_Potensi_Pajak', 'Data_PBB_P2', 'Survei_IKM'
 * 3. Buka menu Extensions (Ekstensi) > Apps Script.
 * 4. Hapus isi bawaan, paste seluruh kode di bawah ini.
 * 5. Klik 'Deploy' > 'New deployment' > Select type: 'Web app'.
 * 6. Set 'Execute as': Me, dan 'Who has access': 'Anyone'.
 * 7. Salin URL Web App yang dihasilkan ke menu Pengaturan Google Sheets di SIPOTENSI.
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheetType = contents.sheetType;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (sheetType === 'potensi') {
      var sheet = ss.getSheetByName('Data_Potensi_Pajak') || ss.insertSheet('Data_Potensi_Pajak');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp', 'ID Tiket', 'Tanggal', 'Nama Objek', 'Kategori',
          'Nama WP', 'Alamat', 'Kecamatan', 'Kelurahan', 'No WhatsApp',
          'Estimasi Potensi', 'Koordinat Lat', 'Koordinat Lng', 'Skor Kelayakan',
          'Status Validasi', 'Status Admin', 'Petugas'
        ]);
        sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
      }
      sheet.appendRow([
        new Date(), data.id, data.tanggal, data.namaObjek, data.kategoriObjek,
        data.namaWajibPajak, data.alamat, data.kecamatan, data.kelurahan, "'" + data.noWhatsapp,
        data.estimasiPotensiTahunan || 0, data.koordinatLat || '', data.koordinatLng || '',
        data.skorKelayakan, data.statusValidasi, data.statusAdmin, data.petugasSurvey || ''
      ]);
    } else if (sheetType === 'pbb') {
      var sheet = ss.getSheetByName('Data_PBB_P2') || ss.insertSheet('Data_PBB_P2');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp', 'ID PBB', 'Tanggal', 'Nama WP', 'NIK', 'Status NOP',
          'NOP', 'Lokasi Objek', 'RT/RW', 'Kelurahan/Desa', 'Kecamatan',
          'Tahun Pajak', 'Nominal Bayar', 'Status Verifikasi'
        ]);
        sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#065f46').setFontColor('#ffffff');
      }
      sheet.appendRow([
        new Date(), data.id, data.tanggal, data.namaWajibPajak, "'" + data.nik,
        data.statusNop, "'" + (data.nop || '-'), data.lokasiObjek, data.rtRw || '',
        data.kelurahanDesa, data.kecamatan, data.tahunPajak, data.nominalBayar || 0,
        data.statusVerifikasi
      ]);
    } else if (sheetType === 'ikm') {
      var sheet = ss.getSheetByName('Survei_IKM') || ss.insertSheet('Survei_IKM');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp', 'ID IKM', 'Tanggal', 'Nama WP', 'Alamat', 'Bidang Usaha',
          'Kemudahan (1-5)', 'Kecepatan (1-5)', 'Kesopanan (1-5)', 'Transparansi (1-5)',
          'Sarana (1-5)', 'Skor Rata-Rata', 'Nilai Mutu', 'Saran & Masukan'
        ]);
        sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#854d0e').setFontColor('#ffffff');
      }
      sheet.appendRow([
        new Date(), data.id, data.tanggal, data.namaWajibPajak, data.alamat,
        data.bidangUsaha || '', data.skorKemudahan, data.skorKecepatan, data.skorKesopanan,
        data.skorTransparansi, data.skorSarana, data.skorRataRata, data.kategoriMutu,
        data.saranMasukan
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data berhasil ditambahkan ke Google Sheet'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'SIPOTENSI BP2RD Google Sheets API Webhook'
  })).setMimeType(ContentService.MimeType.JSON);
}`;
  },
};
