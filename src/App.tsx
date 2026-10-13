import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { DocumentLibrary } from './components/DocumentLibrary';
import { RealtimeReportsManager } from './components/RealtimeReportsManager';
import { PotensiPajakForm } from './components/PotensiPajakForm';
import { PbbP2Form } from './components/PbbP2Form';
import { RetribusiDaerahForm } from './components/RetribusiDaerahForm';
import { PetaGeospasialHsu } from './components/PetaGeospasialHsu';
import { AdminInputLibraryBerkas } from './components/AdminInputLibraryBerkas';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LoginModal } from './components/LoginModal';
import { 
  PotensiPajakEntry, 
  PbbP2Entry, 
  RetribusiDaerahEntry,
  LibraryBerkasEntry, 
  AppUser, 
  LibraryCategory,
  VerificationStatus 
} from './types';
import { 
  loadPotensiList, 
  savePotensiList, 
  loadPbbList, 
  savePbbList, 
  loadRetribusiList,
  saveRetribusiList,
  loadLibraryList, 
  saveLibraryList, 
  loadCurrentUser, 
  saveCurrentUser,
  DEFAULT_USERS
} from './services/storage';
import { 
  testFirestoreConnection, 
  logoutGoogle, 
  subscribeToAuth, 
  syncEntryToFirestore,
  deleteEntryFromFirestore
} from './services/firebase';
import { ShieldCheck, LogIn, ArrowLeft } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [potensiList, setPotensiList] = useState<PotensiPajakEntry[]>([]);
  const [pbbList, setPbbList] = useState<PbbP2Entry[]>([]);
  const [retribusiList, setRetribusiList] = useState<RetribusiDaerahEntry[]>([]);
  const [libraryList, setLibraryList] = useState<LibraryBerkasEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<'all' | LibraryCategory>('all');

  // Load initial data and connect with Firebase
  useEffect(() => {
    setPotensiList(loadPotensiList());
    setPbbList(loadPbbList());
    setRetribusiList(loadRetribusiList());
    setLibraryList(loadLibraryList());
    
    // Default logged in as admin for ease of testing government features
    const user = loadCurrentUser() || DEFAULT_USERS[0];
    setCurrentUser(user);
    saveCurrentUser(user);

    // Test Firestore Connection on Boot (Requirement from skill)
    testFirestoreConnection().then((connected) => {
      if (connected) {
        console.log('SIPOTENSI HSU: Terhubung ke Firebase Firestore & Auth');
      }
    });

    // Real-time auth listener
    const unsubscribeAuth = subscribeToAuth((appUser) => {
      if (appUser) {
        setCurrentUser(appUser);
        saveCurrentUser(appUser);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    showToast(`Berhasil login ke Firebase sebagai ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
    } catch (e) {
      console.warn('Logout Firebase error:', e);
    }
    setCurrentUser(null);
    saveCurrentUser(null);
    if (activeTab === 'laporan' || activeTab === 'analitik') {
      setActiveTab('beranda');
    }
    showToast('Anda telah logout dari mode aparatur internal');
  };

  // Status Verifikasi Update Handler for Potensi Pajak
  const handleUpdatePotensiStatus = async (
    id: string, 
    newStatus: VerificationStatus, 
    note?: string
  ) => {
    const updated = potensiList.map(p => {
      if (p.id === id) {
        const updatedEntry: PotensiPajakEntry = {
          ...p,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Rija, S.STP, M.IP (BP2RD HSU)',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (
            newStatus === 'Setuju' 
              ? 'Hasil inputan potensi telah diverifikasi sah dan disetujui masuk ketetapan fiskal.' 
              : newStatus === 'Verifikasi' 
              ? 'Sedang dalam verifikasi data lapangan dan kelengkapan berkas.' 
              : 'Menunggu verifikasi lebih lanjut.'
          ),
          updatedAt: new Date().toISOString(),
        };
        // Sync to Firestore
        syncEntryToFirestore('potensi_pajak', updatedEntry);
        return updatedEntry;
      }
      return p;
    });

    setPotensiList(updated);
    savePotensiList(updated);
    showToast(`Status potensi berhasil diubah menjadi: "${newStatus}"`);
  };

  // Status Verifikasi Update Handler for PBB-P2
  const handleUpdatePbbStatus = async (
    id: string, 
    newStatus: VerificationStatus, 
    note?: string
  ) => {
    const updated = pbbList.map(p => {
      if (p.id === id) {
        const updatedEntry: PbbP2Entry = {
          ...p,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Aparatur BP2RD HSU',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (
            newStatus === 'Setuju' 
              ? 'Data SPPT dan ketetapan PBB-P2 telah diverifikasi dan disetujui.' 
              : newStatus === 'Verifikasi' 
              ? 'Sedang dalam penelaahan bukti setoran dan data persil.' 
              : 'Menunggu verifikasi.'
          ),
          updatedAt: new Date().toISOString(),
        };
        // Sync to Firestore
        syncEntryToFirestore('pbb_p2', updatedEntry);
        return updatedEntry;
      }
      return p;
    });

    setPbbList(updated);
    savePbbList(updated);
    showToast(`Status PBB-P2 berhasil diubah menjadi: "${newStatus}"`);
  };

  // Delete Handlers for Potensi Pajak and PBB-P2
  const handleDeletePotensi = async (id: string) => {
    const updated = potensiList.filter(p => p.id !== id);
    setPotensiList(updated);
    savePotensiList(updated);
    try {
      await deleteEntryFromFirestore('potensi_pajak', id);
    } catch (err) {
      console.warn('Delete potensi firestore note:', err);
    }
    showToast('Data potensi pajak berhasil dihapus.');
  };

  const handleDeletePbb = async (id: string) => {
    const updated = pbbList.filter(p => p.id !== id);
    setPbbList(updated);
    savePbbList(updated);
    try {
      await deleteEntryFromFirestore('pbb_p2', id);
    } catch (err) {
      console.warn('Delete PBB firestore note:', err);
    }
    showToast('Data ketetapan PBB-P2 berhasil dihapus.');
  };

  const handleDeleteRetribusi = async (id: string) => {
    const updated = retribusiList.filter(r => r.id !== id);
    setRetribusiList(updated);
    saveRetribusiList(updated);
    try {
      await deleteEntryFromFirestore('retribusi_daerah', id);
    } catch (err) {
      console.warn('Delete retribusi firestore note:', err);
    }
    showToast('Data potensi retribusi daerah berhasil dihapus.');
  };

  const handleUpdateRetribusiStatus = async (
    id: string,
    newStatus: VerificationStatus,
    note?: string
  ) => {
    const updated = retribusiList.map(r => {
      if (r.id === id) {
        const updatedEntry: RetribusiDaerahEntry = {
          ...r,
          statusVerifikasi: newStatus,
          verifiedBy: currentUser?.name || 'Aparatur BP2RD HSU',
          verifiedAt: new Date().toISOString(),
          catatanVerifikasi: note || (
            newStatus === 'Setuju'
              ? 'Potensi retribusi daerah telah diverifikasi dan disetujui.'
              : newStatus === 'Verifikasi'
              ? 'Sedang dalam verifikasi data lapangan.'
              : 'Menunggu verifikasi.'
          ),
          updatedAt: new Date().toISOString(),
        };
        syncEntryToFirestore('retribusi_daerah', updatedEntry);
        return updatedEntry;
      }
      return r;
    });
    setRetribusiList(updated);
    saveRetribusiList(updated);
    showToast(`Status retribusi berhasil diubah menjadi: "${newStatus}"`);
  };

  const handleSavePotensi = (newEntry: PotensiPajakEntry) => {
    const updated = [newEntry, ...potensiList];
    setPotensiList(updated);
    savePotensiList(updated);
    syncEntryToFirestore('potensi_pajak', newEntry);

    // Otomatis sinkronkan file DPA/ARKAS dan Foto Objek PJRD ke Library Berkas (Kategori Internal)
    const newLibraryEntries: LibraryBerkasEntry[] = [];

    if (newEntry.dpaFileName && newEntry.dpaFileUrl) {
      newLibraryEntries.push({
        id: `lib-dpa-${Date.now()}`,
        title: `DPA / ARKAS: ${newEntry.namaUsaha} (${newEntry.jenisPajak})`,
        category: 'dpa',
        categoryLabel: 'DPA / ARKAS Internal',
        nomorBerkas: `DPA/POT/${newEntry.nomorFormulir.slice(-7)}`,
        description: `Dokumen anggaran dan kertas kerja survei potensi pajak ${newEntry.namaUsaha}, ${newEntry.kecamatan}.`,
        fileName: newEntry.dpaFileName,
        fileSize: 'DPA Valid',
        fileType: 'pdf',
        fileUrl: newEntry.dpaFileUrl,
        isPublic: false,
        uploadedBy: newEntry.petugasPendata,
        uploadedRole: currentUser?.role || 'user',
        tanggalUpload: newEntry.tanggalPendataan,
        statusVerifikasi: 'Aktif',
        tags: ['DPA', 'ARKAS', newEntry.kecamatan, 'Survei'],
      });
    }

    if (newEntry.fotoObjekName && newEntry.fotoObjekUrl) {
      newLibraryEntries.push({
        id: `lib-obj-${Date.now() + 1}`,
        title: `Foto Fisik Objek PJRD: ${newEntry.namaUsaha}`,
        category: 'objek',
        categoryLabel: 'Foto Objek Pajak',
        nomorBerkas: `DOK-OBJ/${newEntry.nomorFormulir.slice(-7)}`,
        description: `Dokumentasi visual fisik lokasi usaha & reklame ${newEntry.namaUsaha} di ${newEntry.alamatLengkap}, ${newEntry.kecamatan}. Koordinat: (${newEntry.latitude.toFixed(6)}, ${newEntry.longitude.toFixed(6)}).`,
        fileName: newEntry.fotoObjekName,
        fileSize: 'Foto Lapangan',
        fileType: 'image',
        fileUrl: newEntry.fotoObjekUrl,
        isPublic: false,
        uploadedBy: newEntry.petugasPendata,
        uploadedRole: currentUser?.role || 'user',
        tanggalUpload: newEntry.tanggalPendataan,
        statusVerifikasi: 'Aktif',
        tags: ['Foto Objek', 'PJRD', newEntry.kecamatan, 'Kamera Lapangan'],
      });
    }

    if (newLibraryEntries.length > 0) {
      const updatedLib = [...newLibraryEntries, ...libraryList];
      setLibraryList(updatedLib);
      saveLibraryList(updatedLib);
    }

    showToast(`Data potensi ${newEntry.namaUsaha} berhasil disimpan & disinkronkan ke Firebase!`);
    setActiveTab('laporan');
  };

  const handleSavePbb = (newEntry: PbbP2Entry) => {
    const updated = [newEntry, ...pbbList];
    setPbbList(updated);
    savePbbList(updated);
    syncEntryToFirestore('pbb_p2', newEntry);

    // Otomatis sinkronkan Foto Objek Pajak dan Struk Bayar ke Library Berkas (Kategori Internal)
    const newLibraryEntries: LibraryBerkasEntry[] = [];

    if (newEntry.fotoObjekPbbName && newEntry.fotoObjekPbbUrl) {
      newLibraryEntries.push({
        id: `lib-pbb-obj-${Date.now()}`,
        title: `Foto Objek Tanah/Bangunan SPPT NOP: ${newEntry.nop}`,
        category: 'objek',
        categoryLabel: 'Foto Objek Pajak',
        nomorBerkas: `FOTO-PBB/${newEntry.nop.slice(-6)}`,
        description: `Dokumentasi persil tanah & bangunan Wajib Pajak ${newEntry.namaWajibPajak}, luas bumi ${newEntry.luasBumiM2} m2, bangunan ${newEntry.luasBangunanM2} m2 di ${newEntry.kecamatan}.`,
        fileName: newEntry.fotoObjekPbbName,
        fileSize: 'Foto Persil',
        fileType: 'image',
        fileUrl: newEntry.fotoObjekPbbUrl,
        isPublic: false,
        uploadedBy: newEntry.petugasValidasi,
        uploadedRole: currentUser?.role || 'user',
        tanggalUpload: new Date().toISOString().split('T')[0],
        statusVerifikasi: 'Aktif',
        tags: ['Foto Objek', 'PBB-P2', newEntry.kecamatan],
      });
    }

    if (newEntry.strukBayarUrl) {
      newLibraryEntries.push({
        id: `lib-struk-${Date.now() + 1}`,
        title: `Struk Pembayaran PBB NOP: ${newEntry.nop}`,
        category: 'pbb',
        categoryLabel: 'Struk Bayar PBB-P2',
        nomorBerkas: newEntry.nomorStruk || `STRUK-PBB/${newEntry.nop.slice(-6)}`,
        description: `Bukti bayar lunas PBB-P2 ${newEntry.namaWajibPajak} di ${newEntry.bankTempatBayar || 'Bank Persepsi'}.`,
        fileName: 'Struk_Bayar_PBB.pdf',
        fileSize: 'Struk Sah',
        fileType: 'pdf',
        fileUrl: newEntry.strukBayarUrl,
        isPublic: false,
        uploadedBy: newEntry.petugasValidasi,
        uploadedRole: currentUser?.role || 'user',
        tanggalUpload: newEntry.tanggalBayar || new Date().toISOString().split('T')[0],
        statusVerifikasi: 'Aktif',
        tags: ['Struk PBB', 'Lunas', 'Bank'],
      });
    }

    if (newLibraryEntries.length > 0) {
      const updatedLib = [...newLibraryEntries, ...libraryList];
      setLibraryList(updatedLib);
      saveLibraryList(updatedLib);
    }

    showToast(`Data SPPT NOP ${newEntry.nop} berhasil disimpan & disinkronkan ke Firebase!`);
    setActiveTab('laporan');
  };

  const handleSaveRetribusi = (newEntry: RetribusiDaerahEntry) => {
    const updated = [newEntry, ...retribusiList];
    setRetribusiList(updated);
    saveRetribusiList(updated);
    syncEntryToFirestore('retribusi_daerah', newEntry);

    // Jika ada foto objek retribusi, sinkronkan juga ke Library Berkas (Kategori Internal)
    if (newEntry.fotoObjekRetribusiName && newEntry.fotoObjekRetribusiUrl) {
      const newLibraryEntry: LibraryBerkasEntry = {
        id: `lib-ret-${Date.now()}`,
        title: `Foto Objek Retribusi: ${newEntry.subObjekRetribusi} (${newEntry.subRekening})`,
        category: 'objek',
        categoryLabel: 'Foto Objek Retribusi',
        nomorBerkas: `DOK-RET/${newEntry.nomorRegister.slice(-7)}`,
        description: `Dokumentasi visual fisik ${newEntry.subObjekRetribusi} di ${newEntry.alamatLengkap}, ${newEntry.kecamatan}. Koordinat: (${newEntry.latitude.toFixed(6)}, ${newEntry.longitude.toFixed(6)}).`,
        fileName: newEntry.fotoObjekRetribusiName,
        fileSize: 'Foto Lapangan',
        fileType: 'image',
        fileUrl: newEntry.fotoObjekRetribusiUrl,
        isPublic: false,
        uploadedBy: newEntry.petugasPendata,
        uploadedRole: currentUser?.role || 'user',
        tanggalUpload: newEntry.tanggalPendataan,
        statusVerifikasi: 'Aktif',
        tags: ['Retribusi', newEntry.subRekening, newEntry.kecamatan],
      };
      const updatedLib = [newLibraryEntry, ...libraryList];
      setLibraryList(updatedLib);
      saveLibraryList(updatedLib);
    }

    showToast(`Potensi retribusi "${newEntry.subObjekRetribusi}" berhasil disimpan & disinkronkan ke Firebase!`);
    setActiveTab('laporan');
  };

  const handleSaveLibrary = (newEntry: LibraryBerkasEntry) => {
    const updated = [newEntry, ...libraryList];
    setLibraryList(updated);
    saveLibraryList(updated);
    showToast(`Berkas ${newEntry.nomorBerkas} berhasil ditambahkan ke Library!`);
    setActiveTab('library');
  };

  const handleDeleteLibrary = (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berkas ini dari repositori?')) return;
    const updated = libraryList.filter(item => item.id !== id);
    setLibraryList(updated);
    saveLibraryList(updated);
    showToast('Berkas berhasil dihapus');
  };

  const handleOpenLibraryWithCategory = (cat: 'all' | LibraryCategory) => {
    setLibraryCategoryFilter(cat);
    setActiveTab('library');
  };

  // Calculations for stats
  const totalPotensiRupiah = potensiList.reduce((acc, curr) => acc + (curr.potensiRupiahTahunan || 0), 0);
  const totalPbbLunasRupiah = pbbList
    .filter(p => p.statusPembayaran === 'LUNAS')
    .reduce((acc, curr) => acc + (curr.pbbTerhutang || 0), 0);

  // Check if current user has authorized access to internal management tabs
  const isInternalUser = currentUser !== null && (currentUser.role === 'admin' || currentUser.role === 'user');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'library') setLibraryCategoryFilter('all');
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        potensiCount={potensiList.length}
        pbbCount={pbbList.length}
        retribusiCount={retribusiList.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'beranda' && (
          <LandingHero
            onSelectTab={(tab) => {
              if (tab === 'library') setLibraryCategoryFilter('all');
              setActiveTab(tab);
            }}
            onOpenLibraryCategory={handleOpenLibraryWithCategory}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            stats={{
              totalPotensiRupiah,
              totalPotensiCount: potensiList.length,
              totalPbbCount: pbbList.length,
              totalPbbLunasRupiah,
            }}
          />
        )}

        {activeTab === 'peta' && (
          <PetaGeospasialHsu
            potensiList={potensiList}
            pbbList={pbbList}
            currentUser={currentUser}
            onNavigateToForm={(type) => setActiveTab(type)}
          />
        )}

        {activeTab === 'potensi' && (
          <PotensiPajakForm
            currentUser={currentUser}
            potensiList={potensiList}
            onSave={handleSavePotensi}
            onCancel={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'pbb' && (
          <PbbP2Form
            currentUser={currentUser}
            pbbList={pbbList}
            onSave={handleSavePbb}
            onCancel={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'retribusi' && (
          <RetribusiDaerahForm
            currentUser={currentUser}
            retribusiList={retribusiList}
            onSave={handleSaveRetribusi}
            onCancel={() => setActiveTab('beranda')}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onUpdateRetribusiStatus={handleUpdateRetribusiStatus}
            onDeleteRetribusi={handleDeleteRetribusi}
          />
        )}

        {activeTab === 'library' && (
          <DocumentLibrary
            potensiList={potensiList}
            pbbList={pbbList}
            libraryList={libraryList}
            currentUser={currentUser}
            initialCategory={libraryCategoryFilter}
            onBackToHome={() => setActiveTab('beranda')}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenInputLibrary={() => setActiveTab('input-library')}
            onDeleteEntry={handleDeleteLibrary}
          />
        )}

        {activeTab === 'input-library' && (
          <AdminInputLibraryBerkas
            currentUser={currentUser}
            onSave={handleSaveLibrary}
            onCancel={() => setActiveTab('library')}
          />
        )}

        {/* Tab Manajemen Laporan (Hanya tampil & dapat diakses pada login admin dan user) */}
        {activeTab === 'laporan' && (
          isInternalUser ? (
            <RealtimeReportsManager
              potensiList={potensiList}
              pbbList={pbbList}
              retribusiList={retribusiList}
              currentUser={currentUser}
              onUpdatePotensiStatus={handleUpdatePotensiStatus}
              onUpdatePbbStatus={handleUpdatePbbStatus}
              onUpdateRetribusiStatus={handleUpdateRetribusiStatus}
              onDeletePotensi={handleDeletePotensi}
              onDeletePbb={handleDeletePbb}
              onDeleteRetribusi={handleDeleteRetribusi}
            />
          ) : (
            <div className="max-w-xl mx-auto my-20 p-8 bg-slate-900 border border-amber-500/40 rounded-3xl text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Akses Terbatas: Login Admin / User Diperlukan
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Menu <strong>Manajemen Laporan</strong> dan verifikasi hasil inputan hanya dapat diakses oleh Administrator dan Petugas (User) BP2RD Kabupaten Hulu Sungai Utara yang terautentikasi melalui Firebase.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login Admin / User Sekarang</span>
                </button>
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Beranda</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Tab Dashboard Analitik (Hanya tampil & dapat diakses pada login admin dan user) */}
        {activeTab === 'analitik' && (
          isInternalUser ? (
            <AnalyticsDashboard
              potensiList={potensiList}
              pbbList={pbbList}
              libraryList={libraryList}
              currentUser={currentUser}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : (
            <div className="max-w-xl mx-auto my-20 p-8 bg-slate-900 border border-amber-500/40 rounded-3xl text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Akses Terbatas: Login Admin / User Diperlukan
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Menu <strong>Dashboard Analitik</strong> hanya dapat diakses oleh Administrator dan Petugas (User) BP2RD Kabupaten Hulu Sungai Utara yang terautentikasi melalui Firebase.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login Admin / User Sekarang</span>
                </button>
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Beranda</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SIPOTENSI BP2RD</span>
            <span>&bull;</span>
            <span>Pemerintah Kabupaten Hulu Sungai Utara</span>
            <span>&bull;</span>
            <span>Amuntai - Kalimantan Selatan</span>
          </div>
          <div>
            <span>Sistem Informasi Potensi Fiskal &bull; GPS Geospasial Presisi HSU 2026</span>
          </div>
        </div>
      </footer>

      {/* Login Modal Connected to Firebase */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

    </div>
  );
}
export default App;

