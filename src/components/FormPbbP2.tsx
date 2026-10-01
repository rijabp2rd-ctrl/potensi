import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  Info, 
  Send, 
  RefreshCw, 
  FileSpreadsheet, 
  Receipt,
  User,
  Home,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PbbP2Entry } from '../types';
import { triggerSuccessConfetti } from '../utils/confetti';

interface FormPbbP2Props {
  onSubmit: (entry: PbbP2Entry) => void;
  onBackToHome: () => void;
}

const KECAMATAN_OPTIONS = [
  'Kecamatan Kota Selatan',
  'Kecamatan Kota Utara',
  'Kecamatan Kota Barat',
  'Kecamatan Kota Timur',
  'Kecamatan Kawasan Industri & Bisnis',
  'Kecamatan Perdesaan Hijau',
];

export const FormPbbP2: React.FC<FormPbbP2Props> = ({ onSubmit, onBackToHome }) => {
  const [namaWajibPajak, setNamaWajibPajak] = useState('');
  const [nik, setNik] = useState('');
  const [statusNop, setStatusNop] = useState<'ada' | 'tidak_ada'>('ada');
  const [nop, setNop] = useState('');
  const [lokasiObjek, setLokasiObjek] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [kelurahanDesa, setKelurahanDesa] = useState('');
  const [kecamatan, setKecamatan] = useState(KECAMATAN_OPTIONS[0]);
  const [tahunPajak, setTahunPajak] = useState<number>(2026);
  const [nominalBayar, setNominalBayar] = useState<number | ''>('');
  
  const [buktiBayar, setBuktiBayar] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEntry, setSuccessEntry] = useState<PbbP2Entry | null>(null);

  const handleNopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 2) formatted = raw.slice(0, 2) + '.' + raw.slice(2);
    if (raw.length > 4) formatted = formatted.slice(0, 5) + '.' + raw.slice(4);
    if (raw.length > 7) formatted = formatted.slice(0, 9) + '.' + raw.slice(7);
    if (raw.length > 10) formatted = formatted.slice(0, 13) + '.' + raw.slice(10);
    if (raw.length > 13) formatted = formatted.slice(0, 17) + '-' + raw.slice(13);
    if (raw.length > 17) formatted = formatted.slice(0, 22) + '.' + raw.slice(17, 18);
    setNop(formatted.slice(0, 24));
  };

  const handleBuktiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran berkas melebihi 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBuktiBayar({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const isValidNik = nik.trim().length === 16 && /^\d+$/.test(nik.trim());
  const isValidNama = namaWajibPajak.trim().length >= 3;
  const isValidLokasi = lokasiObjek.trim().length >= 8;
  const isValidBukti = buktiBayar !== null;
  const isValidNopField = statusNop === 'tidak_ada' || (statusNop === 'ada' && nop.replace(/[^0-9]/g, '').length >= 18);

  const isFormValid = isValidNik && isValidNama && isValidLokasi && isValidBukti && isValidNopField;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('Mohon lengkapi seluruh isian wajib (NIK 16 digit, Nama, Lokasi, dan Unggah Bukti Bayar).');
      return;
    }

    setIsSubmitting(true);
    const newId = `PBB-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newEntry: PbbP2Entry = {
      id: newId,
      tanggal: new Date().toISOString().split('T')[0],
      namaWajibPajak: namaWajibPajak.trim(),
      nik: nik.trim(),
      statusNop,
      nop: statusNop === 'ada' ? nop : undefined,
      lokasiObjek: lokasiObjek.trim(),
      rtRw: rtRw.trim() || undefined,
      kelurahanDesa: kelurahanDesa.trim() || 'Kelurahan Setempat',
      kecamatan,
      tahunPajak,
      nominalBayar: typeof nominalBayar === 'number' ? nominalBayar : 500000,
      buktiBayar: buktiBayar || undefined,
      statusVerifikasi: 'Lunas & Sah',
      catatanVerifikasi: 'Bukti pembayaran berhasil diunggah dan tervalidasi.',
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

  const handleReset = () => {
    setNamaWajibPajak('');
    setNik('');
    setStatusNop('ada');
    setNop('');
    setLokasiObjek('');
    setRtRw('');
    setKelurahanDesa('');
    setNominalBayar('');
    setBuktiBayar(null);
    setSuccessEntry(null);
  };

  const nopDigitsCount = nop.replace(/[^0-9]/g, '').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Form */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Formulir Resmi 02
              </span>
              <span className="text-xs text-slate-400">PBB-P2 Perdesaan & Perkotaan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Formulir Verifikasi & Setoran PBB-P2
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Layanan konfirmasi pembayaran Pajak Bumi dan Bangunan (PBB-P2) tahun berjalan serta pendaftaran permohonan NOP baru untuk objek tanah dan bangunan yang belum terdata di SISMIOP.
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

      {/* Success Banner */}
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
                    Data Terverifikasi
                  </span>
                  <span className="text-xs text-emerald-300/80">Kode Bukti:</span>
                  <strong className="text-xs text-emerald-100 font-mono bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    {successEntry.id}
                  </strong>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Bukti Pembayaran PBB-P2 a.n. {successEntry.namaWajibPajak} Diterima!
                </h3>
                <p className="text-xs text-emerald-200/90 mt-1.5 leading-relaxed">
                  Terima kasih telah berpartisipasi membangun daerah dengan membayar PBB-P2 tepat waktu. Data telah dicatat di database BP2RD dan disinkronkan ke Google Sheets.
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 text-xs text-emerald-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Google Sheets: <strong>Data_PBB_P2 (Tersinkron)</strong></span>
                  </div>
                  <div>
                    <span>Status NOP: <strong>{successEntry.statusNop === 'ada' ? successEntry.nop : 'Objek Baru / Belum Ada NOP'}</strong></span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    Kirim Data PBB Lainnya
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Wajib Pajak */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Identitas Wajib Pajak (KTP)</h2>
              <p className="text-xs text-slate-400">Data kependudukan pemilik hak atas tanah dan bangunan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap Wajib Pajak <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP / sertifikat"
                  value={namaWajibPajak}
                  onChange={(e) => setNamaWajibPajak(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Induk Kependudukan (NIK) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="16 digit angka NIK KTP"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    nik.length === 16 ? 'text-emerald-300 bg-emerald-950 font-bold border border-emerald-500/40' : 'text-slate-400'
                  }`}>
                    {nik.length}/16
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Wajib 16 digit angka sesuai KTP Elektronik
              </p>
            </div>
          </div>
        </motion.div>

        {/* NOP Dropdown & Nomor Objek Pajak */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/30">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Status & Nomor Objek Pajak (NOP)</h2>
              <p className="text-xs text-slate-400">Pilih ketersediaan NOP di SPPT PBB sebelumnya</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ketersediaan NOP (Nomor Objek Pajak) <span className="text-rose-400">*</span>
              </label>
              <select
                value={statusNop}
                onChange={(e) => setStatusNop(e.target.value as 'ada' | 'tidak_ada')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold cursor-pointer"
              >
                <option value="ada">Ada NOP (Sudah terdaftar di SPPT PBB sebelumnya)</option>
                <option value="tidak_ada">Tidak Ada NOP (Permohonan Pendaftaran Objek Pajak Baru / Pemecahan Bidang)</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              {statusNop === 'ada' ? (
                <motion.div 
                  key="nop-ada"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-white">
                      Nomor Objek Pajak (NOP 18 Digit Standar) <span className="text-rose-400">*</span>
                    </label>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      nopDigitsCount >= 18 ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-slate-400'
                    }`}>
                      {nopDigitsCount}/18 digit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="32.73.010.002.015-0089.0"
                    value={nop}
                    onChange={handleNopChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Format standar SISMIOP: Propinsi.Dati2.Kecamatan.Kelurahan.Blok-NomorUrut.Kode
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="nop-tidak-ada"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-xs text-amber-200 flex items-start gap-3"
                >
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300">Pendaftaran Objek Pajak Baru</h4>
                    <p className="mt-0.5 text-[11px] text-amber-200/90 leading-relaxed">
                      Untuk objek baru atau belum memiliki NOP, formulir ini akan didaftarkan ke sistem pemetaan ZNT untuk penertiban Surat Keterangan Nilai Objek & NOP definitif oleh UPT Pelayanan Pajak Daerah.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Lokasi Objek & Bukti Bayar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-black text-sm border border-teal-500/30">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lokasi Objek & Unggah Bukti Bayar</h2>
              <p className="text-xs text-slate-400">Alamat objek pajak serta struk setoran lunas tahun berjalan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lokasi Objek PBB (Alamat, Blok, Kavling) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Home className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perumahan Griya Indah Blok C2 No. 14"
                  value={lokasiObjek}
                  onChange={(e) => setLokasiObjek(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                RT / RW
              </label>
              <input
                type="text"
                placeholder="RT 04 / RW 08"
                value={rtRw}
                onChange={(e) => setRtRw(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kelurahan / Desa <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Kelurahan Sukadamai"
                value={kelurahanDesa}
                onChange={(e) => setKelurahanDesa(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kecamatan
              </label>
              <select
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
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
                Tahun Pajak & Nominal Pembayaran
              </label>
              <div className="flex gap-2">
                <select
                  value={tahunPajak}
                  onChange={(e) => setTahunPajak(Number(e.target.value))}
                  className="w-28 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
                <input
                  type="number"
                  placeholder="Nominal (Rp)"
                  value={nominalBayar}
                  onChange={(e) => setNominalBayar(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Unggah Bukti Bayar */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Unggah Bukti Pembayaran Tahun Berjalan <span className="text-rose-400">*</span>
              </label>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                {buktiBayar ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="w-6 h-6 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">{buktiBayar.name}</p>
                        <p className="text-[10px] text-slate-400">{(buktiBayar.size / 1024).toFixed(0)} KB • Terlampir</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBuktiBayar(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Ganti Berkas
                    </button>
                  </motion.div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80 group">
                    <UploadCloud className="w-8 h-8 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-emerald-300">Pilih Foto Struk / PDF Bukti Bayar</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Struk ATM, QRIS, Bukti Transfer Mobile Banking, atau Validasi Bank
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleBuktiUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Otomatis tercatat pada Sheet: Data_PBB_P2 & Dashboard Pelayanan</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
              >
                Reset
              </motion.button>

              <motion.button
                type="submit"
                whileHover={isFormValid ? { scale: 1.05 } : {}}
                whileTap={isFormValid ? { scale: 0.95 } : {}}
                disabled={!isFormValid || isSubmitting}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/30 border border-emerald-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim Bukti PBB-P2</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};
