import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Calendar, 
  Filter, 
  Award, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Receipt, 
  Building2, 
  Layers, 
  ArrowUpRight, 
  Coins, 
  Percent,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { PotensiPajakEntry, PbbP2Entry, LibraryBerkasEntry, AppUser } from '../types';
import { KABUPATEN_HSU, KECAMATAN_HSU } from '../constants/wilayahHsu';

interface AnalyticsDashboardProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  libraryList: LibraryBerkasEntry[];
  currentUser: AppUser | null;
  onNavigateToTab?: (tab: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  potensiList,
  pbbList,
  libraryList,
  currentUser,
  onNavigateToTab,
}) => {
  const [filterKecamatan, setFilterKecamatan] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'2026' | 'triwulan-1' | 'all'>('2026');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter datasets
  const activePotensi = potensiList.filter((p) => {
    return filterKecamatan === 'all' || p.kecamatan === filterKecamatan;
  });

  const activePbb = pbbList.filter((p) => {
    return filterKecamatan === 'all' || p.kecamatan === filterKecamatan;
  });

  // Aggregated KPIs
  const totalPotensiTahunan = activePotensi.reduce((acc, curr) => acc + (curr.potensiRupiahTahunan || 0), 0);
  const totalPotensiBulanan = activePotensi.reduce((acc, curr) => acc + (curr.potensiRupiahBulanan || 0), 0);
  
  const totalPbbTerhutang = activePbb.reduce((acc, curr) => acc + (curr.pbbTerhutang || 0), 0);
  const totalPbbLunas = activePbb
    .filter((p) => p.statusPembayaran === 'LUNAS')
    .reduce((acc, curr) => acc + (curr.pbbTerhutang || 0), 0);
  const totalPbbPiutang = totalPbbTerhutang - totalPbbLunas;
  const persentasePbbLunas = totalPbbTerhutang > 0 ? Math.round((totalPbbLunas / totalPbbTerhutang) * 100) : 0;

  // Breakdown per Jenis Pajak
  const jenisPajakMap: Record<string, { count: number; total: number }> = {};
  activePotensi.forEach((p) => {
    if (!jenisPajakMap[p.jenisPajak]) {
      jenisPajakMap[p.jenisPajak] = { count: 0, total: 0 };
    }
    jenisPajakMap[p.jenisPajak].count += 1;
    jenisPajakMap[p.jenisPajak].total += p.potensiRupiahTahunan;
  });

  const jenisPajakBreakdown = Object.entries(jenisPajakMap)
    .map(([jenis, data]) => ({
      jenis,
      count: data.count,
      total: data.total,
      percentage: totalPotensiTahunan > 0 ? (data.total / totalPotensiTahunan) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Breakdown per 10 Kecamatan HSU
  const kecamatanBreakdown = KECAMATAN_HSU.map((kec) => {
    const listKec = potensiList.filter((p) => p.kecamatan === kec.nama);
    const pbbKec = pbbList.filter((p) => p.kecamatan === kec.nama);
    const sumPotensi = listKec.reduce((acc, curr) => acc + curr.potensiRupiahTahunan, 0);
    const sumPbb = pbbKec.reduce((acc, curr) => acc + curr.pbbTerhutang, 0);
    const lunasPbb = pbbKec.filter((p) => p.statusPembayaran === 'LUNAS').reduce((acc, curr) => acc + curr.pbbTerhutang, 0);

    return {
      nama: kec.nama,
      singkat: kec.nama.replace('Kecamatan ', ''),
      potensiTotal: sumPotensi,
      potensiCount: listKec.length,
      pbbTotal: sumPbb,
      pbbLunas: lunasPbb,
      complianceRate: sumPbb > 0 ? Math.round((lunasPbb / sumPbb) * 100) : 0,
    };
  }).sort((a, b) => b.potensiTotal - a.potensiTotal);

  const maxKecamatanPotensi = Math.max(...kecamatanBreakdown.map((k) => k.potensiTotal), 1);

  // Top 5 Wajib Pajak Potensial
  const topPotensiList = [...activePotensi]
    .sort((a, b) => b.potensiRupiahTahunan - a.potensiRupiahTahunan)
    .slice(0, 5);

  // Digital Berkas Distribution
  const libraryPublicCount = libraryList.filter((l) => l.isPublic).length;
  const libraryInternalCount = libraryList.filter((l) => !l.isPublic).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Dashboard Analitik Fiskal &amp; Potensi HSU
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Real-Time BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualisasi cerdas performa penerimaan, pemetaan potensi pajak daerah, dan evaluasi kepatuhan PBB-P2 Kabupaten Hulu Sungai Utara.
          </p>
        </div>

        {/* Global Toolbar Filters */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-950">Seluruh 10 Kecamatan HSU</option>
              {KECAMATAN_HSU.map((k, idx) => (
                <option key={idx} value={k.nama} className="bg-slate-950">{k.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTimeRange('2026')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                timeRange === '2026' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              TA 2026
            </button>
            <button
              onClick={() => setTimeRange('triwulan-1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                timeRange === 'triwulan-1' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              TW I
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Potensi Fiskal Tahunan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatRupiah(totalPotensiTahunan)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Rata-rata / Bulan:</span>
            <strong className="text-emerald-400 font-mono">{formatRupiah(totalPotensiBulanan)}</strong>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Realisasi Lunas PBB-P2</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-blue-400 tracking-tight">
            {formatRupiah(totalPbbLunas)}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Tingkat Kepatuhan:</span>
            <strong className="text-blue-300 font-bold">{persentasePbbLunas}% Tercapai</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Objek Pajak Terdata</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {activePotensi.length + activePbb.length} Objek
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{activePotensi.length} Usaha</span>
            <span>&bull;</span>
            <span>{activePbb.length} SPPT PBB</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-5 shadow-xl transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Repositori Berkas Digital</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-purple-300 tracking-tight">
            {libraryList.length} Dokumen
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400">{libraryPublicCount} Publik</span>
            <span>&bull;</span>
            <span className="text-amber-400">{libraryInternalCount} Internal</span>
          </div>
        </div>

      </div>

      {/* Main Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Sebaran Potensi Berdasarkan 10 Kecamatan HSU */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">
                Peringkat Potensi per Kecamatan HSU
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">10 Wilayah</span>
          </div>
          <p className="text-xs text-slate-400">
            Estimasi kontribusi potensi PAD dari hasil survei geospasial lapangan di setiap kecamatan.
          </p>

          <div className="space-y-3.5 pt-2">
            {kecamatanBreakdown.map((kec, idx) => {
              const widthPct = Math.max(8, (kec.potensiTotal / maxKecamatanPotensi) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono w-4">#{idx + 1}</span>
                      {kec.singkat}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatRupiah(kec.potensiTotal)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Komposisi Potensi Berdasarkan Jenis Pajak */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-extrabold text-white">
                Komposisi per Jenis Pajak Daerah
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Persentase</span>
          </div>
          <p className="text-xs text-slate-400">
            Distribusi potensi penerimaan pajak daerah berdasarkan klasifikasi UU HKPD &amp; Perda Kab. HSU.
          </p>

          <div className="space-y-3 pt-2">
            {jenisPajakBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Tidak ada data untuk filter ini.</p>
            ) : (
              jenisPajakBreakdown.map((jp, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{jp.jenis}</h4>
                      <p className="text-[11px] text-slate-400">{jp.count} Wajib Pajak terdata</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-teal-300 block">
                      {formatRupiah(jp.total)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {jp.percentage.toFixed(1)}% dari Total
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Top Wajib Pajak & Evaluasi Kepatuhan PBB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top 5 Objek Potensi */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white">
                5 Objek Pajak dengan Potensi Tertinggi
              </h2>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('potensi')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Usaha / Objek</th>
                  <th className="py-2.5 px-3">Jenis Pajak</th>
                  <th className="py-2.5 px-3">Kecamatan</th>
                  <th className="py-2.5 px-3 text-right">Potensi Tahunan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topPotensiList.map((tp, idx) => (
                  <tr key={tp.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <strong className="text-white block">{tp.namaUsaha}</strong>
                      <span className="text-[10px] text-slate-400">{tp.namaWajibPajak}</span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">{tp.jenisPajak}</td>
                    <td className="py-2.5 px-3">{tp.kecamatan}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatRupiah(tp.potensiRupiahTahunan)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {tp.statusVerifikasi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rekomendasi Penggalian Potensi Cerdas BP2RD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white">
                Rekomendasi Fiskal BP2RD HSU
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Peluang intensifikasi &amp; ekstensifikasi berdasarkan data analitik:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                  1. Sentra Kuliner Alabio &amp; Amuntai
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Tingkatkan pendataan PBJT Makanan &amp; Minuman di pusat perdagangan Alabio (Sungai Pandan) dan sepanjang koridor Basuki Rahmat Amuntai Tengah.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-blue-400 block mb-1">
                  2. Cleansing Piutang PBB-P2
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sisa piutang PBB {formatRupiah(totalPbbPiutang)} memerlukan verifikasi batas tanah persil rawa di Danau Panggang dan Babirik.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">
                  3. Optimalisasi Pajak Reklame
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Titik strategis bundaran dan simpang protokol di Amuntai Tengah memiliki potensi reklame komersial yang belum seluruhnya terdaftar resmi.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('laporan')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Cetak Dokumen Evaluasi Resmi
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
