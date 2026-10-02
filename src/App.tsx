import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { FormPotensi } from './components/FormPotensi';
import { FormPbbP2 } from './components/FormPbbP2';
import { FormIkm } from './components/FormIkm';
import { AdminDashboard } from './components/AdminDashboard';
import { RealtimeReportsManager } from './components/RealtimeReportsManager';
import { DocumentLibrary } from './components/DocumentLibrary';
import { LoginModal } from './components/LoginModal';
import { GoogleDriveSheetsHub } from './components/GoogleDriveSheetsHub';
import { StorageService } from './services/storage';
import { syncEntryToFirestore, auth, logoutGoogle, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PotensiPajakEntry, PbbP2Entry, IkmEntry, AppUser, GoogleSheetsConfig } from './types';
import { CheckCircle2, FileSpreadsheet, Building2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'potensi' | 'pbb' | 'ikm' | 'dashboard' | 'laporan' | 'library'>('beranda');
  
  // Data States
  const [potensiList, setPotensiList] = useState<PotensiPajakEntry[]>([]);
  const [pbbList, setPbbList] = useState<PbbP2Entry[]>([]);
  const [ikmList, setIkmList] = useState<IkmEntry[]>([]);
  
  // Config & User States
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(StorageService.getSheetsConfig());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGoogleHubOpen, setIsGoogleHubOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Initial Data & Sync with Firebase Auth
  useEffect(() => {
    setPotensiList(StorageService.getPotensiList());
    setPbbList(StorageService.getPbbList());
    setIkmList(StorageService.getIkmList());
    setCurrentUser(StorageService.getCurrentUser());
    setSheetsConfig(StorageService.getSheetsConfig());

    // Listen to Firebase Auth state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          const isSuperAdmin = user.email === 'rija.bp2rd@gmail.com';
          const role = isSuperAdmin ? 'admin' : (snap.exists() ? snap.data().role : (user.email?.includes('admin') ? 'admin' : 'petugas'));
          
          const appUser: AppUser = {
            id: user.uid,
            email: user.email || 'petugas@bp2rd.go.id',
            nama: (snap.exists() && snap.data().nama) || user.displayName || 'Petugas BP2RD',
            role,
            nip: (snap.exists() && snap.data().nip) || (role === 'admin' ? '198005122005011003' : '198709142010011002'),
            jabatan: (snap.exists() && snap.data().jabatan) || (role === 'admin' ? 'Kepala Bidang Pendataan & Penetapan' : 'Petugas Uji Petik Lapangan'),
            unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
          };
          StorageService.setCurrentUser(appUser);
          setCurrentUser(appUser);
        } catch (err) {
          console.warn('Firebase user sync note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Form Submissions with Dual Firestore & Google Sheets Sync
  const handlePotensiSubmit = async (entry: PotensiPajakEntry) => {
    const saved = StorageService.savePotensiEntry(entry);
    setPotensiList(StorageService.getPotensiList());
    setSheetsConfig(StorageService.getSheetsConfig());
    await syncEntryToFirestore('potensi_pajak', saved);
    showToast(`Data potensi "${saved.namaObjek}" berhasil dikirim dan tersinkron ke Google Sheets & Firestore!`);
  };

  const handlePbbSubmit = async (entry: PbbP2Entry) => {
    const saved = StorageService.savePbbEntry(entry);
    setPbbList(StorageService.getPbbList());
    setSheetsConfig(StorageService.getSheetsConfig());
    await syncEntryToFirestore('pbb_p2', saved);
    showToast(`Bukti setor PBB-P2 a.n. "${saved.namaWajibPajak}" berhasil dikonfirmasi ke Firestore!`);
  };

  const handleIkmSubmit = async (entry: IkmEntry) => {
    const saved = StorageService.saveIkmEntry(entry);
    setIkmList(StorageService.getIkmList());
    setSheetsConfig(StorageService.getSheetsConfig());
    await syncEntryToFirestore('survei_ikm', saved);
    showToast(`Terima kasih! Survei kepuasan Anda tersimpan di Firestore dengan skor ${saved.nilaiKonversi}.`);
  };

  // Status updates
  const handleUpdatePotensiStatus = (
    id: string,
    status: PotensiPajakEntry['statusAdmin'],
    catatan?: string,
    petugas?: string
  ) => {
    StorageService.updatePotensiStatus(id, status, catatan, petugas);
    setPotensiList(StorageService.getPotensiList());
    showToast(`Status objek ${id} diperbarui menjadi: ${status}`);
  };

  const handleUpdatePbbStatus = (
    id: string,
    status: PbbP2Entry['statusVerifikasi'],
    catatan?: string
  ) => {
    StorageService.updatePbbStatus(id, status, catatan);
    setPbbList(StorageService.getPbbList());
    showToast(`Status verifikasi PBB ${id} diperbarui.`);
  };

  // User Auth Handlers
  const handleLoginSuccess = (user: AppUser) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Selamat datang, ${user.nama} (${user.role === 'admin' ? 'Administrator' : 'Petugas Lapangan'})!`);
  };

  const handleLogout = async () => {
    await logoutGoogle();
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    showToast('Anda telah keluar dari sesi.');
  };

  const handleSaveSheetsConfig = (cfg: GoogleSheetsConfig) => {
    StorageService.saveSheetsConfig(cfg);
    setSheetsConfig(cfg);
    showToast('Pengaturan Google Sheets berhasil disimpan!');
  };

  // Stats calculation for Landing Hero
  const totalPotensiRupiah = potensiList.reduce((acc, curr) => acc + (curr.estimasiPotensiTahunan || 0), 0);
  const avgIkmScore = ikmList.length > 0 
    ? ikmList.reduce((acc, curr) => acc + curr.nilaiKonversi, 0) / ikmList.length 
    : 88.0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fade-in max-w-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Notifikasi Sistem</p>
            <p className="text-emerald-200/90 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Navbar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        sheetsConfig={sheetsConfig}
        onOpenSheetsHub={() => setActiveTab('laporan')}
        onOpenGoogleWorkspace={() => setIsGoogleHubOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'beranda' && (
          <LandingHero
            onSelectTab={(tab) => setActiveTab(tab)}
            stats={{
              totalPotensiRupiah,
              totalPotensiCount: potensiList.length,
              totalPbbCount: pbbList.length,
              avgIkmScore,
            }}
          />
        )}

        {activeTab === 'potensi' && (
          <FormPotensi
            onSubmit={handlePotensiSubmit}
            onBackToHome={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'pbb' && (
          <FormPbbP2
            onSubmit={handlePbbSubmit}
            onBackToHome={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'ikm' && (
          <FormIkm
            onSubmit={handleIkmSubmit}
            onBackToHome={() => setActiveTab('beranda')}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            potensiList={potensiList}
            pbbList={pbbList}
            ikmList={ikmList}
            onOpenReports={() => setActiveTab('laporan')}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'laporan' && (
          <RealtimeReportsManager
            potensiList={potensiList}
            pbbList={pbbList}
            ikmList={ikmList}
            onUpdatePotensiStatus={handleUpdatePotensiStatus}
            onUpdatePbbStatus={handleUpdatePbbStatus}
            sheetsConfig={sheetsConfig}
            onSaveSheetsConfig={handleSaveSheetsConfig}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'library' && (
          <DocumentLibrary
            potensiList={potensiList}
            pbbList={pbbList}
            onBackToHome={() => setActiveTab('beranda')}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">SIPOTENSI - Portal Penggalian Potensi Pajak Daerah</p>
              <p className="text-[11px] text-slate-400">
                Badan Pengelola Pajak dan Retribusi Daerah (BP2RD / BAPENDA) • Pemerintah Daerah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets Integration Live</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>Hak Cipta © 2026 BP2RD</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Google Drive, Sheets & Firebase Hub Modal */}
      {isGoogleHubOpen && (
        <GoogleDriveSheetsHub
          potensiList={potensiList}
          pbbList={pbbList}
          ikmList={ikmList}
          sheetsConfig={sheetsConfig}
          onUpdateSheetsConfig={handleSaveSheetsConfig}
          onClose={() => setIsGoogleHubOpen(false)}
        />
      )}
    </div>
  );
}
