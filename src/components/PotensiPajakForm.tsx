import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  MapPin, 
  Navigation, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calculator, 
  User, 
  Calendar,
  Compass,
  Crosshair,
  Info,
  ArrowLeft,
  Upload,
  Camera,
  Image as ImageIcon,
  FileText,
  X,
  Smartphone,
  Laptop,
  Check,
  Eye,
  BarChart3,
  PieChart,
  Search,
  PlayCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { PotensiPajakEntry, AppUser, JenisPajak, GpsCoordinateResult } from '../types';
import { 
  KABUPATEN_HSU, 
  KECAMATAN_HSU, 
  KECAMATAN_HSU_OPTIONS, 
  TITIK_PRESET_HSU, 
  isWithinHsuRegion,
  getDefaultCoordsForKecamatan 
} from '../constants/wilayahHsu';
import { capturePreciseGpsCoordinate, calculateHaversineDistance } from '../services/gpsService';
import { compressImageFile } from '../utils/imageCompressor';

interface PotensiPajakFormProps {
  currentUser: AppUser | null;
  onSave: (entry: PotensiPajakEntry) => void;
  onCancel: () => void;
  potensiList?: PotensiPajakEntry[];
  onNavigateToTab?: (tab: string) => void;
  initialSubTab?: 'form' | 'riwayat';
  onUpdatePotensiStatus?: (id: string, newStatus: PotensiPajakEntry['statusVerifikasi']) => void;
}

const JENIS_PAJAK_OPTIONS: JenisPajak[] = [
  'Pajak Restoran / PBJT Makanan & Minuman',
  'Pajak Reklame',
  'Pajak Hotel / Jasa Perhotelan',
  'Pajak Air Tanah',
  'Pajak MBLB (Mineral Bukan Logam & Batuan)',
  'Pajak Hiburan / Jasa Kesenian',
  'Pajak Parkir / Jasa Parkir',
  'Pajak Penerangan Jalan / PBJT Tenaga Listrik',
  'Pajak Sarang Burung Walet',
  'PBB-P2',
];

export const PotensiPajakForm: React.FC<PotensiPajakFormProps> = ({
  currentUser,
  onSave,
  onCancel,
  potensiList = [],
  onNavigateToTab,
  initialSubTab = 'form',
  onUpdatePotensiStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'riwayat'>(initialSubTab);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isInternalUser = currentUser !== null && (currentUser.role === 'admin' || currentUser.role === 'user');

  React.useEffect(() => {
    if (!isInternalUser) {
      setActiveSubTab('form');
    } else if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab, isInternalUser]);

  const [justSavedItem, setJustSavedItem] = useState<PotensiPajakEntry | null>(null);

  const [namaWajibPajak, setNamaWajibPajak] = useState('');
  const [npwpd, setNpwpd] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [jenisPajak, setJenisPajak] = useState<JenisPajak>('Pajak Restoran / PBJT Makanan & Minuman');
  const [kecamatan, setKecamatan] = useState<string>('Kecamatan Amuntai Tengah');
  const [kelurahanDesa, setKelurahanDesa] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  
  // Geolocation states (HSU Specific)
  const defaultCenter = getDefaultCoordsForKecamatan('Kecamatan Amuntai Tengah');
  const [latitude, setLatitude] = useState<number>(defaultCenter.lat);
  const [longitude, setLongitude] = useState<number>(defaultCenter.lng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [gpsSource, setGpsSource] = useState<'device' | 'preset' | 'manual'>('preset');

  // Potensi calculations
  const [omzetBulanan, setOmzetBulanan] = useState<number>(50000000);
  const [tarifPajakPersen, setTarifPajakPersen] = useState<number>(10);
  const [catatanPetugas, setCatatanPetugas] = useState('');

  // Upload States: DPA / ARKAS & Foto Objek PJRD (Laptop & HP)
  const [dpaFileUrl, setDpaFileUrl] = useState<string>('');
  const [dpaFileName, setDpaFileName] = useState<string>('');
  const [dpaFileSize, setDpaFileSize] = useState<string>('');

  const [fotoObjekUrl, setFotoObjekUrl] = useState<string>('');
  const [fotoObjekName, setFotoObjekName] = useState<string>('');
  const [fotoObjekSize, setFotoObjekSize] = useState<string>('');

  const handleDpaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDpaFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setDpaFileSize(`${sizeMb} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setDpaFileUrl(event.target?.result as string || '');
    };
    reader.readAsDataURL(file);
  };

  const handleFotoObjekUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const potensiBulanan = Math.round((omzetBulanan * tarifPajakPersen) / 100);
  const potensiTahunan = potensiBulanan * 12;

  const isCoordinateValidHsu = isWithinHsuRegion(latitude, longitude);
  const distanceToAmuntai = calculateHaversineDistance(
    latitude,
    longitude,
    KABUPATEN_HSU.pusatLat,
    KABUPATEN_HSU.pusatLng
  );

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    if (gpsSource !== 'device') {
      const coord = getDefaultCoordsForKecamatan(newKec);
      setLatitude(coord.lat);
      setLongitude(coord.lng);
      setGpsSource('preset');
      setGpsStatusMessage(`Koordinat disesuaikan ke titik pusat ${newKec}`);
    }
  };

  const handleCaptureGps = async () => {
    setIsCapturingGps(true);
    setGpsStatusMessage('Menghubungi satelit GPS & memvalidasi batas wilayah Hulu Sungai Utara...');

    try {
      const result: GpsCoordinateResult = await capturePreciseGpsCoordinate({
        prioritizeHsuRegion: true,
        selectedKecamatan: kecamatan,
        forceHighAccuracy: true,
      });

      setLatitude(result.latitude);
      setLongitude(result.longitude);
      setGpsAccuracy(result.accuracy);

      if (result.source === 'gps_device') {
        setGpsSource('device');
        setGpsStatusMessage(
          `GPS Akurat Terkunci! Presisi satelit: ±${result.accuracy}m. Jarak ke Amuntai: ${result.jarakKmKePusatAmuntai} km.`
        );
      } else {
        setGpsSource('preset');
        setGpsStatusMessage(
          `Titik GPS perangkat terdeteksi di luar HSU. Koordinat disinkronkan otomatis ke pusat ${kecamatan} (HSU Presisi).`
        );
      }
    } catch (err: any) {
      console.error(err);
      const fallback = getDefaultCoordsForKecamatan(kecamatan);
      setLatitude(fallback.lat);
      setLongitude(fallback.lng);
      setGpsSource('preset');
      setGpsStatusMessage(`Gagal membaca sensor GPS. Titik diset ke pusat ${kecamatan}.`);
    } finally {
      setIsCapturingGps(false);
    }
  };

  const handleSelectPresetLandmark = (preset: typeof TITIK_PRESET_HSU[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setKecamatan(preset.kecamatan);
    setGpsSource('preset');
    setGpsAccuracy(5);
    setGpsStatusMessage(`Titik koordinat diset ke: ${preset.label}`);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const resetForm = () => {
    setNamaWajibPajak('');
    setNamaUsaha('');
    setNpwpd('');
    setKelurahanDesa('');
    setAlamatLengkap('');
    setCatatanPetugas('');
    setDpaFileName('');
    setDpaFileUrl('');
    setFotoObjekName('');
    setFotoObjekUrl('');
    setJustSavedItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaWajibPajak || !namaUsaha) {
      alert('Mohon isi nama wajib pajak dan nama usaha');
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newEntry: PotensiPajakEntry = {
      id: `pot-${Date.now()}`,
      nomorFormulir: `FORM-POT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${randomSuffix}`,
      tanggalPendataan: new Date().toISOString().split('T')[0],
      namaWajibPajak,
      npwpd: npwpd || `P.2.${Math.floor(1000000 + Math.random() * 9000000)}.08.${new Date().getFullYear()}`,
      namaUsaha,
      jenisPajak,
      kecamatan,
      kelurahanDesa: kelurahanDesa || 'Pusat Kecamatan',
      alamatLengkap: alamatLengkap || `Kawasan ${kecamatan}, Kab. HSU`,
      latitude,
      longitude,
      akurasiGps: gpsAccuracy || 10,
      potensiRupiahBulanan: potensiBulanan,
      potensiRupiahTahunan: potensiTahunan,
      statusVerifikasi: currentUser?.role === 'admin' ? 'Terverifikasi' : 'Dalam Proses',
      petugasPendata: currentUser?.name || 'Petugas Lapangan BP2RD HSU',
      catatanPetugas,
      dpaFileUrl: dpaFileUrl || undefined,
      dpaFileName: dpaFileName || undefined,
      dpaFileSize: dpaFileSize || undefined,
      fotoObjekUrl: fotoObjekUrl || undefined,
      fotoObjekName: fotoObjekName || undefined,
      fotoObjekSize: fotoObjekSize || undefined,
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
            <h1 className="text-2xl font-black text-white">
              Menu Input Potensi Pajak Daerah (PJRD)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Perekaman data subjek pajak, objek usaha, upload DPA/ARKAS &amp; foto fisik, serta geospasial Kab. Hulu Sungai Utara.
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
                  ? 'bg-emerald-500 text-white shadow'
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
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Daftar Terinput</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono text-emerald-400">
                {potensiList.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner after saving */}
      {justSavedItem && (
        <div className="mt-6 p-5 rounded-3xl bg-emerald-950/40 border border-emerald-500/50 shadow-2xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Data Potensi &quot;{justSavedItem.namaUsaha}&quot; Berhasil Tersimpan!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  No. Form: <strong className="font-mono text-emerald-400">{justSavedItem.nomorFormulir}</strong> &bull; Potensi: {formatRupiah(justSavedItem.potensiRupiahTahunan)} &bull; Data otomatis tampil di menu ini, Manajemen Laporan, dan Dashboard Analitik.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-colors cursor-pointer"
              >
                + Input Data Lain
              </button>
              {onNavigateToTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('laporan')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white transition-colors cursor-pointer flex items-center gap-1.5"
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
          
          {/* Identitas Subjek & Objek Pajak */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <Building2 className="w-4 h-4" />
              <span>1. Identitas Wajib Pajak &amp; Objek Usaha</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nama Wajib Pajak / Penanggung Jawab <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaWajibPajak}
                  onChange={(e) => setNamaWajibPajak(e.target.value)}
                  placeholder="Contoh: H. Mansyur / PT Anugerah HSU"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nama Objek Usaha / Merek Dagang <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  placeholder="Contoh: RM Wong Solo Amuntai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Jenis Pajak Daerah (PJRD)
                </label>
                <select
                  value={jenisPajak}
                  onChange={(e) => setJenisPajak(e.target.value as JenisPajak)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {JENIS_PAJAK_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  NPWPD (Opsional)
                </label>
                <input
                  type="text"
                  value={npwpd}
                  onChange={(e) => setNpwpd(e.target.value)}
                  placeholder="P.2.0019283.08.2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Wilayah & GPS Geospasial HSU */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-teal-400">
                <MapPin className="w-4 h-4" />
                <span>2. Lokasi Geospasial Kabupaten Hulu Sungai Utara</span>
              </h2>

              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
                <span>{isCapturingGps ? 'Mengunci Satelit GPS...' : 'Ambil Koordinat GPS Presisi HSU'}</span>
              </button>
            </div>

            {gpsStatusMessage && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{gpsStatusMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kecamatan (Kabupaten Hulu Sungai Utara)
                </label>
                <select
                  value={kecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {KECAMATAN_HSU_OPTIONS.map((kec, idx) => (
                    <option key={idx} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kelurahan / Desa
                </label>
                <input
                  type="text"
                  value={kelurahanDesa}
                  onChange={(e) => setKelurahanDesa(e.target.value)}
                  placeholder="Contoh: Murung Sari / Alabio Pasar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alamat Lengkap / Patokan Lokasi Usaha
                </label>
                <input
                  type="text"
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Jl. Basuki Rahmat No. 45 RT 02, Samping Bank Kalsel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(parseFloat(e.target.value) || 0);
                    setGpsSource('manual');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(parseFloat(e.target.value) || 0);
                    setGpsSource('manual');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Quick Landmark Presets */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-2 font-semibold">
                Preset Titik Landmark HSU Cepat:
              </span>
              <div className="flex flex-wrap gap-2">
                {TITIK_PRESET_HSU.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetLandmark(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    📍 {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Perhitungan Potensi Fiskal */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Calculator className="w-4 h-4" />
              <span>3. Perhitungan Potensi Pajak (Omzet &amp; Tarif)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Estimasi Omzet / Peredaran Bruto Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={omzetBulanan}
                  onChange={(e) => setOmzetBulanan(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tarif Pajak (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tarifPajakPersen}
                  onChange={(e) => setTarifPajakPersen(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">Potensi Pajak per Bulan:</span>
                <span className="text-base font-bold text-emerald-400">{formatRupiah(potensiBulanan)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Potensi Fiskal Tahunan:</span>
                <span className="text-lg font-black text-amber-400">{formatRupiah(potensiTahunan)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Catatan Petugas Lapangan
              </label>
              <textarea
                rows={2}
                value={catatanPetugas}
                onChange={(e) => setCatatanPetugas(e.target.value)}
                placeholder="Catatan survei fisik, kapasitas tempat, jam operasional, atau situasi lapangan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 4. Upload DPA/ARKAS & Foto Objek PJRD (Laptop & HP) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-blue-400">
                <Upload className="w-4 h-4" />
                <span>4. Unggah Berkas: DPA/ARKAS &amp; Foto Objek PJRD</span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                <span>File Laptop</span>
                <span>&bull;</span>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kamera HP</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Upload 1: DPA / ARKAS */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Upload DPA / ARKAS Penggalian</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      PDF / DOC / XLS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dokumen pelaksanaan anggaran survei potensi atau kertas kerja pendataan.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                    <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Pilih Berkas DPA</span>
                    <span className="text-[10px] text-slate-500">Maks. 10MB dari Laptop / HP</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleDpaUpload}
                      className="hidden"
                    />
                  </label>

                  {dpaFileName && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800 text-xs text-slate-200">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{dpaFileName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">{dpaFileSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload 2: Foto Objek PJRD */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-400" />
                      <span>Upload Foto Objek Usaha / Reklame</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Foto Kamera HP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Foto fisik lokasi usaha, plang nama, atau reklame objek wajib pajak.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                    <Camera className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Ambil Foto / Pilih Galeri</span>
                    <span className="text-[10px] text-slate-500">Kamera HP atau Galeri Laptop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoObjekUpload}
                      className="hidden"
                    />
                  </label>

                  {fotoObjekUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-800 text-xs">
                      <img 
                        src={fotoObjekUrl} 
                        alt="Preview Foto" 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0" 
                      />
                      <div className="truncate">
                        <span className="font-semibold text-white block truncate">{fotoObjekName}</span>
                        <span className="text-[10px] text-blue-300">{fotoObjekSize}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Potensi Pajak</span>
            </button>
          </div>

        </form>
      )}

      {/* VIEW 2: DAFTAR OBJEK TERINPUT LANGSUNG PADA MENU INI (HANYA TAMPIL UNTUK ADMIN & USER) */}
      {isInternalUser && activeSubTab === 'riwayat' && (
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Daftar Potensi Pajak Daerah Terinput ({potensiList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Data otomatis tersimpan &amp; tersinkronisasi langsung ke Manajemen Laporan dan Dashboard Analitik.
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
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Formulir Input Baru
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
                placeholder="Cari WP, usaha, no form..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Disetujui">Disetujui</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">No. Form</th>
                  <th className="py-3 px-3">Wajib Pajak &amp; Usaha</th>
                  <th className="py-3 px-3">Jenis Pajak</th>
                  <th className="py-3 px-3">Kecamatan</th>
                  <th className="py-3 px-3 text-right">Potensi Tahunan</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Berkas</th>
                  <th className="py-3 px-3 text-center min-w-[190px]">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {potensiList
                  .filter(p => {
                    const matchSearch = !searchKeyword || 
                      p.namaWajibPajak.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.namaUsaha.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.nomorFormulir.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.kecamatan.toLowerCase().includes(searchKeyword.toLowerCase());
                    const matchStatus = statusFilter === 'all' || p.statusVerifikasi === statusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((p) => {
                    const isNewlyAdded = justSavedItem?.id === p.id;
                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors ${
                          isNewlyAdded 
                            ? 'bg-emerald-950/50 ring-1 ring-emerald-500/50' 
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{p.nomorFormulir}</span>
                            {isNewlyAdded && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-emerald-500 text-slate-950">
                                Baru Disimpan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{p.namaWajibPajak}</span>
                          <span className="text-[11px] text-slate-400">{p.namaUsaha}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                            {p.jenisPajak}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{p.kecamatan}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                          {formatRupiah(p.potensiRupiahTahunan)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.statusVerifikasi === 'Disetujui'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.statusVerifikasi === 'Terverifikasi'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {p.statusVerifikasi || 'Dalam Proses'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.fotoObjekUrl && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                                Foto Objek
                              </span>
                            )}
                            {p.dpaFileUrl && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                                DPA
                              </span>
                            )}
                            {!p.fotoObjekUrl && !p.dpaFileUrl && (
                              <span className="text-[10px] text-slate-500">-</span>
                            )}
                          </div>
                        </td>
                        {/* Aksi Petugas: Proses, Verifikasi, Setuju */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePotensiStatus) {
                                  onUpdatePotensiStatus(p.id, 'Dalam Proses');
                                }
                              }}
                              title="Tandai Sedang Diproses"
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                p.statusVerifikasi === 'Dalam Proses'
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60'
                              }`}
                            >
                              <PlayCircle className="w-2.5 h-2.5" />
                              <span>Proses</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePotensiStatus) {
                                  onUpdatePotensiStatus(p.id, 'Terverifikasi');
                                }
                              }}
                              title="Verifikasi Hasil Survei"
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                p.statusVerifikasi === 'Terverifikasi'
                                  ? 'bg-blue-500 text-white shadow'
                                  : 'bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60'
                              }`}
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verifikasi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePotensiStatus) {
                                  onUpdatePotensiStatus(p.id, 'Disetujui');
                                }
                              }}
                              title="Setujui Potensi Pajak"
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                p.statusVerifikasi === 'Disetujui'
                                  ? 'bg-emerald-500 text-white shadow'
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Setuju</span>
                            </button>
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

    </div>
  );
};
