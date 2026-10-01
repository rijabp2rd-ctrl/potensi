import React, { useState } from 'react';
import { 
  Star, 
  Smile, 
  Meh, 
  Frown, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles,
  MessageSquareHeart,
  Award,
  ThumbsUp,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IkmEntry } from '../types';
import { triggerStarConfetti } from '../utils/confetti';

interface FormIkmProps {
  onSubmit: (entry: IkmEntry) => void;
  onBackToHome: () => void;
}

interface QuestionDef {
  key: 'kemudahan' | 'kecepatan' | 'kesopanan' | 'transparansi' | 'sarana';
  title: string;
  description: string;
}

const QUESTIONS: QuestionDef[] = [
  {
    key: 'kemudahan',
    title: '1. Kemudahan Persyaratan & Alur Prosedur',
    description: 'Seberapa mudah persyaratan pendaftaran potensi, pengurusan PBB, dan informasi perpajakan daerah?',
  },
  {
    key: 'kecepatan',
    title: '2. Kecepatan & Ketepatan Waktu Pelayanan',
    description: 'Seberapa cepat respon verifikasi dokumen dan penetapan SKPD oleh tim BP2RD?',
  },
  {
    key: 'kesopanan',
    title: '3. Kesopanan, Keramahan & Kompetensi Petugas',
    description: 'Sikap sopan santun, profesionalitas, dan kejelasan solusi yang diberikan oleh petugas pelayanan?',
  },
  {
    key: 'transparansi',
    title: '4. Transparansi Tarif Pajak & Keterbukaan Informasi',
    description: 'Kejelasan perhitungan tarif pajak daerah sesuai regulasi tanpa ada pungutan liar (pungli)?',
  },
  {
    key: 'sarana',
    title: '5. Kualitas Sistem Digital & Fasilitas Layanan',
    description: 'Kenyamanan portal online SIPOTENSI, integrasi Google Sheets, dan saluran WhatsApp Center?',
  },
];

const SKALA_LABELS: Record<number, { text: string; color: string; emoji: string }> = {
  1: { text: 'Sangat Tidak Puas', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40', emoji: '😞' },
  2: { text: 'Kurang Puas', color: 'text-orange-400 bg-orange-950/60 border-orange-500/40', emoji: '🙁' },
  3: { text: 'Cukup Puas', color: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40', emoji: '😐' },
  4: { text: 'Puas & Senang', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40', emoji: '😊' },
  5: { text: 'Sangat Puas & Luar Biasa', color: 'text-teal-300 bg-teal-950/60 border-teal-500/40', emoji: '🤩' },
};

export const FormIkm: React.FC<FormIkmProps> = ({ onSubmit, onBackToHome }) => {
  const [namaWajibPajak, setNamaWajibPajak] = useState('');
  const [alamat, setAlamat] = useState('');
  const [bidangUsaha, setBidangUsaha] = useState('');
  const [nomorKontak, setNomorKontak] = useState('');

  const [ratings, setRatings] = useState({
    kemudahan: 5,
    kecepatan: 5,
    kesopanan: 5,
    transparansi: 5,
    sarana: 5,
  });

  const [saranMasukan, setSaranMasukan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEntry, setSuccessEntry] = useState<IkmEntry | null>(null);

  const totalScore = ratings.kemudahan + ratings.kecepatan + ratings.kesopanan + ratings.transparansi + ratings.sarana;
  const avgScore = totalScore / 5;
  const nilaiKonversi = Math.round(avgScore * 20);

  let mutu: IkmEntry['kategoriMutu'] = 'A (Sangat Baik)';
  if (nilaiKonversi < 65) mutu = 'D (Tidak Baik)';
  else if (nilaiKonversi < 76.6) mutu = 'C (Kurang Baik)';
  else if (nilaiKonversi < 88.3) mutu = 'B (Baik)';
  else mutu = 'A (Sangat Baik)';

  const handleRatingChange = (key: QuestionDef['key'], val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const isFormValid = namaWajibPajak.trim().length >= 3 && alamat.trim().length >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('Mohon isi nama lengkap dan alamat Anda.');
      return;
    }

    setIsSubmitting(true);
    const newId = `IKM-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newEntry: IkmEntry = {
      id: newId,
      tanggal: new Date().toISOString().split('T')[0],
      namaWajibPajak: namaWajibPajak.trim(),
      alamat: alamat.trim(),
      bidangUsaha: bidangUsaha.trim() || 'Wajib Pajak Daerah',
      nomorKontak: nomorKontak.trim() || undefined,
      skorKemudahan: ratings.kemudahan,
      skorKecepatan: ratings.kecepatan,
      skorKesopanan: ratings.kesopanan,
      skorTransparansi: ratings.transparansi,
      skorSarana: ratings.sarana,
      skorRataRata: parseFloat(avgScore.toFixed(2)),
      nilaiKonversi,
      kategoriMutu: mutu,
      saranMasukan: saranMasukan.trim() || 'Pelayanan sudah sangat baik dan transparan.',
      createdAt: new Date().toISOString(),
      syncedToGoogleSheets: true,
    };

    setTimeout(() => {
      onSubmit(newEntry);
      setIsSubmitting(false);
      setSuccessEntry(newEntry);
      triggerStarConfetti();
    }, 500);
  };

  const handleReset = () => {
    setNamaWajibPajak('');
    setAlamat('');
    setBidangUsaha('');
    setNomorKontak('');
    setRatings({
      kemudahan: 5,
      kecepatan: 5,
      kesopanan: 5,
      transparansi: 5,
      sarana: 5,
    });
    setSaranMasukan('');
    setSuccessEntry(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Form */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Survei Kepuasan Resmi 03
              </span>
              <span className="text-xs text-slate-400">Permenpan-RB No. 14 Tahun 2017</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Survei Indeks Kepuasan Masyarakat (IKM)
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bantu kami meningkatkan mutu pelayanan perpajakan daerah. Berikan penilaian Anda dalam skala 1 sampai 5 serta sampaikan masukan, kritik membangun, atau saran langsung kepada manajemen BP2RD.
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
            className="mb-8 bg-gradient-to-r from-amber-950/90 to-yellow-950/90 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 text-white shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <motion.div 
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20"
              >
                <Award className="w-8 h-8" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/30 text-amber-300">
                    Survei Tersimpan
                  </span>
                  <span className="text-xs text-amber-200/80">Kode Responden:</span>
                  <strong className="text-xs text-amber-100 font-mono bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-500/40">
                    {successEntry.id}
                  </strong>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  Terima Kasih Atas Partisipasi Anda, {successEntry.namaWajibPajak}!
                </h3>
                <p className="text-xs text-amber-200/90 mt-1.5 leading-relaxed">
                  Penilaian Anda telah memberikan kontribusi penting bagi perbaikan mutu layanan kami. Skor kepuasan Anda: <strong className="text-white font-black">{successEntry.nilaiKonversi} ({successEntry.kategoriMutu})</strong>.
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-amber-900/40 border border-amber-500/30 text-xs text-amber-100 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets: Data otomatis disinkronkan ke sheet <strong>Survei_IKM</strong></span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all"
                  >
                    Isi Survei Lainnya
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
        {/* Identitas Responden */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/30">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Identitas Responden Wajib Pajak</h2>
              <p className="text-xs text-slate-400">Data sukarela untuk verifikasi objektivitas responden</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap Wajib Pajak <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nama Anda atau penanggung jawab usaha"
                value={namaWajibPajak}
                onChange={(e) => setNamaWajibPajak(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat / Domisili / Lokasi Usaha <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Alamat domisili atau tempat usaha"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bidang Usaha / Kategori Layanan
              </label>
              <input
                type="text"
                placeholder="Contoh: Kuliner Restoran, Hotel, Wajib Pajak PBB, dll."
                value={bidangUsaha}
                onChange={(e) => setBidangUsaha(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Kontak / WhatsApp (Opsional)
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={nomorKontak}
                onChange={(e) => setNomorKontak(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* 5 Unsur Penilaian Skala 1 - 5 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/30">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Penilaian Kepuasan Layanan (Skala 1 - 5)</h2>
                <p className="text-xs text-slate-400">Pilih bintang 1 (Sangat Tidak Puas) sampai 5 (Sangat Puas)</p>
              </div>
            </div>

            {/* Live Indicator Score with Animated Pulse */}
            <motion.div 
              key={nilaiKonversi}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700 self-start sm:self-auto"
            >
              <span className="text-xs text-slate-400">Nilai IKM:</span>
              <span className="text-lg font-black text-amber-400">{nilaiKonversi}</span>
              <span className="text-xs font-bold text-emerald-400">({mutu})</span>
            </motion.div>
          </div>

          <div className="space-y-6">
            {QUESTIONS.map((q) => {
              const currentRating = ratings[q.key];
              return (
                <div
                  key={q.key}
                  className="bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{q.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{q.description}</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {/* Interactive Bouncing Stars */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <motion.button
                            type="button"
                            key={starVal}
                            whileHover={{ scale: 1.3, rotate: 10 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleRatingChange(q.key, starVal)}
                            className={`p-1.5 rounded-lg focus:outline-none transition-colors ${
                              starVal <= currentRating
                                ? 'text-amber-400'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                starVal <= currentRating ? 'fill-amber-400 text-amber-400' : 'fill-transparent'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>

                      {/* Animated Badge with Emoji */}
                      <motion.div
                        key={currentRating}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          SKALA_LABELS[currentRating].color
                        }`}
                      >
                        <span className="text-base">{SKALA_LABELS[currentRating].emoji}</span>
                        <span>Skor {currentRating}: {SKALA_LABELS[currentRating].text}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Kolom Saran atau Masukan Wajib Pajak */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-black text-sm border border-teal-500/30">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kolom Saran & Masukan Wajib Pajak</h2>
              <p className="text-xs text-slate-400">Aspirasi Anda dibaca langsung oleh pimpinan untuk perbaikan berkelanjutan</p>
            </div>
          </div>

          <div>
            <textarea
              rows={4}
              placeholder="Tuliskan saran, kritik, atau usulan perbaikan layanan pajak daerah di sini..."
              value={saranMasukan}
              onChange={(e) => setSaranMasukan(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <MessageSquareHeart className="w-4 h-4 text-pink-400" />
              <span>Setiap masukan sangat berharga bagi transparansi dan pelayanan prima BP2RD.</span>
            </p>
          </div>

          {/* Submit Action */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Tersimpan & tersinkronisasi ke Google Sheets (Tab: Survei_IKM)</span>
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
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-xl shadow-amber-600/30 border border-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim Survei IKM</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};
