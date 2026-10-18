import React from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Download,
  Share2
} from 'lucide-react';
import { PbbP2Entry } from '../types';
import { getKelasBumi, getKelasBangunan, terbilangRupiah } from '../utils/pbbCalculator';

interface SpptPbbModalProps {
  entry: Partial<PbbP2Entry> | null;
  onClose: () => void;
}

export const SpptPbbModal: React.FC<SpptPbbModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const formatRupiah = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const luasBumi = entry.luasBumiM2 || 0;
  const njopBumi = entry.njopBumiPerM2 || 0;
  const totalBumi = entry.totalNjopBumi !== undefined ? entry.totalNjopBumi : Math.round(luasBumi * njopBumi);
  const kelasBumi = entry.kelasBumi || getKelasBumi(njopBumi);

  const luasBangunan = entry.luasBangunanM2 || 0;
  const njopBangunan = entry.njopBangunanPerM2 || 0;
  const totalBangunan = entry.totalNjopBangunan !== undefined ? entry.totalNjopBangunan : Math.round(luasBangunan * njopBangunan);
  const kelasBangunan = entry.kelasBangunan || (luasBangunan > 0 ? getKelasBangunan(njopBangunan) : '-');

  const totalNjop = entry.njopTotal !== undefined ? entry.njopTotal : (totalBumi + totalBangunan);
  const njoptkp = entry.njoptkp !== undefined ? entry.njoptkp : 10000000;
  const njopKenaPajak = entry.njopKenaPajak !== undefined ? entry.njopKenaPajak : Math.max(0, totalNjop - njoptkp);
  const tarifPersen = entry.tarifPbbPersen !== undefined ? entry.tarifPbbPersen : 0.15;
  const ketetapanPokok = Math.round(njopKenaPajak * (tarifPersen / 100));
  const stimulus = entry.stimulusPengurangan || 0;
  const denda = entry.dendaAdministrasi || 0;
  const totalBayar = entry.totalPbbHarusDibayar !== undefined 
    ? entry.totalPbbHarusDibayar 
    : (entry.pbbTerhutang || Math.max(0, ketetapanPokok - stimulus + denda));

  const terbilang = terbilangRupiah(totalBayar);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-extrabold text-white">
              Lembar Resmi SPPT PBB-P2 &bull; Dokumen Ketetapan Pajak Daerah
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak SPPT</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SPPT Sheet Content (Rendered like an Official Government Slip) */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-900 text-slate-100">
          
          {/* Official Letterhead (KOP) */}
          <div className="border-b-2 border-slate-700 pb-5 text-center relative">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shrink-0">
                <Building2 className="w-9 h-9" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                  Pemerintah Kabupaten Hulu Sungai Utara
                </h3>
                <h4 className="text-xs sm:text-sm font-extrabold text-teal-400 uppercase tracking-widest">
                  Badan Pengelola Pendapatan dan Retribusi Daerah (BP2RD)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Jl. Basuki Rahmat No. 01, Amuntai &bull; Call Center PBB-P2: (0527) 61234 &bull; SIPOTENSI HSU
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Surat Pemberitahuan Pajak Terhutang (SPPT) PBB-P2
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                Tahun Pajak : <strong className="text-white text-sm">{entry.tahunPajak || 2026}</strong>
              </span>
            </div>
          </div>

          {/* Subjek & Objek Pajak Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Box NOP & Objek */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="font-bold text-teal-400 uppercase text-[11px]">Nomor Objek Pajak (NOP)</span>
                {entry.statusPembayaran === 'LUNAS' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>LUNAS</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>BELUM LUNAS</span>
                  </span>
                )}
              </div>

              <div className="text-base sm:text-lg font-black text-white tracking-widest py-1">
                {entry.nop || '63.08.xxx.xxx.xxx-xxxx.x'}
              </div>

              <div className="space-y-1 text-slate-300 text-[11px] font-sans">
                <div>
                  <span className="text-slate-500 block">Letak Objek Pajak:</span>
                  <span className="font-semibold text-white">{entry.alamatObjek || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block">Kelurahan / Desa:</span>
                    <span className="font-medium text-slate-200">{entry.kelurahanDesa || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Kecamatan:</span>
                    <span className="font-medium text-slate-200">{entry.kecamatan || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Wajib Pajak (Subjek Pajak) */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
                <span className="font-bold text-teal-400 uppercase text-[11px]">Nama &amp; Identitas Wajib Pajak</span>
                <span className="text-[10px] text-slate-400">Subjek PBB Terdaftar</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block font-sans">Nama Wajib Pajak:</span>
                <span className="text-base font-extrabold text-white block">{entry.namaWajibPajak || '-'}</span>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px] font-sans">
                <div>
                  <span className="text-slate-500 block">NIK Wajib Pajak:</span>
                  <span className="font-mono text-slate-200">{entry.nikWajibPajak || 'Belum Terlampir'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kabupaten:</span>
                  <span className="text-slate-200 font-semibold">Hulu Sungai Utara, Prov. Kalimantan Selatan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Objek Pajak Sesuai Referensi SPPT PBB Resmi */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/90">
            <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tabel Rincian Objek Pajak Bumi &amp; Bangunan
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Standar Penilaian BP2RD HSU</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-4 text-left">Objek Pajak</th>
                    <th className="py-2.5 px-4 text-right">Luas (m&sup2;)</th>
                    <th className="py-2.5 px-4 text-center">Kelas</th>
                    <th className="py-2.5 px-4 text-right">NJOP per m&sup2; (Rp)</th>
                    <th className="py-2.5 px-4 text-right font-bold text-teal-300">Total NJOP (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {/* Baris Bumi */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>BUMI (Tanah / Persil)</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      {luasBumi.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-400">
                      {kelasBumi}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {formatRupiah(njopBumi)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {formatRupiah(totalBumi)}
                    </td>
                  </tr>

                  {/* Baris Bangunan */}
                  <tr className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>BANGUNAN</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      {luasBangunan > 0 ? luasBangunan.toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-400">
                      {luasBangunan > 0 ? kelasBangunan : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {luasBangunan > 0 ? formatRupiah(njopBangunan) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {luasBangunan > 0 ? formatRupiah(totalBangunan) : 'Rp 0'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rekapitulasi & Komputasi Ketetapan Pajak (Sesuai SPPT PBB Resmi) */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans">1. Total Nilai Jual Objek Pajak (NJOP Dasar Pengenaan PBB-P2):</span>
                <span className="font-bold text-white">{formatRupiah(totalNjop)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="font-sans">2. Nilai Jual Objek Pajak Tidak Kena Pajak (NJOPTKP):</span>
                <span className="text-amber-300">(-) {formatRupiah(njoptkp)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800/80">
                <span className="font-sans font-bold">3. Nilai Jual Objek Pajak untuk Penghitungan PBB (NJOPKP):</span>
                <span className="font-bold text-teal-300">{formatRupiah(njopKenaPajak)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="font-sans">4. Tarif Pajak Bumi dan Bangunan P2 (Perda HSU No. 01/2024):</span>
                <span className="text-slate-200 font-bold">{tarifPersen}%</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans">5. Ketetapan PBB Terhutang ({tarifPersen}% &times; NJOPKP):</span>
                <span className="font-bold text-white">{formatRupiah(ketetapanPokok)}</span>
              </div>

              {stimulus > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="font-sans">6. Stimulus / Pengurangan Ketetapan SPPT:</span>
                  <span>(-) {formatRupiah(stimulus)}</span>
                </div>
              )}

              {denda > 0 && (
                <div className="flex justify-between items-center text-red-400">
                  <span className="font-sans">7. Denda Keterlambatan Administrasi:</span>
                  <span>(+) {formatRupiah(denda)}</span>
                </div>
              )}

              {/* Total PBB yang harus dibayar */}
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-950/80 via-blue-950/70 to-slate-900 border border-teal-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-sans font-extrabold text-teal-300 tracking-wider block">
                    Jumlah PBB Yang Harus Dibayar :
                  </span>
                  <span className="text-[11px] font-sans text-slate-300 italic">
                    Terbilang: &ldquo;{terbilang}&rdquo;
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">
                  {formatRupiah(totalBayar)}
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Pembayaran & Tempat Bayar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                <span>Tanggal Jatuh Tempo</span>
              </span>
              <span className="text-sm font-bold text-white block">30 November {entry.tahunPajak || 2026}</span>
              <span className="text-[10px] text-slate-500">Denda 1% per bulan keterlambatan</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Tempat Pembayaran Resmi</span>
              </span>
              <span className="text-xs font-bold text-white block">
                {entry.bankTempatBayar || 'Bank Kalsel Cabang Amuntai'}
              </span>
              <span className="text-[10px] text-slate-500">Teller, ATM, Mobile Banking, Kantor Pos</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verifikasi Validasi BP2RD</span>
              </span>
              <span className="text-xs font-bold text-emerald-400 block">
                {entry.petugasValidasi || 'Petugas Validasi BP2RD HSU'}
              </span>
              <span className="text-[10px] text-slate-500">Tercatat pada Database SIPOTENSI</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              Dicetak melalui Sistem Informasi Pemetaan Potensi (SIPOTENSI) BP2RD Kab. Hulu Sungai Utara.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Lembar SPPT
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-950/50 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print Dokumen</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
