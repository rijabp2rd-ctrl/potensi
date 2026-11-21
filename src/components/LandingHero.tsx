import React, { useState, useRef } from 'react';
import {
  MapPin,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  ArrowRight,
  BarChart3,
  ChevronRight,
  BookOpen,
  FileCheck,
  FileText,
  FolderArchive,
  Navigation2,
  Coins,
  ShieldCheck,
  Radar,
  Layers,
  CheckCircle2,
  Play,
  Globe2,
  Database,
  Clock,
  Activity,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { AppUser, LibraryCategory } from '../types';
import { KECAMATAN_HSU } from '../constants/wilayahHsu';

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

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSelectTab,
  onOpenLibraryCategory,
  currentUser,
  onOpenLogin,
  stats,
}) => {
  const [previewTab, setPreviewTab] = useState<'potensi' | 'pbb' | 'wilayah'>('potensi');
  const heroRef = useRef<HTMLDivElement>(null);

  // Smooth interactive parallax for hero orbital core
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 28, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const orbTranslateX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const orbTranslateY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);
  const cardShiftX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const cardShiftY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCompactRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(2).replace('.', ',')} M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1).replace('.', ',')} Jt`;
    }
    return formatRupiah(val);
  };

  const capabilityItems = [
    {
      title: 'Pemetaan Geospasial GPS',
      desc: 'Validasi titik koordinat objek pajak & persil tanah presisi ±5 meter di seluruh wilayah Kabupaten HSU.',
      icon: Radar,
      gradient: 'from-blue-600 to-indigo-500',
      action: () => onSelectTab('peta'),
    },
    {
      title: 'Analitik & Pendataan Real-Time',
      desc: 'Input lapangan Pajak Daerah, Retribusi, dan PBB-P2 tersinkronisasi instan dengan database Firebase.',
      icon: Activity,
      gradient: 'from-indigo-600 to-violet-500',
      action: () => onSelectTab('potensi'),
    },
    {
      title: 'Pelaporan & Verifikasi Terpadu',
      desc: 'Alur verifikasi berjenjang, cetak rekapitulasi resmi ber-kop BP2RD HSU, serta ekspor Spreadsheet.',
      icon: Layers,
      gradient: 'from-sky-500 to-blue-600',
      action: () => (currentUser ? onSelectTab('laporan') : onOpenLogin()),
    },
  ];

  const documentCards = [
    {
      id: 'regulasi' as LibraryCategory,
      title: 'Perda & Regulasi',
      desc: 'Peraturan Daerah Kab. HSU tentang Pajak Daerah & Retribusi Daerah serta landasan hukum pemungutan fiskal.',
      cta: 'Lihat Dokumen',
      icon: BookOpen,
      iconBg: 'from-indigo-600 via-blue-600 to-sky-500',
      ring: 'ring-blue-500/20',
    },
    {
      id: 'sop' as LibraryCategory,
      title: 'SOP & Juknis',
      desc: 'Standar operasional pendataan geospasial GPS lapangan, petunjuk teknis verifikasi desa, dan rekonsiliasi data.',
      cta: 'Lihat Panduan',
      icon: FileCheck,
      iconBg: 'from-violet-600 via-indigo-600 to-blue-500',
      ring: 'ring-indigo-500/20',
    },
    {
      id: 'blanko' as LibraryCategory,
      title: 'Formulir Blanko',
      desc: 'Template SPOP & LSPOP pendaftaran/mutasi PBB-P2, blanko permohonan NPWPD, dan pengajuan keringanan pajak.',
      cta: 'Unduh Formulir',
      icon: FileText,
      iconBg: 'from-sky-500 via-blue-600 to-indigo-600',
      ring: 'ring-sky-500/20',
    },
  ];

  const previewSeries = {
    potensi: {
      label: 'Tren Estimasi Potensi Pajak',
      metric: formatRupiah(stats.totalPotensiRupiah),
      sub: `${stats.totalPotensiCount} Objek Usaha Terdata`,
      path: 'M 0 112 C 38 94, 62 104, 96 78 C 132 52, 160 80, 198 56 C 236 32, 265 48, 305 26 C 335 12, 360 22, 380 14',
      area: 'M 0 112 C 38 94, 62 104, 96 78 C 132 52, 160 80, 198 56 C 236 32, 265 48, 305 26 C 335 12, 360 22, 380 14 L 380 130 L 0 130 Z',
      bars: [42, 64, 52, 78, 68, 92, 85],
    },
    pbb: {
      label: 'Realisasi Pembayaran PBB-P2',
      metric: formatRupiah(stats.totalPbbLunasRupiah),
      sub: `${stats.totalPbbCount} SPPT NOP Tervalidasi`,
      path: 'M 0 105 C 40 102, 72 86, 108 82 C 145 78, 174 60, 212 48 C 248 36, 282 40, 318 22 C 345 10, 366 18, 380 12',
      area: 'M 0 105 C 40 102, 72 86, 108 82 C 145 78, 174 60, 212 48 C 248 36, 282 40, 318 22 C 345 10, 366 18, 380 12 L 380 130 L 0 130 Z',
      bars: [55, 62, 74, 70, 88, 82, 95],
    },
    wilayah: {
      label: 'Sebaran Titik Geospasial HSU',
      metric: '10 Kecamatan · 214 Desa',
      sub: 'Presisi Koordinat GPS ±5 Meter',
      path: 'M 0 98 C 42 84, 78 90, 114 68 C 150 48, 184 56, 224 44 C 260 34, 294 28, 332 20 C 355 15, 370 16, 380 10',
      area: 'M 0 98 C 42 84, 78 90, 114 68 C 150 48, 184 56, 224 44 C 260 34, 294 28, 332 20 C 355 15, 370 16, 380 10 L 380 130 L 0 130 Z',
      bars: [72, 68, 84, 76, 90, 86, 98],
    },
  };

  const activeSeries = previewSeries[previewTab];

  const isInternalUser =
    currentUser && (currentUser.role === 'admin' || currentUser.role === 'user');

  return (
    <div className="relative w-full overflow-x-clip">
      {/* =====================================================================
          BAND 1: FUTURISTIC COSMIC HERO (Reference Top Section)
         ===================================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative overflow-hidden bg-gradient-to-br from-[#070b28] via-[#11194d] to-[#1a1f66] text-white pt-12 pb-20 lg:pt-16 lg:pb-24"
      >
        {/* Cosmic Ambient Glows */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-indigo-600/25 blur-[110px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/4 right-0 w-[560px] h-[520px] rounded-full bg-blue-500/25 blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, 30, 0], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 w-[520px] h-[240px] rounded-full bg-violet-500/25 blur-[100px] pointer-events-none"
        />

        {/* Subtle Architectural Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(165,180,252,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(165,180,252,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Flowing Luminous Plasma Ribbons (Hero Lower Edge) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-44 pointer-events-none opacity-80"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroWave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.7" />
              <stop offset="68%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="heroWave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
              <stop offset="45%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#60a5fa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <motion.path
            d="M-40,165 C220,95 460,210 740,130 C1020,50 1220,165 1480,100"
            fill="none"
            stroke="url(#heroWave1)"
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
          />
          <motion.path
            d="M-40,190 C280,120 540,220 840,145 C1120,75 1290,175 1480,125"
            fill="none"
            stroke="url(#heroWave2)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 1.9, delay: 0.2, ease: EASE_OUT_EXPO }}
          />
          <motion.path
            d="M-40,145 C310,195 580,80 910,155 C1160,210 1320,115 1480,150"
            fill="none"
            stroke="url(#heroWave1)"
            strokeWidth="1.25"
            strokeOpacity="0.45"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.1, delay: 0.35, ease: EASE_OUT_EXPO }}
          />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* LEFT COLUMN: Bold Headline, Subtitle, Dual CTAs */}
            <div className="lg:col-span-7 text-left">
              <motion.p
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
                className="text-xs sm:text-sm font-medium tracking-wide text-sky-300/90 mb-4"
              >
                Portal Resmi BP2RD &middot; Kabupaten Hulu Sungai Utara &middot; Amuntai
              </motion.p>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.15] text-white [text-wrap:balance]">
                <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
                  {['Optimalkan', 'Potensi', 'Pajak'].map((word, idx) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                      animate={{
                        opacity: 1,
                        y: [0, -5, 0],
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        opacity: { duration: 0.55, delay: 0.08 + idx * 0.1, ease: EASE_OUT_EXPO },
                        filter: { duration: 0.55, delay: 0.08 + idx * 0.1, ease: EASE_OUT_EXPO },
                        y: {
                          duration: 2.8,
                          delay: 0.7 + idx * 0.18,
                          repeat: Infinity,
                          repeatDelay: 0.6,
                          ease: 'easeInOut',
                        },
                      }}
                      className="inline-block bg-gradient-to-r from-white via-sky-100 to-indigo-200 bg-clip-text text-transparent animate-text-gradient"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>

                <span className="block mt-1.5 font-semibold text-indigo-200/95">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [0, -4, 0] }}
                    transition={{
                      opacity: { duration: 0.55, delay: 0.38, ease: EASE_OUT_EXPO },
                      y: {
                        duration: 2.8,
                        delay: 1.24,
                        repeat: Infinity,
                        repeatDelay: 0.6,
                        ease: 'easeInOut',
                      },
                    }}
                    className="inline-block mr-3"
                  >
                    dengan
                  </motion.span>
                  <span className="relative inline-flex flex-wrap gap-x-3">
                    {['Geospasial', 'Presisi'].map((word, idx) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, y: 24, scale: 0.94 }}
                        animate={{
                          opacity: 1,
                          y: [0, -6, 0],
                          scale: 1,
                        }}
                        transition={{
                          opacity: { duration: 0.6, delay: 0.48 + idx * 0.12, ease: EASE_OUT_EXPO },
                          scale: { duration: 0.6, delay: 0.48 + idx * 0.12, ease: EASE_OUT_EXPO },
                          y: {
                            duration: 2.8,
                            delay: 1.42 + idx * 0.18,
                            repeat: Infinity,
                            repeatDelay: 0.6,
                            ease: 'easeInOut',
                          },
                        }}
                        className="inline-block font-extrabold bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent animate-text-gradient drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]"
                      >
                        {word}
                      </motion.span>
                    ))}
                    {/* Animated Glowing Beam Underneath */}
                    <motion.span
                      aria-hidden="true"
                      animate={{ x: ['-15%', '115%', '-15%'] }}
                      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="pointer-events-none absolute -bottom-1 left-0 h-[3px] w-1/2 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-85 blur-[0.5px]"
                    />
                  </span>
                </span>
              </h1>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.18, ease: EASE_OUT_EXPO }}
                className="origin-left h-px w-64 max-w-full bg-gradient-to-r from-sky-400/70 via-indigo-400/50 to-transparent mt-5"
              />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2, ease: EASE_OUT_EXPO }}
                className="mt-5 text-sm sm:text-base text-indigo-100/80 max-w-xl leading-relaxed"
              >
                Pendataan Lebih Cepat. Pemetaan Lebih Akurat. Mengelola potensi pajak daerah, retribusi, dan PBB-P2 di 10 kecamatan secara real-time dengan koordinat GPS valid.
              </motion.p>

              {/* Primary + Secondary CTA Buttons (Matching Reference Hero) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.3, ease: EASE_OUT_EXPO }}
                className="mt-8 flex flex-wrap items-center gap-3.5"
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectTab('peta')}
                  className="btn-shimmer-effect inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 hover:from-indigo-400 hover:to-sky-300 text-white font-bold text-sm shadow-lg shadow-blue-600/35 transition-shadow cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Navigation2 className="w-4 h-4" />
                  <span>Buka Peta Geospasial</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectTab('potensi')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-indigo-300/35 text-indigo-50 font-semibold text-sm backdrop-blur-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-300" />
                  <span>Input Potensi Lapangan</span>
                </motion.button>
              </motion.div>

              {/* Secondary Quick Actions Row (Retribusi + Internal Links when logged in) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT_EXPO }}
                className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-semibold text-indigo-200/85"
              >
                <button
                  onClick={() => onSelectTab('retribusi')}
                  className="inline-flex items-center gap-1.5 hover:text-sky-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Coins className="w-3.5 h-3.5 text-sky-400" />
                  <span>Input Potensi Retribusi</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </button>

                <span className="text-indigo-400/40" aria-hidden="true">
                  &middot;
                </span>

                <button
                  onClick={() => onSelectTab('pbb')}
                  className="inline-flex items-center gap-1.5 hover:text-sky-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Receipt className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Layanan PBB-P2</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isInternalUser && (
                  <>
                    <span className="text-indigo-400/40" aria-hidden="true">
                      &middot;
                    </span>
                    <button
                      onClick={() => onSelectTab('laporan')}
                      className="inline-flex items-center gap-1.5 text-sky-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Manajemen Laporan</span>
                    </button>
                    <span className="text-indigo-400/40" aria-hidden="true">
                      &middot;
                    </span>
                    <button
                      onClick={() => onSelectTab('analitik')}
                      className="inline-flex items-center gap-1.5 text-sky-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Dashboard Analitik</span>
                    </button>
                  </>
                )}
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Interactive Animated Holographic Geospatial Core */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[340px] sm:min-h-[390px]">
              <motion.div
                style={{ x: orbTranslateX, y: orbTranslateY }}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT_EXPO }}
                className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center"
              >
                {/* Outer Glowing Halo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-sky-400/20 to-violet-500/30 blur-2xl" />

                {/* Orbit Ring 1 (Dashed Slow Spin) */}
                <div className="absolute inset-2 rounded-full border border-dashed border-sky-300/30 animate-orbit-slow">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sky-300 shadow-[0_0_16px_#38bdf8]" />
                  <div className="absolute bottom-6 right-5 w-2 h-2 rounded-full bg-violet-300 shadow-[0_0_12px_#c084fc]" />
                </div>

                {/* Orbit Ring 2 (Counter-Rotating Ring) */}
                <div className="absolute inset-9 rounded-full border border-indigo-300/35 animate-orbit-reverse">
                  <div className="absolute top-5 -left-1 w-2.5 h-2.5 rounded-full bg-blue-300 shadow-[0_0_14px_#60a5fa]" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_12px_#bae6fd]" />
                </div>

                {/* Inner Holographic Geospatial Sphere */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#1b2978] via-[#131c54] to-[#0a1033] border border-sky-300/35 shadow-[0_0_60px_rgba(56,189,248,0.28)] flex items-center justify-center overflow-hidden">
                  {/* Latitude / Longitude SVG Wireframe */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full opacity-55"
                    aria-hidden="true"
                  >
                    <defs>
                      <radialGradient id="globeGlow" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.45" />
                        <stop offset="55%" stopColor="#6366f1" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="96" fill="url(#globeGlow)" />
                    <ellipse cx="100" cy="100" rx="88" ry="34" fill="none" stroke="#93c5fd" strokeWidth="0.8" strokeOpacity="0.55" />
                    <ellipse cx="100" cy="100" rx="88" ry="64" fill="none" stroke="#818cf8" strokeWidth="0.7" strokeOpacity="0.4" />
                    <ellipse cx="100" cy="100" rx="36" ry="88" fill="none" stroke="#93c5fd" strokeWidth="0.8" strokeOpacity="0.55" />
                    <ellipse cx="100" cy="100" rx="68" ry="88" fill="none" stroke="#a5b4fc" strokeWidth="0.7" strokeOpacity="0.35" />
                    <line x1="12" y1="100" x2="188" y2="100" stroke="#7dd3fc" strokeWidth="0.7" strokeOpacity="0.45" />
                    <line x1="100" y1="12" x2="100" y2="188" stroke="#7dd3fc" strokeWidth="0.7" strokeOpacity="0.45" />
                  </svg>

                  {/* Animated Radar Sweep Beam */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'conic-gradient(from 0deg, rgba(56,189,248,0.34) 0deg, rgba(99,102,241,0.12) 45deg, transparent 85deg, transparent 360deg)',
                    }}
                  />

                  {/* Center Icon & HSU Coordinate Core */}
                  <div className="relative z-10 text-center px-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-300 flex items-center justify-center shadow-lg shadow-sky-500/40 mb-2">
                      <Globe2 className="w-6 h-6 text-slate-950" />
                    </div>
                    <p className="text-xs font-extrabold tracking-wide text-white">
                      GPS GEOSPASIAL HSU
                    </p>
                    <p className="text-[10px] font-mono tabular-nums text-sky-200/90 mt-0.5">
                      -2.4167&deg;, 115.2500&deg;
                    </p>
                  </div>
                </div>

                {/* Floating Glass Card 1 — Top Right */}
                <motion.div
                  style={{ x: cardShiftX, y: cardShiftY }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-2 sm:-right-6 bg-[#131b4d]/85 backdrop-blur-xl border border-sky-300/30 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-indigo-950/60"
                >
                  <p className="text-[10px] text-sky-300 font-semibold">Potensi Terdata</p>
                  <p className="text-sm font-extrabold font-mono tabular-nums text-white mt-0.5">
                    {formatCompactRupiah(stats.totalPotensiRupiah)}
                  </p>
                </motion.div>

                {/* Floating Glass Card 2 — Bottom Left */}
                <motion.div
                  style={{ x: cardShiftX, y: cardShiftY }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute -bottom-1 -left-2 sm:-left-6 bg-[#131b4d]/85 backdrop-blur-xl border border-indigo-300/30 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-indigo-950/60"
                >
                  <p className="text-[10px] text-indigo-200 font-semibold">Cakupan Aktif</p>
                  <p className="text-xs font-extrabold tabular-nums text-white mt-0.5">
                    10 Kecamatan &middot; 214 Desa
                  </p>
                </motion.div>

                {/* Floating Glass Card 3 — Mid Right */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.1, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  className="hidden sm:block absolute bottom-14 -right-8 bg-[#131b4d]/85 backdrop-blur-xl border border-violet-300/30 rounded-2xl px-3 py-2 shadow-xl shadow-indigo-950/60"
                >
                  <p className="text-[10px] text-violet-200 font-semibold">Presisi GPS</p>
                  <p className="text-xs font-extrabold font-mono tabular-nums text-sky-300 mt-0.5">
                    &plusmn;5 Meter
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 2: CRISP LIGHT CAPABILITY STRIP (Reference Strip Below Hero)
         ===================================================================== */}
      <section className="relative bg-gradient-to-b from-[#f3f6ff] to-[#e9efff] border-b border-indigo-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-200/80">
            {capabilityItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.title}
                  type="button"
                  onClick={item.action}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -3 }}
                  className="group flex items-start gap-4 px-2 py-4 md:py-2 md:px-6 first:md:pl-0 last:md:pr-0 text-left transition-transform cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#161c46] group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 3: COSMIC INDIGO-TO-LAVENDER SHOWCASE WITH 3 FLOATING WHITE CARDS
          (Reference Middle Section — "Dokumen Resmi & Layanan Digital BP2RD HSU")
         ===================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1a246b] via-[#3442a6] to-[#dbe5ff] pt-16 pb-20">
        {/* Glowing Light Waves behind the 3 White Cards */}
        <svg
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-72 pointer-events-none opacity-65"
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="midWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.15" />
              <stop offset="35%" stopColor="#e0e7ff" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#c084fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <motion.path
            d="M-50,150 C260,55 560,240 880,125 C1140,35 1310,165 1490,110"
            fill="none"
            stroke="url(#midWaveGrad)"
            strokeWidth="3.5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.5, ease: EASE_OUT_EXPO }}
          />
          <motion.path
            d="M-50,190 C320,90 610,255 960,155 C1200,90 1350,190 1490,145"
            fill="none"
            stroke="url(#midWaveGrad)"
            strokeWidth="2"
            strokeOpacity="0.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.8, delay: 0.15, ease: EASE_OUT_EXPO }}
          />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
              Pusat Dokumen Resmi &amp; Regulasi Daerah
            </h2>
            <p className="mt-3 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Akses cepat peraturan pajak daerah, standar operasional pendataan lapangan, dan formulir blanko resmi Pemkab Hulu Sungai Utara.
            </p>
          </motion.div>

          {/* 3 Elevated Crisp White Cards (Matching Reference Cards) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: idx * 0.12, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() =>
                    onOpenLibraryCategory
                      ? onOpenLibraryCategory(card.id)
                      : onSelectTab('library')
                  }
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-[0_18px_45px_-12px_rgba(24,35,105,0.28)] border border-white flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconBg} ring-4 ${card.ring} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#161c46] group-hover:text-blue-700 transition-colors">
                          {card.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
                    <span className="btn-shimmer-effect inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 group-hover:from-indigo-500 group-hover:to-sky-400 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all whitespace-nowrap">
                      <span>{card.cta}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-7 text-center"
          >
            <button
              onClick={() =>
                onOpenLibraryCategory
                  ? onOpenLibraryCategory('all')
                  : onSelectTab('library')
              }
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1d286b] hover:text-blue-700 transition-colors cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Buka Seluruh Library Berkas BP2RD HSU</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          BAND 4: "PANTAU SIPOTENSI SECARA REAL-TIME"
          (Reference "See NexoraNova in Action" — Dark Dashboard Preview + Big Stats)
         ===================================================================== */}
      <section className="relative bg-gradient-to-b from-[#dbe5ff] via-[#ebf1ff] to-[#f4f7ff] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flanked Divider Heading (Exact Reference Detail) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className="hidden sm:block h-px w-24 md:w-36 bg-gradient-to-r from-transparent to-indigo-400/60" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#161c46] tracking-tight text-center">
              Pantau SIPOTENSI Secara Real-Time
            </h2>
            <span className="hidden sm:block h-px w-24 md:w-36 bg-gradient-to-l from-transparent to-indigo-400/60" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* LEFT (col-span-7): Interactive Dark Glass Dashboard Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="lg:col-span-7"
            >
              <div className="rounded-2xl bg-[#0c1333] border border-indigo-400/30 shadow-[0_28px_65px_-16px_rgba(15,23,78,0.45)] overflow-hidden text-white">
                {/* Dashboard Window Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#090f29] border-b border-indigo-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-extrabold tracking-wide text-white">
                      Dashboard Fiskal BP2RD HSU
                    </span>
                  </div>

                  {/* Interactive Preview Switcher Tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[#121a45] border border-indigo-400/20">
                    {(
                      [
                        { id: 'potensi', label: 'Potensi Pajak' },
                        { id: 'pbb', label: 'PBB-P2' },
                        { id: 'wilayah', label: 'Wilayah HSU' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPreviewTab(t.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          previewTab === t.id
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm'
                            : 'text-indigo-200/75 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dashboard Inner Content */}
                <div className="p-5 sm:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={previewTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                        <div>
                          <p className="text-xs text-indigo-200/75">{activeSeries.label}</p>
                          <p className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-white mt-0.5">
                            {activeSeries.metric}
                          </p>
                        </div>
                        <p className="text-xs text-sky-300 font-medium">{activeSeries.sub}</p>
                      </div>

                      {/* Dual Mini Visualization Panels */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Area Line Chart */}
                        <div className="sm:col-span-7 rounded-xl bg-[#111945]/90 border border-indigo-400/20 p-4">
                          <div className="flex items-center justify-between text-[11px] text-indigo-200/75 mb-3">
                            <span>Pertumbuhan Pendataan</span>
                            <span className="font-mono text-sky-300">2026</span>
                          </div>
                          <svg
                            viewBox="0 0 380 130"
                            className="w-full h-32 overflow-visible"
                            aria-label="Grafik tren data SIPOTENSI"
                          >
                            <defs>
                              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>
                            <motion.path
                              d={activeSeries.area}
                              fill="url(#chartAreaGrad)"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                            <motion.path
                              d={activeSeries.path}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="3"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                            />
                            <motion.circle
                              cx="380"
                              cy={previewTab === 'potensi' ? 14 : previewTab === 'pbb' ? 12 : 10}
                              r="4.5"
                              fill="#7dd3fc"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.75, duration: 0.3 }}
                            />
                          </svg>
                        </div>

                        {/* Animated Column Bar Chart */}
                        <div className="sm:col-span-5 rounded-xl bg-[#111945]/90 border border-indigo-400/20 p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px] text-indigo-200/75 mb-3">
                            <span>Distribusi Kecamatan</span>
                            <span className="font-mono text-indigo-300">HSU</span>
                          </div>
                          <div className="flex items-end justify-between gap-2 h-28 pt-2">
                            {activeSeries.bars.map((heightPct, i) => (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center justify-end h-full"
                              >
                                <motion.div
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{
                                    duration: 0.55,
                                    delay: i * 0.06,
                                    ease: EASE_OUT_EXPO,
                                  }}
                                  style={{
                                    height: `${heightPct}%`,
                                    transformOrigin: 'bottom',
                                  }}
                                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 via-blue-500 to-sky-300"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* RIGHT (col-span-5): High-Impact Real Metrics + Primary Action (Exact Reference Layout) */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Stat Row 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-md shadow-indigo-200 border border-indigo-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#161c46] tracking-tight">
                    {formatRupiah(stats.totalPotensiRupiah)}
                  </p>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    Estimasi Potensi Pajak &middot;{' '}
                    <span className="text-blue-700 tabular-nums">
                      {stats.totalPotensiCount} Objek Usaha
                    </span>
                  </p>
                </div>
              </div>

              {/* Stat Row 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-md shadow-indigo-200 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-[#161c46] tracking-tight">
                    {formatRupiah(stats.totalPbbLunasRupiah)}
                  </p>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    Realisasi Lunas PBB-P2 &middot;{' '}
                    <span className="text-indigo-700 tabular-nums">
                      {stats.totalPbbCount} SPPT NOP
                    </span>
                  </p>
                </div>
              </div>

              {/* Stat Row 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-md shadow-indigo-200 border border-indigo-100 flex items-center justify-center text-sky-600 shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold tabular-nums text-[#161c46] tracking-tight">
                    10 Kecamatan &middot; 214 Desa
                  </p>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    Akurasi GPS Geospasial &plusmn;5 Meter Kabupaten HSU
                  </p>
                </div>
              </div>

              {/* Action CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectTab(isInternalUser ? 'analitik' : 'peta')}
                  className="btn-shimmer-effect inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-bold shadow-lg shadow-blue-600/30 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isInternalUser ? 'Buka Dashboard Analitik' : 'Jelajahi Peta Geospasial'}</span>
                </motion.button>

                {!currentUser && (
                  <button
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-indigo-50 text-[#161c46] border border-indigo-200 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Login Petugas</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 5: "KEUNGGULAN & CAKUPAN 10 KECAMATAN HSU"
          (Reference Bottom "Why Choose NexoraNova?" Section)
         ===================================================================== */}
      <section className="relative bg-gradient-to-b from-[#f4f7ff] to-[#e6edff] pt-6 pb-20 border-t border-indigo-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3 Trust Pillars (Reference Bottom 3 White Cards) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#161c46] tracking-tight">
              Keunggulan Sistem SIPOTENSI BP2RD HSU
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {[
              {
                icon: Database,
                title: 'Sinkronisasi Cloud Firebase',
                desc: 'Data pendataan pajak, PBB-P2, retribusi, dan library berkas tersimpan aman dan real-time.',
              },
              {
                icon: ShieldCheck,
                title: 'Verifikasi Berjenjang',
                desc: 'Kontrol akses terpisah untuk publik, petugas lapangan, dan administrator BP2RD HSU.',
              },
              {
                icon: Clock,
                title: 'Rekap & Cetak Seketika',
                desc: 'Laporan resmi siap cetak dan integrasi langsung ke Google Spreadsheet dalam satu klik.',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#161c46]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 10 Kecamatan HSU Interactive Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
            <p className="text-xs font-bold text-blue-700 tracking-wide">
              Wilayah Kerja Administrasi Pemkab HSU
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161c46] mt-1 tracking-tight">
              10 Kecamatan di Kabupaten Hulu Sungai Utara
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Klik salah satu kecamatan untuk langsung meninjau sebaran titik objek pada Peta Geospasial HSU.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {KECAMATAN_HSU.map((kec, idx) => (
              <motion.button
                key={kec.nama}
                type="button"
                onClick={() => onSelectTab('peta')}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: (idx % 5) * 0.06,
                  ease: EASE_OUT_EXPO,
                }}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.98 }}
                className="text-left bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/70 border border-indigo-100 hover:border-blue-400/70 p-4 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-blue-600 mb-2">
                  <span className="text-[11px] font-bold text-indigo-600/80 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#161c46] group-hover:text-blue-700 transition-colors truncate">
                  {kec.nama}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {kec.deskripsi}
                </p>
                <div className="mt-2.5 pt-2 border-t border-indigo-50 text-[10px] font-mono tabular-nums text-slate-400 group-hover:text-blue-600 transition-colors">
                  {kec.lat.toFixed(4)}, {kec.lng.toFixed(4)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
