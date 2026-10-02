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
  Building2,
  ShieldCheck,
  Clock,
  XCircle,
  Edit3,
  HelpCircle,
  Check
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
  onUpdateStatus?: (
    id: string,
    statusVerifikasi: LibraryBerkasEntry['statusVerifikasi'],
    catatan?: string,
    verifiedBy?: string
  ) => void;
  onOpenPreview?: (item: LibraryBerkasEntry) => void;
  onOpenLogin?: () => void;
}

export const AdminInputLibraryBerkas: React.FC<AdminInputLibraryBerkasProps> = ({
  currentUser,
  libraryList,
  onSaveEntry,
  onDeleteEntry,
  onUpdateStatus,
  onOpenPreview,
  onOpenLogin,
}) => {
  const isAdmin = currentUser?.role === 'admin';

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
  const [statusVerifikasiInput, setStatusVerifikasiInput] = useState<LibraryBerkasEntry['statusVerifikasi']>(
    currentUser?.role === 'admin' ? 'Terverifikasi & Sah' : 'Menunggu Verifikasi'
  );
  const [catatanVerifikasiInput, setCatatanVerifikasiInput] = useState('');
  
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
  const [tableVerifikasiFilter, setTableVerifikasiFilter] = useState('all');

  // Verification Modal State
  const [verifModalItem, setVerifModalItem] = useState<LibraryBerkasEntry | null>(null);
  const [verifStatusChoice, setVerifStatusChoice] = useState<LibraryBerkasEntry['statusVerifikasi']>('Terverifikasi & Sah');
  const [verifCatatanText, setVerifCatatanText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalItem, setDeleteModalItem] = useState<LibraryBerkasEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Submit New Entry Handler
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
    const verifierName = currentUser ? `${currentUser.nama} (${currentUser.role === 'admin' ? 'Administrator' : 'Petugas'})` : 'Admin BP2RD';
    
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
      statusVerifikasi: statusVerifikasiInput,
      catatanVerifikasi: catatanVerifikasiInput.trim() || (statusVerifikasiInput === 'Terverifikasi & Sah' ? 'Telah diverifikasi dan disahkan oleh administrator.' : 'Menunggu telaah verifikator.'),
      verifiedBy: statusVerifikasiInput === 'Terverifikasi & Sah' ? verifierName : undefined,
      verifiedAt: statusVerifikasiInput === 'Terverifikasi & Sah' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save to local storage state
      onSaveEntry(newEntry);

      // 2. Sync to Firebase Firestore collection: library_berkas
      await syncLibraryEntryToFirestore(newEntry);

      // Trigger Confetti Celebration
      triggerSuccessConfetti();

      setSubmitFeedback(`Berkas "${newEntry.title}" berhasil diinput dan disinkronkan ke Firebase Firestore! Status: ${newEntry.statusVerifikasi}`);

      // Reset form
      setTitle('');
      setNomorSurat('');
      setDescription('');
      setDriveUrl('');
      setCatatanVerifikasiInput('');
      setUploadedFile(null);
    } catch (err: any) {
      console.error('Error saving library berkas:', err);
      setSubmitFeedback('Tersimpan di sistem lokal, sinkronisasi Firestore membutuhkan izin otentikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Verification Modal for an Item
  const handleOpenVerifModal = (item: LibraryBerkasEntry) => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Menu aksi ubah status verifikasi hanya dapat dilakukan oleh Administrator BP2RD.');
      return;
    }
    setVerifModalItem(item);
    setVerifStatusChoice(item.statusVerifikasi || 'Terverifikasi & Sah');
    setVerifCatatanText(item.catatanVerifikasi || '');
  };

  // Submit Verification Result
  const handleConfirmVerification = async () => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator BP2RD yang berwenang mengubah status verifikasi berkas.');
      return;
    }
    if (!verifModalItem) return;
    setIsVerifying(true);

    const verifierName = currentUser 
      ? `${currentUser.nama} (${currentUser.role === 'admin' ? 'Administrator BP2RD' : 'Petugas Lapangan'})` 
      : 'Rija (Administrator BP2RD)';

    const updatedItem: LibraryBerkasEntry = {
      ...verifModalItem,
      statusVerifikasi: verifStatusChoice,
      catatanVerifikasi: verifCatatanText.trim() || (verifStatusChoice === 'Terverifikasi & Sah' ? 'Telah diverifikasi dan disahkan oleh Administrator.' : 'Memerlukan perbaikan berkas.'),
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
    };

    try {
      // 1. Update in local storage state
      if (onUpdateStatus) {
        onUpdateStatus(verifModalItem.id, verifStatusChoice, updatedItem.catatanVerifikasi, verifierName);
      } else {
        onSaveEntry(updatedItem);
      }

      // 2. Sync updated verification status to Firestore
      await syncLibraryEntryToFirestore(updatedItem);

      if (verifStatusChoice === 'Terverifikasi & Sah') {
        triggerSuccessConfetti();
      }

      setSubmitFeedback(`Status verifikasi berkas "${updatedItem.title}" berhasil diperbarui menjadi: ${verifStatusChoice}`);
      setVerifModalItem(null);
    } catch (err: any) {
      console.error('Error verifying berkas:', err);
      alert('Gagal menyinkronkan verifikasi ke Firestore.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick 1-Click Approve
  const handleQuickApprove = async (item: LibraryBerkasEntry) => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Menu aksi pengesahan dokumen hanya dapat dilakukan oleh Administrator BP2RD.');
      return;
    }
    const verifierName = currentUser ? `${currentUser.nama} (Admin BP2RD)` : 'Administrator BP2RD';
    const updatedItem: LibraryBerkasEntry = {
      ...item,
      statusVerifikasi: 'Terverifikasi & Sah',
      catatanVerifikasi: 'Disahkan langsung oleh administrator.',
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
    };

    if (onUpdateStatus) {
      onUpdateStatus(item.id, 'Terverifikasi & Sah', updatedItem.catatanVerifikasi, verifierName);
    } else {
      onSaveEntry(updatedItem);
    }

    await syncLibraryEntryToFirestore(updatedItem);
    triggerSuccessConfetti();
    setSubmitFeedback(`Berkas "${item.title}" langsung disahkan sebagai Terverifikasi & Sah!`);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (item: LibraryBerkasEntry) => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Menu aksi hapus berkas hanya dapat dilakukan oleh Administrator BP2RD.');
      return;
    }
    setDeleteModalItem(item);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!isAdmin) {
      alert('Akses Dibatasi: Hanya Administrator BP2RD yang berwenang menghapus berkas.');
      return;
    }
    if (!deleteModalItem) return;
    setIsDeleting(true);

    try {
      // 1. Delete from local state
      onDeleteEntry(deleteModalItem.id);

      // 2. Delete from Firestore
      await deleteLibraryEntryFromFirestore(deleteModalItem.id);

      setSubmitFeedback(`Berkas "${deleteModalItem.title}" telah dihapus secara permanen dari sistem & Firestore.`);
      setDeleteModalItem(null);
    } catch (err: any) {
      console.error('Error deleting library berkas:', err);
      alert('Gagal menghapus berkas dari Firestore.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Table Items
  const filteredLibrary = libraryList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.nomorSurat && item.nomorSurat.toLowerCase().includes(tableSearch.toLowerCase())) ||
      item.authorOrWp.toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(tableSearch.toLowerCase()))) ||
      (item.catatanVerifikasi && item.catatanVerifikasi.toLowerCase().includes(tableSearch.toLowerCase()));

    const matchesCategory = tableCategoryFilter === 'all' || item.category === tableCategoryFilter;
    const matchesVerifikasi = tableVerifikasiFilter === 'all' || (item.statusVerifikasi || 'Terverifikasi & Sah') === tableVerifikasiFilter;

    return matchesSearch && matchesCategory && matchesVerifikasi;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Portal Verifikasi &amp; Input Berkas Admin</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Firestore: library_berkas</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FolderArchive className="w-8 h-8 text-blue-400" />
              <span>Input, Hapus &amp; Verifikasi Berkas Perpajakan</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Kelola repositori dokumen resmi BP2RD: unggah Perda, Juknis SOP, Blanko SPOP, berkas DPA/ARKAS, verifikasi keabsahan dokumen, dan hapus berkas kadaluarsa langsung di cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400">Total Berkas Tersimpan</p>
              <p className="text-2xl font-black text-white">{libraryList.length} Berkas</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Form on Left, SOP & Rules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Formulir Input &amp; Penerbitan Berkas</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">ID: LIB-{Date.now().toString().slice(-6)}</span>
            </div>

            {submitFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                  submitFeedback.includes('berhasil') || submitFeedback.includes('disahkan')
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}
              >
                {submitFeedback.includes('berhasil') || submitFeedback.includes('disahkan') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className="flex-1 font-medium">{submitFeedback}</span>
                <button
                  type="button"
                  onClick={() => setSubmitFeedback(null)}
                  className="text-slate-400 hover:text-white ml-2"
                >
                  ✕
                </button>
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

            {/* Nomor Surat & Tanggal & Status Dokumen */}
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
                  Status Legalitas Dokumen
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
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

            {/* Status Verifikasi Langsung dari Admin */}
            {isAdmin ? (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Status Verifikasi Awal (Otoritas Admin)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Verifikator: {currentUser ? currentUser.nama : 'Admin BP2RD'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'Terverifikasi & Sah', label: 'Terverifikasi & Sah', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
                    { value: 'Menunggu Verifikasi', label: 'Menunggu Telaah', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
                    { value: 'Perlu Perbaikan', label: 'Perlu Perbaikan', color: 'border-indigo-500 text-indigo-300 bg-indigo-950/40' },
                    { value: 'Ditolak', label: 'Ditolak', color: 'border-rose-500 text-rose-300 bg-rose-950/40' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatusVerifikasiInput(s.value as any)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                        statusVerifikasiInput === s.value
                          ? `${s.color} ring-1 ring-white/20 shadow-md`
                          : 'border-slate-700 text-slate-400 hover:text-white bg-slate-900/60'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={catatanVerifikasiInput}
                    onChange={(e) => setCatatanVerifikasiInput(e.target.value)}
                    placeholder="Catatan verifikasi / disposisi admin (opsional, misal: 'Telah diaudit sesuai Lembaran Daerah No. 1')..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Dokumen yang Anda unggah otomatis berstatus <strong>Menunggu Verifikasi</strong>. Pengesahan &amp; verifikasi dokumen dilakukan oleh <strong>Administrator BP2RD</strong>.
                </span>
              </div>
            )}

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
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/40 rounded-lg border border-rose-500/30 cursor-pointer"
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
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
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
                        className="hover:text-rose-400 font-bold ml-1 cursor-pointer"
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
                    className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
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
                  setCatatanVerifikasiInput('');
                  setSubmitFeedback(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
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
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Pedoman Verifikasi Dokumen Admin</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Admin dan petugas BP2RD dapat memvalidasi dan memverifikasi setiap berkas yang diunggah ke perpustakaan:
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terverifikasi &amp; Sah</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Dokumen telah diaudit, sah secara hukum, dan diakui sebagai rujukan penetapan atau pelayanan.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Menunggu Verifikasi</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Dokumen baru yang memerlukan peninjauan klausul atau pengecekan lampiran oleh tim pengkaji.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Perlu Perbaikan</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Memerlukan revisi redaksi, kelengkapan tanda tangan pejabat, atau resolusi gambar yang lebih jelas.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ditolak / Dihapus</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  Berkas tidak sesuai regulasi atau kadaluarsa. Admin dapat menghapus langsung dari sistem.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Koneksi Firestore &amp; Otoritas</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Koleksi Firestore</span>
                <span className="font-mono font-bold text-blue-300">library_berkas</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Otoritas Verifikasi</span>
                <span className="text-emerald-400 font-semibold">{currentUser ? currentUser.role.toUpperCase() : 'ADMIN'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Fitur Hapus</span>
                <span className="text-rose-400 font-semibold">Terkonfirmasi &amp; Permanen</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Sinkronisasi Cloud</span>
                <span className="text-blue-400 font-semibold">Otomatis Real-Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Management Table with Verification & Delete */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5">
              <FolderArchive className="w-5 h-5 text-blue-400" />
              <span>Daftar Berkas, Status Verifikasi &amp; Aksi Admin</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tinjau, verifikasi keabsahan dokumen, ubah status disposisi, atau hapus berkas dari sistem perpajakan BP2RD
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Cari berkas / catatan..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
            </div>

            <select
              value={tableCategoryFilter}
              onChange={(e) => setTableCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="regulasi">Regulasi &amp; Perda</option>
              <option value="sop">SOP &amp; Juknis</option>
              <option value="blanko">Formulir Blanko</option>
              <option value="dpa">DPA / ARKAS</option>
              <option value="objek">Foto Objek</option>
              <option value="pbb">PBB-P2</option>
            </select>

            <select
              value={tableVerifikasiFilter}
              onChange={(e) => setTableVerifikasiFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Semua Status Verifikasi</option>
              <option value="Terverifikasi & Sah">Terverifikasi &amp; Sah</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Restricted Access Banner for Non-Admin */}
        {!isAdmin && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-md">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Akses Terbatas (Non-Admin / Petugas):</strong> Menu aksi admin (<strong>Hapus</strong> berkas, <strong>Lihat</strong> pratinjau, dan <strong>Ubah Status</strong> verifikasi) hanya tampil dan aktif pada saat login sebagai <strong>Administrator BP2RD</strong>.
              </span>
            </div>
            {onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-colors shadow"
              >
                Login Administrator
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/40">
                <th className="py-3 px-4">Judul Berkas &amp; Nomor</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Instansi &amp; File</th>
                <th className="py-3 px-4">Status Verifikasi Admin</th>
                <th className="py-3 px-4">Akses &amp; Catatan</th>
                {isAdmin && <th className="py-3 px-4 text-right">Aksi Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLibrary.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada berkas yang cocok dengan pencarian atau filter status.
                  </td>
                </tr>
              ) : (
                filteredLibrary.map((item) => {
                  const verifStatus = item.statusVerifikasi || 'Terverifikasi & Sah';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
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
                        <p className="text-slate-200 truncate max-w-[140px] font-medium">{item.authorOrWp}</p>
                        <p className="text-[10px] text-slate-400">{item.fileType} • {item.sizeStr}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            verifStatus === 'Terverifikasi & Sah'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                              : verifStatus === 'Menunggu Verifikasi'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                              : verifStatus === 'Perlu Perbaikan'
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                          }`}>
                            {verifStatus === 'Terverifikasi & Sah' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            {verifStatus === 'Menunggu Verifikasi' && <Clock className="w-3 h-3 text-amber-400" />}
                            {verifStatus === 'Perlu Perbaikan' && <AlertCircle className="w-3 h-3 text-indigo-400" />}
                            {verifStatus === 'Ditolak' && <XCircle className="w-3 h-3 text-rose-400" />}
                            <span>{verifStatus}</span>
                          </span>

                          {item.verifiedBy && (
                            <p className="text-[9px] text-slate-400 leading-tight">
                              Verifikator: <span className="text-slate-300">{item.verifiedBy}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[170px]">
                          <div>
                            {item.isPublic ? (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <Globe className="w-3 h-3" /> Publik
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                                <Lock className="w-3 h-3" /> Khusus Internal
                              </span>
                            )}
                          </div>
                          {item.catatanVerifikasi && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-2">
                              "{item.catatanVerifikasi}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Menu Aksi Admin: HANYA TAMPIL PADA LOGIN ADMIN */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1. Ubah Status: Quick Approve button if pending */}
                            {verifStatus !== 'Terverifikasi & Sah' && (
                              <button
                                type="button"
                                onClick={() => handleQuickApprove(item)}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer"
                                title="Sahkan Langsung (1-Klik)"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                            )}

                            {/* 2. Ubah Status & Catatan Verifikasi Modal */}
                            <button
                              type="button"
                              onClick={() => handleOpenVerifModal(item)}
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
                              title="Ubah Status & Catatan Verifikasi Admin"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Lihat Berkas / Pratinjau */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenPreview) onOpenPreview(item);
                                else setPreviewModalItem(item);
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                              title="Lihat Pratinjau Berkas"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Google Drive Link */}
                            {item.driveUrl && (
                              <a
                                href={item.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                                title="Buka di Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* 4. Hapus Berkas */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(item)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
                              title="Hapus Berkas dari Sistem & Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Verifikasi Berkas (Verification Modal) */}
      <AnimatePresence>
        {verifModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Verifikasi &amp; Disposisi Berkas</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{verifModalItem.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setVerifModalItem(null)}
                  className="text-slate-400 hover:text-white p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Target Item Details */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1.5 text-xs">
                <p className="font-bold text-white text-sm">{verifModalItem.title}</p>
                <div className="flex flex-wrap items-center gap-3 text-slate-300 text-[11px]">
                  <span>Kategori: <strong className="text-blue-300">{verifModalItem.category.toUpperCase()}</strong></span>
                  <span>Penerbit: <strong>{verifModalItem.authorOrWp}</strong></span>
                  <span>Ukuran: <strong>{verifModalItem.sizeStr}</strong></span>
                </div>
              </div>

              {/* Status Verifikasi Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Tentukan Keputusan Verifikasi:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { value: 'Terverifikasi & Sah', label: 'Terverifikasi & Sah', icon: CheckCircle2, desc: 'Dokumen legal & resmi diakui', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
                    { value: 'Menunggu Verifikasi', label: 'Menunggu Verifikasi', icon: Clock, desc: 'Dalam tahap telaah berkas', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                    { value: 'Perlu Perbaikan', label: 'Perlu Perbaikan', icon: AlertCircle, desc: 'Perlu revisi / lampiran tambahan', color: 'border-indigo-500 bg-indigo-950/40 text-indigo-300' },
                    { value: 'Ditolak', label: 'Ditolak', icon: XCircle, desc: 'Dokumen tidak sah/kadaluarsa', color: 'border-rose-500 bg-rose-950/40 text-rose-300' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = verifStatusChoice === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVerifStatusChoice(opt.value as any)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.color} ring-1 ring-white/20 shadow-lg`
                            : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-bold text-white">{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Verifikasi Admin */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Catatan Verifikasi / Disposisi Administrator:
                </label>
                <textarea
                  rows={3}
                  value={verifCatatanText}
                  onChange={(e) => setVerifCatatanText(e.target.value)}
                  placeholder="Berikan catatan tindak lanjut, alasan verifikasi, atau instruksi perbaikan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                />
              </div>

              {/* Verifier Badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Verifikator: <strong className="text-slate-200">{currentUser ? currentUser.nama : 'Admin BP2RD'}</strong></span>
                <span>Waktu: <strong className="text-slate-200">{new Date().toLocaleDateString('id-ID')}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifModalItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Simpan Hasil Verifikasi</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Konfirmasi Hapus Berkas (Delete Confirmation Modal) */}
      <AnimatePresence>
        {deleteModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-500/40 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Konfirmasi Hapus Berkas</h3>
                  <p className="text-[11px] text-rose-300">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs space-y-1">
                <p className="font-bold text-white">{deleteModalItem.title}</p>
                <p className="text-slate-400 text-[11px]">ID: <span className="font-mono text-slate-300">{deleteModalItem.id}</span></p>
                <p className="text-slate-400 text-[11px]">Kategori: <span className="text-slate-300">{deleteModalItem.category}</span></p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin menghapus berkas ini dari repositori library dan database Cloud Firestore?
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteModalItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Ya, Hapus Permanen</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Pratinjau Berkas (Preview Modal) */}
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
                  className="text-slate-400 hover:text-white p-1 text-lg font-bold"
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
                    <span className="text-slate-400">Status Verifikasi: </span>
                    <span className="text-emerald-400 font-semibold">{previewModalItem.statusVerifikasi || 'Terverifikasi & Sah'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                {previewModalItem.driveUrl && (
                  <a
                    href={previewModalItem.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Google Drive</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
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
