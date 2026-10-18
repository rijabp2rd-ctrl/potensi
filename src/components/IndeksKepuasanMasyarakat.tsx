import React, { useState } from 'react';
import {
  HeartHandshake,
  Star,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Send,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Download,
  Search,
  Filter,
  BarChart3,
  Calendar,
  User,
  MapPin,
  Briefcase,
  TrendingUp,
  Award,
  Layers,
  Info,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { IkmSurveyEntry, IkmRatingValue, IkmRatingLevel, AppUser } from '../types';

interface IndeksKepuasanMasyarakatProps {
  ikmList: IkmSurveyEntry[];
  onSaveSurvey: (entry: IkmSurveyEntry) => void;
  currentUser: AppUser | null;
}

// 5 Pernyataan Evaluasi Kepuasan Masyarakat (Masing-masing bernilai maksimal 20, total 100)
export const PERNYATAAN_IKM_CONFIG = [
  {
    id: 1,
    key: 'pernyataan1' as const,
    title: 'Pernyataan 1: Monitoring dan Manfaat bagi pihak sekolah.',
    deskripsi: 'Bagaimana Kegiatan monitoring bagi pihak sekolah dalam meningkatkan pemahaman mengenai administrasi perpajakan daerah?',
  },
  {
    id: 2,
    key: 'pernyataan2' as const,
    title: 'Pernyataan 2: Penjelasan dan Informasi mengenai tujuan kegiatan tersebut',
    deskripsi: 'Petugas memberikan penjelasan dan informasi yang jelas mengenai tujuan kegiatan monitoring serta penggalian potensi pajak daerah?',
  },
  {
    id: 3,
    key: 'pernyataan3' as const,
    title: 'Pernyataan 3: Monitoring dan Penggalian potensi di lingkungan sekolah berjalan dengan tertib.',
    deskripsi: 'Bagaimana Pelaksanaan monitoring dan pendataan potensi pajak di lingkungan sekolah berjalan dengan tertib, lancar, dan sesuai dengan prosedur yang berlaku ?',
  },
  {
    id: 4,
    key: 'pernyataan4' as const,
    title: 'Pernyataan 4: Kualitas Komunikasi, Koordinasi dan Verifikasi Data',
    deskripsi: 'Bagaimana Petugas melakukan komunikasi dan koordinasi yang baik dengan pihak sekolah dalam pengumpulan, verifikasi, dan pemutakhiran pajak daerah?',
  },
  {
    id: 5,
    key: 'pernyataan5' as const,
    title: 'Pernyataan 5: Penanganan Keluhan & Kepuasan Hasil Layanan',
    deskripsi: 'Bagaimana respon penyelesaian konsultasi/keluhan dan kepuasan Anda secara menyeluruh terhadap hasil akhir pelayanan BAPENDA HSU?',
  },
];

// Opsi Penilaian dengan Nilai dan Emote
export const OPSI_NILAI: {
  level: IkmRatingLevel;
  nilai: IkmRatingValue;
  emoji: string;
  label: string;
  colorClass: string;
  bgSelectedClass: string;
  borderClass: string;
  icon: string;
}[] = [
  {
    level: 'Sangat Baik',
    nilai: 20,
    emoji: '🤩',
    label: 'Sangat Baik (Nilai 20)',
    colorClass: 'text-emerald-400',
    bgSelectedClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500',
    borderClass: 'hover:border-emerald-500/60',
    icon: 'star',
  },
  {
    level: 'Baik',
    nilai: 15,
    emoji: '😊',
    label: 'Baik (Nilai 15)',
    colorClass: 'text-blue-400',
    bgSelectedClass: 'bg-blue-500/20 text-blue-300 border-blue-500',
    borderClass: 'hover:border-blue-500/60',
    icon: 'smile',
  },
  {
    level: 'Cukup',
    nilai: 10,
    emoji: '😐',
    label: 'Cukup (Nilai 10)',
    colorClass: 'text-amber-400',
    bgSelectedClass: 'bg-amber-500/20 text-amber-300 border-amber-500',
    borderClass: 'hover:border-amber-500/60',
    icon: 'meh',
  },
  {
    level: 'Kurang',
    nilai: 5,
    emoji: '🙁',
    label: 'Kurang (Nilai 5)',
    colorClass: 'text-rose-400',
    bgSelectedClass: 'bg-rose-500/20 text-rose-300 border-rose-500',
    borderClass: 'hover:border-rose-500/60',
    icon: 'frown',
  },
];

export const IndeksKepuasanMasyarakat: React.FC<IndeksKepuasanMasyarakatProps> = ({
  ikmList,
  onSaveSurvey,
  currentUser,
}) => {
  const isAdmin = currentUser !== null && currentUser.role === 'admin';
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'rekap'>('form');

  // Form State
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [nomorKontak, setNomorKontak] = useState('');
  const [saranMasukan, setSaranMasukan] = useState('');

  // 5 Pernyataan State (Default 20 = Sangat Baik)
  const [ratings, setRatings] = useState<{
    pernyataan1: IkmRatingValue;
    pernyataan2: IkmRatingValue;
    pernyataan3: IkmRatingValue;
    pernyataan4: IkmRatingValue;
    pernyataan5: IkmRatingValue;
  }>({
    pernyataan1: 20,
    pernyataan2: 20,
    pernyataan3: 20,
    pernyataan4: 20,
    pernyataan5: 20,
  });

  const [formSubmittedSuccess, setFormSubmittedSuccess] = useState(false);

  // Rekap Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPredikat, setFilterPredikat] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Perhitungan Nilai Total Form Saat Ini
  const currentTotalNilai =
    ratings.pernyataan1 +
    ratings.pernyataan2 +
    ratings.pernyataan3 +
    ratings.pernyataan4 +
    ratings.pernyataan5;

  const getPredikat = (total: number): 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' => {
    if (total >= 88) return 'Sangat Baik';
    if (total >= 70) return 'Baik';
    if (total >= 50) return 'Cukup';
    return 'Kurang';
  };

  const currentPredikat = getPredikat(currentTotalNilai);

  // Submit Handler
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Mohon isi nama lengkap responden.');
      return;
    }
    if (!alamat.trim()) {
      alert('Mohon isi alamat responden.');
      return;
    }
    if (!kegiatan.trim()) {
      alert('Mohon isi nama kegiatan / jenis layanan.');
      return;
    }

    const nextNumber = String(ikmList.length + 1).padStart(3, '0');
    const newEntry: IkmSurveyEntry = {
      id: `ikm-${Date.now()}`,
      nomorResponden: `IKM/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${nextNumber}`,
      nama: nama.trim(),
      alamat: alamat.trim(),
      kegiatan: kegiatan.trim(),
      nomorKontak: nomorKontak.trim() || undefined,
      tanggalSurvey: new Date().toISOString().split('T')[0],
      pernyataan1: ratings.pernyataan1,
      pernyataan2: ratings.pernyataan2,
      pernyataan3: ratings.pernyataan3,
      pernyataan4: ratings.pernyataan4,
      pernyataan5: ratings.pernyataan5,
      saranMasukan: saranMasukan.trim() || undefined,
      totalNilai: currentTotalNilai,
      predikat: currentPredikat,
      petugasPencatat: currentUser?.name || 'Masyarakat / Wajib Pajak Mandiri',
      createdAt: new Date().toISOString(),
    };

    onSaveSurvey(newEntry);
    setFormSubmittedSuccess(true);

    // Reset Form
    setNama('');
    setAlamat('');
    setKegiatan('');
    setNomorKontak('');
    setSaranMasukan('');
    setRatings({
      pernyataan1: 20,
      pernyataan2: 20,
      pernyataan3: 20,
      pernyataan4: 20,
      pernyataan5: 20,
    });

    setTimeout(() => {
      setFormSubmittedSuccess(false);
      if (isAdmin) {
        setActiveSubTab('rekap');
      }
    }, 1500);
  };

  // ==========================================
  // KALKULASI STATISTIK REKAP LAPORAN
  // ==========================================
  const totalResponden = ikmList.length;
  const grandTotalNilai = ikmList.reduce((acc, curr) => acc + curr.totalNilai, 0);
  const rataRataNilai = totalResponden > 0 ? (grandTotalNilai / totalResponden) : 0;
  const predikatKeseluruhan = getPredikat(rataRataNilai);

  // Rata-rata per pernyataan
  const avgP1 = totalResponden > 0 ? ikmList.reduce((acc, c) => acc + c.pernyataan1, 0) / totalResponden : 0;
  const avgP2 = totalResponden > 0 ? ikmList.reduce((acc, c) => acc + c.pernyataan2, 0) / totalResponden : 0;
  const avgP3 = totalResponden > 0 ? ikmList.reduce((acc, c) => acc + c.pernyataan3, 0) / totalResponden : 0;
  const avgP4 = totalResponden > 0 ? ikmList.reduce((acc, c) => acc + c.pernyataan4, 0) / totalResponden : 0;
  const avgP5 = totalResponden > 0 ? ikmList.reduce((acc, c) => acc + c.pernyataan5, 0) / totalResponden : 0;

  // Filtered List untuk tabel rekap
  const filteredList = ikmList.filter((item) => {
    const matchPredikat = filterPredikat === 'all' || item.predikat === filterPredikat;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.alamat.toLowerCase().includes(q) ||
      item.kegiatan.toLowerCase().includes(q) ||
      item.nomorResponden.toLowerCase().includes(q);
    return matchPredikat && matchSearch;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'No. Responden',
      'Tanggal Survey',
      'Nama Responden',
      'Alamat',
      'Kegiatan / Layanan',
      'Kontak',
      'P1 Prosedur (Max 20)',
      'P2 Respon (Max 20)',
      'P3 Keramahan (Max 20)',
      'P4 Sarana (Max 20)',
      'P5 Kepuasan (Max 20)',
      'Total Nilai (Max 100)',
      'Predikat',
      'Saran & Masukan',
      'Petugas Pencatat',
    ];

    const rows = filteredList.map((item) => [
      `"${item.nomorResponden}"`,
      `"${item.tanggalSurvey}"`,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.alamat.replace(/"/g, '""')}"`,
      `"${item.kegiatan.replace(/"/g, '""')}"`,
      `"${item.nomorKontak || '-'}"`,
      item.pernyataan1,
      item.pernyataan2,
      item.pernyataan3,
      item.pernyataan4,
      item.pernyataan5,
      item.totalNilai,
      `"${item.predikat}"`,
      `"${(item.saranMasukan || '-').replace(/"/g, '""')}"`,
      `"${item.petugasPencatat || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_IKM_BP2RD_HSU_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HeartHandshake className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Indeks Kepuasan Masyarakat (IKM)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                BP2RD Hulu Sungai Utara
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Survei &amp; Rekapitulasi Indeks Kepuasan Masyarakat
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Instrumen evaluasi mutu pelayanan perpajakan dan retribusi daerah Pemkab HSU dengan 
              <strong className="text-emerald-300"> 5 Pernyataan Standar Pelayanan (masing-masing bernilai 20 poin)</strong> 
              dilengkapi emotikon ekspresi tingkat kepuasan.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('form')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'form'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Form Survei IKM</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveSubTab('rekap')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'rekap'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Rekap Laporan IKM</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-extrabold uppercase border border-amber-500/30">
                  Admin
                </span>
                {totalResponden > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-emerald-300 border border-emerald-500/30 font-extrabold">
                    {totalResponden}
                  </span>
                )}
              </button>
            ) : (
              <div 
                title="Rekap Laporan IKM hanya dapat diakses oleh Administrator BP2RD"
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 flex items-center gap-1.5 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Rekap Laporan (Admin)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: FORM SURVEI INDEKS KEPUASAN MASYARAKAT */}
      {/* ======================================================== */}
      {activeSubTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Form Input Data & 5 Pernyataan */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmitSurvey} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  <span>Identitas Responden &amp; Kegiatan Pelayanan</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Isikan data Wajib Pajak / masyarakat yang menerima pelayanan dari BP2RD HSU.
                </p>
              </div>

              {/* Form Input: Nama, Alamat, Kegiatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nama Lengkap Responden <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: H. Fahrurrazi / PT Borneo Maju / Ny. Salbiah"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Alamat Lengkap Responden <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Contoh: Jl. Basuki Rahmat No. 15, Kel. Murung Sari, Amuntai Tengah"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nama Kegiatan / Jenis Layanan <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={kegiatan}
                      onChange={(e) => setKegiatan(e.target.value)}
                      placeholder="Contoh: Konsultasi PBB-P2 / Pendaftaran Pajak Reklame / Retribusi Pasar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nomor WhatsApp / Kontak (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nomorKontak}
                    onChange={(e) => setNomorKontak(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 5 PERNYATAAN EVALUASI KEPUASAN (Masing-masing 20 Nilai) */}
              <div className="border-t border-slate-800 pt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400" />
                      <span>5 Pernyataan Evaluasi Pelayanan (Nilai Maksimal 20 / Item)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      Total Maksimal: 100 Poin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pilih salah satu ekspresi emote untuk setiap butir pernyataan: Sangat Baik (20), Baik (15), Cukup (10), atau Kurang (5).
                  </p>
                </div>

                {PERNYATAAN_IKM_CONFIG.map((pernyataan, idx) => {
                  const currentValue = ratings[pernyataan.key];

                  return (
                    <div
                      key={pernyataan.id}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                            Pernyataan {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {pernyataan.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {pernyataan.deskripsi}
                          </p>
                        </div>

                        {/* Current Badge */}
                        <div className="text-right shrink-0">
                          <span className="inline-block px-3 py-1 rounded-xl text-xs font-black bg-slate-900 border border-emerald-500/40 text-emerald-300 shadow-sm">
                            Nilai: {currentValue} / 20
                          </span>
                        </div>
                      </div>

                      {/* 4 Emote Options: Sangat Baik (20), Baik (15), Cukup (10), Kurang (5) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {OPSI_NILAI.map((opsi) => {
                          const isSelected = currentValue === opsi.nilai;

                          return (
                            <button
                              key={opsi.nilai}
                              type="button"
                              onClick={() => {
                                setRatings((prev) => ({
                                  ...prev,
                                  [pernyataan.key]: opsi.nilai,
                                }));
                              }}
                              className={`p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                isSelected
                                  ? `${opsi.bgSelectedClass} ring-2 ring-emerald-500/40 shadow-lg scale-[1.02]`
                                  : `bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white ${opsi.borderClass} hover:bg-slate-800/60`
                              }`}
                            >
                              <span className="text-2xl select-none animate-bounce-subtle">{opsi.emoji}</span>
                              <span className="text-xs font-extrabold">{opsi.level}</span>
                              <span className="text-[10px] font-bold opacity-80">
                                Nilai: {opsi.nilai}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Saran dan Masukan */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Saran &amp; Masukan Perbaikan Pelayanan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={saranMasukan}
                    onChange={(e) => setSaranMasukan(e.target.value)}
                    placeholder="Tuliskan apresiasi, saran, atau kritik membangun untuk peningkatan mutu layanan BP2RD Kabupaten Hulu Sungai Utara..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Petugas Pencatat:{' '}
                  <strong className="text-white">
                    {currentUser?.name || 'Masyarakat / Mandiri'}
                  </strong>
                </span>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Simpan Hasil Survei IKM</span>
                </button>
              </div>

            </form>
          </div>

          {/* Kolom Kanan: Pratinjau Skor & Penjelasan */}
          <div className="space-y-6">
            
            {/* Live Score Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Skor IKM Form Ini</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  5 Butir x 20
                </span>
              </div>

              <div className="my-6 text-center">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 font-mono tracking-tight">
                  {currentTotalNilai}
                  <span className="text-2xl text-slate-500 font-sans"> / 100</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Predikat: {currentPredikat}</span>
                </div>
              </div>

              {/* Progress bar per pernyataan */}
              <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                {PERNYATAAN_IKM_CONFIG.map((p) => {
                  const val = ratings[p.key];
                  const pct = (val / 20) * 100;
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="truncate max-w-[200px]">Pernyataan {p.id}</span>
                        <strong className="text-white font-mono">{val} ( {pct}% )</strong>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedoman Penilaian Permenpan */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tingkat Kepuasan &amp; Nilai Butir:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    <strong className="block text-white">🤩 Sangat Baik = 20</strong>
                    Mutu A (Sangat Memuaskan)
                  </div>
                  <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-300">
                    <strong className="block text-white">😊 Baik = 15</strong>
                    Mutu B (Memuaskan)
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-amber-300">
                    <strong className="block text-white">😐 Cukup = 10</strong>
                    Mutu C (Kurang Memuaskan)
                  </div>
                  <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300">
                    <strong className="block text-white">🙁 Kurang = 5</strong>
                    Mutu D (Tidak Memuaskan)
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: REKAP LAPORAN INDEKS KEPUASAN MASYARAKAT (KHUSUS ADMIN) */}
      {/* ======================================================== */}
      {activeSubTab === 'rekap' && (
        isAdmin ? (
          <div className="space-y-8">
          
          {/* Ringkasan Statistik IKM Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Responden Terdata
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{totalResponden}</span>
                <span className="text-xs text-slate-400">Responden</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Wajib Pajak &amp; masyarakat penerima layanan
              </p>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Rata-Rata Nilai IKM
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {rataRataNilai.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-300 mt-2 font-bold">
                Predikat: {predikatKeseluruhan}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Nilai Tertinggi Pelayanan
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400 font-mono">
                  {Math.max(...[avgP1, avgP2, avgP3, avgP4, avgP5]).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 20</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 truncate">
                Rata-rata aspek tertinggi
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Tingkat Kepuasan Publik
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400 font-mono">
                  {((rataRataNilai / 100) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-teal-300">Sangat Positif</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Berdasarkan 5 kriteria pelayanan
              </p>
            </div>

          </div>

          {/* Rincian Rata-Rata 5 Butir Pernyataan */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Rincian Rata-Rata Nilai 5 Pernyataan Evaluasi (Max 20 Poin)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribusi penilaian responden terhadap masing-masing unsur pelayanan BP2RD HSU.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ekspor Data Rekap IKM ke format CSV"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Rekap IKM</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {[
                { title: 'P1: Prosedur', desc: 'Kemudahan Alur', val: avgP1 },
                { title: 'P2: Kecepatan', desc: 'Respon Petugas', val: avgP2 },
                { title: 'P3: Keramahan', desc: 'Sikap & Kejelasan', val: avgP3 },
                { title: 'P4: Sarana', desc: 'Sistem SIPOTENSI', val: avgP4 },
                { title: 'P5: Hasil Layanan', desc: 'Penyelesaian Konsultasi', val: avgP5 },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {item.title}
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono my-1">
                    {item.val.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 20</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Rekapitulasi Data Responden IKM */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  Daftar Responden &amp; Hasil Rekapitulasi IKM ({filteredList.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, alamat, kegiatan..."
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
                  />
                </div>

                {/* Filter Predikat */}
                <select
                  value={filterPredikat}
                  onChange={(e) => setFilterPredikat(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua Predikat</option>
                  <option value="Sangat Baik">Sangat Baik (88-100)</option>
                  <option value="Baik">Baik (70-87)</option>
                  <option value="Cukup">Cukup (50-69)</option>
                  <option value="Kurang">Kurang (&lt;50)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Tidak ada data responden survei IKM yang sesuai kriteria pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">No. Responden</th>
                      <th className="py-3 px-3">Nama &amp; Kontak</th>
                      <th className="py-3 px-3">Alamat</th>
                      <th className="py-3 px-3">Kegiatan / Layanan</th>
                      <th className="py-3 px-2 text-center" title="Pernyataan 1: Prosedur (Max 20)">P1</th>
                      <th className="py-3 px-2 text-center" title="Pernyataan 2: Respon (Max 20)">P2</th>
                      <th className="py-3 px-2 text-center" title="Pernyataan 3: Keramahan (Max 20)">P3</th>
                      <th className="py-3 px-2 text-center" title="Pernyataan 4: Sarana (Max 20)">P4</th>
                      <th className="py-3 px-2 text-center" title="Pernyataan 5: Hasil (Max 20)">P5</th>
                      <th className="py-3 px-3 text-right">Total Nilai</th>
                      <th className="py-3 px-3 text-center">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-300 whitespace-nowrap">
                          {item.nomorResponden}
                          <span className="block text-[10px] text-slate-500 font-sans">
                            {item.tanggalSurvey}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-white block">{item.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.nomorKontak || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[180px] truncate" title={item.alamat}>
                          {item.alamat}
                        </td>
                        <td className="py-3 px-3 max-w-[200px] truncate" title={item.kegiatan}>
                          <span className="text-emerald-300 font-medium">{item.kegiatan}</span>
                          {item.saranMasukan && (
                            <span className="block text-[10px] text-slate-400 italic truncate" title={item.saranMasukan}>
                              &quot;{item.saranMasukan}&quot;
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{item.pernyataan1}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{item.pernyataan2}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{item.pernyataan3}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{item.pernyataan4}</td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-200">{item.pernyataan5}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                          {item.totalNilai} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.predikat === 'Sangat Baik'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.predikat === 'Baik'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : item.predikat === 'Cukup'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {item.predikat}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950/90 font-bold border-t border-slate-700 text-white">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right text-xs">
                        RATA-RATA NILAI ({filteredList.length} RESPONDEN):
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan1, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan2, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan3, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan4, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan5, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 text-base">
                        {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length).toFixed(1) : 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-emerald-300 text-xs">
                          {getPredikat(filteredList.length > 0 ? filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length : 0)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>
        ) : (
          <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-amber-500/40 rounded-3xl text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Akses Rekap IKM Khusus Administrator BP2RD
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tabel rekapitulasi nilai responden, rata-rata skor per pernyataan, dan dokumen cetak hasil survei Indeks Kepuasan Masyarakat hanya dapat diakses oleh akun dengan peran <strong>Admin BP2RD</strong>.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setActiveSubTab('form')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Kembali ke Form Survei
              </button>
            </div>
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* MODAL CETAK REKAP LAPORAN IKM RESMI PEMKAB HSU */}
      {/* ======================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Pratinjau Dokumen Cetak Rekapitulasi Indeks Kepuasan Masyarakat (IKM)
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Area Lembar Kertas Cetak Putih (Printable Area) */}
            <div className="printable-area bg-white text-slate-900 p-8 my-5 rounded-2xl shadow-inner font-serif text-xs">
              
              {/* Kop Surat Pemkab HSU & BP2RD */}
              <div className="border-b-4 border-double border-slate-900 pb-3 mb-5 text-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight">
                  PEMERINTAH KABUPATEN HULU SUNGAI UTARA
                </h2>
                <h1 className="text-base font-black uppercase tracking-wide text-slate-950 my-1">
                  BADAN PENGELOLAAN PENDAPATAN DAERAH (BP2RD)
                </h1>
                <p className="text-[10px] text-slate-700 font-sans italic">
                  Jl. Basuki Rahmat No. 01, Amuntai &bull; Telp. (0527) 61234 &bull; Email: bp2rd@hulusungaiutarakab.go.id &bull; Kodepos 71415
                </p>
              </div>

              {/* Judul Dokumen Cetak */}
              <div className="text-center my-4 font-sans">
                <h3 className="text-sm font-bold underline uppercase tracking-wide">
                  REKAPITULASI LAPORAN INDEKS KEPUASAN MASYARAKAT (IKM)
                </h3>
                <p className="text-[11px] text-slate-600 mt-1">
                  Periode Tahun Anggaran {new Date().getFullYear()} &bull; Total Responden: {filteredList.length} Orang
                </p>
              </div>

              {/* Ringkasan Skor Angka */}
              <div className="my-4 p-3 bg-slate-100 rounded-lg border border-slate-300 font-sans text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-600 block">Total Responden:</span>
                    <strong className="text-sm text-slate-900">{filteredList.length} Wajib Pajak</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Rata-Rata Nilai IKM:</span>
                    <strong className="text-sm text-emerald-800">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length).toFixed(1) : 0} / 100
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Mutu Pelayanan:</span>
                    <strong className="text-sm text-blue-900">
                      {getPredikat(filteredList.length > 0 ? filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length : 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Tabel Cetak */}
              <table className="w-full text-left border-collapse border border-slate-400 font-sans text-[10px] my-4">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400 text-center">
                    <th className="border border-slate-400 p-1.5 w-8">No</th>
                    <th className="border border-slate-400 p-1.5 text-left">Nama Responden</th>
                    <th className="border border-slate-400 p-1.5 text-left">Alamat</th>
                    <th className="border border-slate-400 p-1.5 text-left">Kegiatan / Layanan</th>
                    <th className="border border-slate-400 p-1.5 w-8" title="P1: Prosedur">P1</th>
                    <th className="border border-slate-400 p-1.5 w-8" title="P2: Respon">P2</th>
                    <th className="border border-slate-400 p-1.5 w-8" title="P3: Keramahan">P3</th>
                    <th className="border border-slate-400 p-1.5 w-8" title="P4: Sarana">P4</th>
                    <th className="border border-slate-400 p-1.5 w-8" title="P5: Hasil">P5</th>
                    <th className="border border-slate-400 p-1.5 w-12">Total</th>
                    <th className="border border-slate-400 p-1.5 w-16">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5 font-bold">{item.nama}</td>
                      <td className="border border-slate-400 p-1.5">{item.alamat}</td>
                      <td className="border border-slate-400 p-1.5">{item.kegiatan}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{item.pernyataan1}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{item.pernyataan2}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{item.pernyataan3}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{item.pernyataan4}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono">{item.pernyataan5}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-mono font-bold">{item.totalNilai}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{item.predikat}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-500">
                    <td colSpan={4} className="border border-slate-400 p-1.5 text-right">
                      RATA-RATA NILAI:
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan1, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan2, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan3, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan4, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.pernyataan5, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono font-bold">
                      {filteredList.length > 0 ? (filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length).toFixed(1) : 0}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center">
                      {getPredikat(filteredList.length > 0 ? filteredList.reduce((a, c) => a + c.totalNilai, 0) / filteredList.length : 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Tanda Tangan Pejabat Pengesah */}
              <div className="flex justify-between items-center text-[11px] font-sans pt-6 mt-6 border-t border-slate-300">
                <div className="text-center w-52">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala BP2RD Kab. HSU</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">H. SUPIAN, S.Sos, M.AP</p>
                  <p className="text-[9px] text-slate-600">NIP. 19740612 199803 1 004</p>
                </div>

                <div className="text-center w-52">
                  <p>Amuntai, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</p>
                  <p className="font-bold">Kabid Pendataan &amp; Penilaian</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{currentUser?.name || 'Rija, S.STP, M.IP'}</p>
                  <p className="text-[9px] text-slate-600">NIP. {currentUser?.nip || '19880512 201001 1 003'}</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Rekap (Printer / PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
