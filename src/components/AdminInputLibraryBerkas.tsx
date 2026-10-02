import React, { useState } from 'react';
import { 
  FolderArchive, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Tag, 
  Lock, 
  Globe, 
  Search, 
  RefreshCw,
  PlusCircle,
  FileCheck,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LibraryBerkasEntry, AppUser } from '../types';
import { triggerSuccessConfetti } from '../utils/confetti';
import { syncLibraryEntryToFirestore, deleteLibraryEntryFromFirestore } from '../services/firebase';

interface AdminInputLibraryBerkasProps {
  currentUser: AppUser | null;
  libraryList: LibraryBerkasEntry[];
  onSaveEntry: (entry: LibraryBerkasEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenPreview?: (item: LibraryBerkasEntry) => void;
}

export const AdminInputLibraryBerkas: React.FC<AdminInputLibraryBerkasProps> = ({
  currentUser,
  libraryList,
  onSaveEntry,
  onDeleteEntry,
  onOpenPreview,
}) => {
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LibraryBerkasEntry['category']>('regulasi');
  const [nomorSurat, setNomorSurat] = useState('');
  const [authorOrWp, setAuthorOrWp] = useState(
    currentUser ? `${currentUser.nama} (${currentUser.unitKerja || 'BP2RD'})` : 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)'
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Berlaku Efektif');
  const [description, setDescription] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);

  // Tags State
  const [tags, setTags] = useState<string[]>(['BP2RD', 'Pajak Daerah']);
  const [tagInput, setTagInput] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<LibraryBerkasEntry | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategoryFilter, setTableCategoryFilter] = useState('all');

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string,
      });

      // Auto-populate title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Quick Preset Categories
  const categoryOptions: {
    value: LibraryBerkasEntry['category'];
    label: string;
    icon: any;
    color: string;
    defaultStatus: string;
  }[] = [
    { value: 'regulasi', label: 'Regulasi & Peraturan Daerah (Perda/Perwal)', icon: BookOpen, color: 'text-emerald-400', defaultStatus: 'Berlaku Efektif' },
    { value: 'sop', label: 'Petunjuk Teknis (Juknis) & SOP Petugas', icon: FileCheck, color: 'text-blue-400', defaultStatus: 'SOP Resmi' },
    { value: 'blanko', label: 'Formulir Blangko & Template Permohonan', icon: FileText, color: 'text-amber-400', defaultStatus: 'Format Standar' },
    { value: 'dpa', label: 'Dokumen DPA / ARKAS Anggaran Belanja', icon: FileSpreadsheet, color: 'text-indigo-400', defaultStatus: 'Pedoman Verifikasi' },
    { value: 'objek', label: 'Dokumentasi Foto Fisik Objek Potensi', icon: ImageIcon, color: 'text-teal-400', defaultStatus: 'Tervalidasi' },
    { value: 'pbb', label: 'Tanda Terima & Bukti Bayar PBB-P2', icon: Building2, color: 'text-rose-400', defaultStatus: 'Lunas & Sah' },
  ];

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitFeedback('Judul berkas tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    // Format size string
    let sizeStr = '1.2 MB';
    let fileType = 'PDF Document';
    if (uploadedFile) {
      const kb = uploadedFile.size / 1024;
      sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
      fileType = uploadedFile.type.includes('image')
        ? 'Foto Gambar'
        : uploadedFile.type.includes('sheet') || uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.csv')
        ? 'Tabel Spreadsheet'
        : uploadedFile.type.includes('word') || uploadedFile.name.endsWith('.docx')
        ? 'Dokumen Word'
        : 'PDF Document';
    } else if (driveUrl) {
      sizeStr = 'Google Drive Cloud';
      fileType = 'Cloud Document';
    }

    const newId = `LIB-${Date.now()}`;
    const newEntry: LibraryBerkasEntry = {
      id: newId,
      title: title.trim(),
      category,
      nomorSurat: nomorSurat.trim() || undefined,
      fileType,
      sizeStr,
      date,
      authorOrWp: authorOrWp.trim() || 'BP2RD',
      status,
      statusColor: category === 'regulasi' 
        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
        : category === 'sop'
        ? 'bg-blue-950 text-blue-300 border-blue-500/30'
        : category === 'blanko'
        ? 'bg-amber-950 text-amber-300 border-amber-500/30'
        : 'bg-indigo-950 text-indigo-300 border-indigo-500/30',
      description: description.trim() || `Berkas kategori ${category} tersimpan dalam basis data library perpajakan BP2RD.`,
      previewUrl: uploadedFile?.dataUrl || (driveUrl ? 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80' : undefined),
      fileData: uploadedFile?.dataUrl,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      uploadedBy: currentUser ? `${currentUser.nama} (${currentUser.role})` : 'Administrator BP2RD',
      driveUrl: driveUrl.trim() || undefined,
      isPublic,
      tags: tags.length ? tags : ['BP2RD'],
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save to local storage state
      onSaveEntry(newEntry);

      // 2. Sync to Firebase Firestore collection: library_berkas
      await syncLibraryEntryToFirestore(newEntry);

      // Trigger Confetti Celebration
      triggerSuccessConfetti();

      setSubmitFeedback(`Berkas "${newEntry.title}" berhasil diinput dan disinkronkan ke Firebase Firestore!`);

      // Reset form
      setTitle('');
      setNomorSurat('');
      setDescription('');
      setDriveUrl('');
      setUploadedFile(null);
    } catch (err: any) {
      console.error('Error saving library berkas:', err);
      setSubmitFeedback('Tersimpan di sistem lokal, sinkronisasi Firestore membutuhkan izin otentikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (item: LibraryBerkasEntry) => {
    if (confirm(`Yakin ingin menghapus berkas "${item.title}"?`)) {
      onDeleteEntry(item.id);
      await deleteLibraryEntryFromFirestore(item.id);
    }
  };

  // Filter Table Items
  const filteredLibrary = libraryList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.nomorSurat && item.nomorSurat.toLowerCase().includes(tableSearch.toLowerCase())) ||
      item.authorOrWp.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(tableSearch.toLowerCase())));

    const matchesCategory = tableCategoryFilter === 'all' || item.category === tableCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Menu Khusus Admin &amp; Petugas BP2RD</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Firestore: library_berkas</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FolderArchive className="w-8 h-8 text-blue-400" />
              <span>Input Berkas &amp; Dokumen Perpustakaan</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Unggah Peraturan Daerah (Perda), Standar Operasional Prosedur (SOP), Formulir Blanko SPOP, Dokumen Anggaran DPA/ARKAS, maupun Dokumentasi Foto Lapangan ke dalam sistem terpadu.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400">Total Berkas Tersimpan</p>
              <p className="text-2xl font-black text-white">{libraryList.length} Berkas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Form on Left/Top, Quick Rules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Formulir Input Berkas Baru</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">ID Otomatis: LIB-{Date.now().toString().slice(-6)}</span>
            </div>

            {submitFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                  submitFeedback.includes('berhasil')
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}
              >
                {submitFeedback.includes('berhasil') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{submitFeedback}</span>
              </motion.div>
            )}

            {/* Judul Berkas */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Judul Berkas / Dokumen Resmi <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Peraturan Daerah No. 2 Tahun 2026 tentang Pajak Barang dan Jasa Tertentu (PBJT)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 transition-all"
              />
            </div>

            {/* Kategori Berkas Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Kategori Berkas <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoryOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCategory(opt.value);
                        setStatus(opt.defaultStatus);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{opt.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Status Bawaan: {opt.defaultStatus}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nomor Surat & Tanggal & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Surat / Regulasi (Opsional)
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Contoh: Perda No. 01/2026"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Dokumen <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status Legalitas Berkas
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Berlaku Efektif">Berlaku Efektif</option>
                  <option value="SOP Resmi">SOP Resmi</option>
                  <option value="Format Standar">Format Standar</option>
                  <option value="Pedoman Verifikasi">Pedoman Verifikasi</option>
                  <option value="Tervalidasi">Tervalidasi</option>
                  <option value="Lunas & Sah">Lunas &amp; Sah</option>
                  <option value="Draft Pengkajian">Draft Pengkajian</option>
                </select>
              </div>
            </div>

            {/* Instansi Penerbit / Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instansi Penerbit / Pengunggah <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={authorOrWp}
                onChange={(e) => setAuthorOrWp(e.target.value)}
                placeholder="Contoh: Bidang Pendataan & Penetapan BP2RD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Unggah File Berkas Fisik (PDF / Excel / Word / Gambar)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-5 text-center transition-all bg-slate-800/40 relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploadedFile ? (
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-blue-500/40 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {uploadedFile.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-xs">{uploadedFile.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(uploadedFile.size / 1024).toFixed(0)} KB • Siap Diunggah
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/40 rounded-lg border border-rose-500/30"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Klik untuk memilih berkas atau seret file ke sini
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Mendukung PDF, Word (.docx), Excel (.xlsx), atau Gambar (.jpg, .png)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alternatif Tautan Google Drive */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Atau Masukkan Tautan Berkas Google Drive / Cloud URL</span>
                <span className="text-[10px] text-slate-400">Opsional</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... atau https://docs.google.com/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Deskripsi & Ringkasan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deskripsi &amp; Ringkasan Ruang Lingkup Dokumen
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan ringkasan materi, pasal penting, atau kegunaan berkas ini dalam proses administrasi pajak daerah..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            {/* Tags & Hak Akses Publik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tag / Label Pencarian
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Tambah tag (tekan Enter)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-blue-400" />
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-400 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hak Akses Dokumen
                </label>
                <div className="flex items-center gap-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                      isPublic ? 'bg-emerald-600/30 text-emerald-400' : 'bg-amber-600/30 text-amber-400'
                    }`}
                  >
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">
                      {isPublic ? 'Publik (Wajib Pajak & Petugas)' : 'Internal Khusus Petugas BP2RD'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isPublic ? 'Dapat dilihat dan diunduh di halaman Beranda Library' : 'Hanya tampak pada portal admin'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setNomorSurat('');
                  setDescription('');
                  setUploadedFile(null);
                  setDriveUrl('');
                  setSubmitFeedback(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Reset Isian
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>Simpan ke Library &amp; Firestore</span>
              </motion.button>
            </div>
          </form>
        </div>

        {/* Right Column: SOP & Rules Guide */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-blue-400">
              <BookOpen className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Panduan Pengarsipan Dokumen</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Setiap berkas yang diinput akan secara otomatis diindeks pada repositori perpajakan daerah dan disinkronkan ke koleksi Cloud Firestore:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>1. Regulasi &amp; Perda</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cantumkan nomor lembaran daerah dan tahun penetapan agar valid sebagai rujukan keberatan wajib pajak.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>2. Petunjuk Teknis SOP</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan sebagai panduan uji petik omzet restoran, reklame, dan validasi fisik di lapangan oleh petugas survey.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>3. Blanko Permohonan</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Wajib Pajak dapat langsung mengunduh formulir resmi format standar tanpa harus datang ke kantor pelayanan.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>4. DPA / ARKAS Anggaran</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lampiran belanja modal dan pembiayaan dinas/sekolah yang memiliki potensi potongan pajak daerah.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Koneksi Database Aktif</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Koleksi Firestore</span>
                <span className="font-mono font-bold text-blue-300">library_berkas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Mode Sinkronisasi</span>
                <span className="text-emerald-400 font-semibold">Otomatis 2-Arah</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Format Preview</span>
                <span className="text-slate-200">PDF, Citra, Dokumen</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Dukungan Drive</span>
                <span className="text-blue-400 font-semibold">Tautan Langsung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5">
              <FolderArchive className="w-5 h-5 text-blue-400" />
              <span>Daftar Berkas Perpustakaan Terinput</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola seluruh dokumen yang telah dimasukkan ke repositori perpustakaan SIPOTENSI
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Cari berkas / nomor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            <select
              value={tableCategoryFilter}
              onChange={(e) => setTableCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="regulasi">Regulasi &amp; Perda</option>
              <option value="sop">SOP &amp; Juknis</option>
              <option value="blanko">Formulir Blanko</option>
              <option value="dpa">DPA / ARKAS</option>
              <option value="objek">Foto Objek</option>
              <option value="pbb">PBB-P2</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/40">
                <th className="py-3 px-4">Judul Berkas &amp; Nomor</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Ukuran &amp; Tipe</th>
                <th className="py-3 px-4">Instansi / Petugas</th>
                <th className="py-3 px-4">Status &amp; Akses</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLibrary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada berkas yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredLibrary.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-white text-xs">{item.title}</p>
                      {item.nomorSurat && (
                        <p className="text-[10px] text-blue-300 font-mono mt-0.5">{item.nomorSurat}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.category === 'regulasi'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : item.category === 'sop'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          : item.category === 'blanko'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : item.category === 'dpa'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                          : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                      }`}>
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{item.fileType}</p>
                      <p className="text-[10px] text-slate-400">{item.sizeStr}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 truncate max-w-[160px]">{item.authorOrWp}</p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.status}
                        </span>
                        <div>
                          {item.isPublic ? (
                            <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <Globe className="w-3 h-3" /> Publik
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-400 flex items-center gap-1 font-semibold">
                              <Lock className="w-3 h-3" /> Internal
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenPreview) onOpenPreview(item);
                            else setPreviewModalItem(item);
                          }}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all"
                          title="Lihat Pratinjau Berkas"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.driveUrl && (
                          <a
                            href={item.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all"
                          title="Hapus Berkas dari Sistem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Preview Modal */}
      <AnimatePresence>
        {previewModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-md">{previewModalItem.title}</h3>
                    <p className="text-[10px] text-slate-400">{previewModalItem.nomorSurat || 'Dokumen Resmi BP2RD'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewModalItem(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              {previewModalItem.previewUrl ? (
                <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img
                    src={previewModalItem.previewUrl}
                    alt={previewModalItem.title}
                    className="object-contain max-h-72 w-full"
                  />
                </div>
              ) : (
                <div className="py-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto opacity-70" />
                  <p className="text-xs text-slate-300 font-bold">{previewModalItem.fileType}</p>
                  <p className="text-[10px] text-slate-400">{previewModalItem.sizeStr}</p>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed">{previewModalItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400">Penerbit: </span>
                    <span className="text-white font-medium">{previewModalItem.authorOrWp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="text-emerald-400 font-semibold">{previewModalItem.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                {previewModalItem.driveUrl && (
                  <a
                    href={previewModalItem.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Google Drive</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
