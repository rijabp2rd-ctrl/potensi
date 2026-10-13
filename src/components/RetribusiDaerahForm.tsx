import React, { useState } from 'react';
import { 
  Coins,
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calculator, 
  User, 
  Calendar, 
  Compass, 
  Crosshair, 
  ArrowLeft, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Check, 
  BarChart3, 
  PieChart,
  Search,
  Users,
  Store,
  FileCheck2,
  Receipt,
  Layers,
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  RetribusiDaerahEntry, 
  GolonganRetribusi, 
  AppUser, 
  VerificationStatus 
} from '../types';
import { 
  KABUPATEN_HSU, 
  KECAMATAN_HSU, 
  KECAMATAN_HSU_OPTIONS, 
  isWithinHsuRegion,
  getDefaultCoordsForKecamatan 
} from '../constants/wilayahHsu';
import { capturePreciseGpsCoordinate, calculateHaversineDistance } from '../services/gpsService';
import { compressImageFile } from '../utils/imageCompressor';

interface RetribusiDaerahFormProps {
  currentUser: AppUser | null;
  retribusiList?: RetribusiDaerahEntry[];
  onSave: (entry: RetribusiDaerahEntry) => void;
  onCancel: () => void;
  onNavigateToTab?: (tab: string) => void;
  initialSubTab?: 'form' | 'riwayat';
  onUpdateRetribusiStatus?: (
    id: string, 
    newStatus: VerificationStatus,
    note?: string
  ) => void;
  onDeleteRetribusi?: (id: string) => void;
}

// Data Kamus Sub Rekening Berdasarkan Golongan Retribusi (UU HKPD & Perda HSU)
const SUB_REKENING_OPTIONS: Record<GolonganRetribusi, string[]> = {
  'Retribusi Jasa Umum': [
    'Retribusi Pelayanan Kesehatan',
    'Retribusi Pelayanan Pasar',
    'Retribusi Pelayanan Persampahan / Kebersihan',
    'Retribusi Pelayanan Parkir di Tepi Jalan Umum',
    'Retribusi Pelayanan Pemakaman dan Pengabuan Mayat',
    'Retribusi Pengendalian Lalu Lintas',
    'Lainnya (Ketik Manual)'
  ],
  'Retribusi Jasa Usaha': [
    'Retribusi Penyediaan Tempat Kegiatan Usaha / Pasar / Pertokoan',
    'Retribusi Tempat Khusus Parkir / Terminal',
    'Retribusi Pemanfaatan Barang Milik Daerah (Sewa Rumah Dinas, Gedung, Tanah)',
    'Retribusi Rumah Potong Hewan (RPH)',
    'Retribusi Pelayanan Kepelabuhanan / Dermaga Sungai HSU',
    'Retribusi Tempat Rekreasi, Pariwisata dan Olahraga',
    'Lainnya (Ketik Manual)'
  ],
  'Retribusi Perizinan Tertentu': [
    'Retribusi Persetujuan Bangunan Gedung (PBG)',
    'Retribusi Penggunaan Tenaga Kerja Asing (PTKA)',
    'Retribusi Pengelolaan Pertambangan Rakyat',
    'Lainnya (Ketik Manual)'
  ]
};

// Preset Sub Objek Retribusi Nyata di Kabupaten Hulu Sungai Utara
const PRESET_SUB_OBJEK_HSU = [
  'Pasar Induk Amuntai',
  'Terminal Palampitan',
  'Rumah Dinas Pejabat / Pegawai Pemkab HSU',
  'Pasar Subuh Amuntai',
  'Pasar Unggas & Ternak Alabio',
  'Kios & Los Pasar Babirik',
  'Dermaga Sungai Danau Panggang',
  'Gedung Aneka Wahana / Gedung Agung Amuntai',
  'Stadion Olahraga Karias Amuntai',
  'Puskesmas Amuntai Tengah',
  'Puskesmas Sungai Pandan (Alabio)',
  'Puskesmas Danau Panggang',
  'Puskesmas Banjang',
  'Tempat Parkir Khusus RSUD Pambalah Batung',
  'Sentra Kuliner Tepian Candi Agung',
  'Lainnya (Ketik Bebas)'
];

const PRESET_SATUAN_TARIF = [
  'Per Kios / Bulan',
  'Per Unit / Bulan',
  'Per Rumah Dinas / Bulan',
  'Per Hari / Karcis',
  'Per Kendaraan / Hari',
  'Per Pasien / Kunjungan',
  'Per Meter Persegi / Tahun',
  'Per Permohonan (PBG)',
  'Per Bulan'
];

export const RetribusiDaerahForm: React.FC<RetribusiDaerahFormProps> = ({
  currentUser,
  retribusiList = [],
  onSave,
  onCancel,
  onNavigateToTab,
  initialSubTab = 'form',
  onUpdateRetribusiStatus,
  onDeleteRetribusi
}) => {
  const isInternalUser = currentUser !== null && (currentUser.role === 'admin' || currentUser.role === 'user');
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'riwayat'>(initialSubTab);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [golonganFilter, setGolonganFilter] = useState<string>('all');

  React.useEffect(() => {
    if (!isInternalUser) {
      setActiveSubTab('form');
    } else if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab, isInternalUser]);

  const [justSavedItem, setJustSavedItem] = useState<RetribusiDaerahEntry | null>(null);

  // 1. Golongan Retribusi
  const [golonganRetribusi, setGolonganRetribusi] = useState<GolonganRetribusi>('Retribusi Jasa Umum');

  // 2. Sub Rekening Retribusi
  const [subRekeningSelect, setSubRekeningSelect] = useState('Retribusi Pelayanan Pasar');
  const [subRekeningCustom, setSubRekeningCustom] = useState('');

  // 3. Sub Objek Retribusi
  const [subObjekSelect, setSubObjekSelect] = useState('Pasar Induk Amuntai');
  const [subObjekCustom, setSubObjekCustom] = useState('');

  // 4. Keterangan & Identitas Pengelola
  const [keterangan, setKeterangan] = useState('');
  const [namaPengelola, setNamaPengelola] = useState('');
  const [nomorKontrakOrSK, setNomorKontrakOrSK] = useState('');

  // 5. Tarif & Perhitungan Potensi
  const [tarifSatuan, setTarifSatuan] = useState<number>(150000);
  const [jumlahSatuan, setJumlahSatuan] = useState<number>(50);
  const [satuanTarif, setSatuanTarif] = useState<string>('Per Kios / Bulan');
  const [potensiPerbulan, setPotensiPerbulan] = useState<number>(7500000);
  const [potensiPertahun, setPotensiPertahun] = useState<number>(90000000);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Otomatis hitung potensi saat tarif, jumlah, atau satuan berubah
  React.useEffect(() => {
    if (!isManualOverride) {
      let bulanan = 0;
      if (satuanTarif.includes('Hari') || satuanTarif.includes('Karcis') || satuanTarif.includes('Kendaraan')) {
        // Frekuensi harian diasumsikan 30 hari operasional
        bulanan = Math.round(tarifSatuan * jumlahSatuan * 30);
      } else if (satuanTarif.includes('Tahun')) {
        bulanan = Math.round((tarifSatuan * jumlahSatuan) / 12);
      } else {
        // Bulanan (Per Kios / Bulan, Per Unit / Bulan, dll)
        bulanan = Math.round(tarifSatuan * jumlahSatuan);
      }
      setPotensiPerbulan(bulanan);
      setPotensiPertahun(bulanan * 12);
    }
  }, [tarifSatuan, jumlahSatuan, satuanTarif, isManualOverride]);

  // 6. Lokasi Geospasial Kabupaten HSU
  const defaultCoord = getDefaultCoordsForKecamatan('Kecamatan Amuntai Tengah');
  const [kecamatan, setKecamatan] = useState<string>('Kecamatan Amuntai Tengah');
  const [kelurahanDesa, setKelurahanDesa] = useState<string>('');
  const [alamatLengkap, setAlamatLengkap] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(defaultCoord.lat);
  const [longitude, setLongitude] = useState<number>(defaultCoord.lng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // 7. Unggah Foto Objek Retribusi
  const [fotoObjekUrl, setFotoObjekUrl] = useState<string>('');
  const [fotoObjekName, setFotoObjekName] = useState<string>('');
  const [fotoObjekSize, setFotoObjekSize] = useState<string>('');

  // Form validation error
  const [formError, setFormError] = useState<string | null>(null);

  // Modal detail & hapus in riwayat
  const [viewDetailTarget, setViewDetailTarget] = useState<RetribusiDaerahEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RetribusiDaerahEntry | null>(null);

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const coord = getDefaultCoordsForKecamatan(newKec);
    setLatitude(coord.lat);
    setLongitude(coord.lng);
    setGpsStatusMessage(`Titik koordinat disinkronkan ke pusat ${newKec}`);
  };

  const handleCaptureGps = async () => {
    setIsCapturingGps(true);
    setGpsStatusMessage('Mengakses sensor GPS presisi...');
    try {
      const res = await capturePreciseGpsCoordinate();
      setLatitude(res.latitude);
      setLongitude(res.longitude);
      setGpsAccuracy(Math.round(res.accuracy));

      if (res.isWithinHsu) {
        setGpsStatusMessage(
          `GPS Terkunci Presisi (±${Math.round(res.accuracy)}m) di wilayah ${res.kecamatanTerdekat || 'Kab. HSU'}`
        );
        if (res.kecamatanTerdekat && KECAMATAN_HSU_OPTIONS.includes(res.kecamatanTerdekat)) {
          setKecamatan(res.kecamatanTerdekat);
        }
      } else {
        const fallback = getDefaultCoordsForKecamatan(kecamatan);
        setLatitude(fallback.lat);
        setLongitude(fallback.lng);
        setGpsStatusMessage(
          `GPS terdeteksi di luar HSU. Koordinat disinkronkan ke pusat ${kecamatan} (Kab. HSU).`
        );
      }
    } catch (err) {
      console.error(err);
      const fallback = getDefaultCoordsForKecamatan(kecamatan);
      setLatitude(fallback.lat);
      setLongitude(fallback.lng);
      setGpsStatusMessage(`Sensor GPS tidak aktif. Menggunakan koordinat pusat ${kecamatan}.`);
    } finally {
      setIsCapturingGps(false);
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await compressImageFile(file, 800, 0.7);
      setFotoObjekName(res.fileName);
      setFotoObjekSize(res.fileSizeStr);
      setFotoObjekUrl(res.dataUrl);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const sizeKb = Math.round(file.size / 1024);
      setFotoObjekName(file.name);
      setFotoObjekSize(`${sizeKb} KB`);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoObjekUrl(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const resetForm = () => {
    setGolonganRetribusi('Retribusi Jasa Umum');
    setSubRekeningSelect('Retribusi Pelayanan Pasar');
    setSubRekeningCustom('');
    setSubObjekSelect('Pasar Induk Amuntai');
    setSubObjekCustom('');
    setKeterangan('');
    setNamaPengelola('');
    setNomorKontrakOrSK('');
    setTarifSatuan(150000);
    setJumlahSatuan(50);
    setSatuanTarif('Per Kios / Bulan');
    setIsManualOverride(false);
    setKelurahanDesa('');
    setAlamatLengkap('');
    setFotoObjekUrl('');
    setFotoObjekName('');
    setFotoObjekSize('');
    setJustSavedItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubRekening = subRekeningSelect === 'Lainnya (Ketik Manual)'
      ? (subRekeningCustom.trim() || 'Retribusi Jasa Daerah')
      : subRekeningSelect;

    const finalSubObjek = subObjekSelect === 'Lainnya (Ketik Bebas)'
      ? (subObjekCustom.trim() || 'Objek Retribusi HSU')
      : subObjekSelect;

    if (!finalSubRekening) {
      setFormError('Mohon pilih atau masukkan Sub Rekening Retribusi');
      return;
    }

    if (!finalSubObjek) {
      setFormError('Mohon pilih atau masukkan Sub Objek Retribusi');
      return;
    }
    setFormError(null);

    const regNumber = `REG-RET/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

    const newEntry: RetribusiDaerahEntry = {
      id: `ret-${Date.now()}`,
      nomorRegister: regNumber,
      tanggalPendataan: new Date().toISOString().split('T')[0],
      golonganRetribusi,
      subRekening: finalSubRekening,
      subObjekRetribusi: finalSubObjek,
      keterangan: keterangan || `Pendataan potensi ${finalSubObjek} (${finalSubRekening}) wilayah ${kecamatan}.`,
      namaPengelola: namaPengelola || undefined,
      nomorKontrakOrSK: nomorKontrakOrSK || undefined,
      tarifSatuan,
      jumlahSatuan,
      satuanTarif,
      potensiPerbulan,
      potensiPertahun,
      kecamatan,
      kelurahanDesa: kelurahanDesa || 'Pusat Kecamatan',
      alamatLengkap: alamatLengkap || `Wilayah ${kecamatan}, Kabupaten Hulu Sungai Utara`,
      latitude,
      longitude,
      akurasiGps: gpsAccuracy || 6,
      fotoObjekRetribusiUrl: fotoObjekUrl || undefined,
      fotoObjekRetribusiName: fotoObjekName || undefined,
      fotoObjekRetribusiSize: fotoObjekSize || undefined,
      statusVerifikasi: 'Terverifikasi',
      petugasPendata: currentUser?.name || 'Petugas Pendata BP2RD HSU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newEntry);
    setJustSavedItem(newEntry);
    if (isInternalUser) {
      setActiveSubTab('riwayat');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">
                Menu Input Potensi Retribusi Daerah
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Kabupaten HSU
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Perekaman potensi penerimaan retribusi jasa umum, jasa usaha, dan perizinan tertentu beserta titik koordinat GPS dan dokumentasi visual.
            </p>
          </div>
        </div>

        {/* View Mode Switcher: HANYA TAMPIL PADA LOGIN ADMIN & USER */}
        {isInternalUser && (
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSubTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'form'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formulir Baru
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('riwayat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'riwayat'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Daftar Retribusi Terinput</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono text-amber-400">
                {retribusiList.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner after saving */}
      {justSavedItem && (
        <div className="mt-6 p-5 rounded-3xl bg-amber-950/40 border border-amber-500/50 shadow-2xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Potensi Retribusi &quot;{justSavedItem.subObjekRetribusi}&quot; Berhasil Tersimpan!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Rekening: <strong className="text-amber-300">{justSavedItem.subRekening}</strong> &bull; Estimasi Bulanan: <strong className="text-white">{formatRupiah(justSavedItem.potensiPerbulan)}</strong> &bull; Estimasi Tahunan: <strong className="text-emerald-400">{formatRupiah(justSavedItem.potensiPertahun)}</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-colors cursor-pointer"
              >
                + Input Retribusi Lain
              </button>
              {onNavigateToTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('laporan')}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-extrabold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Buka Laporan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('analitik')}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-extrabold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>Buka Analitik</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: FORMULIR INPUT */}
      {activeSubTab === 'form' && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-500/20"
              >
                Tutup
              </button>
            </div>
          )}

          {/* BAGIAN 1: PILIH GOLONGAN RETRIBUSI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Coins className="w-4 h-4" />
              <span>1. Pilih Golongan Retribusi Daerah</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sesuai dengan ketentuan UU No. 1 Tahun 2022 (HKPD) dan Peraturan Daerah Kabupaten Hulu Sungai Utara No. 01 Tahun 2024:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Opsi A: Retribusi Jasa Umum */}
              <div
                onClick={() => {
                  setGolonganRetribusi('Retribusi Jasa Umum');
                  setSubRekeningSelect(SUB_REKENING_OPTIONS['Retribusi Jasa Umum'][0]);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  golonganRetribusi === 'Retribusi Jasa Umum'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      Opsi a
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Retribusi Jasa Umum</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Pelayanan yang disediakan/diberikan Pemda untuk tujuan kepentingan dan kemanfaatan umum.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                  <Check className={`w-3.5 h-3.5 ${golonganRetribusi === 'Retribusi Jasa Umum' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>Kesehatan, Pasar, Parkir, Kebersihan</span>
                </div>
              </div>

              {/* Opsi B: Retribusi Jasa Usaha */}
              <div
                onClick={() => {
                  setGolonganRetribusi('Retribusi Jasa Usaha');
                  setSubRekeningSelect(SUB_REKENING_OPTIONS['Retribusi Jasa Usaha'][0]);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  golonganRetribusi === 'Retribusi Jasa Usaha'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      Opsi b
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Retribusi Jasa Usaha</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Pelayanan yang disediakan oleh Pemda dengan menganut prinsip komersial dan pemanfaatan aset BMD.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-blue-300">
                  <Check className={`w-3.5 h-3.5 ${golonganRetribusi === 'Retribusi Jasa Usaha' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>Terminal, Rumah Dinas, RPH, Kios</span>
                </div>
              </div>

              {/* Opsi C: Retribusi Perizinan Tertentu */}
              <div
                onClick={() => {
                  setGolonganRetribusi('Retribusi Perizinan Tertentu');
                  setSubRekeningSelect(SUB_REKENING_OPTIONS['Retribusi Perizinan Tertentu'][0]);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  golonganRetribusi === 'Retribusi Perizinan Tertentu'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      Opsi c
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Retribusi Perizinan Tertentu</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Pelayanan perizinan tertentu oleh Pemda kepada orang pribadi/badan untuk pengaturan &amp; pengawasan.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-teal-300">
                  <Check className={`w-3.5 h-3.5 ${golonganRetribusi === 'Retribusi Perizinan Tertentu' ? 'opacity-100' : 'opacity-0'}`} />
                  <span>PBG Gedung, PTKA, Izin Khusus</span>
                </div>
              </div>
            </div>
          </div>

          {/* BAGIAN 2 & 3: PILIH SUB REKENING & SUB OBJEK RETRIBUSI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Layers className="w-4 h-4" />
              <span>2 &amp; 3. Pilih Sub Rekening &amp; Sub Objek Retribusi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 2. Sub Rekening Retribusi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pilih Sub Rekening Retribusi <span className="text-red-400">*</span>
                </label>
                <select
                  value={subRekeningSelect}
                  onChange={(e) => setSubRekeningSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {SUB_REKENING_OPTIONS[golonganRetribusi].map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>

                {subRekeningSelect === 'Lainnya (Ketik Manual)' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      value={subRekeningCustom}
                      onChange={(e) => setSubRekeningCustom(e.target.value)}
                      placeholder="Ketik nama sub rekening retribusi..."
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  Contoh: a. Retribusi Pelayanan Kesehatan, Retribusi Pelayanan Pasar, Kebersihan, dll.
                </p>
              </div>

              {/* 3. Sub Objek Retribusi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pilih Sub Objek Retribusi HSU <span className="text-red-400">*</span>
                </label>
                <select
                  value={subObjekSelect}
                  onChange={(e) => setSubObjekSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {PRESET_SUB_OBJEK_HSU.map((obj, idx) => (
                    <option key={idx} value={obj}>{obj}</option>
                  ))}
                </select>

                {subObjekSelect === 'Lainnya (Ketik Bebas)' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      required
                      value={subObjekCustom}
                      onChange={(e) => setSubObjekCustom(e.target.value)}
                      placeholder="Ketik nama sub objek retribusi..."
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  Contoh: a. Pasar Induk Amuntai, Terminal Palampitan, Rumah Dinas, Puskesmas, dll.
                </p>
              </div>

              {/* Identitas Pengelola / Wajib Retribusi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pengelola / Wajib Retribusi / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={namaPengelola}
                  onChange={(e) => setNamaPengelola(e.target.value)}
                  placeholder="Contoh: UPTD Pasar, Dishub HSU, Nama Penyewa / Wajib Retribusi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Nomor Kontrak / SK / Karcis */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nomor Kontrak / SK Penetapan / Surat Perjanjian (Opsional)
                </label>
                <input
                  type="text"
                  value={nomorKontrakOrSK}
                  onChange={(e) => setNomorKontrakOrSK(e.target.value)}
                  placeholder="Contoh: SK-BMD/2026/04-012 atau No. Karcis Seri A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 4: KETERANGAN */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <FileText className="w-4 h-4" />
              <span>4. Keterangan Objek Retribusi</span>
            </h2>
            <p className="text-xs text-slate-400">
              Deskripsikan rincian objek, peruntukan ruangan/kios, jadwal penarikan, luas/dimensi, atau catatan lapangan petugas:
            </p>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kios Blok A lantai dasar ukuran 3x3 meter sebanyak 50 unit disewa pedagang pakaian dan sembako. Penarikan retribusi dilakukan per bulan melalui karcis resmi Pemda."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* BAGIAN 5: TARIF & PERHITUNGAN POTENSI PERBULAN & PERTAHUN */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
                <Calculator className="w-4 h-4" />
                <span>5. Tarif &amp; Perhitungan Potensi Perbulan dan Pertahun</span>
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={isManualOverride}
                    onChange={(e) => setIsManualOverride(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Edit Manual Hasil Potensi</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tarif Satuan Retribusi (Rp) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={tarifSatuan}
                    onChange={(e) => setTarifSatuan(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {formatRupiah(tarifSatuan)}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Jumlah Satuan / Kapasitas <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={jumlahSatuan}
                  onChange={(e) => setJumlahSatuan(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Jumlah unit, kamar, kios, karcis, atau frekuensi
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Satuan Tarif / Periode
                </label>
                <select
                  value={satuanTarif}
                  onChange={(e) => setSatuanTarif(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {PRESET_SATUAN_TARIF.map((sat, idx) => (
                    <option key={idx} value={sat}>{sat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display Hasil Perhitungan Potensi Perbulan & Pertahun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1 font-medium">
                  Estimasi Potensi Retribusi Perbulan:
                </span>
                {isManualOverride ? (
                  <input
                    type="number"
                    value={potensiPerbulan}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPotensiPerbulan(val);
                      setPotensiPertahun(val * 12);
                    }}
                    className="w-full bg-slate-900 border border-amber-500 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold"
                  />
                ) : (
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {formatRupiah(potensiPerbulan)}
                  </div>
                )}
                <span className="text-[10px] text-slate-500 block mt-1">
                  Hasil perkalian tarif satuan dan volume perputaran bulanan
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <span className="text-xs text-slate-400 block mb-1 font-medium">
                  Estimasi Potensi Retribusi Pertahun:
                </span>
                {isManualOverride ? (
                  <input
                    type="number"
                    value={potensiPertahun}
                    onChange={(e) => setPotensiPertahun(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-emerald-500 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold"
                  />
                ) : (
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatRupiah(potensiPertahun)}
                  </div>
                )}
                <span className="text-[10px] text-emerald-400/80 block mt-1">
                  12 &times; Potensi Bulanan (Target Proyeksi Fiskal PAD HSU)
                </span>
              </div>
            </div>
          </div>

          {/* BAGIAN 6: LOKASI GEOSPASIAL KABUPATEN HULU SUNGAI UTARA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
                  <MapPin className="w-4 h-4" />
                  <span>6. Lokasi Geospasial Kabupaten Hulu Sungai Utara</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tentukan wilayah kecamatan, desa, alamat lengkap, dan kunci koordinat GPS objek retribusi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <Crosshair className={`w-4 h-4 ${isCapturingGps ? 'animate-spin' : ''}`} />
                <span>{isCapturingGps ? 'Mengunci GPS...' : 'Ambil Titik GPS Presisi (HP/Laptop)'}</span>
              </button>
            </div>

            {gpsStatusMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Compass className="w-4 h-4 shrink-0" />
                <span>{gpsStatusMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kecamatan (Kab. HSU) <span className="text-red-400">*</span>
                </label>
                <select
                  value={kecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {KECAMATAN_HSU_OPTIONS.map((kec, idx) => (
                    <option key={idx} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kelurahan / Desa <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kelurahanDesa}
                  onChange={(e) => setKelurahanDesa(e.target.value)}
                  placeholder="Contoh: Murung Sari / Palampitan Hulu / Alabio Pasar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alamat Lengkap / Lokasi Fisik Objek
                </label>
                <input
                  type="text"
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Contoh: Jl. Basuki Rahmat No. 12 RT 04, Kompleks Pasar Induk Amuntai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Latitude (Lintang Selatan)
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || defaultCoord.lat)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Longitude (Bujur Timur)
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || defaultCoord.lng)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* BAGIAN 7: UNGGAH FOTO OBJEK RETRIBUSI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Camera className="w-4 h-4" />
              <span>7. Unggah Foto Objek Retribusi</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ambil foto fisik langsung menggunakan Kamera HP saat survei lapangan atau unggah berkas visual dari Laptop/PC:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors bg-slate-950/60">
                <input
                  type="file"
                  id="foto-retribusi-upload"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFotoUpload}
                  className="hidden"
                />
                <label htmlFor="foto-retribusi-upload" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white block">
                    Buka Kamera HP / Pilih Foto Objek
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Format JPG, PNG, WEBP (Otomatis Kompresi Gambar)
                  </span>
                </label>
              </div>

              {/* Preview Foto */}
              {fotoObjekUrl ? (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black/50 border border-slate-800">
                    <img 
                      src={fotoObjekUrl} 
                      alt="Foto Objek Retribusi" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoObjekUrl('');
                        setFotoObjekName('');
                        setFotoObjekSize('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white transition-colors"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span className="truncate max-w-[180px] font-mono">{fotoObjekName}</span>
                    <span className="text-amber-400 font-bold">{fotoObjekSize}</span>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[140px] flex items-center justify-center p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-500 text-xs text-center">
                  Belum ada foto objek yang diunggah. Foto membantu validasi saat verifikasi laporan.
                </div>
              )}
            </div>
          </div>

          {/* Tombol Simpan Formulir */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
            >
              Reset Formulir
            </button>
            <button
              type="submit"
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-amber-950/40 hover:shadow-amber-900/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Potensi Retribusi Daerah</span>
            </button>
          </div>

        </form>
      )}

      {/* VIEW 2: DAFTAR RETRIBUSI TERINPUT (HANYA TAMPIL UNTUK ADMIN & USER) */}
      {isInternalUser && activeSubTab === 'riwayat' && (
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Daftar Potensi Retribusi Daerah Terinput ({retribusiList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Data otomatis tersinkronisasi ke Manajemen Laporan dan Dashboard Analitik PAD HSU.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveSubTab('form');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Formulir Retribusi Baru
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari objek, sub rekening, kecamatan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={golonganFilter}
                onChange={(e) => setGolonganFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">Semua Golongan Retribusi</option>
                <option value="Retribusi Jasa Umum">Retribusi Jasa Umum</option>
                <option value="Retribusi Jasa Usaha">Retribusi Jasa Usaha</option>
                <option value="Retribusi Perizinan Tertentu">Retribusi Perizinan Tertentu</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">No. Register</th>
                  <th className="py-3 px-3">Sub Objek Retribusi</th>
                  <th className="py-3 px-3">Golongan &amp; Sub Rekening</th>
                  <th className="py-3 px-3">Kecamatan / Lokasi</th>
                  <th className="py-3 px-3 text-right">Potensi Bulanan</th>
                  <th className="py-3 px-3 text-right">Potensi Tahunan</th>
                  <th className="py-3 px-3 text-center">Status Verifikasi</th>
                  <th className="py-3 px-3 text-center">Foto</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {retribusiList
                  .filter(r => {
                    const matchSearch = !searchKeyword || 
                      r.subObjekRetribusi.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      r.subRekening.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      r.kecamatan.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      r.nomorRegister.toLowerCase().includes(searchKeyword.toLowerCase());
                    const matchGol = golonganFilter === 'all' || r.golonganRetribusi === golonganFilter;
                    return matchSearch && matchGol;
                  })
                  .map((r) => {
                    const isNewlyAdded = justSavedItem?.id === r.id;
                    return (
                      <tr 
                        key={r.id} 
                        className={`transition-colors ${
                          isNewlyAdded 
                            ? 'bg-amber-950/40 ring-1 ring-amber-500/50' 
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {r.nomorRegister}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          <div>
                            <span>{r.subObjekRetribusi}</span>
                            {r.namaPengelola && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Pengelola: {r.namaPengelola}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-300">
                            {r.golonganRetribusi}
                          </span>
                          <span className="text-slate-200 block text-xs">
                            {r.subRekening}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="block text-slate-200">{r.kecamatan}</span>
                          <span className="text-[10px] text-slate-400 block">{r.kelurahanDesa}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">
                          {formatRupiah(r.potensiPerbulan)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {formatRupiah(r.potensiPertahun)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.statusVerifikasi === 'Setuju'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : r.statusVerifikasi === 'Verifikasi'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {r.statusVerifikasi}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {r.fotoObjekRetribusiUrl ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-teal-300 border border-teal-500/30">
                              Ada Foto
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewDetailTarget(r)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Lihat</span>
                            </button>
                            {currentUser?.role === 'admin' && onDeleteRetribusi && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(r)}
                                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Retribusi di Form */}
      {viewDetailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {viewDetailTarget.subObjekRetribusi}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {viewDetailTarget.nomorRegister} &bull; {viewDetailTarget.golonganRetribusi}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Identitas &amp; Rekening
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sub Rekening:</span>
                  <strong className="text-amber-200">{viewDetailTarget.subRekening}</strong>
                </div>
                {viewDetailTarget.namaPengelola && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pengelola / PIC:</span>
                    <span className="text-white">{viewDetailTarget.namaPengelola}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Petugas:</span>
                  <span className="text-slate-300">{viewDetailTarget.petugasPendata}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal:</span>
                  <span className="text-slate-300 font-mono">{viewDetailTarget.tanggalPendataan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400">{viewDetailTarget.statusVerifikasi}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Tarif &amp; Potensi Retribusi
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarif Satuan:</span>
                  <span className="font-mono text-white font-bold">{formatRupiah(viewDetailTarget.tarifSatuan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Satuan &amp; Volume:</span>
                  <span className="text-slate-300">{viewDetailTarget.jumlahSatuan || 1} ({viewDetailTarget.satuanTarif})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Potensi / Bulan:</span>
                  <span className="font-mono text-amber-300 font-bold">{formatRupiah(viewDetailTarget.potensiPerbulan)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-300 font-bold">Potensi / Tahun:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{formatRupiah(viewDetailTarget.potensiPertahun)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Lokasi Geospasial Kabupaten HSU
              </span>
              <div className="flex justify-between">
                <span className="text-slate-400">Kecamatan &amp; Desa:</span>
                <span className="text-white font-medium">{viewDetailTarget.kecamatan}, {viewDetailTarget.kelurahanDesa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Koordinat GPS:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {viewDetailTarget.latitude.toFixed(6)}, {viewDetailTarget.longitude.toFixed(6)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                <span className="text-slate-500 block">Alamat Lengkap:</span>
                <span className="text-slate-300">{viewDetailTarget.alamatLengkap}</span>
              </div>
            </div>

            {viewDetailTarget.keterangan && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Keterangan:
                </span>
                <p className="text-slate-300 italic">
                  &quot;{viewDetailTarget.keterangan}&quot;
                </p>
              </div>
            )}

            {viewDetailTarget.fotoObjekRetribusiUrl && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Foto Objek Retribusi:
                </span>
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 max-h-56 flex items-center justify-center p-2">
                  <img
                    src={viewDetailTarget.fotoObjekRetribusiUrl}
                    alt={viewDetailTarget.subObjekRetribusi}
                    className="max-h-52 rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewDetailTarget(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus di Form */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Hapus Data Potensi Retribusi?
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Anda akan menghapus data <strong className="text-amber-300">&quot;{deleteTarget.subObjekRetribusi}&quot;</strong> ({deleteTarget.nomorRegister}). Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteRetribusi) {
                    onDeleteRetribusi(deleteTarget.id);
                  }
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-red-950/50"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
