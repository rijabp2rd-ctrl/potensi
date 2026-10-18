import React from 'react';
import { 
  Building2, 
  MapPin, 
  FileSpreadsheet, 
  Receipt, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  FileCheck, 
  FileText, 
  Lock, 
  FolderArchive, 
  LogIn, 
  Navigation2,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppUser, LibraryCategory } from '../types';
import { KABUPATEN_HSU, KECAMATAN_HSU } from '../constants/wilayahHsu';

interface LandingHeroProps {
  onSelectTab: (tab: string) => void;
  onOpenLibraryCategory?: (category: 'all' | LibraryCategory) => void;
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  stats: {
    totalPotensiRupiah: number;
    totalPotensiCount: number;
    totalPbbCount: number;
    totalPbbLunasRupiah: number;
  };
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectTab,
  onOpenLibraryCategory,
  currentUser,
  onOpenLogin,
  stats,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/15 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Pemkab Hulu Sungai Utara */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-950/40 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Sistem Resmi Pemkab Hulu Sungai Utara &bull; Amuntai &bull; Kalsel</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Penggalian Potensi Pajak Daerah &amp; Retribusi Daerah Berbasis{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Geospasial GPS Presisi
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed"
          >
            Portal digital integrasi Badan Pendapatan Daerah Kabupaten Hulu Sungai Utara. 
            Mendata objek pajak secara akurat di 10 kecamatan dengan koordinat GPS valid, keterbukaan dokumen regulasi daerah, serta manajemen pelaporan fiskal terverifikasi.
          </motion.p>

          {/* Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={() => onSelectTab('peta')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all active:scale-95 cursor-pointer"
            >
              <Navigation2 className="w-4 h-4 text-amber-300" />
              <span>Buka Peta Geospasial HSU</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectTab('potensi')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Input Potensi Lapangan</span>
            </button>

            <button
              onClick={() => onSelectTab('retribusi')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Input Potensi Retribusi</span>
            </button>

            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'user') && (
              <>
                <button
                  onClick={() => onSelectTab('laporan')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Manajemen Laporan &amp; Verifikasi</span>
                </button>

                <button
                  onClick={() => onSelectTab('analitik')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Dashboard Analitik</span>
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Real-time Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Potensi Pajak (Estimasi)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white tracking-tight">
              {formatRupiah(stats.totalPotensiRupiah)}
            </p>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{stats.totalPotensiCount} Objek Usaha</span>
              <span>terdata aktif di HSU</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Realisasi Lunas PBB-P2
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white tracking-tight">
              {formatRupiah(stats.totalPbbLunasRupiah)}
            </p>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-blue-400 font-bold">{stats.totalPbbCount} SPPT NOP</span>
              <span>tervalidasi bank persepsi</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cakupan Wilayah HSU
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-white tracking-tight">
              10 Kecamatan
            </p>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">214 Desa &amp; Kelurahan</span>
              <span>di Kab. Hulu Sungai Utara</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Presisi GPS Geospasial
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-400 tracking-tight">
              Akurasi Tinggi &plusmn;5m
            </p>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
              <span>Validasi Koordinat Batas HSU</span>
            </p>
          </div>
        </motion.div>

        {/* PUSAT LIBRARY BERKAS & REGULASI PUBLIK SECTION */}
        {/* Sesuai Permintaan: Landing page HANYA menampilkan Perda & Regulasi, SOP & Juknis, Formulir Blanko */}
        {/* DPA/ARKAS, Foto Objek, dan Struk Bayar PBB tampil khusus untuk Admin & User */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-3">
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Pusat Regulasi &amp; Library Berkas Daerah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Dokumen Resmi Terbuka Pemkab HSU
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Kategori berkas publik yang dapat diakses langsung oleh masyarakat dan pelaku usaha: Perda dan Regulasi, SOP &amp; Juknis, serta Formulir Blanko.
              </p>
            </div>
            <button
              onClick={() => {
                if (onOpenLibraryCategory) onOpenLibraryCategory('all');
                else onSelectTab('library');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700 transition-colors self-start md:self-auto cursor-pointer"
            >
              <span>Buka Seluruh Library</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Kartu Kategori Publik Terbuka di Landing Page */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            
            {/* 1. Perda dan Regulasi */}
            <div 
              onClick={() => onOpenLibraryCategory ? onOpenLibraryCategory('regulasi') : onSelectTab('library')}
              className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-emerald-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mt-4 group-hover:text-emerald-300 transition-colors">
                  Perda &amp; Regulasi
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Peraturan Daerah Kab. HSU No. 01 Tahun 2025 tentang Perubahan Pajak Daerah &amp; Retribusi Daerah, daan landasan hukum fiskal.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>3 Berkas Tersedia</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lihat Dokumen <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* 2. SOP & Juknis */}
            <div 
              onClick={() => onOpenLibraryCategory ? onOpenLibraryCategory('sop') : onSelectTab('library')}
              className="bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-blue-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mt-4 group-hover:text-blue-300 transition-colors">
                  SOP &amp; Juknis
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Standar Operasional Prosedur pendataan geospasial GPS objek pajak lapangan, petunjuk teknis verifikasi desa, dan rekonsiliasi data piutang.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>2 Dokumen Panduan</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Lihat Dokumen <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* 3. Formulir Blanko */}
            <div 
              onClick={() => onOpenLibraryCategory ? onOpenLibraryCategory('blanko') : onSelectTab('library')}
              className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-amber-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mt-4 group-hover:text-amber-300 transition-colors">
                  Formulir Blanko
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Formulir SPOP &amp; LSPOP pendaftaran/mutasi PBB-P2, blanko permohonan keringanan ketetapan pajak, serta blanko permohonan NPWPD.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>2 Template Blanko</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Unduh Formulir <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>

          {/* Notifikasi Akses Internal untuk DPA/ARKAS, Foto Objek, dan Struk Bayar PBB */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Akses Berkas Internal: DPA/ARKAS, Foto Objek Pajak &amp; Struk Bayar PBB
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentUser ? (
                    <span className="text-emerald-400">
                      Anda login sebagai {currentUser.role.toUpperCase()} ({currentUser.name}). Seluruh berkas internal terbuka penuh untuk Anda di menu Library.
                    </span>
                  ) : (
                    <span>
                      Berkas DPA/ARKAS, Foto Objek Lapangan, dan Struk Bayar PBB hanya dapat diakses oleh Admin &amp; Petugas terverifikasi.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {currentUser ? (
              <button
                onClick={() => onSelectTab('library')}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 whitespace-nowrap cursor-pointer transition-colors"
              >
                Akses Berkas Internal
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Login untuk Akses</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* 10 KECAMATAN DI KABUPATEN HULU SUNGAI UTARA */}
        <div className="mt-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Wilayah Kerja Administrasi
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              10 Kecamatan di Kabupaten Hulu Sungai Utara
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Titik koordinat geospasial presisi dipetakan di seluruh sentra ekonomi &amp; pemukiman HSU
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {KECAMATAN_HSU.map((kec, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTab('peta')}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Wilayah #{idx + 1}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {kec.nama}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {kec.deskripsi}
                </p>
                <div className="mt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                  <span>{kec.lat.toFixed(4)}, {kec.lng.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
