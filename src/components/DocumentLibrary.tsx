import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Receipt, 
  BookOpen, 
  Download, 
  Eye, 
  CheckCircle2, 
  Layers,
  PlusCircle,
  ExternalLink,
  Trash2,
  FileCheck,
  Building2,
  FileSpreadsheet,
  Globe,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PotensiPajakEntry, PbbP2Entry, LibraryBerkasEntry, AppUser } from '../types';

interface DocumentLibraryProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  libraryList?: LibraryBerkasEntry[];
  currentUser?: AppUser | null;
  onBackToHome: () => void;
  onOpenInputLibrary?: () => void;
  onDeleteEntry?: (id: string) => void;
}

interface LibraryItem {
  id: string;
  title: string;
  category: 'dpa' | 'objek' | 'pbb' | 'regulasi' | 'sop' | 'blanko';
  nomorSurat?: string;
  fileType: string;
  sizeStr: string;
  date: string;
  authorOrWp: string;
  previewUrl?: string;
  driveUrl?: string;
  status: string;
  statusColor: string;
  description: string;
  isCustom?: boolean;
  isPublic?: boolean;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  potensiList,
  pbbList,
  libraryList = [],
  currentUser = null,
  onBackToHome,
  onOpenInputLibrary,
  onDeleteEntry,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'dpa' | 'objek' | 'pbb' | 'regulasi' | 'sop' | 'blanko'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  // 1. Static Regulation Items
  const staticRegulasi: LibraryItem[] = [
    {
      id: 'REG-001',
      title: 'Peraturan Daerah (Perda) Pajak Daerah & Retribusi Daerah 2026',
      category: 'regulasi',
      nomorSurat: 'Perda No. 01/2026',
      fileType: 'PDF Document',
      sizeStr: '3.4 MB',
      date: '2026-01-15',
      authorOrWp: 'Pemerintah Daerah & DPRD',
      previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      status: 'Berlaku Efektif',
      statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      description: 'Ketentuan umum tarif pajak restoran, reklame, perhotelan, parkir, dan air tanah sesuai UU No. 1/2022 HKPD.',
      isPublic: true,
    },
    {
      id: 'REG-002',
      title: 'Petunjuk Teknis (Juknis) Penggalian Potensi Objek Baru BP2RD',
      category: 'sop',
      nomorSurat: 'Juknis BP2RD-04/2026',
      fileType: 'PDF Document',
      sizeStr: '2.1 MB',
      date: '2026-03-01',
      authorOrWp: 'Bidang Pendataan & Penetapan',
      previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      status: 'SOP Resmi',
      statusColor: 'bg-blue-950 text-blue-300 border-blue-500/30',
      description: 'Pedoman operasional verifikasi titik GPS, verifikasi berkas DPA/ARKAS, dan formulasi proyeksi omzet.',
      isPublic: true,
    },
    {
      id: 'REG-003',
      title: 'Peta Zona Nilai Tanah (ZNT) & Klasifikasi NJOP PBB-P2',
      category: 'regulasi',
      nomorSurat: 'Kepbapenda No. 89/2026',
      fileType: 'Spatial Map PDF',
      sizeStr: '12.8 MB',
      date: '2026-02-10',
      authorOrWp: 'UPT Pemetaan & Penilaian Pajak',
      previewUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
      status: 'Referensi Pemetaan',
      statusColor: 'bg-purple-950 text-purple-300 border-purple-500/30',
      description: 'Zonasi nilai pasar tanah per blok kecamatan untuk perhitungan SPPT PBB tahun berjalan.',
      isPublic: true,
    },
  ];

  // 2. Custom Uploaded Library Entries from Admin
  const customItems: LibraryItem[] = libraryList.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    nomorSurat: entry.nomorSurat,
    fileType: entry.fileType,
    sizeStr: entry.sizeStr,
    date: entry.date,
    authorOrWp: entry.authorOrWp,
    previewUrl: entry.previewUrl || entry.fileData,
    driveUrl: entry.driveUrl,
    status: entry.status,
    statusColor: entry.statusColor || 'bg-blue-950 text-blue-300 border-blue-500/30',
    description: entry.description,
    isCustom: true,
    isPublic: entry.isPublic,
  }));

  // 3. Dynamic Potensi Entries
  const potensiItems: LibraryItem[] = [];
  potensiList.forEach((p) => {
    if (p.fileDpaArkas) {
      potensiItems.push({
        id: `LIB-DPA-${p.id}`,
        title: `DPA/ARKAS: ${p.fileDpaArkas.name}`,
        category: 'dpa',
        fileType: 'Dokumen Anggaran PDF',
        sizeStr: `${(p.fileDpaArkas.size / 1024).toFixed(0)} KB`,
        date: p.tanggal,
        authorOrWp: p.namaWajibPajak,
        status: p.statusValidasi,
        statusColor: 'bg-blue-950 text-blue-300 border-blue-500/30',
        description: `Lampiran kelayakan DPA/ARKAS untuk objek potensi ${p.namaObjek}.`,
        isPublic: true,
      });
    }

    if (p.fileObjek) {
      potensiItems.push({
        id: `LIB-IMG-${p.id}`,
        title: `Dokumentasi Fisik: ${p.namaObjek}`,
        category: 'objek',
        fileType: 'Foto Objek (JPEG/PNG)',
        sizeStr: `${(p.fileObjek.size / 1024).toFixed(0)} KB`,
        date: p.tanggal,
        authorOrWp: p.namaWajibPajak,
        previewUrl: p.fileObjek.dataUrl,
        status: p.statusAdmin,
        statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
        description: `Dokumentasi foto lokasi fisik, billboard, atau bangunan usaha di ${p.alamat}.`,
        isPublic: true,
      });
    }
  });

  // 4. Dynamic PBB Entries
  const pbbItems: LibraryItem[] = [];
  pbbList.forEach((p) => {
    if (p.buktiBayar) {
      pbbItems.push({
        id: `LIB-PBB-${p.id}`,
        title: `Struk Bayar PBB: ${p.namaWajibPajak}`,
        category: 'pbb',
        fileType: 'Bukti Pembayaran Bank',
        sizeStr: `${(p.buktiBayar.size / 1024).toFixed(0)} KB`,
        date: p.tanggal,
        authorOrWp: p.namaWajibPajak,
        previewUrl: p.buktiBayar.dataUrl,
        status: p.statusVerifikasi,
        statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
        description: `Bukti pelunasan PBB-P2 NOP ${p.nop || 'Objek Baru'} tahun pajak ${p.tahunPajak}.`,
        isPublic: true,
      });
    }
  });

  // Combine items: custom admin items first, then static, then dynamic submissions
  const allItems: LibraryItem[] = [...customItems, ...staticRegulasi, ...potensiItems, ...pbbItems];

  const filteredItems = allItems.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorOrWp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nomorSurat && item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Library */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Pusat Arsip Digital
              </span>
              <span className="text-xs text-slate-400">Library Dokumen &amp; Berkas Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Library Berkas, Foto Objek &amp; Regulasi Pajak
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Koleksi visual interaktif untuk meninjau berkas DPA/ARKAS, dokumentasi foto fisik objek potensi, struk setoran PBB-P2, serta pedoman regulasi perpajakan daerah tahun 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Admin Input Library Action Button */}
            {onOpenInputLibrary && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenInputLibrary}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-purple-200" />
                <span>+ Input Berkas Baru</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToHome}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              ← Kembali ke Beranda
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Toolbar: Category Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `Semua (${allItems.length})` },
            { id: 'regulasi', label: 'Perda & Regulasi', icon: BookOpen, color: 'text-emerald-400' },
            { id: 'sop', label: 'SOP & Juknis', icon: FileCheck, color: 'text-blue-400' },
            { id: 'blanko', label: 'Formulir Blanko', icon: FileText, color: 'text-amber-400' },
            { id: 'dpa', label: 'DPA/ARKAS', icon: FileSpreadsheet, color: 'text-indigo-400' },
            { id: 'objek', label: 'Foto Objek', icon: ImageIcon, color: 'text-teal-400' },
            { id: 'pbb', label: 'Struk Bayar PBB', icon: Receipt, color: 'text-rose-400' },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {IconComp && <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />}
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul, subjek, atau nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid of Library Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col hover:border-purple-500/50 hover:shadow-purple-500/10 transition-all duration-300 group"
          >
            {/* Card Thumbnail / Preview Frame */}
            <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-800/80">
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-4">
                  {item.category === 'dpa' ? (
                    <FileSpreadsheet className="w-12 h-12 text-blue-400 opacity-80" />
                  ) : item.category === 'blanko' ? (
                    <FileText className="w-12 h-12 text-amber-400 opacity-80" />
                  ) : item.category === 'sop' ? (
                    <FileCheck className="w-12 h-12 text-blue-400 opacity-80" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-purple-400 opacity-80" />
                  )}
                  <span className="text-[11px] font-bold text-slate-300 mt-2">{item.fileType}</span>
                </div>
              )}

              {/* Badges on top */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-900/90 text-white backdrop-blur-md border border-slate-700">
                  {item.category}
                </span>
                {item.isCustom && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-900/90 text-indigo-200 border border-indigo-500/40">
                    Input Admin
                  </span>
                )}
              </div>

              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.nomorSurat && (
                  <p className="text-[10px] font-mono text-purple-400 mt-0.5">{item.nomorSurat}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[150px] font-medium text-slate-300">{item.authorOrWp}</span>
                <span>{item.sizeStr}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
              
              <div className="flex items-center gap-1.5">
                {item.driveUrl && (
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all"
                    title="Buka di Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {item.isCustom && onDeleteEntry && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus berkas "${item.title}"?`)) {
                        onDeleteEntry(item.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                    title="Hapus Berkas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-purple-500 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Berkas</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Preview Berkas with Smooth Spring Animation */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                    {selectedItem.id}
                  </span>
                  <h3 className="text-base font-black text-white mt-1">{selectedItem.title}</h3>
                  {selectedItem.nomorSurat && (
                    <p className="text-[11px] text-purple-400 font-mono">{selectedItem.nomorSurat}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-white font-bold p-1 text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Media Viewer */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-60 max-h-96">
                {selectedItem.previewUrl ? (
                  <img
                    src={selectedItem.previewUrl}
                    alt={selectedItem.title}
                    className="w-full h-full max-h-96 object-contain"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <FileText className="w-16 h-16 mx-auto mb-2 text-blue-400" />
                    <p className="text-xs font-semibold text-white">{selectedItem.fileType}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dokumen siap diunduh dan diverifikasi oleh pihak berwenang.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1.5 text-slate-300">
                <p><strong>Deskripsi:</strong> {selectedItem.description}</p>
                <p><strong>Sumber/Pemilik:</strong> {selectedItem.authorOrWp}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Ukuran Berkas:</strong> {selectedItem.sizeStr}</p>
                <p><strong>Tanggal:</strong> {selectedItem.date}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                {selectedItem.driveUrl && (
                  <a
                    href={selectedItem.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Google Drive</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => alert(`Mengunduh berkas arsip: ${selectedItem.title}...`)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
