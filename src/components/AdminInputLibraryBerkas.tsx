import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Save, 
  ArrowLeft, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Clock,
  Calendar,
  RefreshCw,
  Database
} from 'lucide-react';
import { LibraryBerkasEntry, LibraryCategory, AppUser } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { formatWaktuPenginputan } from '../services/firebase';

interface AdminInputLibraryBerkasProps {
  currentUser: AppUser | null;
  onSave: (entry: LibraryBerkasEntry) => Promise<boolean | void> | void;
  onCancel: () => void;
}

export const AdminInputLibraryBerkas: React.FC<AdminInputLibraryBerkasProps> = ({
  currentUser,
  onSave,
  onCancel,
}) => {
  const initialTime = formatWaktuPenginputan();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LibraryCategory>('regulasi');
  const [nomorBerkas, setNomorBerkas] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.8 MB');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'image' | 'xlsx' | 'zip'>('pdf');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [tanggalUpload, setTanggalUpload] = useState<string>(initialTime.tanggalUpload);
  const [jamUpload, setJamUpload] = useState<string>(initialTime.jamUpload);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Otomatis tentukan sifat akses:
  // regulasi, sop, blanko -> isPublic: true
  // dpa, objek, pbb -> isPublic: false (Internal)
  const isPublicCategory = ['regulasi', 'sop', 'blanko'].includes(category);

  const getCategoryLabel = (cat: LibraryCategory) => {
    switch (cat) {
      case 'regulasi': return 'Perda dan Regulasi';
      case 'sop': return 'SOP & Juknis';
      case 'blanko': return 'Formulir Blanko';
      case 'dpa': return 'DPA / ARKAS Internal';
      case 'objek': return 'Foto Objek Pajak';
      case 'pbb': return 'Struk Bayar PBB-P2';
      default: return cat;
    }
  };

  const refreshTimestampNow = () => {
    const nowMeta = formatWaktuPenginputan();
    setTanggalUpload(nowMeta.tanggalUpload);
    setJamUpload(nowMeta.jamUpload);
  };

  const detectFileTypeFromName = (name: string): 'pdf' | 'doc' | 'image' | 'xlsx' | 'zip' => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xlsx';
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'doc';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'zip';
    return category === 'objek' ? 'image' : category === 'dpa' ? 'xlsx' : 'pdf';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);
    setFileName(file.name);

    // Format file size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024
      ? `${(sizeInKb / 1024).toFixed(2)} MB`
      : `${Math.max(1, Math.round(sizeInKb))} KB`;
    setFileSize(formattedSize);

    const detectedType = detectFileTypeFromName(file.name);
    setFileType(detectedType);

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
      if (cleanTitle) {
        setTitle(cleanTitle);
      }
    }

    // Update waktu penginputan saat berkas dipilih
    refreshTimestampNow();

    setIsReadingFile(true);
    try {
      if (detectedType === 'image' || file.type.startsWith('image/')) {
        const compressed = await compressImageFile(file, 1000, 0.75);
        setFileUrl(compressed.dataUrl);
        setFileSize(compressed.fileSizeStr);
        setIsReadingFile(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileUrl((event.target?.result as string) || '');
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('File upload read fallback:', err);
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isReadingFile) {
      setFormError('Mohon tunggu sebentar, sistem sedang memproses pembacaan file yang diunggah...');
      return;
    }

    // Derive title automatically if user only filled fileName or nomorBerkas
    const derivedTitleFromFile = fileName.trim()
      ? fileName.trim().replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
      : '';
    const finalTitle = title.trim() || derivedTitleFromFile || nomorBerkas.trim() || `${getCategoryLabel(category)} BP2RD HSU`;

    if (!title.trim() && !fileName.trim() && !nomorBerkas.trim() && !description.trim()) {
      setFormError('Mohon isi minimal Judul Dokumen, Nama File, atau Upload File terlebih dahulu.');
      return;
    }

    const finalNomorBerkas = nomorBerkas.trim() || `DOC-HSU/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
    const finalFileName = fileName.trim() || `${finalTitle.replace(/\s+/g, '_').slice(0, 40)}.pdf`;
    const finalFileType = fileName.trim() ? detectFileTypeFromName(finalFileName) : fileType;
    const finalDescription = description.trim() || `Dokumen resmi ${getCategoryLabel(category)}: ${finalTitle} (${finalNomorBerkas}) — Repositori Digital BP2RD Kabupaten Hulu Sungai Utara.`;

    const nowMeta = formatWaktuPenginputan();
    const finalTanggal = tanggalUpload || nowMeta.tanggalUpload;
    const finalJam = jamUpload || nowMeta.jamUpload;
    const finalWaktuPenginputan = `${finalTanggal} ${finalJam}`;

    const tags = tagsInput.trim()
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [getCategoryLabel(category), 'BP2RD HSU', String(new Date().getFullYear())];

    const newEntry: LibraryBerkasEntry = {
      id: `lib-${Date.now()}`,
      title: finalTitle,
      category,
      categoryLabel: getCategoryLabel(category),
      nomorBerkas: finalNomorBerkas,
      description: finalDescription,
      fileName: finalFileName,
      fileSize: fileSize || '1.8 MB',
      fileType: finalFileType,
      fileUrl: fileUrl || undefined,
      isPublic: isPublicCategory,
      uploadedBy: currentUser?.name || 'Administrator BP2RD HSU',
      uploadedRole: currentUser?.role || 'admin',
      tanggalUpload: finalTanggal,
      jamUpload: finalJam,
      waktuPenginputan: finalWaktuPenginputan,
      statusVerifikasi: 'Aktif',
      tags,
      createdAt: nowMeta.isoString,
      updatedAt: nowMeta.isoString,
    };

    setIsSaving(true);
    try {
      await onSave(newEntry);
    } catch (err: any) {
      console.error('Error saving library entry:', err);
      setFormError(err?.message || 'Gagal menyimpan berkas ke database Firebase. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">
              Tambah Berkas Digital Baru
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Registrasi dokumen regulasi publik atau arsip internal langsung ke Database Firebase Firestore BP2RD HSU.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Database className="w-3.5 h-3.5" />
          <span>Firebase Live Sync</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-500/20 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          
          {/* Category Choice */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Kategori Dokumen Berkas <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'regulasi', label: 'Perda & Regulasi', public: true },
                { id: 'sop', label: 'SOP & Juknis', public: true },
                { id: 'blanko', label: 'Formulir Blanko', public: true },
                { id: 'dpa', label: 'DPA / ARKAS', public: false },
                { id: 'objek', label: 'Foto Objek Pajak', public: false },
                { id: 'pbb', label: 'Struk Bayar PBB', public: false },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as LibraryCategory)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between ${
                    category === c.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-white block mb-1">{c.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded w-fit ${
                    c.public 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {c.public ? 'Publik / Landing Page' : 'Internal (Admin & User)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Banner */}
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            isPublicCategory 
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
              : 'bg-amber-950/30 border-amber-800 text-amber-300'
          }`}>
            {isPublicCategory ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
            <span>
              {isPublicCategory 
                ? 'Kategori ini otomatis ditampilkan di Landing Page publik untuk umum.' 
                : 'Kategori ini diproteksi khusus dan hanya tampil untuk Admin dan Petugas Lapangan terverifikasi.'}
            </span>
          </div>

          {/* Waktu Penginputan (Tanggal & Jam Registrasi ke Firebase) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Waktu Penginputan Berkas (Tersimpan ke Database Firebase)</span>
              </label>
              <button
                type="button"
                onClick={refreshTimestampNow}
                className="text-[11px] font-semibold text-teal-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 cursor-pointer"
                title="Perbarui ke waktu saat ini"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Waktu Sekarang</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>Tanggal Penginputan</span>
                </span>
                <input
                  type="date"
                  value={tanggalUpload}
                  onChange={(e) => setTanggalUpload(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Jam / Waktu Penginputan</span>
                </span>
                <input
                  type="text"
                  value={jamUpload}
                  onChange={(e) => setJamUpload(e.target.value)}
                  placeholder="Contoh: 14:30:00 WITA"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Judul Lengkap Dokumen / Berkas <span className="text-emerald-400 text-[10px] font-normal">(Otomatis terisi dari nama file jika dikosongkan)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Peraturan Bupati HSU tentang Penyesuaian Nilai Jual Objek Pajak 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nomor Register / Dokumen Resmi
              </label>
              <input
                type="text"
                value={nomorBerkas}
                onChange={(e) => setNomorBerkas(e.target.value)}
                placeholder="PERBUP-HSU/09/2026 atau DPA/A.1/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama File Fisik / Digital
                </label>
                {fileUrl ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terunggah ({fileSize})</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Bisa ketik nama atau upload file
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.zip,.rar,.7z"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Input Group: Text Field + Upload File Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFileName(val);
                      if (val.trim()) {
                        setFileType(detectFileTypeFromName(val));
                      }
                    }}
                    placeholder="Perbup_HSU_NJOP_2026.pdf"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                  {fileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setFileName('');
                        setFileUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs cursor-pointer"
                      title="Reset / Kosongkan Nama File"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReadingFile}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-md shadow-emerald-950/40"
                  title="Upload / Unggah File dari Komputer atau HP"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isReadingFile ? 'Memproses...' : 'Upload File'}</span>
                </button>
              </div>

              {/* File Info Box if file uploaded */}
              {fileUrl ? (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                      {fileType === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5" />
                      ) : fileType === 'xlsx' ? (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-white block truncate text-[11px]">{fileName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Ukuran: {fileSize} &bull; Tipe: {fileType.toUpperCase()} &bull; Siap Disimpan ke Firebase
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-emerald-300 hover:text-white font-semibold underline ml-2 shrink-0 cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1">
                  Format didukung: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Gambar (JPG/PNG), atau ZIP.
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Deskripsi &amp; Ringkasan Isi Dokumen <span className="text-slate-500 text-[10px] font-normal">(Opsional — otomatis diisi jika kosong)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan pokok isi dokumen, pasal penting, atau objek yang dilampirkan..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Label / Tags Pencarian (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Perda, PDRD, Amuntai, PBB-P2, 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSaving || isReadingFile}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Menyimpan ke Database Firebase...' : 'Simpan Berkas ke Library'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
