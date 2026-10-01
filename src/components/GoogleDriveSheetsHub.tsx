import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FolderPlus, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  UploadCloud, 
  Database, 
  HardDrive, 
  Search, 
  Check, 
  Lock, 
  LogIn, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { 
  auth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  testFirestoreConnection,
  syncEntryToFirestore
} from '../services/firebase';
import { GoogleWorkspaceService, DriveFileItem } from '../services/googleWorkspace';
import { PotensiPajakEntry, PbbP2Entry, IkmEntry, GoogleSheetsConfig } from '../types';

interface GoogleDriveSheetsHubProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  ikmList: IkmEntry[];
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSheetsConfig: (cfg: GoogleSheetsConfig) => void;
  onClose: () => void;
}

export const GoogleDriveSheetsHub: React.FC<GoogleDriveSheetsHubProps> = ({
  potensiList,
  pbbList,
  ikmList,
  sheetsConfig,
  onUpdateSheetsConfig,
  onClose,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [newSheetTitle, setNewSheetTitle] = useState('SIPOTENSI BP2RD Database 2026');
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection().then((ok) => {
      setFirestoreStatus(ok ? 'connected' : 'error');
    });

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setGoogleUser(user);
      if (user) {
        loadDriveFiles();
      }
    });
    return () => unsubscribe();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showFeedback(`Berhasil login Google Workspace sebagai ${res.user.displayName || res.user.email}!`);
        await loadDriveFiles();
      }
    } catch (err: any) {
      console.error(err);
      showFeedback(err.message || 'Gagal login dengan Google', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setDriveFiles([]);
    showFeedback('Berhasil keluar dari akun Google.', 'info');
  };

  const loadDriveFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await GoogleWorkspaceService.listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Load Drive Files warning:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setIsCreatingSheet(true);
    try {
      const res = await GoogleWorkspaceService.createSpreadsheetInDrive(newSheetTitle);
      onUpdateSheetsConfig({
        ...sheetsConfig,
        spreadsheetId: res.id,
        isConnected: true,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
        syncCount: sheetsConfig.syncCount + 1,
      });

      showFeedback(`Spreadsheet baru berhasil dibuat di Google Drive Anda! ID: ${res.id}`);
      await loadDriveFiles();

      // Open new sheet in new tab
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      showFeedback(err.message || 'Gagal membuat Google Spreadsheet', 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handlePushAllDataToSheet = async () => {
    if (!sheetsConfig.spreadsheetId) {
      showFeedback('Pilih atau buat Google Spreadsheet terlebih dahulu.', 'error');
      return;
    }

    setIsSyncingData(true);
    try {
      await GoogleWorkspaceService.syncAllToConnectedSheet(sheetsConfig.spreadsheetId, {
        potensi: potensiList,
        pbb: pbbList,
        ikm: ikmList,
      });

      // Also sync to Firestore in background
      for (const p of potensiList) {
        await syncEntryToFirestore('potensi_pajak', p);
      }
      for (const p of pbbList) {
        await syncEntryToFirestore('pbb_p2', p);
      }
      for (const i of ikmList) {
        await syncEntryToFirestore('survei_ikm', i);
      }

      onUpdateSheetsConfig({
        ...sheetsConfig,
        lastSyncTime: new Date().toLocaleTimeString('id-ID'),
        syncCount: sheetsConfig.syncCount + potensiList.length + pbbList.length + ikmList.length,
      });

      showFeedback(`Berhasil menyinkronkan ${potensiList.length + pbbList.length + ikmList.length} baris data ke Google Sheet dan Firebase Firestore!`);
    } catch (err: any) {
      showFeedback(err.message || 'Gagal menyinkronkan data ke Google Sheets.', 'error');
    } finally {
      setIsSyncingData(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-white shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  Google Drive, Sheets & Firebase Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Resmi Terverifikasi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sinkronisasi berkas pajak, pembuatan spreadsheet otomatis, dan persistensi database cloud.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : feedbackMsg.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  : 'bg-blue-950/80 border-blue-500/50 text-blue-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Integration Status Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Firebase Firestore Status */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Firebase Firestore</p>
                <p className="text-[10px] text-slate-400">Database NoSQL Real-Time</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Terhubung</span>
            </span>
          </div>

          {/* Google Workspace OAuth Status */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Google Drive & Sheets</p>
                <p className="text-[10px] text-slate-400">
                  {googleUser ? googleUser.email : 'Belum Login'}
                </p>
              </div>
            </div>
            {googleUser ? (
              <span className="text-[11px] font-bold text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-500/30">
                OAuth Aktif
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Perlu Login
              </span>
            )}
          </div>
        </div>

        {/* Google Authentication Section */}
        {!googleUser ? (
          <div className="bg-gradient-to-r from-blue-950/50 via-slate-800 to-indigo-950/50 border border-blue-500/40 rounded-3xl p-6 text-center space-y-4">
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-white">
                Hubungkan Akun Google Anda
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Login dengan Google untuk menyimpan, membuka, dan mengelola spreadsheet secara langsung di Google Drive Anda dengan izin penuh.
              </p>
            </div>

            {/* Official Google Sign-In Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="gsi-material-button flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Signed-in Profile Info */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-blue-400"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    {googleUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white">{googleUser.displayName || 'Akun Google Terhubung'}</p>
                  <p className="text-[11px] text-blue-300 font-mono">{googleUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadDriveFiles}
                  disabled={isLoadingFiles}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Muat Berkas</span>
                </button>
                <button
                  onClick={handleGoogleLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Google</span>
                </button>
              </div>
            </div>

            {/* Quick Actions: Create Spreadsheet & Push Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Create Spreadsheet directly in Drive */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Buat Spreadsheet Baru di Drive</h4>
                </div>
                <p className="text-[11px] text-slate-300">
                  Membuat Google Spreadsheet resmi dengan 3 tab: Data_Potensi_Pajak, Data_PBB_P2, & Survei_IKM.
                </p>
                <input
                  type="text"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white"
                  placeholder="Nama Spreadsheet"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSheet}
                  disabled={isCreatingSheet}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingSheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                  <span>{isCreatingSheet ? 'Membuat Spreadsheet...' : 'Buat di Google Drive Sekarang'}</span>
                </button>
              </div>

              {/* Card B: Live Push all data */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Sinkronkan Data ke Google Sheet</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Kirim seluruh data lokal ({potensiList.length} potensi, {pbbList.length} PBB, {ikmList.length} IKM) ke spreadsheet aktif & Firestore.
                  </p>
                  <p className="text-[11px] font-mono text-blue-300 mt-2 truncate bg-slate-900/60 p-2 rounded-lg border border-slate-700">
                    ID Sheet Aktif: {sheetsConfig.spreadsheetId || 'Belum dipilih'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePushAllDataToSheet}
                  disabled={isSyncingData || !sheetsConfig.spreadsheetId}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncingData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{isSyncingData ? 'Menyinkronkan...' : 'Push Seluruh Data ke Google Sheet'}</span>
                </button>
              </div>
            </div>

            {/* Google Drive Explorer: User's Drive Spreadsheets */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>Daftar File & Spreadsheet di Google Drive Anda</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {driveFiles.length} Berkas Ditemukan
                </span>
              </div>

              {isLoadingFiles ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Membaca berkas dari Google Drive...</span>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada spreadsheet perpajakan di Google Drive Anda. Klik &quot;Buat Spreadsheet Baru&quot; di atas untuk memulai.
                </div>
              ) : (
                <div className="divide-y divide-slate-700/60 max-h-52 overflow-y-auto pr-1">
                  {driveFiles.map((file) => {
                    const isConnected = sheetsConfig.spreadsheetId === file.id;
                    return (
                      <div
                        key={file.id}
                        className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/60 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {file.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {isConnected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Terhubung
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onUpdateSheetsConfig({ ...sheetsConfig, spreadsheetId: file.id, isConnected: true });
                                showFeedback(`Spreadsheet "${file.name}" dijadikan target sinkronisasi aktif!`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-all"
                            >
                              Pilih Ini
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-white"
                              title="Buka di Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
