import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  FileText, 
  BookOpen, 
  FileCheck, 
  Download, 
  ExternalLink, 
  Lock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Receipt, 
  Image as ImageIcon,
  LogIn,
  CheckCircle2,
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Clock,
  Database
} from 'lucide-react';
import { LibraryBerkasEntry, AppUser, PotensiPajakEntry, PbbP2Entry, LibraryCategory } from '../types';
import { resolveLibraryFileUrl } from '../services/firebase';

interface DocumentLibraryProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  libraryList: LibraryBerkasEntry[];
  currentUser: AppUser | null;
  initialCategory?: 'all' | LibraryCategory;
  onBackToHome: () => void;
  onOpenLogin: () => void;
  onOpenInputLibrary?: () => void;
  onDeleteEntry?: (id: string) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  potensiList,
  pbbList,
  libraryList,
  currentUser,
  initialCategory = 'all',
  onBackToHome,
  onOpenLogin,
  onOpenInputLibrary,
  onDeleteEntry,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | LibraryCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<LibraryBerkasEntry | null>(null);

  // Kategori berkas resmi pada Library Berkas:
  // Perda dan Regulasi, SOP & Juknis, Formulir Blanko
  const ALLOWED_CATEGORIES: LibraryCategory[] = ['regulasi', 'sop', 'blanko'];

  // Kategori yang tersedia pada menu Library Berkas
  const availableCategories: { id: 'all' | LibraryCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Semua Berkas', icon: FolderArchive },
    { id: 'regulasi', label: 'Perda & Regulasi', icon: BookOpen },
    { id: 'sop', label: 'SOP & Juknis', icon: FileCheck },
    { id: 'blanko', label: 'Formulir Blanko', icon: FileText },
  ];

  // Pastikan kategori yang aktif valid
  const effectiveCategory = (!ALLOWED_CATEGORIES.includes(activeCategory as LibraryCategory) && activeCategory !== 'all')
    ? 'all'
    : activeCategory;

  // Filter berkas agar hanya menampilkan kategori resmi (Perda & Regulasi, SOP & Juknis, Formulir Blanko)
  const accessibleItems = libraryList.filter((item) => {
    return ALLOWED_CATEGORIES.includes(item.category);
  });

  // Filter berdasarkan kategori terpilih dan kata kunci pencarian
  const filteredItems = accessibleItems.filter((item) => {
    const matchesCategory = effectiveCategory === 'all' || item.category === effectiveCategory;
    const matchesQuery = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorBerkas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesQuery;
  });

  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  // Download real file or fallback document (supports chunked files stored in Firestore)
  const handleDownload = async (item: LibraryBerkasEntry) => {
    setIsDownloadingId(item.id);
    try {
      const resolvedUrl = await resolveLibraryFileUrl(item);
      if (resolvedUrl) {
        const link = document.createElement('a');
        link.href = resolvedUrl;
        link.download = item.fileName || `${item.nomorBerkas || 'dokumen'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } finally {
      setIsDownloadingId(null);
    }

    const waktuStr = item.waktuPenginputan || (item.jamUpload ? `${item.tanggalUpload} ${item.jamUpload}` : item.tanggalUpload);
    const textContent = `PEMERINTAH KABUPATEN HULU SUNGAI UTARA
BADAN PENGELOLA PAJAK DAN RETRIBUSI DAERAH (BP2RD)
Jl. Basuki Rahmat No. 01, Amuntai Tengah, Kab. Hulu Sungai Utara, Kalimantan Selatan

ARSIP DOKUMEN SISTEM INFORMASI POTENSI PAJAK (SIPOTENSI HSU)
======================================================================
Kategori Berkas  : ${item.categoryLabel || item.category.toUpperCase()}
Nomor Dokumen    : ${item.nomorBerkas}
Judul Dokumen    : ${item.title}
Waktu Penginputan: ${waktuStr}
Pengunggah       : ${item.uploadedBy} (${item.uploadedRole})
Status Validasi  : ${item.statusVerifikasi || 'Aktif'}
======================================================================

DESKRIPSI:
${item.description}

Catatan Sistem:
Dokumen ini tersimpan secara digital pada Database Firebase Firestore BP2RD Kabupaten Hulu Sungai Utara.
Kesesuaian dan keabsahan dokumen diverifikasi oleh Bagian Tata Usaha dan Hukum BP2RD HSU.
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName || `${item.nomorBerkas}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Back Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Library Berkas &amp; Regulasi Daerah
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BP2RD HSU
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pusat penyimpanan digital peraturan daerah, SOP &amp; petunjuk teknis operasional, serta formulir blanko resmi BP2RD HSU.
            </p>
          </div>
        </div>

        {/* Right Action: Input New File (Hanya untuk Admin) or Login Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {currentUser ? (
            currentUser.role === 'admin' && onOpenInputLibrary && (
              <button
                onClick={onOpenInputLibrary}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Berkas Baru</span>
              </button>
            )
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Login Akses Internal</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Status Akses Kategori Berkas */}
      <div className="mt-6">
        {currentUser ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-300">
                  Akses Terverifikasi ({currentUser.role.toUpperCase()}) &bull; {currentUser.name}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Menampilkan koleksi berkas resmi: <strong className="text-emerald-400">Perda &amp; Regulasi</strong>, <strong className="text-blue-400">SOP &amp; Juknis</strong>, dan <strong className="text-amber-400">Formulir Blanko</strong>.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Mode Terverifikasi
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-200">
                  Repositori Dokumen Resmi BP2RD HSU
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Menampilkan kategori berkas: <strong className="text-emerald-400">Perda &amp; Regulasi</strong>, <strong className="text-blue-400">SOP &amp; Juknis</strong>, dan <strong className="text-amber-400">Formulir Blanko</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILTER TABS & SEARCH BAR (Permintaan #2: Hilangkan garis line berlebih, gunakan wrap rapi) */}
      <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 shadow-xl">
        
        {/* Category Pills (Clean Wrap, NO ugly horizontal scrollbar) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {availableCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = effectiveCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor berkas, judul, tag..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Grid List of Documents */}
      <div className="mt-6">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
            <FolderArchive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">Tidak ada berkas yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Coba ganti filter kategori atau ubah kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5"
                >
                  <div>
                    {/* Card Top: Category Badge & Status indicator */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        item.category === 'regulasi'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.category === 'sop'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.categoryLabel || item.category.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Publik</span>
                        </span>

                        {currentUser?.role === 'admin' && onDeleteEntry && (
                          <button
                            onClick={() => onDeleteEntry(item.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                            title="Hapus Berkas (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Document Number */}
                    <div className="text-[11px] font-mono font-semibold text-slate-400 mb-1">
                      {item.nomorBerkas}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-medium bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Metadata & Actions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold" title="Waktu Penginputan di Database Firebase">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{item.waktuPenginputan || (item.jamUpload ? `${item.tanggalUpload} ${item.jamUpload}` : item.tanggalUpload)}</span>
                      </span>
                      <span className="truncate max-w-[150px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Database className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                        <span>{item.fileName || 'Berkas Digital'} ({item.fileSize || 'PDF'})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const resolved = await resolveLibraryFileUrl(item);
                          setSelectedPreviewDoc(resolved ? { ...item, fileUrl: resolved } : item);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Pratinjau Dokumen"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Detail</span>
                      </button>

                      <button
                        onClick={() => handleDownload(item)}
                        disabled={isDownloadingId === item.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Unduh Berkas Resmi"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingId === item.id ? 'Mengunduh...' : 'Unduh'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Preview Detail Dokumen */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Detail Arsip Dokumen</h4>
                  <p className="text-[11px] font-mono text-slate-400">{selectedPreviewDoc.nomorBerkas}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Judul Dokumen</label>
                <p className="text-slate-200 font-semibold text-sm mt-0.5">{selectedPreviewDoc.title}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kategori &amp; Sifat Akses</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {selectedPreviewDoc.categoryLabel || selectedPreviewDoc.category.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${selectedPreviewDoc.isPublic ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                    {selectedPreviewDoc.isPublic ? 'Publik / Terbuka' : 'Internal Terbatas (Admin & Petugas)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Deskripsi &amp; Ringkasan</label>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed mt-1">
                  {selectedPreviewDoc.description}
                </p>
              </div>

              {selectedPreviewDoc.fileUrl && selectedPreviewDoc.fileType === 'image' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Pratinjau Foto Fisik Objek
                  </label>
                  <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950 flex items-center justify-center">
                    <img 
                      src={selectedPreviewDoc.fileUrl} 
                      alt={selectedPreviewDoc.title} 
                      className="max-h-48 w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Pengunggah</span>
                  <span className="font-semibold text-slate-200">{selectedPreviewDoc.uploadedBy}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Waktu Penginputan (Firebase)</span>
                  <span className="font-semibold font-mono text-emerald-400">
                    {selectedPreviewDoc.waktuPenginputan || (selectedPreviewDoc.jamUpload ? `${selectedPreviewDoc.tanggalUpload} ${selectedPreviewDoc.jamUpload}` : selectedPreviewDoc.tanggalUpload)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedPreviewDoc);
                  setSelectedPreviewDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
