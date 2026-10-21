import { PotensiPajakEntry, PbbP2Entry, LibraryBerkasEntry, AppUser, RetribusiDaerahEntry } from '../types';

export const CURRENT_USER_KEY = 'sipotensi_current_user';
export const POTENSI_KEY = 'sipotensi_potensi_list';
export const PBB_KEY = 'sipotensi_pbb_list';
export const LIBRARY_KEY = 'sipotensi_library_list';
export const RETRIBUSI_KEY = 'sipotensi_retribusi_list';

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

export const INITIAL_POTENSI_DATA: PotensiPajakEntry[] = [
  {
    id: 'pot-001',
    nomorFormulir: 'FORM-POT/2026/03/001',
    tanggalPendataan: '2026-03-12',
    namaWajibPajak: 'Haji Mansyur (RM Wong Solo Amuntai)',
    npwpd: 'P.2.0019283.08.2024',
    namaUsaha: 'Restoran Wong Solo Amuntai & Catering',
    jenisPajak: 'Pajak Restoran / PBJT Makanan & Minuman',
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Murung Sari',
    alamatLengkap: 'Jl. Basuki Rahmat No. 45, Depan Taman Putri Junjung Buih',
    latitude: -2.424458,
    longitude: 115.247231,
    akurasiGps: 6,
    potensiRupiahBulanan: 14500000,
    potensiRupiahTahunan: 174000000,
    statusVerifikasi: 'Setuju',
    verifiedBy: 'Rija, S.STP, M.IP (Kabid Pendataan)',
    verifiedAt: '2026-03-13T10:00:00Z',
    catatanVerifikasi: 'Hasil survei dan potensi omzet telah diverifikasi akurat dan disetujui.',
    petugasPendata: 'Ahmad Faisal, S.AP',
    catatanPetugas: 'Omzet bulanan stabil 145 juta, potensi pajak 10% PBJT terealisasi tertib.',
    createdAt: '2026-03-12T08:30:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: 'pot-002',
    nomorFormulir: 'FORM-POT/2026/03/002',
    tanggalPendataan: '2026-03-15',
    namaWajibPajak: 'PT Borneo Reklame Media Pratama',
    npwpd: 'P.1.0028192.08.2023',
    namaUsaha: 'Billboard Raksasa Bundaran Patung Itik Amuntai',
    jenisPajak: 'Pajak Reklame',
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Antasari',
    alamatLengkap: 'Simpang Empat Bundaran Itik Amuntai',
    latitude: -2.421500,
    longitude: 115.249200,
    akurasiGps: 4,
    potensiRupiahBulanan: 4800000,
    potensiRupiahTahunan: 57600000,
    statusVerifikasi: 'Verifikasi',
    verifiedBy: 'Ahmad Faisal, S.AP (Petugas Tim I)',
    verifiedAt: '2026-03-16T11:00:00Z',
    catatanVerifikasi: 'Sedang dalam proses verifikasi dimensi papan dan sudut pandang ruas jalan protokol.',
    petugasPendata: 'Rija, S.STP, M.IP',
    catatanPetugas: 'Ukuran 8x4 meter dua muka vertikal, penayangan produk telekomunikasi komersial.',
    createdAt: '2026-03-15T09:15:00Z',
    updatedAt: '2026-03-16T11:00:00Z',
  },
  {
    id: 'pot-003',
    nomorFormulir: 'FORM-POT/2026/03/018',
    tanggalPendataan: '2026-03-20',
    namaWajibPajak: 'Hj. Mardiah (Pusat Kerajinan Anyaman Purun)',
    npwpd: 'P.2.0039482.08.2025',
    namaUsaha: 'Sentra Grosir Hasil Kerajinan & Bebek Alabio',
    jenisPajak: 'Pajak Restoran / PBJT Makanan & Minuman',
    kecamatan: 'Kecamatan Sungai Pandan (Alabio)',
    kelurahanDesa: 'Alabio Pasar',
    alamatLengkap: 'Kawasan Pasar Alabio RT 03 No. 12',
    latitude: -2.482345,
    longitude: 115.187654,
    akurasiGps: 8,
    potensiRupiahBulanan: 6200000,
    potensiRupiahTahunan: 74400000,
    statusVerifikasi: 'Menunggu Verifikasi',
    petugasPendata: 'Ahmad Faisal, S.AP',
    catatanPetugas: 'Sentra usaha kuliner itik khas Alabio dan pusat oleh-oleh kerajinan HSU.',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'pot-004',
    nomorFormulir: 'FORM-POT/2026/03/025',
    tanggalPendataan: '2026-03-24',
    namaWajibPajak: 'Pengelola Wisata Rawa Kerbau Danau Panggang',
    npwpd: 'P.3.0048123.08.2025',
    namaUsaha: 'Resto Terapung Danau Panggang & Wisata Rawa',
    jenisPajak: 'Pajak Hiburan / Jasa Kesenian',
    kecamatan: 'Kecamatan Danau Panggang',
    kelurahanDesa: 'Danau Panggang',
    alamatLengkap: 'Dermaga Wisata Danau Panggang RT 02',
    latitude: -2.498765,
    longitude: 115.098432,
    akurasiGps: 10,
    potensiRupiahBulanan: 3500000,
    potensiRupiahTahunan: 42000000,
    statusVerifikasi: 'Menunggu Verifikasi',
    petugasPendata: 'Siti Nurhaliza, A.Md',
    catatanPetugas: 'Pengembangan objek wisata unggulan kerbau rawa HSU, verifikasi intensitas kunjungan.',
    createdAt: '2026-03-24T14:20:00Z',
    updatedAt: '2026-03-24T14:20:00Z',
  },
  {
    id: 'pot-005',
    nomorFormulir: 'FORM-POT/2026/03/031',
    tanggalPendataan: '2026-03-28',
    namaWajibPajak: 'Hotel Bersaudara Amuntai',
    npwpd: 'P.4.0051289.08.2023',
    namaUsaha: 'Hotel & Penginapan Bersaudara HSU',
    jenisPajak: 'Pajak Hotel / Jasa Perhotelan',
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Kebun Sari',
    alamatLengkap: 'Jl. Ahmad Yani No. 88, Amuntai',
    latitude: -2.423100,
    longitude: 115.245800,
    akurasiGps: 5,
    potensiRupiahBulanan: 18500000,
    potensiRupiahTahunan: 222000000,
    statusVerifikasi: 'Setuju',
    verifiedBy: 'Rija, S.STP, M.IP (Kabid Pendataan)',
    verifiedAt: '2026-03-29T09:00:00Z',
    catatanVerifikasi: 'Ketetapan potensi jasa perhotelan telah disetujui sesuai tarif perda.',
    petugasPendata: 'Rija, S.STP, M.IP',
    catatanPetugas: 'Memiliki 32 kamar aktif, tingkat okupansi rata-rata 68% per bulan.',
    fotoObjekUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    fotoObjekName: 'Foto_Fisik_Hotel_Bersaudara_Amuntai.jpg',
    fotoObjekSize: '2.4 MB',
    dpaFileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    dpaFileName: 'DPA_Kertas_Kerja_Hotel_Bersaudara_2026.pdf',
    dpaFileSize: '1.2 MB',
    createdAt: '2026-03-28T11:40:00Z',
    updatedAt: '2026-03-29T09:00:00Z',
  },
];

export const INITIAL_PBB_DATA: PbbP2Entry[] = [
  {
    id: 'pbb-001',
    nop: '63.08.010.001.002-0045.0',
    tahunPajak: 2026,
    namaWajibPajak: 'H. Rusliansyah, S.Pd',
    nikWajibPajak: '6308011204780001',
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Murung Sari',
    alamatObjek: 'Jl. Empu Jatmika No. 14 RT 04, Amuntai',
    luasBumiM2: 450,
    njopBumiPerM2: 850000,
    kelasBumi: 'A35',
    totalNjopBumi: 382500000,
    luasBangunanM2: 240,
    njopBangunanPerM2: 1200000,
    kelasBangunan: 'B12',
    totalNjopBangunan: 288000000,
    njopTotal: 670500000,
    njoptkp: 10000000,
    njopKenaPajak: 660500000,
    tarifPbbPersen: 0.15,
    stimulusPengurangan: 0,
    dendaAdministrasi: 0,
    totalPbbHarusDibayar: 990750,
    pbbTerhutang: 990750,
    statusPembayaran: 'LUNAS',
    statusVerifikasi: 'Setuju',
    verifiedBy: 'Rija, S.STP, M.IP',
    verifiedAt: '2026-03-11T10:00:00Z',
    catatanVerifikasi: 'Ketetapan PBB dan bukti bayar lunas Bank Kalsel telah diverifikasi dan disetujui.',
    tanggalBayar: '2026-03-10',
    bankTempatBayar: 'Bank Kalsel Cabang Amuntai',
    nomorStruk: 'STRUK-BKS/HSU/2026/03/4982',
    strukBayarUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    strukBayarName: 'Struk_Bayar_Lunas_Bank_Kalsel_4982.pdf',
    fotoObjekPbbUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    fotoObjekPbbName: 'Foto_Persil_Rumah_Empu_Jatmika.jpg',
    fotoObjekPbbSize: '1.8 MB',
    latitude: -2.425120,
    longitude: 115.246890,
    akurasiGps: 5,
    petugasValidasi: 'Rija, S.STP, M.IP',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-11T10:00:00Z',
  },
  {
    id: 'pbb-002',
    nop: '63.08.020.003.001-0112.0',
    tahunPajak: 2026,
    namaWajibPajak: 'Hj. Masitah',
    nikWajibPajak: '6308024508820003',
    kecamatan: 'Kecamatan Amuntai Utara',
    kelurahanDesa: 'Pakacangan',
    alamatObjek: 'Jl. Trans Kalimantan RT 02, Pakacangan',
    luasBumiM2: 600,
    njopBumiPerM2: 420000,
    kelasBumi: 'A38',
    totalNjopBumi: 252000000,
    luasBangunanM2: 180,
    njopBangunanPerM2: 890000,
    kelasBangunan: 'B14',
    totalNjopBangunan: 160200000,
    njopTotal: 412200000,
    njoptkp: 10000000,
    njopKenaPajak: 402200000,
    tarifPbbPersen: 0.15,
    stimulusPengurangan: 0,
    dendaAdministrasi: 0,
    totalPbbHarusDibayar: 603300,
    pbbTerhutang: 603300,
    statusPembayaran: 'LUNAS',
    statusVerifikasi: 'Verifikasi',
    verifiedBy: 'Ahmad Faisal, S.AP',
    verifiedAt: '2026-03-19T09:30:00Z',
    catatanVerifikasi: 'Pengecekan slip setoran Pos Indonesia dan pemutakhiran data wajib pajak.',
    tanggalBayar: '2026-03-18',
    bankTempatBayar: 'Pos Indonesia Amuntai',
    nomorStruk: 'STRUK-POS/HSU/2026/03/1182',
    latitude: -2.378912,
    longitude: 115.263445,
    akurasiGps: 6,
    petugasValidasi: 'Ahmad Faisal, S.AP',
    createdAt: '2026-03-18T10:30:00Z',
    updatedAt: '2026-03-19T09:30:00Z',
  },
  {
    id: 'pbb-003',
    nop: '63.08.040.002.004-0078.0',
    tahunPajak: 2026,
    namaWajibPajak: 'Koperasi Usaha Bersama Alabio',
    nikWajibPajak: '6308041005750002',
    kecamatan: 'Kecamatan Sungai Pandan (Alabio)',
    kelurahanDesa: 'Pandulangan',
    alamatObjek: 'Jl. Kebun Purun RT 01, Alabio',
    luasBumiM2: 1200,
    njopBumiPerM2: 350000,
    kelasBumi: 'A39',
    totalNjopBumi: 420000000,
    luasBangunanM2: 380,
    njopBangunanPerM2: 950000,
    kelasBangunan: 'B13',
    totalNjopBangunan: 361000000,
    njopTotal: 781000000,
    njoptkp: 10000000,
    njopKenaPajak: 771000000,
    tarifPbbPersen: 0.15,
    stimulusPengurangan: 0,
    dendaAdministrasi: 0,
    totalPbbHarusDibayar: 1156500,
    pbbTerhutang: 1156500,
    statusPembayaran: 'BELUM LUNAS',
    statusVerifikasi: 'Menunggu Verifikasi',
    latitude: -2.482345,
    longitude: 115.187654,
    akurasiGps: 8,
    petugasValidasi: 'Siti Nurhaliza, A.Md',
    createdAt: '2026-03-22T13:45:00Z',
    updatedAt: '2026-03-22T13:45:00Z',
  },
  {
    id: 'pbb-004',
    nop: '63.08.050.001.003-0091.0',
    tahunPajak: 2026,
    namaWajibPajak: 'Drs. H. M. Arsyad',
    nikWajibPajak: '6308051909650001',
    kecamatan: 'Kecamatan Danau Panggang',
    kelurahanDesa: 'Danau Panggang',
    alamatObjek: 'Jl. Dermaga Rawa No. 05 RT 03',
    luasBumiM2: 520,
    njopBumiPerM2: 280000,
    kelasBumi: 'A40',
    totalNjopBumi: 145600000,
    luasBangunanM2: 150,
    njopBangunanPerM2: 750000,
    kelasBangunan: 'B15',
    totalNjopBangunan: 112500000,
    njopTotal: 258100000,
    njoptkp: 10000000,
    njopKenaPajak: 248100000,
    tarifPbbPersen: 0.15,
    stimulusPengurangan: 0,
    dendaAdministrasi: 0,
    totalPbbHarusDibayar: 372150,
    pbbTerhutang: 372150,
    statusPembayaran: 'LUNAS',
    statusVerifikasi: 'Setuju',
    verifiedBy: 'Siti Nurhaliza, A.Md',
    verifiedAt: '2026-03-27T14:00:00Z',
    catatanVerifikasi: 'Objek persil dan ketetapan lunas Bank Kalsel Danau Panggang terverifikasi disetujui.',
    tanggalBayar: '2026-03-27',
    bankTempatBayar: 'Bank Kalsel Unit Danau Panggang',
    nomorStruk: 'STRUK-BKS/DPG/2026/03/0073',
    latitude: -2.498765,
    longitude: 115.098432,
    akurasiGps: 7,
    petugasValidasi: 'Siti Nurhaliza, A.Md',
    createdAt: '2026-03-27T08:15:00Z',
    updatedAt: '2026-03-27T14:00:00Z',
  },
];

export const INITIAL_LIBRARY_DATA: LibraryBerkasEntry[] = [
  // 1. KATEGORI REGULASI (TAMPIL DI LANDING PAGE / PUBLIK)
  {
    id: 'lib-reg-01',
    title: 'Peraturan Daerah Kab. Hulu Sungai Utara No. 01 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah',
    category: 'regulasi',
    categoryLabel: 'Perda dan Regulasi',
    nomorBerkas: 'PERDA-HSU/01/2024',
    description: 'Payung hukum fundamental pemungutan Pajak Daerah (PBB-P2, BPHTB, PBJT, Reklame, Air Tanah, MBLB) dan Retribusi Daerah terintegrasi UU HKPD.',
    fileName: 'Perda_HSU_No_01_2024_PDRD.pdf',
    fileSize: '4.8 MB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'BP2RD HSU Official',
    uploadedRole: 'admin',
    tanggalUpload: '2026-01-15',
    statusVerifikasi: 'Aktif',
    tags: ['Perda', 'PDRD', 'Regulasi Utama', 'Hukum'],
  },
  {
    id: 'lib-reg-02',
    title: 'Peraturan Bupati Hulu Sungai Utara tentang Tata Cara Pemungutan dan Pengelolaan PBB Perdesaan dan Perkotaan (PBB-P2)',
    category: 'regulasi',
    categoryLabel: 'Perda dan Regulasi',
    nomorBerkas: 'PERBUP-HSU/18/2024',
    description: 'Pedoman teknis penetapan NJOP, penerbitan SPPT, mekanisme keberatan, dan pelimpahan insentif pemungutan PBB-P2 ke desa/kelurahan.',
    fileName: 'Perbup_HSU_Tata_Cara_PBB_P2.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'Bagian Hukum & BP2RD HSU',
    uploadedRole: 'admin',
    tanggalUpload: '2026-02-01',
    statusVerifikasi: 'Aktif',
    tags: ['Perbup', 'PBB-P2', 'Tata Cara'],
  },
  {
    id: 'lib-reg-03',
    title: 'Instruksi Bupati HSU tentang Optimalisasi Penerimaan Asli Daerah (PAD) dan Penilaian Potensi Pajak Lapangan',
    category: 'regulasi',
    categoryLabel: 'Perda dan Regulasi',
    nomorBerkas: 'INBUP-HSU/04/2025',
    description: 'Instruksi percepatan digitalisasi pajak daerah, pendataan potensi geospasial di 10 kecamatan, dan kolaborasi aparat desa.',
    fileName: 'Instruksi_Bupati_PAD_HSU_2025.pdf',
    fileSize: '1.2 MB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'Sekretariat Daerah HSU',
    uploadedRole: 'admin',
    tanggalUpload: '2026-02-10',
    statusVerifikasi: 'Aktif',
    tags: ['Inbup', 'Optimalisasi PAD', 'Survei Lapangan'],
  },

  // 2. KATEGORI SOP & JUKNIS (TAMPIL DI LANDING PAGE / PUBLIK)
  {
    id: 'lib-sop-01',
    title: 'SOP Pendataan dan Pemetaan Titik Koordinat Geospasial Objek Pajak Baru BP2RD HSU',
    category: 'sop',
    categoryLabel: 'SOP & Juknis',
    nomorBerkas: 'SOP/BP2RD-HSU/BID-I/001',
    description: 'Standar operasional prosedur survei lapangan tim surveyor, perekaman titik koordinat GPS akurasi <10 meter, dan verifikasi foto objek.',
    fileName: 'SOP_Pendataan_Geospasial_Pajak_HSU.pdf',
    fileSize: '3.1 MB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'Bidang Pendataan & Penilaian',
    uploadedRole: 'admin',
    tanggalUpload: '2026-02-14',
    statusVerifikasi: 'Aktif',
    tags: ['SOP', 'Geospasial', 'GPS Lapangan', 'Surveyor'],
  },
  {
    id: 'lib-sop-02',
    title: 'Petunjuk Teknis Verifikasi dan Validasi Data Piutang PBB-P2 Berbasis Wilayah Desa/Kelurahan',
    category: 'sop',
    categoryLabel: 'SOP & Juknis',
    nomorBerkas: 'JUKNIS/BP2RD-HSU/2026/007',
    description: 'Pedoman penyisiran SPPT PBB-P2 tidak terdistribusi, pemutakhiran NOP ganda, dan prosedur cleansing data wajib pajak.',
    fileName: 'Juknis_Validasi_PBB_P2_Desa_HSU.pdf',
    fileSize: '1.9 MB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'Tim Data & IT BP2RD HSU',
    uploadedRole: 'admin',
    tanggalUpload: '2026-02-20',
    statusVerifikasi: 'Aktif',
    tags: ['Juknis', 'Validasi', 'Piutang PBB', 'Cleansing'],
  },

  // 3. KATEGORI FORMULIR BLANKO (TAMPIL DI LANDING PAGE / PUBLIK)
  {
    id: 'lib-blk-01',
    title: 'Blanko Formulir SPOP (Surat Pemberitahuan Objek Pajak) & LSPOP PBB-P2 Resmi Kab. HSU',
    category: 'blanko',
    categoryLabel: 'Formulir Blanko',
    nomorBerkas: 'FORM-BLANKO/SPOP/HSU-2026',
    description: 'Format cetak resmi pengisian data subjek pajak, objek tanah, dan rincian komponen bangunan untuk pendaftaran NOP baru / mutasi.',
    fileName: 'Blanko_Resmi_SPOP_LSPOP_HSU_2026.pdf',
    fileSize: '850 KB',
    fileType: 'pdf',
    isPublic: true,
    uploadedBy: 'Loket Pelayanan BP2RD HSU',
    uploadedRole: 'admin',
    tanggalUpload: '2026-01-20',
    statusVerifikasi: 'Aktif',
    tags: ['Blanko', 'SPOP', 'LSPOP', 'PBB-P2'],
  },
  {
    id: 'lib-blk-02',
    title: 'Blanko Surat Permohonan Pengurangan / Keringanan Ketetapan PBB-P2 Wajib Pajak Tidak Mampu',
    category: 'blanko',
    categoryLabel: 'Formulir Blanko',
    nomorBerkas: 'FORM-BLANKO/KERINGANAN-PBB/2026',
    description: 'Formulir permohonan stimulus dan keringanan pembayaran PBB-P2 untuk pensiunan, lahan pertanian rawa, dan masyarakat berpenghasilan rendah.',
    fileName: 'Formulir_Permohonan_Keringanan_PBB_HSU.doc',
    fileSize: '420 KB',
    fileType: 'doc',
    isPublic: true,
    uploadedBy: 'Subbid Keberatan & Banding',
    uploadedRole: 'admin',
    tanggalUpload: '2026-01-22',
    statusVerifikasi: 'Aktif',
    tags: ['Blanko', 'Keringanan', 'Permohonan'],
  },

  // 4. KATEGORI DPA / ARKAS (KHUSUS ADMIN & USER LOGGED IN - TIDAK TAMPIL DI LANDING PAGE)
  {
    id: 'lib-dpa-01',
    title: 'Dokumen Pelaksanaan Anggaran (DPA) BP2RD Program Pengelolaan Pendapatan Daerah TA 2026',
    category: 'dpa',
    categoryLabel: 'DPA / ARKAS Internal',
    nomorBerkas: 'DPA/A.1/5.02.0.00.0.00.01.0000/001/2026',
    description: 'Alokasi pagu belanja operasional pendataan potensi lapangan, survei geospasial, dan insentif pemungutan pajak daerah Kab. HSU.',
    fileName: 'DPA_BP2RD_HSU_TA_2026_Full.pdf',
    fileSize: '8.5 MB',
    fileType: 'pdf',
    isPublic: false,
    uploadedBy: 'Kasubag Perencanaan BP2RD HSU',
    uploadedRole: 'admin',
    tanggalUpload: '2026-01-08',
    statusVerifikasi: 'Aktif',
    tags: ['DPA', 'Anggaran', 'Internal', 'Bapenda HSU'],
  },
  {
    id: 'lib-dpa-02',
    title: 'Rincian Kertas Kerja Anggaran Kas (ARKAS) Kegiatan Pemeliharaan Sistem & GPS Geospasial',
    category: 'dpa',
    categoryLabel: 'DPA / ARKAS Internal',
    nomorBerkas: 'ARKAS/BP2RD-HSU/SUB-IT/2026',
    description: 'Jadwal penyerapan triwulanan operasional GPS handheld surveyor dan infrastruktur cloud SIPOTENSI HSU.',
    fileName: 'ARKAS_IT_Geospasial_2026.xlsx',
    fileSize: '1.4 MB',
    fileType: 'xlsx',
    isPublic: false,
    uploadedBy: 'Bendahara Pengeluaran BP2RD',
    uploadedRole: 'admin',
    tanggalUpload: '2026-01-10',
    statusVerifikasi: 'Aktif',
    tags: ['ARKAS', 'RKA', 'Internal'],
  },

  // 5. KATEGORI FOTO OBJEK (KHUSUS ADMIN & USER LOGGED IN - TIDAK TAMPIL DI LANDING PAGE)
  {
    id: 'lib-obj-01',
    title: 'Dokumentasi Visual Fisik Titik Reklame Komersial Kawasan Bundaran Itik Amuntai Tengah',
    category: 'objek',
    categoryLabel: 'Foto Objek Pajak',
    nomorBerkas: 'DOK-OBJ/REK/001-AMT',
    description: 'Foto sudut pandang barat & selatan billboard 8x4m PT Borneo Reklame, koordinat presisi (-2.421500, 115.249200).',
    fileName: 'Foto_Fisik_Billboard_Bundaran_Itik.jpg',
    fileSize: '3.2 MB',
    fileType: 'image',
    isPublic: false,
    uploadedBy: 'Ahmad Faisal, S.AP',
    uploadedRole: 'user',
    tanggalUpload: '2026-03-15',
    statusVerifikasi: 'Aktif',
    tags: ['Foto Objek', 'Reklame', 'Amuntai Tengah', 'Survei'],
  },
  {
    id: 'lib-obj-02',
    title: 'Foto Fisik Objek Pajak Restoran & Kuliner Tradisional Kawasan Sentra Pasar Alabio',
    category: 'objek',
    categoryLabel: 'Foto Objek Pajak',
    nomorBerkas: 'DOK-OBJ/PBJT/018-ALB',
    description: 'Foto bangunan dan kapasitas tempat duduk RM Itik Alabio, koordinat presisi (-2.482345, 115.187654).',
    fileName: 'Foto_RM_Itik_Alabio_Sentra.jpg',
    fileSize: '2.8 MB',
    fileType: 'image',
    isPublic: false,
    uploadedBy: 'Ahmad Faisal, S.AP',
    uploadedRole: 'user',
    tanggalUpload: '2026-03-20',
    statusVerifikasi: 'Aktif',
    tags: ['Foto Objek', 'Restoran', 'Sungai Pandan', 'Alabio'],
  },

  // 6. KATEGORI STRUK BAYAR PBB (KHUSUS ADMIN & USER LOGGED IN - TIDAK TAMPIL DI LANDING PAGE)
  {
    id: 'lib-pbb-01',
    title: 'Arsip Struk Pembayaran Sah PBB-P2 Bank Kalsel NOP: 63.08.010.001.002-0045.0 (H. Rusliansyah)',
    category: 'pbb',
    categoryLabel: 'Struk Bayar PBB-P2',
    nomorBerkas: 'STRUK-BKS/HSU/2026/03/4982',
    description: 'Bukti validasi kas daerah penerimaan PBB-P2 Rp 835.250,- tercatat realtime di sistem rekonsiliasi.',
    fileName: 'Struk_Validasi_BankKalsel_4982.pdf',
    fileSize: '650 KB',
    fileType: 'pdf',
    isPublic: false,
    uploadedBy: 'Rija, S.STP, M.IP',
    uploadedRole: 'admin',
    tanggalUpload: '2026-03-10',
    statusVerifikasi: 'Aktif',
    tags: ['Struk PBB', 'Bank Kalsel', 'Lunas', 'Validasi'],
  },
  {
    id: 'lib-pbb-02',
    title: 'Bukti Setor Kolektif PBB-P2 Desa Pakacangan Amuntai Utara Periode Triwulan I 2026',
    category: 'pbb',
    categoryLabel: 'Struk Bayar PBB-P2',
    nomorBerkas: 'STRUK-KOL/PKC/TW1-2026',
    description: 'Rekapitulasi setoran tunai 42 wajib pajak desa Pakacangan melalui mobil layanan keliling BP2RD HSU.',
    fileName: 'Setoran_Kolektif_Pakacangan_TW1.pdf',
    fileSize: '1.7 MB',
    fileType: 'pdf',
    isPublic: false,
    uploadedBy: 'Siti Nurhaliza, A.Md',
    uploadedRole: 'user',
    tanggalUpload: '2026-03-26',
    statusVerifikasi: 'Aktif',
    tags: ['Struk PBB', 'Kolektif', 'Desa Pakacangan'],
  },
];

// Helper functions for LocalStorage management
export function loadPotensiList(): PotensiPajakEntry[] {
  try {
    const raw = localStorage.getItem(POTENSI_KEY);
    if (!raw) {
      localStorage.setItem(POTENSI_KEY, JSON.stringify(INITIAL_POTENSI_DATA));
      return INITIAL_POTENSI_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading potensi list:', e);
    return INITIAL_POTENSI_DATA;
  }
}

export function savePotensiList(data: PotensiPajakEntry[]) {
  try {
    localStorage.setItem(POTENSI_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving potensi list:', e);
  }
}

export function loadPbbList(): PbbP2Entry[] {
  try {
    const raw = localStorage.getItem(PBB_KEY);
    if (!raw) {
      localStorage.setItem(PBB_KEY, JSON.stringify(INITIAL_PBB_DATA));
      return INITIAL_PBB_DATA;
    }
    const parsed: PbbP2Entry[] = JSON.parse(raw);
    const updated = parsed.map(item => {
      const matchInit = INITIAL_PBB_DATA.find(i => i.id === item.id);
      if (matchInit && (!item.totalNjopBumi || !item.kelasBumi)) {
        return {
          ...matchInit,
          ...item,
          kelasBumi: item.kelasBumi || matchInit.kelasBumi,
          totalNjopBumi: item.totalNjopBumi || (item.luasBumiM2 * item.njopBumiPerM2),
          kelasBangunan: item.kelasBangunan || matchInit.kelasBangunan,
          totalNjopBangunan: item.totalNjopBangunan || (item.luasBangunanM2 * item.njopBangunanPerM2),
          njoptkp: item.njoptkp ?? matchInit.njoptkp,
          njopKenaPajak: item.njopKenaPajak ?? Math.max(0, item.njopTotal - (matchInit.njoptkp || 10000000)),
          tarifPbbPersen: item.tarifPbbPersen ?? matchInit.tarifPbbPersen,
          pbbTerhutang: matchInit.pbbTerhutang || item.pbbTerhutang,
          totalPbbHarusDibayar: matchInit.totalPbbHarusDibayar || item.pbbTerhutang,
        };
      }
      return item;
    });
    return updated;
  } catch (e) {
    console.error('Error loading pbb list:', e);
    return INITIAL_PBB_DATA;
  }
}

export function savePbbList(data: PbbP2Entry[]) {
  try {
    localStorage.setItem(PBB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving pbb list:', e);
  }
}

export function loadLibraryList(): LibraryBerkasEntry[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(INITIAL_LIBRARY_DATA));
      return INITIAL_LIBRARY_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading library list:', e);
    return INITIAL_LIBRARY_DATA;
  }
}

export function saveLibraryList(data: LibraryBerkasEntry[]) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving library list:', e);
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

export const INITIAL_RETRIBUSI_DATA: RetribusiDaerahEntry[] = [
  {
    id: 'ret-001',
    nomorRegister: 'REG-RET/2026/04/001',
    tanggalPendataan: '2026-04-02',
    golonganRetribusi: 'Retribusi Jasa Umum',
    subRekening: 'Retribusi Pelayanan Pasar',
    subObjekRetribusi: 'Pasar Induk Amuntai',
    keterangan: 'Perekaman potensi kios sembako & los pedagang sayur/ikan di blok A Pasar Induk Amuntai.',
    namaPengelola: 'UPTD Pasar Amuntai & Paguyuban Pedagang',
    tarifSatuan: 150000,
    jumlahSatuan: 120,
    satuanTarif: 'Per Kios/Bulan',
    potensiPerbulan: 18000000,
    potensiPertahun: 216000000,
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Murung Sari',
    alamatLengkap: 'Jl. Basuki Rahmat, Kawasan Pasar Induk Amuntai',
    latitude: -2.425100,
    longitude: 115.246800,
    akurasiGps: 5,
    statusVerifikasi: 'Setuju',
    petugasPendata: 'Rija, S.STP, M.IP',
    fotoObjekRetribusiUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    fotoObjekRetribusiName: 'Foto_Fisik_Kios_Pasar_Induk_Amuntai.jpg',
    fotoObjekRetribusiSize: '2.1 MB',
    verifiedBy: 'Rija, S.STP, M.IP (BP2RD HSU)',
    verifiedAt: '2026-04-03T09:00:00Z',
    catatanVerifikasi: 'Potensi retribusi pelayanan pasar telah diverifikasi sesuai Perda HSU No. 1/2024.',
    createdAt: '2026-04-02T08:30:00Z',
    updatedAt: '2026-04-03T09:00:00Z',
  },
  {
    id: 'ret-002',
    nomorRegister: 'REG-RET/2026/04/002',
    tanggalPendataan: '2026-04-05',
    golonganRetribusi: 'Retribusi Jasa Usaha',
    subRekening: 'Retribusi Tempat Khusus Parkir / Terminal',
    subObjekRetribusi: 'Terminal Palampitan',
    keterangan: 'Karcis retribusi parkir kendaraan angkutan pedesaan, bus antarkota, dan penitipan kendaraan Terminal Palampitan.',
    namaPengelola: 'Dishub Kab. HSU & Pengelola Terminal',
    tarifSatuan: 5000,
    jumlahSatuan: 80,
    satuanTarif: 'Per Kendaraan/Hari',
    potensiPerbulan: 12000000,
    potensiPertahun: 144000000,
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Palampitan Hulu',
    alamatLengkap: 'Jl. Pembalacatan, Kompleks Terminal Tipe C Palampitan',
    latitude: -2.431200,
    longitude: 115.253400,
    akurasiGps: 6,
    statusVerifikasi: 'Verifikasi',
    petugasPendata: 'Ahmad Faisal, S.AP',
    verifiedBy: 'Ahmad Faisal, S.AP',
    verifiedAt: '2026-04-06T10:00:00Z',
    catatanVerifikasi: 'Data arus harian kendaraan sedang direkonsiliasi dengan Dinas Perhubungan HSU.',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-06T10:00:00Z',
  },
  {
    id: 'ret-003',
    nomorRegister: 'REG-RET/2026/04/003',
    tanggalPendataan: '2026-04-08',
    golonganRetribusi: 'Retribusi Jasa Usaha',
    subRekening: 'Retribusi Pemanfaatan Barang Milik Daerah',
    subObjekRetribusi: 'Rumah Dinas',
    keterangan: 'Sewa pemanfaatan rumah dinas tipe 70 Golongan III bagi aparatur Pemkab HSU.',
    namaPengelola: 'Bagian Umum Setda HSU / BPKAD HSU',
    tarifSatuan: 500000,
    jumlahSatuan: 14,
    satuanTarif: 'Per Rumah/Bulan',
    potensiPerbulan: 7000000,
    potensiPertahun: 84000000,
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Antasari',
    alamatLengkap: 'Jl. Norman Umar, Kompleks Perumahan Dinas Pemkab HSU',
    latitude: -2.420800,
    longitude: 115.244500,
    akurasiGps: 4,
    statusVerifikasi: 'Menunggu Verifikasi',
    petugasPendata: 'Siti Nurhaliza, A.Md',
    createdAt: '2026-04-08T11:00:00Z',
    updatedAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'ret-004',
    nomorRegister: 'REG-RET/2026/04/004',
    tanggalPendataan: '2026-04-10',
    golonganRetribusi: 'Retribusi Jasa Umum',
    subRekening: 'Retribusi Pelayanan Kesehatan',
    subObjekRetribusi: 'Puskesmas Sungai Pandan (Alabio)',
    keterangan: 'Pelayanan poli umum, gigi, laboratorium sederhana, dan surat keterangan kesehatan puskesmas.',
    namaPengelola: 'Dinas Kesehatan / Puskesmas Alabio',
    tarifSatuan: 15000,
    jumlahSatuan: 35,
    satuanTarif: 'Per Pasien/Hari',
    potensiPerbulan: 15750000,
    potensiPertahun: 189000000,
    kecamatan: 'Kecamatan Sungai Pandan (Alabio)',
    kelurahanDesa: 'Alabio Pasar',
    alamatLengkap: 'Jl. Kesatuan No. 12, Alabio',
    latitude: -2.483100,
    longitude: 115.188200,
    akurasiGps: 5,
    statusVerifikasi: 'Menunggu Verifikasi',
    petugasPendata: 'Ahmad Faisal, S.AP',
    createdAt: '2026-04-10T09:30:00Z',
    updatedAt: '2026-04-10T09:30:00Z',
  },
  {
    id: 'ret-005',
    nomorRegister: 'REG-RET/2026/04/005',
    tanggalPendataan: '2026-04-11',
    golonganRetribusi: 'Retribusi Jasa Usaha',
    subRekening: 'Retribusi Pelayanan Kepelabuhanan / Dermaga Sungai HSU',
    subObjekRetribusi: 'Dermaga Sungai Danau Panggang',
    keterangan: 'Retribusi tambat kapal motor, jukung dagang, dan speedboat jalur sungai Danau Panggang - Paminggir.',
    namaPengelola: 'UPTD Perhubungan Sungai Dishub HSU & Pengelola Dermaga',
    tarifSatuan: 20000,
    jumlahSatuan: 25,
    satuanTarif: 'Per Kapal/Hari',
    potensiPerbulan: 15000000,
    potensiPertahun: 180000000,
    kecamatan: 'Kecamatan Danau Panggang',
    kelurahanDesa: 'Danau Panggang',
    alamatLengkap: 'Dermaga Utama Jalur Rawa Danau Panggang, HSU',
    latitude: -2.535200,
    longitude: 115.092400,
    akurasiGps: 5,
    fotoObjekRetribusiUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    fotoObjekRetribusiName: 'Foto_Fisik_Dermaga_Danau_Panggang.jpg',
    fotoObjekRetribusiSize: '2.4 MB',
    statusVerifikasi: 'Setuju',
    petugasPendata: 'Rija, S.STP, M.IP',
    verifiedBy: 'Rija, S.STP, M.IP (BP2RD HSU)',
    verifiedAt: '2026-04-11T14:00:00Z',
    catatanVerifikasi: 'Potensi retribusi tambat dermaga perairan Danau Panggang telah tervalidasi.',
    createdAt: '2026-04-11T10:00:00Z',
    updatedAt: '2026-04-11T14:00:00Z',
  },
  {
    id: 'ret-006',
    nomorRegister: 'REG-RET/2026/04/006',
    tanggalPendataan: '2026-04-12',
    golonganRetribusi: 'Retribusi Jasa Umum',
    subRekening: 'Retribusi Pelayanan Pasar',
    subObjekRetribusi: 'Kios & Los Pasar Babirik',
    keterangan: 'Perekaman 45 los pedagang ikan, anyaman purun, dan sembako hari pasar Babirik.',
    namaPengelola: 'Pengelola Pasar Babirik & BP2RD HSU',
    tarifSatuan: 100000,
    jumlahSatuan: 45,
    satuanTarif: 'Per Kios/Bulan',
    potensiPerbulan: 4500000,
    potensiPertahun: 54000000,
    kecamatan: 'Kecamatan Babirik',
    kelurahanDesa: 'Babirik Hilir',
    alamatLengkap: 'Kawasan Pasar Babirik, Kec. Babirik, Kab. HSU',
    latitude: -2.571400,
    longitude: 115.143200,
    akurasiGps: 6,
    statusVerifikasi: 'Verifikasi',
    petugasPendata: 'Siti Nurhaliza, A.Md',
    createdAt: '2026-04-12T08:00:00Z',
    updatedAt: '2026-04-12T08:00:00Z',
  },
  {
    id: 'ret-007',
    nomorRegister: 'REG-RET/2026/04/007',
    tanggalPendataan: '2026-04-12',
    golonganRetribusi: 'Retribusi Jasa Usaha',
    subRekening: 'Retribusi Pemanfaatan Barang Milik Daerah',
    subObjekRetribusi: 'Sentra Kuliner Tepian Candi Agung',
    keterangan: 'Sewa lapak sentra UMKM dan kuliner khas Amuntai itik panggang di area wisata sejarah Candi Agung.',
    namaPengelola: 'Disporapar HSU & Paguyuban UMKM',
    tarifSatuan: 250000,
    jumlahSatuan: 20,
    satuanTarif: 'Per Lapak/Bulan',
    potensiPerbulan: 5000000,
    potensiPertahun: 60000000,
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Sungai Malang',
    alamatLengkap: 'Kawasan Wisata Sejarah Candi Agung, Sungai Malang, Amuntai',
    latitude: -2.418900,
    longitude: 115.239100,
    akurasiGps: 4,
    statusVerifikasi: 'Setuju',
    petugasPendata: 'Rija, S.STP, M.IP',
    verifiedBy: 'Rija, S.STP, M.IP (BP2RD HSU)',
    verifiedAt: '2026-04-12T16:00:00Z',
    catatanVerifikasi: 'Sewa lahan sentra kuliner aktif beroperasi.',
    createdAt: '2026-04-12T11:00:00Z',
    updatedAt: '2026-04-12T16:00:00Z',
  },
  {
    id: 'ret-008',
    nomorRegister: 'REG-RET/2026/04/008',
    tanggalPendataan: '2026-04-13',
    golonganRetribusi: 'Retribusi Jasa Usaha',
    subRekening: 'Retribusi Tempat Khusus Parkir / Terminal',
    subObjekRetribusi: 'Tempat Parkir Khusus RSUD Pambalah Batung',
    keterangan: 'Pengelolaan tempat parkir khusus kendaraan roda dua dan roda empat pengunjung RSUD Pambalah Batung Amuntai.',
    namaPengelola: 'RSUD Pambalah Batung & Dinas Perhubungan HSU',
    tarifSatuan: 3000,
    jumlahSatuan: 150,
    satuanTarif: 'Per Kendaraan/Hari',
    potensiPerbulan: 13500000,
    potensiPertahun: 162000000,
    kecamatan: 'Kecamatan Amuntai Tengah',
    kelurahanDesa: 'Murung Sari',
    alamatLengkap: 'Jl. Basuki Rahmat No. 1, Kawasan RSUD Pambalah Batung Amuntai',
    latitude: -2.427800,
    longitude: 115.249100,
    akurasiGps: 5,
    statusVerifikasi: 'Setuju',
    petugasPendata: 'Ahmad Faisal, S.AP',
    verifiedBy: 'Ahmad Faisal, S.AP',
    verifiedAt: '2026-04-13T10:00:00Z',
    catatanVerifikasi: 'Pengelolaan parkir khusus RSUD resmi.',
    createdAt: '2026-04-13T09:00:00Z',
    updatedAt: '2026-04-13T10:00:00Z',
  }
];

export function loadRetribusiList(): RetribusiDaerahEntry[] {
  try {
    const raw = localStorage.getItem(RETRIBUSI_KEY);
    if (!raw) {
      localStorage.setItem(RETRIBUSI_KEY, JSON.stringify(INITIAL_RETRIBUSI_DATA));
      return INITIAL_RETRIBUSI_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading retribusi list:', e);
    return INITIAL_RETRIBUSI_DATA;
  }
}

export function saveRetribusiList(data: RetribusiDaerahEntry[]) {
  try {
    localStorage.setItem(RETRIBUSI_KEY, JSON.stringify(data));
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

// ==========================================
// INDEKS KEPUASAN MASYARAKAT (IKM) STORAGE
// ==========================================
export const IKM_KEY = 'sipotensi_ikm_surveys';

export const INITIAL_IKM_DATA: import('../types').IkmSurveyEntry[] = [
  {
    id: 'ikm-001',
    nomorResponden: 'IKM/2026/04/001',
    nama: 'H. Muhammad Arsyad',
    alamat: 'Jl. Basuki Rahmat No. 12, Kel. Murung Sari, Amuntai Tengah',
    kegiatan: 'Pelayanan Pendaftaran Objek & Validasi Potensi Pajak Restoran',
    nomorKontak: '0812-5432-8899',
    tanggalSurvey: '2026-04-05',
    pernyataan1: 20, // Sangat Baik
    pernyataan2: 20, // Sangat Baik
    pernyataan3: 20, // Sangat Baik
    pernyataan4: 20, // Sangat Baik
    pernyataan5: 20, // Sangat Baik
    saranMasukan: 'Pelayanan aparatur BP2RD sangat ramah dan proses survei lapangan berbasis GPS sangat cepat serta transparan.',
    totalNilai: 100,
    predikat: 'Sangat Baik',
    petugasPencatat: 'Rija, S.STP, M.IP',
    createdAt: '2026-04-05T09:30:00Z',
  },
  {
    id: 'ikm-002',
    nomorResponden: 'IKM/2026/04/002',
    nama: 'Hj. Siti Marhamah',
    alamat: 'Desa Alabio Pasar RT 02, Kec. Sungai Pandan',
    kegiatan: 'Konsultasi Ketetapan SPPT PBB-P2 & Pembayaran Online',
    nomorKontak: '0852-4890-1123',
    tanggalSurvey: '2026-04-07',
    pernyataan1: 20, // Sangat Baik
    pernyataan2: 15, // Baik
    pernyataan3: 20, // Sangat Baik
    pernyataan4: 20, // Sangat Baik
    pernyataan5: 20, // Sangat Baik
    saranMasukan: 'Penjelasan petugas loket sangat jelas mengenai rincian NJOP dan tata cara pelunasan di Bank Kalsel.',
    totalNilai: 95,
    predikat: 'Sangat Baik',
    petugasPencatat: 'Ahmad Faisal, S.AP',
    createdAt: '2026-04-07T10:15:00Z',
  },
  {
    id: 'ikm-003',
    nomorResponden: 'IKM/2026/04/003',
    nama: 'Gusti Rahmadi, S.E.',
    alamat: 'Jl. Norman Umar No. 44, Antasari, Amuntai Tengah',
    kegiatan: 'Perekaman Potensi & Perizinan Retribusi Tempat Usaha / Reklame',
    nomorKontak: '0813-7721-0044',
    tanggalSurvey: '2026-04-09',
    pernyataan1: 15, // Baik
    pernyataan2: 20, // Sangat Baik
    pernyataan3: 20, // Sangat Baik
    pernyataan4: 15, // Baik
    pernyataan5: 20, // Sangat Baik
    saranMasukan: 'Aplikasi SIPOTENSI HSU sangat memudahkan pengecekan berkas dan titik lokasi geospasial.',
    totalNilai: 90,
    predikat: 'Sangat Baik',
    petugasPencatat: 'Siti Nurhaliza, A.Md',
    createdAt: '2026-04-09T11:45:00Z',
  },
  {
    id: 'ikm-004',
    nomorResponden: 'IKM/2026/04/004',
    nama: 'Bahruddin Noor',
    alamat: 'Dermaga Danau Panggang RT 01, Kec. Danau Panggang',
    kegiatan: 'Pelayanan Retribusi Terminal & Tambat Perahu Wisata Rawa',
    nomorKontak: '0821-9988-3311',
    tanggalSurvey: '2026-04-11',
    pernyataan1: 20, // Sangat Baik
    pernyataan2: 15, // Baik
    pernyataan3: 15, // Baik
    pernyataan4: 15, // Baik
    pernyataan5: 15, // Baik
    saranMasukan: 'Petugas lapangan datang tepat waktu saat pendataan perahu dan los dermaga.',
    totalNilai: 80,
    predikat: 'Baik',
    petugasPencatat: 'Rija, S.STP, M.IP',
    createdAt: '2026-04-11T14:00:00Z',
  },
];

export function loadIkmList(): import('../types').IkmSurveyEntry[] {
  try {
    const raw = localStorage.getItem(IKM_KEY);
    if (!raw) {
      localStorage.setItem(IKM_KEY, JSON.stringify(INITIAL_IKM_DATA));
      return INITIAL_IKM_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading IKM list:', e);
    return INITIAL_IKM_DATA;
  }
}

export function saveIkmList(data: import('../types').IkmSurveyEntry[]) {
  try {
    localStorage.setItem(IKM_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving IKM list:', e);
  }
}



