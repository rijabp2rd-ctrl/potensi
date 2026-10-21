import React, { useState } from 'react';
import { 
  Receipt, 
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
  Smartphone, 
  Laptop, 
  Check, 
  BarChart3, 
  PieChart,
  Search,
  PlayCircle,
  ShieldCheck,
  Printer,
  Eye,
  Sparkles,
  SlidersHorizontal,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { PbbP2Entry, AppUser, GpsCoordinateResult } from '../types';
import { 
  calculatePbbDetail, 
  getKelasBumi, 
  getKelasBangunan, 
  terbilangRupiah 
} from '../utils/pbbCalculator';
import { SpptPbbModal } from './SpptPbbModal';
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

interface PbbP2FormProps {
  currentUser: AppUser | null;
  onSave: (entry: PbbP2Entry) => void;
  onCancel: () => void;
  pbbList?: PbbP2Entry[];
  onNavigateToTab?: (tab: string) => void;
  initialSubTab?: 'form' | 'riwayat';
  onUpdatePbbStatus?: (
    id: string, 
    newStatus: 'Dalam Proses' | 'Terverifikasi' | 'Disetujui',
    statusBayar?: 'LUNAS' | 'BELUM LUNAS' | 'PIUTANG'
  ) => void;
}

export const PbbP2Form: React.FC<PbbP2FormProps> = ({
  currentUser,
  onSave,
  onCancel,
  pbbList = [],
  onNavigateToTab,
  initialSubTab = 'form',
  onUpdatePbbStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'riwayat'>(initialSubTab);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusBayarFilter, setStatusBayarFilter] = useState<string>('all');

  const isInternalUser = currentUser !== null && (currentUser.role === 'admin' || currentUser.role === 'user');

  React.useEffect(() => {
    if (!isInternalUser) {
      setActiveSubTab('form');
    } else if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab, isInternalUser]);

  const [justSavedItem, setJustSavedItem] = useState<PbbP2Entry | null>(null);

  // Status NOP: 'ada' (isikan NOP) atau 'tidak_ada' (belum ada NOP)
  const [statusNop, setStatusNop] = useState<'ada' | 'tidak_ada'>('ada');
  const [savedNop, setSavedNop] = useState('63.08.');
  const [nop, setNop] = useState('63.08.');
  const [tahunPajak, setTahunPajak] = useState<number>(2026);
  const [namaWajibPajak, setNamaWajibPajak] = useState('');
  const [nikWajibPajak, setNikWajibPajak] = useState('');
  const [kecamatan, setKecamatan] = useState<string>('Kecamatan Amuntai Tengah');
  const [kelurahanDesa, setKelurahanDesa] = useState('');
  const [alamatObjek, setAlamatObjek] = useState('');

  // NJOP & Luas & Parameter Perhitungan SPPT PBB-P2 Lengkap
  const [luasBumiM2, setLuasBumiM2] = useState<number>(450);
  const [njopBumiPerM2, setNjopBumiPerM2] = useState<number>(850000);
  const [customKelasBumi, setCustomKelasBumi] = useState<string>('');
  
  const [hasBangunan, setHasBangunan] = useState<boolean>(true);
  const [luasBangunanM2, setLuasBangunanM2] = useState<number>(240);
  const [njopBangunanPerM2, setNjopBangunanPerM2] = useState<number>(1200000);
  const [customKelasBangunan, setCustomKelasBangunan] = useState<string>('');
  
  const [njoptkp, setNjoptkp] = useState<number>(10000000);
  const [tarifPbbPersen, setTarifPbbPersen] = useState<number>(0.15);
  const [stimulusPengurangan, setStimulusPengurangan] = useState<number>(0);
  const [dendaAdministrasi, setDendaAdministrasi] = useState<number>(0);

  // Modal dialog preview Lembar Resmi SPPT PBB-P2
  const [showCurrentSpptModal, setShowCurrentSpptModal] = useState<boolean>(false);
  const [selectedSpptForModal, setSelectedSpptForModal] = useState<PbbP2Entry | null>(null);

  // Status bayar
  const [statusPembayaran, setStatusPembayaran] = useState<'LUNAS' | 'BELUM LUNAS'>('BELUM LUNAS');
  const [bankTempatBayar, setBankTempatBayar] = useState('Bank Kalsel Cabang Amuntai');
  const [nomorStruk, setNomorStruk] = useState('');

  // Upload File Objek Pajak PBB-P2 (Laptop & HP Kamera/Galeri)
  const [fotoObjekPbbUrl, setFotoObjekPbbUrl] = useState<string>('');
  const [fotoObjekPbbName, setFotoObjekPbbName] = useState<string>('');
  const [fotoObjekPbbSize, setFotoObjekPbbSize] = useState<string>('');

  const [strukBayarUrl, setStrukBayarUrl] = useState<string>('');
  const [strukBayarName, setStrukBayarName] = useState<string>('');

  const handleFotoObjekPbbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await compressImageFile(file, 800, 0.7);
      setFotoObjekPbbName(res.fileName);
      setFotoObjekPbbSize(res.fileSizeStr);
      setFotoObjekPbbUrl(res.dataUrl);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const sizeKb = Math.round(file.size / 1024);
      setFotoObjekPbbName(file.name);
      setFotoObjekPbbSize(`${sizeKb} KB`);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoObjekPbbUrl(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStrukBayarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await compressImageFile(file, 800, 0.7);
      setStrukBayarName(res.fileName);
      setStrukBayarUrl(res.dataUrl);
    } catch (err) {
      setStrukBayarName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setStrukBayarUrl(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  // GPS Coordinates (HSU Presisi)
  const defaultCoord = getDefaultCoordsForKecamatan('Kecamatan Amuntai Tengah');
  const [latitude, setLatitude] = useState<number>(defaultCoord.lat);
  const [longitude, setLongitude] = useState<number>(defaultCoord.lng);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // Perhitungan PBB-P2 Otomatis Sesuai SPPT Resmi
  const effectiveLuasBangunan = hasBangunan ? luasBangunanM2 : 0;
  const effectiveNjopBangunan = hasBangunan ? njopBangunanPerM2 : 0;

  const calcResult = calculatePbbDetail({
    luasBumi: luasBumiM2,
    njopBumiPerM2: njopBumiPerM2,
    luasBangunan: effectiveLuasBangunan,
    njopBangunanPerM2: effectiveNjopBangunan,
    njoptkp,
    tarifPbbPersen,
    stimulusPengurangan,
    dendaAdministrasi,
  });

  const totalNjopBumi = calcResult.totalNjopBumi;
  const totalNjopBangunan = calcResult.totalNjopBangunan;
  const totalNjop = calcResult.njopTotal;
  const njopKenaPajak = calcResult.njopKenaPajak;
  const pbbTerhutang = calcResult.totalPbbHarusDibayar;
  const kelasBumi = customKelasBumi || calcResult.kelasBumi;
  const kelasBangunan = hasBangunan ? (customKelasBangunan || calcResult.kelasBangunan) : '-';

  // Preset Cepat Objek Pajak di Wilayah Kabupaten HSU
  const applyPresetHsu = (type: 'hunian' | 'ruko' | 'pertanian' | 'tanah_kosong') => {
    if (type === 'hunian') {
      setLuasBumiM2(300);
      setNjopBumiPerM2(500000);
      setCustomKelasBumi('A36');
      setHasBangunan(true);
      setLuasBangunanM2(120);
      setNjopBangunanPerM2(1000000);
      setCustomKelasBangunan('B12');
      setNjoptkp(10000000);
      setTarifPbbPersen(0.10);
      setStimulusPengurangan(0);
      setDendaAdministrasi(0);
    } else if (type === 'ruko') {
      setLuasBumiM2(250);
      setNjopBumiPerM2(1200000);
      setCustomKelasBumi('A34');
      setHasBangunan(true);
      setLuasBangunanM2(350);
      setNjopBangunanPerM2(1800000);
      setCustomKelasBangunan('B10');
      setNjoptkp(10000000);
      setTarifPbbPersen(0.20);
      setStimulusPengurangan(0);
      setDendaAdministrasi(0);
    } else if (type === 'pertanian') {
      setLuasBumiM2(2500);
      setNjopBumiPerM2(60000);
      setCustomKelasBumi('A43');
      setHasBangunan(false);
      setLuasBangunanM2(0);
      setNjopBangunanPerM2(0);
      setCustomKelasBangunan('-');
      setNjoptkp(10000000);
      setTarifPbbPersen(0.05);
      setStimulusPengurangan(0);
      setDendaAdministrasi(0);
    } else if (type === 'tanah_kosong') {
      setLuasBumiM2(500);
      setNjopBumiPerM2(350000);
      setCustomKelasBumi('A38');
      setHasBangunan(false);
      setLuasBangunanM2(0);
      setNjopBangunanPerM2(0);
      setCustomKelasBangunan('-');
      setNjoptkp(10000000);
      setTarifPbbPersen(0.10);
      setStimulusPengurangan(0);
      setDendaAdministrasi(0);
    }
  };

  const isCoordinateValidHsu = isWithinHsuRegion(latitude, longitude);
  const distanceToAmuntai = calculateHaversineDistance(
    latitude,
    longitude,
    KABUPATEN_HSU.pusatLat,
    KABUPATEN_HSU.pusatLng
  );

  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const coord = getDefaultCoordsForKecamatan(newKec);
    setLatitude(coord.lat);
    setLongitude(coord.lng);
    setGpsStatusMessage(`Titik koordinat disinkronkan ke pusat ${newKec}`);
  };

  const handleCaptureGps = async () => {
    setIsCapturingGps(true);
    setGpsStatusMessage('Mengakses satelit GPS & memvalidasi koordinat wilayah Kab. HSU...');

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
        setGpsStatusMessage(
          `Satelit GPS terkunci! Akurasi: ±${result.accuracy} meter. Jarak ke pusat Amuntai: ${result.jarakKmKePusatAmuntai} km.`
        );
      } else {
        setGpsStatusMessage(
          `GPS terdeteksi di luar HSU. Koordinat disinkronkan ke titik pusat ${kecamatan} (Kab. HSU).`
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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const resetForm = () => {
    setStatusNop('ada');
    setSavedNop('63.08.');
    setNop('63.08.');
    setNamaWajibPajak('');
    setNikWajibPajak('');
    setKelurahanDesa('');
    setAlamatObjek('');
    setFotoObjekPbbName('');
    setFotoObjekPbbUrl('');
    setStrukBayarUrl('');
    setJustSavedItem(null);
    setCustomKelasBumi('');
    setCustomKelasBangunan('');
    setStimulusPengurangan(0);
    setDendaAdministrasi(0);
    setFormError(null);
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaWajibPajak.trim()) {
      setFormError('Mohon isi Nama Wajib Pajak pada Bagian 1 terlebih dahulu.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (luasBumiM2 <= 0) {
      setFormError('Mohon isi Luas Tanah / Bumi (m²) lebih dari 0.');
      return;
    }

    if (njopBumiPerM2 <= 0) {
      setFormError('Mohon isi nilai NJOP Bumi per m² (Rp).');
      return;
    }

    setFormError(null);

    let finalNop = 'TIDAK ADA NOP';
    if (statusNop === 'ada') {
      const trimmedNop = nop.trim();
      if (!trimmedNop || trimmedNop === '63.08.') {
        finalNop = `63.08.010.001.001-${Math.floor(1000 + Math.random() * 9000)}.0`;
      } else {
        finalNop = trimmedNop;
      }
    }

    const newEntry: PbbP2Entry = {
      id: `pbb-${Date.now()}`,
      nop: finalNop,
      statusNop,
      tahunPajak,
      namaWajibPajak: namaWajibPajak.trim(),
      nikWajibPajak: nikWajibPajak || undefined,
      kecamatan,
      kelurahanDesa: kelurahanDesa || 'Pusat Kecamatan',
      alamatObjek: alamatObjek || `Wilayah ${kecamatan}, Kab. HSU`,
      luasBumiM2,
      njopBumiPerM2,
      kelasBumi,
      totalNjopBumi: calcResult.totalNjopBumi,
      luasBangunanM2: effectiveLuasBangunan,
      njopBangunanPerM2: effectiveNjopBangunan,
      kelasBangunan,
      totalNjopBangunan: calcResult.totalNjopBangunan,
      njopTotal: calcResult.njopTotal,
      njoptkp: calcResult.njoptkp,
      njopKenaPajak: calcResult.njopKenaPajak,
      tarifPbbPersen: calcResult.tarifPbbPersen,
      stimulusPengurangan: calcResult.stimulusPengurangan,
      dendaAdministrasi: calcResult.dendaAdministrasi,
      totalPbbHarusDibayar: calcResult.totalPbbHarusDibayar,
      pbbTerhutang: calcResult.totalPbbHarusDibayar,
      statusPembayaran,
      statusVerifikasi: 'Terverifikasi',
      tanggalBayar: statusPembayaran === 'LUNAS' ? new Date().toISOString().split('T')[0] : undefined,
      bankTempatBayar: statusPembayaran === 'LUNAS' ? bankTempatBayar : undefined,
      nomorStruk: statusPembayaran === 'LUNAS' ? (nomorStruk || `STRUK-BKS/HSU/${Date.now().toString().slice(-4)}`) : undefined,
      strukBayarUrl: statusPembayaran === 'LUNAS' ? (strukBayarUrl || undefined) : undefined,
      strukBayarName: statusPembayaran === 'LUNAS' ? (strukBayarName || undefined) : undefined,
      fotoObjekPbbUrl: fotoObjekPbbUrl || undefined,
      fotoObjekPbbName: fotoObjekPbbName || undefined,
      fotoObjekPbbSize: fotoObjekPbbSize || undefined,
      latitude,
      longitude,
      akurasiGps: gpsAccuracy || 8,
      petugasValidasi: currentUser?.name || 'Petugas Validasi BP2RD HSU',
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
              Menu Input SPPT PBB-P2 Kabupaten HSU
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Perekaman SPPT PBB Perdesaan &amp; Perkotaan, upload foto objek tanah/bangunan dari laptop/HP, dan bukti setoran.
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
                  ? 'bg-blue-600 text-white shadow'
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
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Daftar SPPT Terinput</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono text-blue-400">
                {pbbList.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Banner after saving */}
      {justSavedItem && (
        <div className="mt-6 p-5 rounded-3xl bg-blue-950/40 border border-blue-500/50 shadow-2xl animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  {justSavedItem.nop === 'TIDAK ADA NOP'
                    ? 'Data SPPT (Tanpa NOP / Objek Baru) Berhasil Tersimpan!'
                    : `Data SPPT NOP "${justSavedItem.nop}" Berhasil Tersimpan!`}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Wajib Pajak: <strong className="text-white">{justSavedItem.namaWajibPajak}</strong> &bull; PBB Terhutang: {formatRupiah(justSavedItem.pbbTerhutang)} &bull; Status: {justSavedItem.statusPembayaran} &bull; Tampil di menu ini, Manajemen Laporan, dan Dashboard Analitik.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-colors cursor-pointer"
              >
                + Input SPPT Lain
              </button>
              {onNavigateToTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('laporan')}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition-colors cursor-pointer flex items-center gap-1.5"
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
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-rose-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-500/20 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
          
          {/* Identitas NOP & Subjek */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-blue-400">
              <Receipt className="w-4 h-4" />
              <span>1. Nomor Objek Pajak (NOP) &amp; Identitas Subjek</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Dropdown Pilihan Nomor Objek Pajak */}
              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nomor Objek Pajak (NOP) <span className="text-red-400">*</span>
                </label>
                <select
                  value={statusNop}
                  onChange={(e) => {
                    const val = e.target.value as 'ada' | 'tidak_ada';
                    setStatusNop(val);
                    if (val === 'tidak_ada') {
                      if (nop && nop !== 'TIDAK ADA NOP') {
                        setSavedNop(nop);
                      }
                      setNop('TIDAK ADA NOP');
                    } else {
                      setNop(savedNop && savedNop !== 'TIDAK ADA NOP' ? savedNop : '63.08.');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="ada">Ada (Isikan NOP)</option>
                  <option value="tidak_ada">Tidak Ada</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {statusNop === 'ada' 
                    ? 'Pilih opsi ini untuk menginput 18 digit NOP' 
                    : 'Untuk objek pajak baru / belum terbit NOP'}
                </p>
              </div>

              {/* Input Isian NOP jika ADA, atau badge keterangan jika TIDAK ADA */}
              <div className="sm:col-span-5">
                {statusNop === 'ada' ? (
                  <>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Isikan NOP 18 Digit <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nop}
                      onChange={(e) => setNop(e.target.value)}
                      placeholder="63.08.010.001.002-0045.0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Format baku: 63.08.xxx.xxx.xxx-xxxx.x
                    </p>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Status NOP Objek Pajak
                    </label>
                    <div className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-2.5 text-xs text-amber-300 flex items-center justify-between">
                      <span className="font-bold tracking-wide">TIDAK ADA NOP</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-500/30">
                        Objek Baru
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-400/80 mt-1">
                      Tetap dapat direkam untuk pendataan &amp; penerbitan NOP oleh BP2RD
                    </p>
                  </>
                )}
              </div>

              {/* Tahun Pajak SPPT */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tahun Pajak SPPT <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={tahunPajak}
                  onChange={(e) => setTahunPajak(parseInt(e.target.value) || 2026)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nama Wajib Pajak <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaWajibPajak}
                  onChange={(e) => setNamaWajibPajak(e.target.value)}
                  placeholder="Contoh: H. Rusliansyah, S.Pd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  NIK Wajib Pajak (Opsional)
                </label>
                <input
                  type="text"
                  value={nikWajibPajak}
                  onChange={(e) => setNikWajibPajak(e.target.value)}
                  placeholder="6308011204780001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Kecamatan (Kab. HSU)
                </label>
                <select
                  value={kecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                  placeholder="Contoh: Murung Sari / Pakacangan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Alamat Lengkap Objek Pajak (Persil)
                </label>
                <input
                  type="text"
                  value={alamatObjek}
                  onChange={(e) => setAlamatObjek(e.target.value)}
                  placeholder="Jl. Empu Jatmika No. 14 RT 04, Amuntai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Geospasial GPS Hulu Sungai Utara */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-teal-400">
                <MapPin className="w-4 h-4" />
                <span>2. Koordinat Geospasial Objek Tanah &amp; Bangunan HSU</span>
              </h2>

              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
                <span>{isCapturingGps ? 'Merekam GPS Satelit...' : 'Kunci Titik GPS Objek'}</span>
              </button>
            </div>

            {gpsStatusMessage && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{gpsStatusMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Luas Bumi, Bangunan, NJOP & Ketetapan PBB (Sesuai Referensi SPPT PBB Resmi) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            
            {/* Header Section 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400">
                <Calculator className="w-5 h-5" />
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    3. Luas Bumi, Bangunan, NJOP &amp; Ketetapan PBB-P2
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Formulasi resmi SPPT PBB-P2 Pemkab Hulu Sungai Utara &bull; UU HKPD No. 1/2022 &bull; Perda No. 01/2024
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCurrentSpptModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Lembar SPPT Resmi</span>
              </button>
            </div>

            {/* Presets Cepat Objek Pajak di Wilayah HSU */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilihan Cepat Standar Wilayah Kabupaten HSU (1-Klik):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPresetHsu('hunian')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/70 hover:border-teal-500/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-white block text-[11px] group-hover:text-teal-300">
                    🏠 Hunian / Perumahan
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Bumi 300m&sup2; &bull; Bgn 120m&sup2; (0,10%)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetHsu('ruko')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/70 hover:border-blue-500/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-white block text-[11px] group-hover:text-blue-300">
                    🏢 Ruko Pasar Amuntai
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Bumi 250m&sup2; &bull; Bgn 350m&sup2; (0,20%)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetHsu('pertanian')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/70 hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-white block text-[11px] group-hover:text-emerald-300">
                    🌾 Sawah Rawa Lebak
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Bumi 2.500m&sup2; &bull; Tanpa Bgn (0,05%)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetHsu('tanah_kosong')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/70 hover:border-amber-500/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-white block text-[11px] group-hover:text-amber-300">
                    📍 Pekarangan Kosong
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Bumi 500m&sup2; &bull; Tanpa Bgn (0,10%)
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Panel: A. DATA OBJEK BUMI / TANAH & B. DATA OBJEK BANGUNAN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* KOTAK A: OBJEK BUMI (TANAH) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      A. Data Objek Bumi (Tanah / Persil)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    <span>Kelas:</span>
                    <strong className="font-black text-white">{kelasBumi}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Luas Tanah / Bumi (m&sup2;) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Contoh: 450"
                      value={luasBumiM2 === 0 ? '' : luasBumiM2}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setLuasBumiM2(isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Kelas Bumi (SPPT)
                    </label>
                    <input
                      type="text"
                      placeholder={calcResult.kelasBumi}
                      value={customKelasBumi}
                      onChange={(e) => setCustomKelasBumi(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Otomatis: {calcResult.kelasBumi}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      NJOP Bumi per m&sup2; (Rp) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {formatRupiah(njopBumiPerM2)}/m&sup2;
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Masukkan NJOP Bumi per m² (Rp)"
                    value={njopBumiPerM2 === 0 ? '' : njopBumiPerM2}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setNjopBumiPerM2(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {/* Quick NJOP Bumi Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[60000, 150000, 350000, 500000, 850000, 1200000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNjopBumiPerM2(v)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          njopBumiPerM2 === v
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {formatRupiah(v).replace(',00', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal Total NJOP Bumi Box */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold block">
                      Total Nilai NJOP Bumi (Luas &times; NJOP/m&sup2;):
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      {luasBumiM2} m&sup2; &times; {formatRupiah(njopBumiPerM2)}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-emerald-300">
                    {formatRupiah(calcResult.totalNjopBumi)}
                  </span>
                </div>
              </div>

              {/* KOTAK B: OBJEK BANGUNAN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      B. Data Objek Bangunan
                    </h3>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasBangunan}
                      onChange={(e) => setHasBangunan(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      Ada Bangunan
                    </span>
                  </label>
                </div>

                {hasBangunan ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Luas Bangunan (m&sup2;) <span className="text-[10px] text-slate-400 font-normal ml-1">(Opsional)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0 (Opsional)"
                          value={luasBangunanM2 === 0 ? '' : luasBangunanM2}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setLuasBangunanM2(isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Biarkan 0 atau kosong jika tidak ada bangunan
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Kelas Bangunan (SPPT)
                        </label>
                        <input
                          type="text"
                          placeholder={calcResult.kelasBangunan}
                          value={customKelasBangunan}
                          onChange={(e) => setCustomKelasBangunan(e.target.value.toUpperCase())}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Otomatis: {calcResult.kelasBangunan}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          NJOP Bangunan per m&sup2; (Rp) <span className="text-[10px] text-slate-400 font-normal ml-1">(Opsional)</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-blue-400">
                          {formatRupiah(njopBangunanPerM2)}/m&sup2;
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0 (Opsional)"
                        value={njopBangunanPerM2 === 0 ? '' : njopBangunanPerM2}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setNjopBangunanPerM2(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      {/* Quick NJOP Bangunan Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setNjopBangunanPerM2(0)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            njopBangunanPerM2 === 0
                              ? 'bg-blue-500 text-white font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          Rp 0 (Kosong)
                        </button>
                        {[500000, 750000, 1000000, 1200000, 1500000, 1800000].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setNjopBangunanPerM2(v)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                              njopBangunanPerM2 === v
                                ? 'bg-blue-500 text-white font-bold'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {formatRupiah(v).replace(',00', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal Total NJOP Bangunan Box */}
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-blue-400 uppercase font-sans font-bold block">
                          Total Nilai NJOP Bangunan:
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {luasBangunanM2 > 0 && njopBangunanPerM2 > 0
                            ? `${luasBangunanM2} m² × ${formatRupiah(njopBangunanPerM2)}`
                            : 'Rp 0 (Tanpa Nilai Bangunan / Opsional)'}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-blue-300">
                        {formatRupiah(calcResult.totalNjopBangunan)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">
                      Objek Tidak Memiliki Bangunan (Tanah Kosong)
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Luas &amp; NJOP Bangunan dihitung Rp 0. Perhitungan PBB hanya didasarkan pada NJOP Bumi/Tanah.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Sub-Panel: C. PARAMETER KETETAPAN PBB-P2 (NJOPTKP, TARIF, STIMULUS) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                <span>C. Parameter Pengenaan, Tarif &amp; Stimulus Pajak Daerah</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                {/* 1. NJOPTKP */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    NJOPTKP (Tidak Kena Pajak)
                  </label>
                  <select
                    value={njoptkp}
                    onChange={(e) => setNjoptkp(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer font-medium"
                  >
                    <option value={10000000}>Rp 10.000.000 (Standar Perda HSU)</option>
                    <option value={12000000}>Rp 12.000.000 (Maksimal)</option>
                    <option value={0}>Rp 0 (Objek Kedua WP Sama)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Objek utama WP berhak NJOPTKP
                  </span>
                </div>

                {/* 2. Tarif PBB-P2 */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tarif PBB-P2 (%)
                  </label>
                  <select
                    value={tarifPbbPersen}
                    onChange={(e) => setTarifPbbPersen(parseFloat(e.target.value) || 0.15)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer font-medium"
                  >
                    <option value={0.10}>0,10% (Hunian &le; 1 Miliar)</option>
                    <option value={0.15}>0,15% (Standar Umum SPPT HSU)</option>
                    <option value={0.20}>0,20% (Komersial / &gt; 1 Miliar)</option>
                    <option value={0.05}>0,05% (Pertanian / Peternakan Rawa)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Perda Kab. HSU No. 01/2024
                  </span>
                </div>

                {/* 3. Stimulus / Pengurangan SPPT */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Stimulus / Pengurangan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={stimulusPengurangan === 0 ? '' : stimulusPengurangan}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setStimulusPengurangan(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Keringanan pensiunan / stimulus
                  </span>
                </div>

                {/* 4. Denda Administrasi */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Denda Keterlambatan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dendaAdministrasi === 0 ? '' : dendaAdministrasi}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setDendaAdministrasi(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    1% per bulan lewat tempo
                  </span>
                </div>

              </div>
            </div>

            {/* Sub-Panel: D. TABEL RESMI LEMBAR SPPT PBB-P2 (SESUAI DOKUMEN RESMI BP2RD HSU) */}
            <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl">
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Format Tabel Lembar Resmi SPPT PBB-P2 (Kabupaten Hulu Sungai Utara)
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Hitungan Real-Time Sah
                </span>
              </div>

              {/* Tabel Komparasi Objek Bumi & Bangunan */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                      <th className="py-2.5 px-4 text-left">Objek Pajak</th>
                      <th className="py-2.5 px-4 text-right">Luas (m&sup2;)</th>
                      <th className="py-2.5 px-4 text-center">Kelas</th>
                      <th className="py-2.5 px-4 text-right">NJOP per m&sup2; (Rp)</th>
                      <th className="py-2.5 px-4 text-right font-bold text-teal-300">Total NJOP (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>BUMI (Tanah Persil)</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">
                        {luasBumiM2.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400">
                        {kelasBumi}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {formatRupiah(njopBumiPerM2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {formatRupiah(calcResult.totalNjopBumi)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span>BANGUNAN</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">
                        {hasBangunan ? luasBangunanM2.toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-400">
                        {hasBangunan ? kelasBangunan : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {hasBangunan ? formatRupiah(njopBangunanPerM2) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {formatRupiah(calcResult.totalNjopBangunan)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rincian Komputasi Ketetapan SPPT */}
              <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans">Total Nilai Jual Objek Pajak (NJOP Bumi + Bangunan):</span>
                  <span className="font-bold text-white text-sm">{formatRupiah(calcResult.njopTotal)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-sans">Nilai Jual Objek Pajak Tidak Kena Pajak (NJOPTKP):</span>
                  <span className="text-amber-300">(-) {formatRupiah(calcResult.njoptkp)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="font-sans font-bold">NJOP untuk Penghitungan PBB (NJOPKP):</span>
                  <span className="font-bold text-teal-300 text-sm">{formatRupiah(calcResult.njopKenaPajak)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-sans">Tarif Pajak Bumi &amp; Bangunan P2:</span>
                  <span className="text-slate-200 font-bold">{calcResult.tarifPbbPersen}%</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans">Ketetapan Pokok PBB Terhutang ({calcResult.tarifPbbPersen}% &times; NJOPKP):</span>
                  <span className="font-bold text-white">{formatRupiah(calcResult.ketetapanPbbTerhutang)}</span>
                </div>

                {calcResult.stimulusPengurangan > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="font-sans">Pengurangan / Stimulus SPPT:</span>
                    <span>(-) {formatRupiah(calcResult.stimulusPengurangan)}</span>
                  </div>
                )}

                {calcResult.dendaAdministrasi > 0 && (
                  <div className="flex justify-between items-center text-red-400">
                    <span className="font-sans">Denda Administrasi Keterlambatan:</span>
                    <span>(+) {formatRupiah(calcResult.dendaAdministrasi)}</span>
                  </div>
                )}

                {/* Final Total Ketetapan Highlight */}
                <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-teal-950 via-slate-900 to-blue-950 border border-teal-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="text-xs uppercase font-sans font-black text-teal-300 tracking-wider block">
                      JUMLAH PBB YANG HARUS DIBAYAR :
                    </span>
                    <span className="text-[11px] font-sans text-slate-300 italic">
                      Terbilang: &ldquo;{calcResult.terbilang}&rdquo;
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatRupiah(calcResult.totalPbbHarusDibayar)}
                  </div>
                </div>
              </div>

              {/* Action Button at bottom of table */}
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Formula teruji: Luas Bumi &times; NJOP/m&sup2; + Luas Bgn &times; NJOP/m&sup2; - NJOPTKP &times; Tarif
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentSpptModal(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Lembar SPPT Lengkap Siap Cetak</span>
                </button>
              </div>
            </div>

          </div>

          {/* 4. Status Pembayaran SPPT */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <Calendar className="w-4 h-4" />
              <span>4. Status Pembayaran &amp; Tempat Bayar</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Status Pembayaran SPPT
                </label>
                <select
                  value={statusPembayaran}
                  onChange={(e) => setStatusPembayaran(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="BELUM LUNAS">BELUM LUNAS (Piutang)</option>
                  <option value="LUNAS">LUNAS (Terbayar Sah)</option>
                </select>
              </div>

              {statusPembayaran === 'LUNAS' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Bank Persepsi / Tempat Bayar
                    </label>
                    <input
                      type="text"
                      value={bankTempatBayar}
                      onChange={(e) => setBankTempatBayar(e.target.value)}
                      placeholder="Bank Kalsel Cabang Amuntai / Pos"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Nomor Struk / Bukti Setor
                    </label>
                    <input
                      type="text"
                      value={nomorStruk}
                      onChange={(e) => setNomorStruk(e.target.value)}
                      placeholder="STRUK-BKS/HSU/2026/03/xxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 5. Upload File Objek Pajak PBB-P2 & Struk Bayar (Laptop & HP) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-blue-400">
                <Upload className="w-4 h-4" />
                <span>5. Unggah Berkas Objek Pajak PBB-P2 &amp; Struk Setoran</span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                <span>Laptop File</span>
                <span>&bull;</span>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>HP Kamera / Galeri</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Upload 1: Foto Fisik Objek Tanah/Bangunan */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-400" />
                      <span>Upload Foto Objek Pajak (Tanah/Bangunan)</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      JPG / PNG / PDF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Foto persil tanah atau tampak depan bangunan wajib pajak dari kamera HP atau file laptop.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                    <Camera className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Ambil Foto / Pilih Berkas Objek</span>
                    <span className="text-[10px] text-slate-500">Kamera HP atau Galeri Laptop</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFotoObjekPbbUpload}
                      className="hidden"
                    />
                  </label>

                  {fotoObjekPbbUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-800 text-xs">
                      {fotoObjekPbbUrl.startsWith('data:image') ? (
                        <img 
                          src={fotoObjekPbbUrl} 
                          alt="Preview Foto Objek" 
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0" 
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-blue-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-white block truncate">{fotoObjekPbbName}</span>
                        <span className="text-[10px] text-blue-300">{fotoObjekPbbSize || 'Berkas Terlampir'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload 2: Struk Bayar PBB-P2 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Upload Struk / Bukti Bayar Bank</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      JPG / PNG / PDF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Struk setoran Bank Kalsel, bukti teller, atau struk pos untuk validasi status Lunas.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-4 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900">
                    <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Unggah Bukti Setoran Bank</span>
                    <span className="text-[10px] text-slate-500">Maksimal 10MB dari HP / Laptop</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleStrukBayarUpload}
                      className="hidden"
                    />
                  </label>

                  {strukBayarUrl && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800 text-xs text-slate-200">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{strukBayarName || 'Struk_Bayar_PBB.pdf'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">Sah</span>
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-600 to-blue-500 hover:from-blue-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-blue-950/50 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan SPPT PBB-P2</span>
            </button>
          </div>

        </form>
      )}

      {/* VIEW 2: DAFTAR SPPT TERINPUT LANGSUNG PADA MENU INI (HANYA TAMPIL UNTUK ADMIN & USER) */}
      {isInternalUser && activeSubTab === 'riwayat' && (
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Daftar SPPT PBB-P2 Terinput pada Sistem ({pbbList.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Data otomatis tersimpan &amp; disinkronkan ke Manajemen Laporan dan Dashboard Analitik.
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
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Formulir SPPT Baru
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
                placeholder="Cari NOP, nama WP, desa..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusBayarFilter}
                onChange={(e) => setStatusBayarFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Status Bayar</option>
                <option value="LUNAS">LUNAS</option>
                <option value="BELUM LUNAS">BELUM LUNAS</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">NOP (18 Digit)</th>
                  <th className="py-3 px-3">Nama Wajib Pajak</th>
                  <th className="py-3 px-3">Kecamatan / Desa</th>
                  <th className="py-3 px-3 text-right">Luas Bumi</th>
                  <th className="py-3 px-3 text-right">Luas Bangunan</th>
                  <th className="py-3 px-3 text-right">PBB Terhutang</th>
                  <th className="py-3 px-3 text-center">Status Bayar</th>
                  <th className="py-3 px-3">Tempat Bayar</th>
                  <th className="py-3 px-3 text-center">Status Validasi</th>
                  <th className="py-3 px-3 text-center">Berkas</th>
                  <th className="py-3 px-3 text-center min-w-[190px]">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {pbbList
                  .filter(p => {
                    const matchSearch = !searchKeyword || 
                      p.nop.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.namaWajibPajak.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.kecamatan.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      p.kelurahanDesa.toLowerCase().includes(searchKeyword.toLowerCase());
                    const matchStatus = statusBayarFilter === 'all' || p.statusPembayaran === statusBayarFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((p) => {
                    const isNewlyAdded = justSavedItem?.id === p.id;
                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors ${
                          isNewlyAdded 
                            ? 'bg-blue-950/50 ring-1 ring-blue-500/50' 
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {p.nop === 'TIDAK ADA NOP' || p.statusNop === 'tidak_ada' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Tidak Ada NOP
                              </span>
                            ) : (
                              <span className="text-blue-400">{p.nop}</span>
                            )}
                            {isNewlyAdded && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-blue-500 text-white">
                                Baru Disimpan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          {p.namaWajibPajak}
                        </td>
                        <td className="py-3 px-3">
                          <span className="block text-slate-200">{p.kecamatan}</span>
                          <span className="text-[10px] text-slate-400 block">{p.kelurahanDesa}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                          {p.luasBumiM2} m&sup2;
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                          {p.luasBangunanM2} m&sup2;
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {formatRupiah(p.pbbTerhutang)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.statusPembayaran === 'LUNAS'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {p.statusPembayaran}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                          {p.bankTempatBayar || '-'}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                            {p.fotoObjekPbbUrl && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                                Foto
                              </span>
                            )}
                            {p.strukBayarUrl && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Struk
                              </span>
                            )}
                            {!p.fotoObjekPbbUrl && !p.strukBayarUrl && (
                              <span className="text-[10px] text-slate-500">-</span>
                            )}
                          </div>
                        </td>
                        {/* Aksi Petugas: SPPT, Proses, Verifikasi, Setuju */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedSpptForModal(p)}
                              title="Buka Lembar Resmi SPPT PBB-P2"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/80 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>SPPT</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePbbStatus) {
                                  onUpdatePbbStatus(p.id, 'Dalam Proses');
                                }
                              }}
                              title="Tandai Sedang Diproses Validasi"
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
                                if (onUpdatePbbStatus) {
                                  onUpdatePbbStatus(p.id, 'Terverifikasi');
                                }
                              }}
                              title="Verifikasi Ketetapan PBB"
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
                                if (onUpdatePbbStatus) {
                                  onUpdatePbbStatus(p.id, 'Disetujui');
                                }
                              }}
                              title="Setujui Validasi PBB"
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

      {/* Modal Lembar Resmi SPPT PBB-P2 (Formulir Langsung) */}
      {showCurrentSpptModal && (
        <SpptPbbModal
          entry={{
            nop: statusNop === 'tidak_ada' ? 'TIDAK ADA NOP' : (nop || '63.08.xxx.xxx.xxx-xxxx.x'),
            tahunPajak,
            namaWajibPajak: namaWajibPajak || 'Wajib Pajak Terdata',
            nikWajibPajak,
            kecamatan,
            kelurahanDesa: kelurahanDesa || 'Amuntai',
            alamatObjek: alamatObjek || `Wilayah ${kecamatan}`,
            luasBumiM2,
            njopBumiPerM2,
            kelasBumi,
            totalNjopBumi: calcResult.totalNjopBumi,
            luasBangunanM2: effectiveLuasBangunan,
            njopBangunanPerM2: effectiveNjopBangunan,
            kelasBangunan,
            totalNjopBangunan: calcResult.totalNjopBangunan,
            njopTotal: calcResult.njopTotal,
            njoptkp: calcResult.njoptkp,
            njopKenaPajak: calcResult.njopKenaPajak,
            tarifPbbPersen: calcResult.tarifPbbPersen,
            stimulusPengurangan: calcResult.stimulusPengurangan,
            dendaAdministrasi: calcResult.dendaAdministrasi,
            totalPbbHarusDibayar: calcResult.totalPbbHarusDibayar,
            pbbTerhutang: calcResult.totalPbbHarusDibayar,
            statusPembayaran,
            bankTempatBayar,
            petugasValidasi: currentUser?.name || 'Petugas Validasi BP2RD HSU',
          }}
          onClose={() => setShowCurrentSpptModal(false)}
        />
      )}

      {/* Modal Lembar Resmi SPPT PBB-P2 (Dari Tabel Riwayat) */}
      {selectedSpptForModal && (
        <SpptPbbModal
          entry={selectedSpptForModal}
          onClose={() => setSelectedSpptForModal(null)}
        />
      )}

    </div>
  );
};
