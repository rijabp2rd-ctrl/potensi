import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Link2, 
  Unlink, 
  Coins, 
  Receipt,
  FileCheck2,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  GoogleWorkspaceService, 
  DriveFileItem 
} from '../services/googleWorkspace';
import { 
  googleSignIn, 
  getAccessToken 
} from '../services/firebase';
import { 
  ConnectedSpreadsheetConfig, 
  loadSpreadsheetConfig, 
  saveSpreadsheetConfig 
} from '../services/storage';
import { 
  PotensiPajakEntry, 
  RetribusiDaerahEntry, 
  PbbP2Entry, 
  AppUser 
} from '../types';

interface GoogleSpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  potensiList: PotensiPajakEntry[];
  retribusiList: RetribusiDaerahEntry[];
  pbbList: PbbP2Entry[];
  onSyncSuccess?: (message: string) => void;
}

export const GoogleSpreadsheetSyncModal: React.FC<GoogleSpreadsheetSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  potensiList,
  retribusiList,
  pbbList,
  onSyncSuccess,
}) => {
  const [config, setConfig] = useState<ConnectedSpreadsheetConfig | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  
  // Connection Form State
  const [activeTabMode, setActiveTabMode] = useState<'create' | 'link' | 'drive'>('create');
  const [newSheetTitle, setNewSheetTitle] = useState<string>(
    `SIPOTENSI BP2RD HSU - Database Master PAD (${new Date().toLocaleDateString('id-ID')})`
  );
  const [inputUrlOrId, setInputUrlOrId] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [loadingDriveFiles, setLoadingDriveFiles] = useState<boolean>(false);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const currentConfig = loadSpreadsheetConfig();
    setConfig(currentConfig);

    // Check if token already exists in memory
    getAccessToken().then(token => {
      setHasGoogleToken(!!token);
      if (token && activeTabMode === 'drive') {
        loadDriveFilesList();
      }
    });
  }, [isOpen]);

  const loadDriveFilesList = async () => {
    try {
      setLoadingDriveFiles(true);
      const files = await GoogleWorkspaceService.listDriveFiles();
      setDriveFiles(files);
    } catch (e: any) {
      console.warn('Drive files load info:', e.message);
    } finally {
      setLoadingDriveFiles(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsAuthenticating(true);
      setStatusMessage(null);
      const result = await googleSignIn();
      if (result?.accessToken) {
        setHasGoogleToken(true);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung ke akun Google ${result.user.email || ''}!`,
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'Gagal login ke Google. Pastikan popup login tidak diblokir oleh browser.',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 1. Create New Spreadsheet & Sync
  const handleCreateAndConnect = async () => {
    try {
      setIsSyncing(true);
      setStatusMessage(null);

      // Check access token first
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Akses Google Workspace belum aktif. Silakan klik tombol "Login dengan Google" terlebih dahulu.');
      }

      // Create spreadsheet in Drive
      const created = await GoogleWorkspaceService.createSpreadsheetInDrive(newSheetTitle);

      // Immediately sync all data
      const syncResult = await GoogleWorkspaceService.syncAllToConnectedSheet(created.id, {
        potensi: potensiList,
        retribusi: retribusiList,
        pbb: pbbList,
      });

      const newConfig: ConnectedSpreadsheetConfig = {
        spreadsheetId: created.id,
        spreadsheetUrl: created.spreadsheetUrl,
        title: created.title,
        lastSyncedAt: syncResult.timestamp,
        autoSync: true,
        syncedCounts: syncResult.syncedCounts,
      };

      saveSpreadsheetConfig(newConfig);
      setConfig(newConfig);

      const successMsg = `Spreadsheet baru "${created.title}" berhasil dibuat dan ${potensiList.length + retribusiList.length + pbbList.length} rekaman database tersinkronisasi!`;
      setStatusMessage({
        type: 'success',
        text: successMsg,
      });
      if (onSyncSuccess) onSyncSuccess(successMsg);
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'Gagal membuat Google Spreadsheet baru.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Link Existing Spreadsheet & Sync
  const handleLinkExistingAndSync = async (targetId?: string) => {
    try {
      setIsSyncing(true);
      setStatusMessage(null);

      const rawInput = targetId || inputUrlOrId;
      if (!rawInput.trim()) {
        throw new Error('Mohon masukkan URL Google Sheets atau ID Spreadsheet');
      }

      const cleanId = GoogleWorkspaceService.extractSpreadsheetId(rawInput);
      const meta = await GoogleWorkspaceService.getSpreadsheetMetadata(cleanId);

      // Sync data to this spreadsheet
      const syncResult = await GoogleWorkspaceService.syncAllToConnectedSheet(cleanId, {
        potensi: potensiList,
        retribusi: retribusiList,
        pbb: pbbList,
      });

      const newConfig: ConnectedSpreadsheetConfig = {
        spreadsheetId: meta.id,
        spreadsheetUrl: meta.spreadsheetUrl,
        title: meta.title,
        lastSyncedAt: syncResult.timestamp,
        autoSync: true,
        syncedCounts: syncResult.syncedCounts,
      };

      saveSpreadsheetConfig(newConfig);
      setConfig(newConfig);

      const successMsg = `Spreadsheet "${meta.title}" berhasil terhubung dan tersinkronisasi dengan seluruh data database!`;
      setStatusMessage({
        type: 'success',
        text: successMsg,
      });
      if (onSyncSuccess) onSyncSuccess(successMsg);
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'Gagal menghubungkan ke Google Spreadsheet tersebut.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Manual Re-Sync to connected sheet
  const handleTriggerSync = async () => {
    if (!config?.spreadsheetId) return;

    try {
      setIsSyncing(true);
      setStatusMessage(null);

      const syncResult = await GoogleWorkspaceService.syncAllToConnectedSheet(config.spreadsheetId, {
        potensi: potensiList,
        retribusi: retribusiList,
        pbb: pbbList,
      });

      const updatedConfig: ConnectedSpreadsheetConfig = {
        ...config,
        lastSyncedAt: syncResult.timestamp,
        syncedCounts: syncResult.syncedCounts,
      };

      saveSpreadsheetConfig(updatedConfig);
      setConfig(updatedConfig);

      const totalCount = syncResult.syncedCounts.potensi + syncResult.syncedCounts.retribusi + syncResult.syncedCounts.pbb;
      const successMsg = `Database berhasil disinkronkan ke Google Spreadsheet (${totalCount} total baris)!`;
      setStatusMessage({
        type: 'success',
        text: successMsg,
      });
      if (onSyncSuccess) onSyncSuccess(successMsg);
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: e.message || 'Gagal menyinkronkan data ke spreadsheet.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Disconnect sheet
  const handleDisconnect = () => {
    saveSpreadsheetConfig(null);
    setConfig(null);
    setStatusMessage({
      type: 'info',
      text: 'Koneksi ke Google Spreadsheet telah diputuskan. Data lokal tetap aman di sistem.',
    });
  };

  // Toggle Auto-sync
  const handleToggleAutoSync = () => {
    if (!config) return;
    const updated = { ...config, autoSync: !config.autoSync };
    saveSpreadsheetConfig(updated);
    setConfig(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Koneksi Database ke Google Spreadsheet
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sinkronisasi otomatis basis data Potensi Pajak, Retribusi Daerah, dan PBB-P2 ke Google Sheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Step 1: Google Auth Verification */}
        {!hasGoogleToken ? (
          <div className="mt-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Otorisasi Akses Google Sheets &amp; Drive
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Untuk menghubungkan dan mengekspor seluruh rekaman database daerah, izinkan aplikasi mengakses Google Spreadsheet dengan masuk menggunakan Akun Google Anda.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              {/* Official Google Sign In Button Style */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isAuthenticating}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-3 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Menghubungkan...' : 'Masuk dengan Google & Berikan Izin'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Spreadsheet Connection & Live Status */
          <div className="mt-5 space-y-5">
            
            {/* If Already Connected to a Spreadsheet */}
            {config ? (
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {config.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          TERHUBUNG
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ID: {config.spreadsheetId}
                      </p>
                    </div>
                  </div>

                  <a
                    href={config.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Buka di Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>

                {/* Database Metrics Synced */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block">Potensi Pajak</span>
                    <strong className="text-sm font-mono text-emerald-400 mt-1 block">
                      {config.syncedCounts?.potensi ?? potensiList.length} Baris
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block">Retribusi Daerah</span>
                    <strong className="text-sm font-mono text-amber-400 mt-1 block">
                      {config.syncedCounts?.retribusi ?? retribusiList.length} Baris
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 block">PBB-P2</span>
                    <strong className="text-sm font-mono text-blue-400 mt-1 block">
                      {config.syncedCounts?.pbb ?? pbbList.length} Baris
                    </strong>
                  </div>
                </div>

                {/* Last Synced Info & Auto Sync Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Sinkronisasi terakhir:{' '}
                      <strong className="text-slate-200">
                        {config.lastSyncedAt
                          ? new Date(config.lastSyncedAt).toLocaleString('id-ID')
                          : 'Baru saja'}
                      </strong>
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={config.autoSync}
                      onChange={handleToggleAutoSync}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-slate-300 font-medium">Auto-sync realtime</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Putus Koneksi</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Database Sekarang'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Not Connected Yet -> Setup Options */
              <div className="space-y-4">
                
                {/* Tabs: Create vs Link vs Browse Drive */}
                <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTabMode('create')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTabMode === 'create'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Spreadsheet Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTabMode('link')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTabMode === 'link'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Hubungkan yang Ada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTabMode('drive');
                      loadDriveFilesList();
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTabMode === 'drive'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Pilih dari Drive</span>
                  </button>
                </div>

                {/* Option A: Create New Spreadsheet */}
                {activeTabMode === 'create' && (
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1.5">
                        Nama Spreadsheet Master Baru di Google Drive:
                      </label>
                      <input
                        type="text"
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        placeholder="Contoh: SIPOTENSI BP2RD HSU - Database Master PAD"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Spreadsheet akan otomatis dibuat dengan 4 sheet terstruktur: <span className="text-emerald-300 font-semibold">Data_Potensi_Pajak</span>, <span className="text-amber-300 font-semibold">Data_Retribusi_Daerah</span>, <span className="text-blue-300 font-semibold">Data_PBB_P2</span>, dan <span className="text-teal-300 font-semibold">Ringkasan_PAD_HSU</span>.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleCreateAndConnect}
                        disabled={isSyncing}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>
                          {isSyncing 
                            ? 'Sedang Membuat & Menyinkronkan...' 
                            : 'Buat Spreadsheet di Google Drive & Sinkronkan Sekarang'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Option B: Link Existing by URL/ID */}
                {activeTabMode === 'link' && (
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white mb-1.5">
                        Tempel Tautan (URL) atau ID Google Spreadsheet:
                      </label>
                      <input
                        type="text"
                        value={inputUrlOrId}
                        onChange={(e) => setInputUrlOrId(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit atau ID Spreadsheet"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Sistem akan memeriksa spreadsheet dan secara otomatis membuat sheet yang diperlukan bila belum tersedia.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleLinkExistingAndSync()}
                        disabled={isSyncing || !inputUrlOrId.trim()}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        <Link2 className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>
                          {isSyncing ? 'Menghubungkan & Menyinkronkan...' : 'Hubungkan Spreadsheet & Sinkronkan'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Option C: Browse from Google Drive */}
                {activeTabMode === 'drive' && (
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white">
                        Pilih Spreadsheet dari Google Drive Anda:
                      </label>
                      <button
                        type="button"
                        onClick={loadDriveFilesList}
                        disabled={loadingDriveFiles}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingDriveFiles ? 'animate-spin' : ''}`} />
                        <span>Segarkan</span>
                      </button>
                    </div>

                    {loadingDriveFiles ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <RefreshCw className="w-5 h-5 mx-auto animate-spin text-emerald-400 mb-2" />
                        <span>Memuat berkas dari Google Drive...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                        Tidak ditemukan berkas Google Spreadsheet di Drive. Anda dapat menggunakan opsi &quot;Buat Spreadsheet Baru&quot;.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white block truncate">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono truncate block">
                                  ID: {file.id}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLinkExistingAndSync(file.id)}
                              disabled={isSyncing}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                            >
                              Pilih &amp; Sinkronkan
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Info Box: Total Local Database Ready */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/70 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ringkasan Database Siap Sinkronisasi:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{potensiList.length}</strong> Potensi Pajak
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{retribusiList.length}</strong> Retribusi Daerah
                </span>
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{pbbList.length}</strong> Objek PBB-P2
                </span>
                <span className="text-slate-500 font-mono">
                  Total: {potensiList.length + retribusiList.length + pbbList.length} rekaman
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
