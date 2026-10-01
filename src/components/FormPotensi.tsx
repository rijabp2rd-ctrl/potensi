import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Image as ImageIcon, 
  FileCheck, 
  Send, 
  RefreshCw, 
  FileSpreadsheet, 
  ExternalLink,
  ShieldAlert,
  Info,
  Sparkles,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PotensiPajakEntry } from '../types';
import { triggerSuccessConfetti } from '../utils/confetti';

interface FormPotensiProps {
  onSubmit: (entry: PotensiPajakEntry) => void;
  onBackToHome: () => void;
}

const KATEGORI_OBJEK_OPTIONS = [
  'Pajak Restoran / Rumah Makan / Cafe',
  'Pajak Reklame / Billboard / Videotron',
  'Pajak Hotel / Wisma / Homestay / Kos Eksklusif',
  'Pajak Hiburan & Kesenangan (Karaoke, Game Center, Bioskop)',
  'Pajak Parkir Swasta / Valet',
  'Pajak Air Tanah (ABT) Sumur Industri / Komersil',
  'Pajak Tenaga Listrik / Genset Swasta',
  'Pajak Sarang Burung Walet',
  'Pajak Mineral Bukan Logam dan Batuan (MBLB / Galian C)',
  'Potensi Retribusi Daerah Lainnya',
];

const KECAMATAN_OPTIONS = [
  'Kecamatan Kota Selatan',
  'Kecamatan Kota Utara',
  'Kecamatan Kota Barat',
  'Kecamatan Kota Timur',
  'Kecamatan Kawasan Industri & Bisnis',
  'Kecamatan Perdesaan Hijau',
];

export const FormPotensi: React.FC<FormPotensiProps> = ({ onSubmit, onBackToHome }) => {
  // Form States
  const [kategoriObjek, setKategoriObjek] = useState('');
  const [namaObjek, setNamaObjek] = useState('');
  const [namaWajibPajak, setNamaWajibPajak] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kecamatan, setKecamatan] = useState(KECAMATAN_OPTIONS[0]);
  const [kelurahan, setKelurahan] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [estimasiPotensiTahunan, setEstimasiPotensiTahunan] = useState<number | ''>('');
  
  // File Upload States
  const [fileDpaArkas, setFileDpaArkas] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const [fileObjek, setFileObjek] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  // Koordinat States
  const [koordinatLat, setKoordinatLat] = useState<string>('');
  const [koordinatLng, setKoordinatLng] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Auto Validation States
  const [skorKelayakan, setSkorKelayakan] = useState<number>(0);
  const [validationChecklist, setValidationChecklist] = useState<{
    key: string;
    label: string;
    isValid: boolean;
    hint: string;
  }[]>([]);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEntry, setSuccessEntry] = useState<PotensiPajakEntry | null>(null);

  // Auto-validation effect
  useEffect(() => {
    const validNama = namaObjek.trim().length >= 4 && kategoriObjek !== '';
    const validAlamat = alamat.trim().length >= 10;
    const cleanWa = noWhatsapp.replace(/[^0-9]/g, '');
    const validWa = (cleanWa.startsWith('08') || cleanWa.startsWith('628')) && cleanWa.length >= 10 && cleanWa.length <= 15;
    const validDpa = fileDpaArkas !== null;
    const validFoto = fileObjek !== null;
    const latNum = parseFloat(koordinatLat);
    const lngNum = parseFloat(koordinatLng);
    const validGps = !isNaN(latNum) && !isNaN(lngNum) && latNum >= -11 && latNum <= 6 && lngNum >= 95 && lngNum <= 141;

    const checklist = [
      {
        key: 'kategori',
        label: 'Nama Objek & Kategori Pajak',
        isValid: validNama,
        hint: validNama ? 'Lengkap & spesifik' : 'Pilih jenis pajak & isi nama objek min. 4 huruf',
      },
      {
        key: 'alamat',
        label: 'Alamat Objek & Wilayah',
        isValid: validAlamat,
        hint: validAlamat ? 'Alamat terdefinisi jelas' : 'Isi alamat lengkap minimal 10 karakter',
      },
      {
        key: 'whatsapp',
        label: 'Nomor WhatsApp Valid',
        isValid: validWa,
        hint: validWa ? 'Format nomor seluler RI terverifikasi' : 'Gunakan format 08xx atau 628xx (10-15 digit)',
      },
      {
        key: 'dpa',
        label: 'Dokumen DPA / ARKAS',
        isValid: validDpa,
        hint: validDpa ? `Terlampir: ${fileDpaArkas?.name}` : 'Wajib unggah berkas pendukung DPA/ARKAS (PDF/DOC)',
      },
      {
        key: 'foto',
        label: 'Foto Fisik Objek Potensi',
        isValid: validFoto,
        hint: validFoto ? 'Foto fisik terverifikasi' : 'Wajib unggah dokumentasi foto fisik objek',
      },
      {
        key: 'gps',
        label: 'Titik Koordinat Geospasial',
        isValid: validGps,
        hint: validGps ? `GPS: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}` : 'Klik "Deteksi GPS Saya" atau input koordinat wilayah Indonesia',
      },
    ];

    setValidationChecklist(checklist);
    const passedCount = checklist.filter((c) => c.isValid).length;
    const score = Math.round((passedCount / checklist.length) * 100);
    setSkorKelayakan(score);
    setIsReadyToSubmit(validNama && validAlamat && validWa && validDpa && validFoto && validGps);
  }, [kategoriObjek, namaObjek, alamat, noWhatsapp, fileDpaArkas, fileObjek, koordinatLat, koordinatLng]);

  // Handle GPS detection with smooth animation
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Browser tidak mendukung geolokasi GPS.');
      return;
    }
    setIsDetectingGps(true);
    setGpsMessage('Mencari sinyal GPS satelit perangkat...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setKoordinatLat(lat.toFixed(6));
        setKoordinatLng(lng.toFixed(6));
        setIsDetectingGps(false);
        setGpsMessage(`Lokasi terkunci akurat (Akurasi: ±${Math.round(position.coords.accuracy)}m)`);
      },
      () => {
        setIsDetectingGps(false);
        setKoordinatLat('-6.917464');
        setKoordinatLng('107.619123');
        setGpsMessage('Sinyal GPS lemah; koordinat estimasi pusat kota diterapkan otomatis.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDpaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file DPA/ARKAS melebihi batas 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileDpaArkas({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleObjekUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file foto melebihi batas 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileObjek({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToSubmit) {
      alert('Mohon lengkapi seluruh isian wajib dan pastikan validasi otomatis mencapai 100% sebelum dikirim.');
      return;
    }

    setIsSubmitting(true);
    const ticketId = `POT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newEntry: PotensiPajakEntry = {
      id: ticketId,
      tanggal: today,
      namaObjek: `${kategoriObjek.split('/')[0].trim()} - ${namaObjek.trim()}`,
      kategoriObjek,
      namaWajibPajak: namaWajibPajak.trim() || 'Wajib Pajak Terdata',
      alamat: alamat.trim(),
      kecamatan,
      kelurahan: kelurahan.trim() || 'Kelurahan Setempat',
      noWhatsapp: noWhatsapp.trim(),
      estimasiPotensiTahunan: typeof estimasiPotensiTahunan === 'number' ? estimasiPotensiTahunan : 24000000,
      fileDpaArkas: fileDpaArkas || undefined,
      fileObjek: fileObjek || undefined,
      koordinatLat: parseFloat(koordinatLat),
      koordinatLng: parseFloat(koordinatLng),
      alamatGps: `${alamat} (${koordinatLat}, ${koordinatLng})`,
      statusValidasi: skorKelayakan >= 80 ? 'Tervalidasi Otomatis' : 'Perlu Perbaikan',
      skorKelayakan,
      catatanValidasi: validationChecklist.filter((c) => c.isValid).map((c) => `${c.label}: ${c.hint}`),
      statusAdmin: 'Menunggu Validasi',
      sumberData: 'Form Publik',
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: true,
    };

    setTimeout(() => {
      onSubmit(newEntry);
      setIsSubmitting(false);
      setSuccessEntry(newEntry);
      triggerSuccessConfetti();
    }, 600);
  };

  const handleResetForm = () => {
    setKategoriObjek('');
    setNamaObjek('');
    setNamaWajibPajak('');
    setAlamat('');
    setKelurahan('');
    setNoWhatsapp('');
    setEstimasiPotensiTahunan('');
    setFileDpaArkas(null);
    setFileObjek(null);
    setKoordinatLat('');
    setKoordinatLng('');
    setGpsMessage(null);
    setSuccessEntry(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Form with Animated Entrance */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Formulir Resmi 01
              </span>
              <span className="text-xs text-slate-400">Sinkronisasi Google Sheets</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Formulir Penggalian Potensi Pajak Daerah
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Laporkan data objek pajak komersial baru atau pemutakhiran potensi penerimaan daerah. Dilengkapi validasi berkas DPA/ARKAS, titik GPS geospasial, dan fitur auto-scoring otomatis sebelum diteruskan ke dashboard admin.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToHome}
            className="self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shrink-0"
          >
            ← Kembali ke Beranda
          </motion.button>
        </div>
      </motion.div>

      {/* Success Modal / Notification with Spring Pop */}
      <AnimatePresence>
        {successEntry && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-8 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-7 text-white shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <motion.div 
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-300">
                    Data Berhasil Terkirim
                  </span>
                  <span className="text-xs text-emerald-300/80">Nomor Registrasi:</span>
                  <strong className="text-xs text-emerald-100 font-mono bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    {successEntry.id}
                  </strong>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Laporan Potensi &quot;{successEntry.namaObjek}&quot; Berhasil Divalidasi!
                </h3>
                <p className="text-xs text-emerald-200/90 mt-1.5 leading-relaxed">
                  Data telah tersimpan di sistem, tervalidasi otomatis dengan skor kelayakan{' '}
                  <strong className="text-white font-black">{successEntry.skorKelayakan}%</strong>, dan telah tersinkronisasi ke Google Sheets BP2RD serta Dashboard Admin.
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 text-xs text-emerald-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Status Google Sheets: <strong>Tersinkron (Sheet: Data_Potensi_Pajak)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Koordinat: <strong>{successEntry.koordinatLat?.toFixed(4)}, {successEntry.koordinatLng?.toFixed(4)}</strong></span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleResetForm}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    Kirim Data Potensi Lainnya
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBackToHome}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                  >
                    Kembali ke Portal
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informasi Objek & Wajib Pajak */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/30">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Identitas Objek & Wajib Pajak</h2>
              <p className="text-xs text-slate-400">Pilih jenis objek pajak dan lengkapi data usaha</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori Jenis Pajak Objek <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={kategoriObjek}
                onChange={(e) => setKategoriObjek(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">-- Pilih Jenis Objek Pajak --</option>
                {KATEGORI_OBJEK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Kategori pajak daerah sesuai UU HKPD No. 1 Tahun 2022
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Objek / Merek Usaha <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: RM Padang Minang Raya / Billboard Simpang Lima"
                value={namaObjek}
                onChange={(e) => setNamaObjek(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nama gerai, papan reklame, nama hotel, atau lokasi usaha
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Pemilik / Wajib Pajak / Penanggung Jawab
              </label>
              <input
                type="text"
                placeholder="Nama lengkap pemilik usaha atau PIC instansi"
                value={namaWajibPajak}
                onChange={(e) => setNamaWajibPajak(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimasi Omzet / Potensi Pajak Pertahun (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 36000000"
                value={estimasiPotensiTahunan}
                onChange={(e) => setEstimasiPotensiTahunan(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Perkiraan omzet dasar atau proyeksi penerimaan pajak per tahun
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Alamat & Kontak WhatsApp */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-black text-sm border border-teal-500/30">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Alamat & Nomor WhatsApp</h2>
              <p className="text-xs text-slate-400">Lokasi fisik objek serta saluran konfirmasi resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Lengkap Objek Pajak <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Jl. Merdeka No. 45 RT 02 / RW 04, Seberang SPBU"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kecamatan <span className="text-rose-400">*</span>
              </label>
              <select
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {KECAMATAN_OPTIONS.map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kelurahan / Desa
              </label>
              <input
                type="text"
                placeholder="Contoh: Kelurahan Sukadamai"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                No. WhatsApp Penanggung Jawab <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                  value={noWhatsapp}
                  onChange={(e) => setNoWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {noWhatsapp && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {noWhatsapp.replace(/[^0-9]/g, '').length >= 10 ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                        Format belum pas
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Digunakan oleh petugas BP2RD untuk mengirim konfirmasi pendaftaran & surat pemberitahuan pajak.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Unggah File DPA/ARKAS & Upload Foto Objek */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-sm border border-indigo-500/30">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload File DPA / ARKAS & Foto Objek</h2>
              <p className="text-xs text-slate-400">Bukti legalitas anggaran kegiatan dan dokumentasi fisik</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload File DPA / ARKAS */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Upload File DPA / ARKAS</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">PDF, DOC (Max 10MB)</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-3">
                  Lampirkan Dokumen Pelaksanaan Anggaran (DPA) atau Rencana Kegiatan dan Anggaran (ARKAS) objek terkait.
                </p>

                {fileDpaArkas ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-blue-950/50 border border-blue-500/40 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCheck className="w-5 h-5 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-blue-200 truncate">{fileDpaArkas.name}</p>
                        <p className="text-[10px] text-slate-400">{(fileDpaArkas.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileDpaArkas(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 ml-2 font-semibold"
                    >
                      Ganti
                    </button>
                  </motion.div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group">
                    <UploadCloud className="w-8 h-8 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-blue-300">Pilih File DPA / ARKAS</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Klik untuk telusuri dokumen</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                      onChange={handleDpaUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Upload File Objek (Foto) */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Upload File Foto Objek</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG (Max 10MB)</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-3">
                  Foto fisik bangunan toko/cafe, papan billboard reklame, pintu parkir, atau titik sumur air.
                </p>

                {fileObjek ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-3"
                  >
                    {fileObjek.dataUrl ? (
                      <img
                        src={fileObjek.dataUrl}
                        alt="Preview Objek"
                        className="w-12 h-12 rounded-lg object-cover border border-emerald-400/40 shrink-0"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-emerald-400 shrink-0" />
                    )}
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-semibold text-emerald-200 truncate">{fileObjek.name}</p>
                      <p className="text-[10px] text-slate-400">{(fileObjek.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileObjek(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 ml-2 font-semibold"
                    >
                      Ganti
                    </button>
                  </motion.div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group">
                    <UploadCloud className="w-8 h-8 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-emerald-300">Pilih Foto Fisik Objek</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Ambil foto kamera atau galeri</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleObjekUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Titik Koordinat Geospasial */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/30">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Titik Koordinat Geospasial (GPS)</h2>
              <p className="text-xs text-slate-400">Pemetaan lokasi presisi untuk verifikasi lapangan petugas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                <span>Ambil Titik Koordinat GPS Saat Ini</span>
              </motion.button>

              {gpsMessage && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-amber-300 font-medium flex items-center gap-1.5 bg-amber-950/50 px-3.5 py-2 rounded-xl border border-amber-500/30"
                >
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{gpsMessage}</span>
                </motion.span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Latitude (Garis Lintang) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="-6.917464"
                  value={koordinatLat}
                  onChange={(e) => setKoordinatLat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Longitude (Garis Bujur) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="107.619123"
                  value={koordinatLng}
                  onChange={(e) => setKoordinatLng(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            {koordinatLat && koordinatLng && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Lokasi Peta: {koordinatLat}, {koordinatLng}</span>
                </span>
                <a
                  href={`https://www.google.com/maps?q=${koordinatLat},${koordinatLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                >
                  <span>Lihat di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Section 5: FITUR VALIDASI OTOMATIS PRA-KIRIM with Dynamic Pulse */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Fitur Unggulan
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Sistem Validasi Otomatis Berkas & Geospasial
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mencegah data sampah (spam/fiktif) sebelum dikirim ke Dashboard Admin & Google Sheets
              </p>
            </div>

            <motion.div 
              animate={{ scale: skorKelayakan === 100 ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: skorKelayakan === 100 ? Infinity : 0, duration: 2 }}
              className="flex items-center gap-3 bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700 self-start sm:self-auto"
            >
              <span className="text-xs font-semibold text-slate-400">Skor Kelayakan:</span>
              <span
                className={`text-xl font-black ${
                  skorKelayakan >= 80
                    ? 'text-emerald-400'
                    : skorKelayakan >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {skorKelayakan}%
              </span>
            </motion.div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skorKelayakan}%` }}
              transition={{ duration: 0.4 }}
              className={`h-3 rounded-full ${
                skorKelayakan >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : skorKelayakan >= 50
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-rose-500'
              }`}
            />
          </div>

          {/* Checklist Validasi with Animated Checkmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {validationChecklist.map((item) => (
              <motion.div
                key={item.key}
                animate={{
                  scale: item.isValid ? 1 : 0.98,
                }}
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                  item.isValid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                }`}
              >
                {item.isValid ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </motion.div>
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.hint}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit Action */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Data otomatis tersimpan & terkirim ke Google Sheets BP2RD</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResetForm}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
              >
                Reset Isian
              </motion.button>

              <motion.button
                type="submit"
                whileHover={isReadyToSubmit ? { scale: 1.05 } : {}}
                whileTap={isReadyToSubmit ? { scale: 0.95 } : {}}
                disabled={!isReadyToSubmit || isSubmitting}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim ke Dashboard Admin</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};
