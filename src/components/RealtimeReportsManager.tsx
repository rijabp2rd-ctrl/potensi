import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Copy, 
  Send, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Star,
  Building2,
  Check,
  Code2,
  FolderArchive,
  Trash2,
  Lock,
  PlusCircle
} from 'lucide-react';
import { PotensiPajakEntry, PbbP2Entry, IkmEntry, GoogleSheetsConfig, LibraryBerkasEntry, AppUser } from '../types';
import { StorageService } from '../services/storage';
import { AdminInputLibraryBerkas } from './AdminInputLibraryBerkas';

interface RealtimeReportsManagerProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  ikmList: IkmEntry[];
  libraryList: LibraryBerkasEntry[];
  currentUser: AppUser | null;
  onSaveLibraryEntry: (entry: LibraryBerkasEntry) => void;
  onDeleteLibraryEntry: (id: string) => void;
  onUpdateLibraryStatus?: (
    id: string,
    statusVerifikasi: LibraryBerkasEntry['statusVerifikasi'],
    catatan?: string,
    verifiedBy?: string
  ) => void;
  onUpdatePotensiStatus: (id: string, status: PotensiPajakEntry['statusAdmin'], catatan?: string, petugas?: string) => void;
  onUpdatePbbStatus: (id: string, status: PbbP2Entry['statusVerifikasi'], catatan?: string) => void;
  onDeletePotensi?: (id: string) => void;
  onDeletePbb?: (id: string) => void;
  onDeleteIkm?: (id: string) => void;
  sheetsConfig: GoogleSheetsConfig;
  onSaveSheetsConfig: (config: GoogleSheetsConfig) => void;
  onOpenLibrary: () => void;
  onOpenLogin?: () => void;
}

export const RealtimeReportsManager: React.FC<RealtimeReportsManagerProps> = ({
  potensiList,
  pbbList,
  ikmList,
  libraryList,
  currentUser,
  onSaveLibraryEntry,
  onDeleteLibraryEntry,
  onUpdateLibraryStatus,
  onUpdatePotensiStatus,
  onUpdatePbbStatus,
  onDeletePotensi,
  onDeletePbb,
  onDeleteIkm,
  sheetsConfig,
  onSaveSheetsConfig,
  onOpenLibrary,
  onOpenLogin,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [activeReportTab, setActiveReportTab] = useState<'potensi' | 'pbb' | 'ikm' | 'input-library' | 'sheets'>('potensi');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Detail Modal State
  const [selectedPotensi, setSelectedPotensi] = useState<PotensiPajakEntry | null>(null);
  const [selectedPbb, setSelectedPbb] = useState<PbbP2Entry | null>(null);

  // Edit Status States (Potensi)
  const [editStatusValue, setEditStatusValue] = useState<PotensiPajakEntry['statusAdmin']>('Diverifikasi');
  const [editCatatan, setEditCatatan] = useState('');
  const [editPetugas, setEditPetugas] = useState('');

  // Edit Status States (PBB)
  const [selectedPbbEdit, setSelectedPbbEdit] = useState<PbbP2Entry | null>(null);
  const [editPbbStatus, setEditPbbStatus] = useState<PbbP2Entry['statusVerifikasi']>('Lunas & Sah');
  const [editPbbCatatan, setEditPbbCatatan] = useState('');

  // IKM Detail Modal State
  const [selectedIkmDetail, setSelectedIkmDetail] = useState<IkmEntry | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ type: 'potensi' | 'pbb' | 'ikm'; id: string; title: string } | null>(null);

  // Sheets Config States
  const [localSheetsConfig, setLocalSheetsConfig] = useState<GoogleSheetsConfig>({ ...sheetsConfig });
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [testPingStatus, setTestPingStatus] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);

  const handleConfirmDelete = () => {
    if (!deleteConfirmItem || !isAdmin) return;
    if (deleteConfirmItem.type === 'potensi' && onDeletePotensi) {
      onDeletePotensi(deleteConfirmItem.id);
    } else if (deleteConfirmItem.type === 'pbb' && onDeletePbb) {
      onDeletePbb(deleteConfirmItem.id);
    } else if (deleteConfirmItem.type === 'ikm' && onDeleteIkm) {
      onDeleteIkm(deleteConfirmItem.id);
    }
    setDeleteConfirmItem(null);
  };

  const handleSavePbbStatus = () => {
    if (!selectedPbbEdit || !isAdmin) return;
    onUpdatePbbStatus(selectedPbbEdit.id, editPbbStatus, editPbbCatatan);
    setSelectedPbbEdit(null);
  };

  // Format Currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered Potensi
  const filteredPotensi = potensiList.filter((item) => {
    const matchesSearch =
      item.namaObjek.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noWhatsapp.includes(searchQuery) ||
      item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Semua' || item.statusAdmin === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered PBB
  const filteredPbb = pbbList.filter((item) => {
    const matchesSearch =
      item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nik.includes(searchQuery) ||
      (item.nop && item.nop.includes(searchQuery)) ||
      item.lokasiObjek.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Semua' || item.statusVerifikasi === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered IKM
  const filteredIkm = ikmList.filter((item) => {
    return (
      item.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.saranMasukan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Export CSV Handler
  const handleExportCsv = (type: 'potensi' | 'pbb' | 'ikm') => {
    const csvContent = StorageService.exportToCsv(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SIPOTENSI_Laporan_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Google Apps Script Template
  const handleCopyScript = () => {
    const script = StorageService.getGoogleAppsScriptTemplate();
    navigator.clipboard.writeText(script);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 3000);
  };

  // Test Ping Google Sheets Webhook
  const handleTestPing = async () => {
    setIsTestingPing(true);
    setTestPingStatus('Mengirim sinyal uji ke Google Sheets Webhook...');
    try {
      const res = await StorageService.syncToGoogleSheets('potensi', {
        id: 'TEST-PING-001',
        tanggal: new Date().toISOString().split('T')[0],
        namaObjek: 'Uji Koneksi Webhook SIPOTENSI BP2RD',
        kategoriObjek: 'Sistem Pengujian',
        namaWajibPajak: 'Admin BP2RD',
        alamat: 'Kantor BAPENDA / BP2RD',
        kecamatan: 'Pusat Kota',
        kelurahan: 'Pusat',
        noWhatsapp: '081200000000',
        estimasiPotensiTahunan: 1000000,
        skorKelayakan: 100,
        statusValidasi: 'Tervalidasi Otomatis',
        statusAdmin: 'Diverifikasi',
      });
      setTestPingStatus(`Uji Berhasil! Data uji terkirim ke Google Sheets pada ${res.timestamp}`);
      setIsTestingPing(false);
    } catch (err) {
      setTestPingStatus('Gagal menghubungkan webhook. Periksa format URL Google Apps Script.');
      setIsTestingPing(false);
    }
  };

  // Save Sheets Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetsConfig(localSheetsConfig);
    alert('Pengaturan Google Sheets berhasil disimpan!');
  };

  // Save Modal Status Potensi
  const handleSaveModalStatus = () => {
    if (!selectedPotensi) return;
    onUpdatePotensiStatus(selectedPotensi.id, editStatusValue, editCatatan, editPetugas);
    setSelectedPotensi((prev) =>
      prev ? { ...prev, statusAdmin: editStatusValue, catatanPetugas: editCatatan, petugasSurvey: editPetugas } : null
    );
    alert(`Status objek ${selectedPotensi.id} berhasil diperbarui menjadi ${editStatusValue}.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Pusat Manajemen Data Real-Time
            </span>
            <span className="text-xs text-slate-400">Sinkronisasi Google Sheets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manajemen Laporan & Aktivitas Wajib Pajak
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau, verifikasi, dan audit data potensi pajak daerah, kepatuhan PBB-P2, serta survei kepuasan secara terpusat.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportCsv(activeReportTab === 'sheets' || activeReportTab === 'input-library' ? 'potensi' : activeReportTab)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveReportTab('potensi'); setStatusFilter('Semua'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeReportTab === 'potensi'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Penggalian Potensi Pajak ({potensiList.length})</span>
        </button>

        <button
          onClick={() => { setActiveReportTab('pbb'); setStatusFilter('Semua'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeReportTab === 'pbb'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Layanan PBB-P2 ({pbbList.length})</span>
        </button>

        <button
          onClick={() => { setActiveReportTab('ikm'); setStatusFilter('Semua'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeReportTab === 'ikm'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Survei IKM ({ikmList.length})</span>
        </button>

        <button
          onClick={() => { setActiveReportTab('input-library'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeReportTab === 'input-library'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-purple-300 hover:text-white hover:bg-slate-800 border border-purple-500/30'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-purple-400" />
          <span>+ Input Library Berkas ({libraryList?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeReportTab === 'sheets'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Integrasi Google Sheets Hub</span>
        </button>
      </div>

      {/* Search & Filter Toolbar (for table tabs) */}
      {activeReportTab !== 'sheets' && activeReportTab !== 'input-library' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama objek, WP, NIK, alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeReportTab === 'potensi' && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu Validasi">Menunggu Validasi</option>
                  <option value="Diverifikasi">Diverifikasi</option>
                  <option value="Perlu Survey Lapangan">Perlu Survey Lapangan</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            )}

            {activeReportTab === 'pbb' && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status Setor:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Lunas & Sah">Lunas & Sah</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Data Tidak Sesuai">Data Tidak Sesuai</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-Admin Access Banner */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Mode Peninjauan Terbatas (Non-Admin / Petugas):</strong> Menu aksi admin (<strong>Hapus</strong> data, <strong>Lihat</strong> audit, dan <strong>Ubah Status</strong> verifikasi) hanya tampil pada saat login sebagai <strong>Administrator BP2RD</strong>.
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

      {/* Tab 1: TABEL POTENSI PAJAK */}
      {activeReportTab === 'potensi' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/60">
                  <th className="py-3.5 px-4">ID & Tanggal</th>
                  <th className="py-3.5 px-4">Nama Objek & Jenis</th>
                  <th className="py-3.5 px-4">Alamat & GPS</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Estimasi Potensi</th>
                  <th className="py-3.5 px-4">Skor Validasi</th>
                  <th className="py-3.5 px-4">Status Admin</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPotensi.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data potensi yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredPotensi.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-blue-300">
                        {item.id}
                        <p className="text-[10px] text-slate-400 font-sans">{item.tanggal}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white max-w-xs truncate">{item.namaObjek}</p>
                        <p className="text-[10px] text-slate-400">{item.namaWajibPajak}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="truncate max-w-xs text-slate-300">{item.alamat}</p>
                        <p className="text-[10px] text-teal-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{item.koordinatLat?.toFixed(4)}, {item.koordinatLng?.toFixed(4)}</span>
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${item.noWhatsapp.replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.noWhatsapp}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {formatRupiah(item.estimasiPotensiTahunan || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                          {item.skorKelayakan}% Otomatis
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            item.statusAdmin === 'Disetujui'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : item.statusAdmin === 'Diverifikasi'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : item.statusAdmin === 'Perlu Survey Lapangan'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                              : item.statusAdmin === 'Ditolak'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {item.statusAdmin}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPotensi(item);
                                setEditStatusValue(item.statusAdmin);
                                setEditCatatan(item.catatanPetugas || '');
                                setEditPetugas(item.petugasSurvey || '');
                              }}
                              className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs transition-all cursor-pointer"
                              title="Lihat Detail & Audit"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPotensi(item);
                                setEditStatusValue(item.statusAdmin);
                                setEditCatatan(item.catatanPetugas || '');
                                setEditPetugas(item.petugasSurvey || '');
                              }}
                              className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs transition-all cursor-pointer"
                              title="Ubah Status Verifikasi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'potensi', id: item.id, title: item.namaObjek })}
                              className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs transition-all cursor-pointer"
                              title="Hapus Data Potensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: TABEL PBB-P2 */}
      {activeReportTab === 'pbb' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/60">
                  <th className="py-3.5 px-4">ID & Tanggal</th>
                  <th className="py-3.5 px-4">Nama Wajib Pajak</th>
                  <th className="py-3.5 px-4">NIK (16 Digit)</th>
                  <th className="py-3.5 px-4">Status & NOP</th>
                  <th className="py-3.5 px-4">Lokasi Objek PBB</th>
                  <th className="py-3.5 px-4">Nominal Setor</th>
                  <th className="py-3.5 px-4">Status Verifikasi</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPbb.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data pembayaran PBB yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredPbb.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-emerald-300">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.namaWajibPajak}</td>
                      <td className="py-3 px-4 font-mono">{item.nik}</td>
                      <td className="py-3 px-4">
                        {item.statusNop === 'ada' ? (
                          <span className="font-mono text-xs text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            {item.nop}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                            Objek Baru (Belum Ada NOP)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="max-w-xs truncate">{item.lokasiObjek}</p>
                        <p className="text-[10px] text-slate-400">{item.kelurahanDesa}, {item.kecamatan}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {formatRupiah(item.nominalBayar || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {item.statusVerifikasi}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.buktiBayar ? (
                              <button
                                onClick={() => setSelectedPbb(item)}
                                className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs transition-all cursor-pointer"
                                title="Lihat Struk Pembayaran"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs" title="Tanpa Berkas Struk">
                                <Eye className="w-3.5 h-3.5 opacity-30" />
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPbbEdit(item);
                                setEditPbbStatus(item.statusVerifikasi);
                                setEditPbbCatatan(item.catatanVerifikasi || '');
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/30 text-xs transition-all cursor-pointer"
                              title="Ubah Status Verifikasi PBB"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'pbb', id: item.id, title: `PBB: ${item.namaWajibPajak}` })}
                              className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs transition-all cursor-pointer"
                              title="Hapus Data PBB"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: TABEL IKM */}
      {activeReportTab === 'ikm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/60">
                  <th className="py-3.5 px-4">ID & Tanggal</th>
                  <th className="py-3.5 px-4">Nama Responden</th>
                  <th className="py-3.5 px-4">Bidang Usaha / Alamat</th>
                  <th className="py-3.5 px-4 text-center">Skor Unsur (1-5)</th>
                  <th className="py-3.5 px-4 text-center">Nilai Konversi</th>
                  <th className="py-3.5 px-4">Mutu</th>
                  <th className="py-3.5 px-4">Saran & Masukan Wajib Pajak</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIkm.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada data survei IKM yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredIkm.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-amber-300">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.namaWajibPajak}</td>
                      <td className="py-3 px-4">
                        <p>{item.bidangUsaha}</p>
                        <p className="text-[10px] text-slate-400">{item.alamat}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span title="Kemudahan | Kecepatan | Kesopanan | Transparansi | Sarana">
                          {item.skorKemudahan}-{item.skorKecepatan}-{item.skorKesopanan}-{item.skorTransparansi}-{item.skorSarana}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-400">
                        {item.nilaiKonversi}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                          {item.kategoriMutu}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-sm italic text-slate-300">
                        &quot;{item.saranMasukan}&quot;
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedIkmDetail(item)}
                              className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-xs transition-all cursor-pointer"
                              title="Lihat Detail Responden IKM"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem({ type: 'ikm', id: item.id, title: `IKM: ${item.namaWajibPajak}` })}
                              className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 text-xs transition-all cursor-pointer"
                              title="Hapus Data IKM"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: GOOGLE SHEETS INTEGRATION HUB */}
      {activeReportTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Pusat Integrasi Google Sheets Real-Time
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Otomatis Sinkron
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Hubungkan form potensi, PBB-P2, dan survei IKM langsung dengan Google Spreadsheet milik kantor BP2RD tanpa perlu autentikasi berulang bagi warga pembayar pajak.
                </p>
              </div>
            </div>

            {/* Test Ping Status Box */}
            {testPingStatus && (
              <div className="mb-6 p-4 rounded-xl bg-slate-800/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{testPingStatus}</span>
                </span>
                <button
                  onClick={() => setTestPingStatus(null)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Tutup
                </button>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Apps Script Webhook URL
                  </label>
                  <input
                    type="url"
                    value={localSheetsConfig.webhookUrl}
                    onChange={(e) => setLocalSheetsConfig({ ...localSheetsConfig, webhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/xxxx/exec"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    URL deployment Web App Google Apps Script dari spreadsheet Anda
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={localSheetsConfig.spreadsheetId}
                    onChange={(e) => setLocalSheetsConfig({ ...localSheetsConfig, spreadsheetId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ID unik spreadsheet yang tertera di address bar browser
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tab Potensi Pajak
                  </label>
                  <input
                    type="text"
                    value={localSheetsConfig.sheetNamePotensi}
                    onChange={(e) => setLocalSheetsConfig({ ...localSheetsConfig, sheetNamePotensi: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tab Data PBB-P2
                  </label>
                  <input
                    type="text"
                    value={localSheetsConfig.sheetNamePbb}
                    onChange={(e) => setLocalSheetsConfig({ ...localSheetsConfig, sheetNamePbb: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tab Survei IKM
                  </label>
                  <input
                    type="text"
                    value={localSheetsConfig.sheetNameIkm}
                    onChange={(e) => setLocalSheetsConfig({ ...localSheetsConfig, sheetNameIkm: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition-all"
                >
                  Simpan Pengaturan
                </button>

                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={isTestingPing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isTestingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Test Kirim Baris Uji ke Google Sheet</span>
                </button>
              </div>
            </form>
          </div>

          {/* Apps Script Code Template Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Kode Google Apps Script Webhook (Siap Salin & Pasang)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cukup salin script ini ke Extensions &gt; Apps Script di Google Sheets Anda, lalu klik Deploy Web App.
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-all self-start sm:self-auto"
              >
                {copyCodeSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copyCodeSuccess ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72 border border-slate-800">
              {StorageService.getGoogleAppsScriptTemplate()}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Input Library Berkas Khusus Admin / Petugas */}
      {activeReportTab === 'input-library' && (
        <AdminInputLibraryBerkas
          currentUser={currentUser}
          libraryList={libraryList}
          onSaveEntry={onSaveLibraryEntry}
          onDeleteEntry={onDeleteLibraryEntry}
          onUpdateStatus={onUpdateLibraryStatus}
          onOpenLogin={onOpenLogin}
        />
      )}

      {/* Modal Detail & Verifikasi Potensi */}
      {selectedPotensi && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                    {selectedPotensi.id}
                  </span>
                  <span className="text-xs text-slate-400">Tanggal: {selectedPotensi.tanggal}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedPotensi.namaObjek}</h3>
              </div>
              <button
                onClick={() => setSelectedPotensi(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Objek Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Kategori Pajak:</span>
                <span className="font-semibold text-white">{selectedPotensi.kategoriObjek}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Wajib Pajak:</span>
                <span className="font-semibold text-white">{selectedPotensi.namaWajibPajak}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Kontak WhatsApp:</span>
                <a
                  href={`https://wa.me/${selectedPotensi.noWhatsapp.replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-400 flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedPotensi.noWhatsapp}</span>
                </a>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block mb-0.5">Estimasi Potensi:</span>
                <span className="font-bold text-emerald-400">
                  {formatRupiah(selectedPotensi.estimasiPotensiTahunan || 0)}
                </span>
              </div>
            </div>

            {/* Berkas & Dokumentasi Visual */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Berkas Terlampir & Geospasial
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DPA / ARKAS */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedPotensi.fileDpaArkas?.name || 'Dokumen DPA/ARKAS Terlampir'}
                    </p>
                    <p className="text-[10px] text-slate-400">Berkas Terverifikasi</p>
                  </div>
                </div>

                {/* Foto Objek */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                  {selectedPotensi.fileObjek?.dataUrl ? (
                    <img
                      src={selectedPotensi.fileObjek.dataUrl}
                      alt="Objek"
                      className="w-10 h-10 rounded object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">
                      {selectedPotensi.fileObjek?.name || 'Foto Fisik Objek'}
                    </p>
                    <p className="text-[10px] text-slate-400">Dokumentasi Lapangan</p>
                  </div>
                </div>
              </div>

              {/* Titik Koordinat */}
              {selectedPotensi.koordinatLat && selectedPotensi.koordinatLng && (
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>GPS: {selectedPotensi.koordinatLat}, {selectedPotensi.koordinatLng}</span>
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${selectedPotensi.koordinatLat},${selectedPotensi.koordinatLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Update Status Admin Form */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Ubah Status & Catatan Verifikasi Admin</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Verifikasi</label>
                  <select
                    value={editStatusValue}
                    onChange={(e) => setEditStatusValue(e.target.value as PotensiPajakEntry['statusAdmin'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-xs"
                  >
                    <option value="Menunggu Validasi">Menunggu Validasi</option>
                    <option value="Diverifikasi">Diverifikasi</option>
                    <option value="Perlu Survey Lapangan">Perlu Survey Lapangan</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Petugas Survey / NIP</label>
                  <input
                    type="text"
                    value={editPetugas}
                    onChange={(e) => setEditPetugas(e.target.value)}
                    placeholder="Nama Petugas Lapangan"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Catatan Verifikasi / Disposisi</label>
                <textarea
                  rows={2}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Tambahkan catatan tindak lanjut untuk tim lapangan atau Wajib Pajak..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPotensi(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalStatus}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail PBB */}
      {selectedPbb && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Bukti Pembayaran PBB-P2</h3>
              <button
                onClick={() => setSelectedPbb(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Wajib Pajak:</strong> {selectedPbb.namaWajibPajak}</p>
              <p><strong>NIK:</strong> {selectedPbb.nik}</p>
              <p><strong>NOP:</strong> {selectedPbb.nop || 'Pendaftaran Objek Baru'}</p>
              <p><strong>Lokasi:</strong> {selectedPbb.lokasiObjek}</p>
              <p><strong>Nominal:</strong> {formatRupiah(selectedPbb.nominalBayar || 0)}</p>
            </div>

            {selectedPbb.buktiBayar?.dataUrl ? (
              <img
                src={selectedPbb.buktiBayar.dataUrl}
                alt="Struk Bayar"
                className="w-full max-h-64 object-contain rounded-xl border border-slate-700 bg-slate-950"
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-800 text-center text-xs text-slate-400">
                Berkas bukti bayar PDF / Gambar: {selectedPbb.buktiBayar?.name}
              </div>
            )}

            <button
              onClick={() => setSelectedPbb(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Edit Status Verifikasi PBB (Khusus Admin) */}
      {selectedPbbEdit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Verifikasi Pembayaran PBB-P2</h3>
              </div>
              <button
                onClick={() => setSelectedPbbEdit(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <p><span className="text-slate-400">ID Setor:</span> <strong className="text-emerald-300 font-mono">{selectedPbbEdit.id}</strong></p>
              <p><span className="text-slate-400">Wajib Pajak:</span> <strong className="text-white">{selectedPbbEdit.namaWajibPajak}</strong></p>
              <p><span className="text-slate-400">Nominal:</span> <strong className="text-emerald-400">{formatRupiah(selectedPbbEdit.nominalBayar || 0)}</strong></p>
              <p><span className="text-slate-400">NOP:</span> <strong className="text-slate-200 font-mono">{selectedPbbEdit.nop || 'Pendaftaran Objek Baru'}</strong></p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ubah Status Verifikasi Admin
                </label>
                <select
                  value={editPbbStatus}
                  onChange={(e) => setEditPbbStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Lunas & Sah">Lunas &amp; Sah</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Data Tidak Sesuai">Data Tidak Sesuai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Catatan Verifikasi / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={editPbbCatatan}
                  onChange={(e) => setEditPbbCatatan(e.target.value)}
                  placeholder="Tambahkan catatan audit atau bukti rekonsiliasi kas daerah..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPbbEdit(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePbbStatus}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
              >
                Simpan Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Survei IKM */}
      {selectedIkmDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Detail Evaluasi &amp; Mutu IKM</h3>
              </div>
              <button
                onClick={() => setSelectedIkmDetail(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <span className="text-slate-400 block">Responden:</span>
                  <span className="font-bold text-white">{selectedIkmDetail.namaWajibPajak}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bidang Usaha:</span>
                  <span className="font-semibold text-slate-200">{selectedIkmDetail.bidangUsaha || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Alamat / Lokasi:</span>
                  <span className="text-slate-300">{selectedIkmDetail.alamat}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-300 mb-2">Penilaian 5 Unsur Pelayanan (Skala 1 - 5):</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Prosedur</p>
                    <p className="text-base font-bold text-amber-300">{selectedIkmDetail.skorKemudahan}</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Kecepatan</p>
                    <p className="text-base font-bold text-amber-300">{selectedIkmDetail.skorKecepatan}</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Kesopanan</p>
                    <p className="text-base font-bold text-amber-300">{selectedIkmDetail.skorKesopanan}</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Transparansi</p>
                    <p className="text-base font-bold text-amber-300">{selectedIkmDetail.skorTransparansi}</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Fasilitas</p>
                    <p className="text-base font-bold text-amber-300">{selectedIkmDetail.skorSarana}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Mutu Pelayanan:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                    {selectedIkmDetail.kategoriMutu} (Nilai: {selectedIkmDetail.nilaiKonversi})
                  </span>
                </div>
                <p className="text-slate-300 italic mt-2">
                  &quot;{selectedIkmDetail.saranMasukan}&quot;
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedIkmDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Data (Khusus Admin) */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Data (Aksi Admin)</h3>
                <p className="text-[11px] text-slate-400">Tindakan ini permanen dan akan disinkronkan ke sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200">
              <p>Apakah Anda yakin ingin menghapus data berikut dari sistem?</p>
              <p className="mt-1 font-bold text-white font-mono">{deleteConfirmItem.title}</p>
              <p className="text-[10px] text-slate-400 mt-1">ID: {deleteConfirmItem.id} • Kategori: {deleteConfirmItem.type.toUpperCase()}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
              >
                Ya, Hapus Data Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
