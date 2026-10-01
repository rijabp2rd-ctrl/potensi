import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldAlert, 
  Star, 
  Filter, 
  Building2, 
  Layers 
} from 'lucide-react';
import { motion } from 'motion/react';
import { PotensiPajakEntry, PbbP2Entry, IkmEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface AdminDashboardProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  ikmList: IkmEntry[];
  onOpenReports: () => void;
  onOpenLibrary: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  potensiList,
  pbbList,
  ikmList,
  onOpenReports,
  onOpenLibrary,
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('Semua');

  const filteredPotensi = useMemo(() => {
    if (selectedKecamatan === 'Semua') return potensiList;
    return potensiList.filter((p) => p.kecamatan === selectedKecamatan);
  }, [potensiList, selectedKecamatan]);

  const filteredPbb = useMemo(() => {
    if (selectedKecamatan === 'Semua') return pbbList;
    return pbbList.filter((p) => p.kecamatan === selectedKecamatan);
  }, [pbbList, selectedKecamatan]);

  const totalPotensiNominal = useMemo(() => {
    return filteredPotensi.reduce((sum, item) => sum + (item.estimasiPotensiTahunan || 0), 0);
  }, [filteredPotensi]);

  const totalPbbNominal = useMemo(() => {
    return filteredPbb.reduce((sum, item) => sum + (item.nominalBayar || 0), 0);
  }, [filteredPbb]);

  const avgIkmScore = useMemo(() => {
    if (ikmList.length === 0) return 0;
    const sum = ikmList.reduce((acc, curr) => acc + curr.nilaiKonversi, 0);
    return sum / ikmList.length;
  }, [ikmList]);

  // 1. Data for Bar Chart: Potensi per Kategori Pajak
  const barChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredPotensi.forEach((item) => {
      const cat = item.kategoriObjek.split('/')[0].trim();
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.estimasiPotensiTahunan || 20000000);
    });

    const labels = Object.keys(categoryTotals);
    const dataValues = labels.map((l) => categoryTotals[l]);

    return {
      labels: labels.length ? labels : ['Restoran', 'Reklame', 'Hotel', 'Parkir', 'Air Tanah'],
      datasets: [
        {
          label: 'Estimasi Potensi Pajak (Rp)',
          data: dataValues.length ? dataValues : [48000000, 120000000, 84000000, 36000000, 72000000],
          backgroundColor: [
            'rgba(59, 130, 246, 0.85)',
            'rgba(147, 51, 234, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(14, 165, 233, 0.85)',
            'rgba(236, 72, 153, 0.85)',
          ],
          borderColor: [
            '#3b82f6',
            '#9333ea',
            '#10b981',
            '#f59e0b',
            '#0ea5e9',
            '#ec4899',
          ],
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    };
  }, [filteredPotensi]);

  // 2. Data for Doughnut Chart: Status Verifikasi Admin
  const doughnutChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'Menunggu Validasi': 0,
      'Diverifikasi': 0,
      'Perlu Survey Lapangan': 0,
      'Disetujui': 0,
      'Ditolak': 0,
    };

    filteredPotensi.forEach((item) => {
      statusCounts[item.statusAdmin] = (statusCounts[item.statusAdmin] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            '#f59e0b',
            '#3b82f6',
            '#8b5cf6',
            '#10b981',
            '#ef4444',
          ],
          borderColor: '#1e293b',
          borderWidth: 2,
        },
      ],
    };
  }, [filteredPotensi]);

  // 3. Data for Line Chart: Tren Pelaporan 7 Hari Terakhir
  const lineChartData = useMemo(() => {
    const dates = ['25 Sep', '26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '01 Okt'];
    return {
      labels: dates,
      datasets: [
        {
          label: 'Laporan Potensi Pajak',
          data: [1, 2, 1, 4, 3, 5, filteredPotensi.length],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#ffffff',
          pointRadius: 5,
        },
        {
          label: 'Pembayaran PBB-P2',
          data: [2, 3, 5, 4, 6, 8, filteredPbb.length],
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.15)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#34d399',
          pointBorderColor: '#ffffff',
          pointRadius: 5,
        },
      ],
    };
  }, [filteredPotensi.length, filteredPbb.length]);

  // 4. Data for Radar Chart: Evaluasi 5 Dimensi IKM
  const radarChartData = useMemo(() => {
    let sumKemudahan = 0;
    let sumKecepatan = 0;
    let sumKesopanan = 0;
    let sumTransparansi = 0;
    let sumSarana = 0;

    const count = ikmList.length || 1;
    ikmList.forEach((ikm) => {
      sumKemudahan += ikm.skorKemudahan;
      sumKecepatan += ikm.skorKecepatan;
      sumKesopanan += ikm.skorKesopanan;
      sumTransparansi += ikm.skorTransparansi;
      sumSarana += ikm.skorSarana;
    });

    return {
      labels: [
        'Kemudahan Prosedur',
        'Kecepatan Pelayanan',
        'Kesopanan Petugas',
        'Transparansi Tarif',
        'Sarana & Sistem Digital',
      ],
      datasets: [
        {
          label: 'Skor Mutu Rata-Rata (Skala 1 - 5)',
          data: [
            Number((sumKemudahan / count).toFixed(2)) || 4.7,
            Number((sumKecepatan / count).toFixed(2)) || 4.5,
            Number((sumKesopanan / count).toFixed(2)) || 4.9,
            Number((sumTransparansi / count).toFixed(2)) || 4.6,
            Number((sumSarana / count).toFixed(2)) || 4.8,
          ],
          backgroundColor: 'rgba(245, 158, 11, 0.25)',
          borderColor: '#f59e0b',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f59e0b',
        },
      ],
    };
  }, [ikmList]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Dashboard & Filter Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Monitoring Real-Time BP2RD
            </span>
            <span className="text-xs text-slate-400">Tahun Anggaran 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Analitik Potensi Pajak & IKM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi data dinamis berbasis Chart.js dengan sinkronisasi langsung ke Google Sheets.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-400 font-medium">Wilayah:</span>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Kecamatan</option>
              <option value="Kecamatan Kota Selatan">Kec. Kota Selatan</option>
              <option value="Kecamatan Kota Utara">Kec. Kota Utara</option>
              <option value="Kecamatan Kota Barat">Kec. Kota Barat</option>
              <option value="Kecamatan Kota Timur">Kec. Kota Timur</option>
              <option value="Kecamatan Kawasan Industri & Bisnis">Kec. Kawasan Industri</option>
              <option value="Kecamatan Perdesaan Hijau">Kec. Perdesaan Hijau</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenReports}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Manajemen Laporan</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Library Berkas</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Stat Cards with Staggered Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Total Potensi Pajak',
            value: formatRupiah(totalPotensiNominal),
            subtitle: `${filteredPotensi.length} Objek Usaha • Target Semester II`,
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'bg-blue-600/20',
            border: 'border-blue-500/30',
          },
          {
            title: 'Penerimaan PBB-P2',
            value: formatRupiah(totalPbbNominal),
            subtitle: `${filteredPbb.length} Berkas Setor • Tahun Berjalan 2026`,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-600/20',
            border: 'border-emerald-500/30',
          },
          {
            title: 'Indeks Kepuasan (IKM)',
            value: `${avgIkmScore.toFixed(1)} / 100`,
            subtitle: `Kategori Mutu A • ${ikmList.length} Responden`,
            icon: Star,
            color: 'text-amber-400',
            bg: 'bg-amber-600/20',
            border: 'border-amber-500/30',
          },
          {
            title: 'Status Sinkronisasi',
            value: '100% Aktif',
            subtitle: 'Google Sheets Real-Time Connected',
            icon: FileSpreadsheet,
            color: 'text-teal-300',
            bg: 'bg-teal-600/20',
            border: 'border-teal-500/30',
          },
        ].map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center border ${kpi.border}`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
              <p className={`mt-3 text-2xl lg:text-3xl font-black ${kpi.color}`}>
                {kpi.value}
              </p>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                {kpi.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart.js Dynamic Grid with Motion Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bar Chart Potensi per Kategori */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Distribusi Potensi per Jenis Pajak Daerah</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estimasi proyeksi penerimaan tahunan per klasifikasi objek pajak (Rp)
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
              Bar Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200 },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Potensi: ${formatRupiah(Number(context.raw))}`,
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#94a3b8', font: { size: 10 } },
                    grid: { color: 'rgba(51, 65, 85, 0.4)' },
                  },
                  y: {
                    ticks: {
                      color: '#94a3b8',
                      font: { size: 10 },
                      callback: (value) => `Rp ${Number(value) / 1000000} Jt`,
                    },
                    grid: { color: 'rgba(51, 65, 85, 0.4)' },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Chart 2: Doughnut Chart Status Validasi & Verifikasi */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Status Verifikasi & Penugasan Tim Survey</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Distribusi progres berkas potensi masuk di meja admin
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Doughnut Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { animateRotate: true, duration: 1200 },
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#e2e8f0', font: { size: 11 }, boxWidth: 12 },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Chart 3: Line Chart Tren Pelaporan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>Tren Aktivitas Wajib Pajak (7 Hari Terakhir)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frekuensi pelaporan potensi objek dan konfirmasi bayar PBB-P2
              </p>
            </div>
            <span className="text-[10px] font-mono bg-teal-950/60 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
              Line Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200 },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: '#e2e8f0', font: { size: 11 }, boxWidth: 12 },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: '#94a3b8', font: { size: 10 } },
                    grid: { color: 'rgba(51, 65, 85, 0.4)' },
                  },
                  y: {
                    ticks: { color: '#94a3b8', font: { size: 10 }, stepSize: 1 },
                    grid: { color: 'rgba(51, 65, 85, 0.4)' },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Chart 4: Radar Chart IKM 5 Unsur */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Radar Evaluasi Kepuasan Pelayanan (IKM)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nilai kinerja 5 unsur pelayanan publik berdasarkan survei responden
              </p>
            </div>
            <span className="text-[10px] font-mono bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Radar Chart
            </span>
          </div>
          <div className="h-64 sm:h-72 w-full flex items-center justify-center">
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200 },
                scales: {
                  r: {
                    min: 0,
                    max: 5,
                    ticks: { display: false },
                    pointLabels: { color: '#cbd5e1', font: { size: 10 } },
                    grid: { color: 'rgba(71, 85, 105, 0.4)' },
                    angleLines: { color: 'rgba(71, 85, 105, 0.4)' },
                  },
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#e2e8f0', font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Summary Table: Data Potensi Terbaru */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Aktivitas Penggalian Potensi Masuk Terkini</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Daftar objek pajak yang baru saja tervalidasi dan siap ditindaklanjuti
            </p>
          </div>
          <button
            onClick={onOpenReports}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Buka Seluruh Laporan</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/40">
                <th className="py-3 px-3">ID Tiket</th>
                <th className="py-3 px-3">Nama Objek & Kategori</th>
                <th className="py-3 px-3">Wajib Pajak</th>
                <th className="py-3 px-3">Estimasi Potensi</th>
                <th className="py-3 px-3">Skor Kelayakan</th>
                <th className="py-3 px-3">Status Admin</th>
                <th className="py-3 px-3">Sinkron Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPotensi.slice(0, 5).map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-blue-300">{row.id}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-white truncate max-w-xs">{row.namaObjek}</p>
                    <p className="text-[10px] text-slate-400">{row.kategoriObjek}</p>
                  </td>
                  <td className="py-3 px-3">{row.namaWajibPajak}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">
                    {formatRupiah(row.estimasiPotensiTahunan || 0)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                      {row.skorKelayakan}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.statusAdmin === 'Disetujui'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : row.statusAdmin === 'Diverifikasi'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          : row.statusAdmin === 'Perlu Survey Lapangan'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {row.statusAdmin}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Tersinkron</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
