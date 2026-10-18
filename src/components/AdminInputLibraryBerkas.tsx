import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  Upload, 
  Save, 
  ArrowLeft, 
  BookOpen, 
  FileCheck, 
  FileText, 
  FileSpreadsheet, 
  Receipt, 
  Image as ImageIcon, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { LibraryBerkasEntry, LibraryCategory, AppUser } from '../types';

interface AdminInputLibraryBerkasProps {
  currentUser: AppUser | null;
  onSave: (entry: LibraryBerkasEntry) => void;
  onCancel: () => void;
}

export const AdminInputLibraryBerkas: React.FC<AdminInputLibraryBerkasProps> = ({
  currentUser,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LibraryCategory>('regulasi');
  const [nomorBerkas, setNomorBerkas] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'image' | 'xlsx' | 'zip'>('pdf');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Format file size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024
      ? `${(sizeInKb / 1024).toFixed(1)} MB`
      : `${Math.round(sizeInKb)} KB`;
    setFileSize(formattedSize);

    // Detect file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let detectedType: 'pdf' | 'doc' | 'image' | 'xlsx' | 'zip' = 'pdf';
    if (ext === 'pdf') {
      detectedType = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
      detectedType = 'image';
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      detectedType = 'xlsx';
    } else if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
      detectedType = 'doc';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      detectedType = 'zip';
    }
    setFileType(detectedType);

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanTitle);
    }

    // Read as Data URL
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileUrl((event.target?.result as string) || '');
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      alert('Mohon isi judul dan ringkasan berkas');
      return;
    }

    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [getCategoryLabel(category), 'BP2RD HSU'];

    const newEntry: LibraryBerkasEntry = {
      id: `lib-${Date.now()}`,
      title,
      category,
      categoryLabel: getCategoryLabel(category),
      nomorBerkas: nomorBerkas || `DOC-HSU/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      description,
      fileName: fileName || `${title.replace(/\s+/g, '_').slice(0, 30)}.pdf`,
      fileSize: fileSize || '1.8 MB',
      fileType: fileType || (category === 'objek' ? 'image' : category === 'dpa' ? 'xlsx' : 'pdf'),
      fileUrl: fileUrl || undefined,
      isPublic: isPublicCategory,
      uploadedBy: currentUser?.name || 'Administrator BP2RD HSU',
      uploadedRole: currentUser?.role || 'admin',
      tanggalUpload: new Date().toISOString().split('T')[0],
      statusVerifikasi: 'Aktif',
      tags,
    };

    onSave(newEntry);
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
              Registrasi dokumen regulasi publik atau arsip internal ke Library Berkas BAPENDA Kabupaten Hulu Sungai Utara.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Admin Portal
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        
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

          {/* Title & Number */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Judul Lengkap Dokumen / Berkas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
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
                    onChange={(e) => setFileName(e.target.value)}
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
                        Ukuran: {fileSize} &bull; Tipe: {fileType.toUpperCase()}
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
              Deskripsi &amp; Ringkasan Isi Dokumen <span className="text-red-400">*</span>
            </label>
            <textarea
              required
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
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Berkas ke Library</span>
          </button>
        </div>

      </form>

    </div>
  );
};
