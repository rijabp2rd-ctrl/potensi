import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  BarChart3, 
  ChevronRight,
  Zap,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingHeroProps {
  onSelectTab: (tab: 'potensi' | 'pbb' | 'ikm' | 'dashboard' | 'library') => void;
  stats: {
    totalPotensiRupiah: number;
    totalPotensiCount: number;
    totalPbbCount: number;
    avgIkmScore: number;
  };
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSelectTab, stats }) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Animated Background Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-15"></div>
      
      {/* Ambient Moving Glows */}
      <motion.div 
        animate={{ 
          x: [0, 30, 0], 
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -40, 0], 
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
        {/* Government Badge with Floating & Shimmer */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-blue-500/10 hover:border-blue-400 transition-colors">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </motion.div>
            <span>Sistem Informasi Penggalian Potensi Pajak Daerah Terpadu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
            <span className="text-white font-bold bg-blue-600/40 px-2 py-0.5 rounded-full text-[10px] border border-blue-400/30">
              TA 2026
            </span>
          </div>
        </motion.div>

        {/* Main Headline with Stagger Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mt-6 max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Optimalisasi Pendapatan Daerah &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 inline-block">
              Evaluasi Layanan Wajib Pajak
            </span>
          </h1>
          <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Portal resmi partisipasi wajib pajak dan pendataan potensi objek baru (Restoran, Reklame, Hotel, Parkir, ABT, dll.), pemutakhiran PBB-P2, serta Indeks Kepuasan Masyarakat (IKM) dengan validasi otomatis dan sinkronisasi real-time ke Google Sheets.
          </p>
        </motion.div>

        {/* 3 Main Action Cards with Cool Hover & Entry Animations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Form Potensi */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTab('potensi')}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 hover:border-blue-500 rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Glowing Accent Glow on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                >
                  <Building2 className="w-7 h-7" />
                </motion.div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider">
                  Formulir 01
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
                Penggalian Potensi Pajak
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Laporkan potensi objek pajak baru: Nama Objek, Alamat, No WhatsApp, Unggah Dokumen DPA/ARKAS, Foto Objek, Titik Koordinat GPS, serta skor kelayakan data otomatis.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-blue-400" /> GPS Presisi
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-blue-400" /> Upload DPA & Objek
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-blue-400" /> Auto-Score
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-blue-400 font-bold text-xs group-hover:text-blue-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Buka Formulir Potensi
              </span>
              <motion.div 
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>

          {/* Card 2: Form PBB-P2 */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTab('pbb')}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 hover:border-emerald-500 rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300"
                >
                  <ShieldCheck className="w-7 h-7" />
                </motion.div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  Formulir 02
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                Layanan & Setoran PBB-P2
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Verifikasi kepatuhan Pajak Bumi dan Bangunan: Nama, NIK 16 digit, Pilihan Status NOP (Ada NOP / Belum Ada Objek Baru), Lokasi Objek, dan Unggah Bukti Bayar Tahun Berjalan.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> NOP 18 Digit Masking
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Bukti Struk Bank/QRIS
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Status Lunas & Sah
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-emerald-400 font-bold text-xs group-hover:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Bayar & NOP Baru
              </span>
              <motion.div 
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>

          {/* Card 3: Form IKM */}
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTab('ikm')}
            className="group relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 hover:border-amber-500 rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300"
                >
                  <Star className="w-7 h-7" />
                </motion.div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                  Formulir 03
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
                Survei Kepuasan WP (IKM)
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Suarakan kepuasan Anda: Nama, Alamat, Skala 1 - 5 untuk 5 dimensi layanan (kemudahan, kecepatan, keramahan, transparansi tarif, sarana), serta saran dan masukan langsung ke pimpinan.
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-amber-400" /> Skala Bintang 1-5
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-amber-400" /> Nilai Mutu A/B/C
                </span>
                <span className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-amber-400" /> Aspirasi Wajib Pajak
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-amber-400 font-bold text-xs group-hover:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Berikan Penilaian & Saran
              </span>
              <motion.div 
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Real-Time Stats Strip with Pulsing Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-2 md:pt-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <span>Total Potensi Terdata</span>
              </p>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                {formatRupiah(stats.totalPotensiRupiah)}
              </p>
              <p className="text-[11px] text-blue-300/80 font-medium mt-1">
                {stats.totalPotensiCount} Objek Usaha Terpetakan
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Laporan PBB-P2
              </p>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                {stats.totalPbbCount} Berkas
              </p>
              <p className="text-[11px] text-emerald-300/80 font-medium mt-1">
                Tervalidasi & NOP Terdaftar
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Indeks Kepuasan (IKM)
              </p>
              <p className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                {stats.avgIkmScore.toFixed(1)} / 100
              </p>
              <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Kategori Mutu A (Sangat Baik)</span>
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Integrasi Database
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-emerald-400 text-xl sm:text-2xl font-black">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                </motion.div>
                <span>Google Sheets</span>
              </div>
              <p className="text-[11px] text-teal-300/80 font-medium mt-1 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Real-Time Auto Synchronized</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights: Alur Penggalian Potensi with Animated Flow */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Alur Penggalian Potensi & Verifikasi Cerdas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Standar Operasional Prosedur (SOP) Digital Pendataan Pajak Daerah BP2RD
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: 'Entri Formulir',
                desc: 'Wajib pajak atau petugas mengisi nama objek, alamat, no. WA, dan berkas.',
                color: 'from-blue-600 to-blue-700',
              },
              {
                step: '2',
                title: 'Validasi Otomatis',
                desc: 'Sistem mengecek format WA, presisi titik GPS, dan kelengkapan dokumen.',
                color: 'from-indigo-600 to-indigo-700',
              },
              {
                step: '3',
                title: 'Sinkron Google Sheets',
                desc: 'Data otomatis terkirim ke spreadsheet kantor dan tersimpan di database.',
                color: 'from-teal-600 to-teal-700',
              },
              {
                step: '4',
                title: 'Uji Petik & SKPD',
                desc: 'Admin memantau via dashboard analitik Chart.js & menugaskan tim survey.',
                color: 'from-amber-600 to-amber-700',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                whileHover={{ scale: 1.03 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5 shadow-md relative overflow-hidden"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Action Navigation */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 border border-blue-400/30 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Buka Dashboard Analitik Interaktif</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 shadow-lg transition-all"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Jelajahi Library Berkas & Regulasi</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
