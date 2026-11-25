import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  FileSpreadsheet,
  Cloud,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Settings,
  Database,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { AppUser } from '../types';
import {
  AppSecuritySettings,
  DEFAULT_SAVE_VERIFICATION_CODE,
  hashVerificationCode,
  maskSecretCode,
  saveSecuritySettingsToFirestore,
} from '../services/securitySettings';
import {
  ConnectedSpreadsheetConfig,
  DEFAULT_SPREADSHEET_PASSCODE,
  loadSpreadsheetPasscode,
  saveSpreadsheetConfig,
} from '../services/storage';
import {
  CloudflareTurnstileWidget,
  getCloudflareSiteKey,
} from './CloudflareTurnstileWidget';

interface AdminSecuritySettingsProps {
  currentUser: AppUser | null;
  securitySettings: AppSecuritySettings;
  onSettingsUpdated: (updated: AppSecuritySettings) => void;
  spreadsheetConfig: ConnectedSpreadsheetConfig | null;
  onSpreadsheetConfigUpdated: (cfg: ConnectedSpreadsheetConfig | null) => void;
  onOpenSpreadsheetModal: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({
  currentUser,
  securitySettings,
  onSettingsUpdated,
  spreadsheetConfig,
  onSpreadsheetConfigUpdated,
  onOpenSpreadsheetModal,
}) => {
  const [activeSection, setActiveSection] = useState<'kode' | 'cloudflare' | 'spreadsheet'>('kode');

  // Form state for Save Verification Code
  const [requireSaveCode, setRequireSaveCode] = useState(securitySettings.requireSaveCode);
  const [protectPotensi, setProtectPotensi] = useState(securitySettings.protectPotensi);
  const [protectPbb, setProtectPbb] = useState(securitySettings.protectPbb);
  const [protectRetribusi, setProtectRetribusi] = useState(securitySettings.protectRetribusi);
  const [newSaveCode, setNewSaveCode] = useState('');
  const [showNewSaveCode, setShowNewSaveCode] = useState(false);
  const [saveCodeHint, setSaveCodeHint] = useState(securitySettings.saveCodeHint);

  // Form state for Cloudflare Security
  const [cloudflareEnabled, setCloudflareEnabled] = useState(securitySettings.cloudflareEnabled);
  const [cloudflareMode, setCloudflareMode] = useState<'managed' | 'strict'>(
    securitySettings.cloudflareMode || 'managed'
  );
  const [cfTestVerified, setCfTestVerified] = useState(false);
  const [cfTestReset, setCfTestReset] = useState(0);

  // Form state for Spreadsheet Settings & Passcode
  const [newSpreadsheetCode, setNewSpreadsheetCode] = useState('');
  const [showSpreadsheetCode, setShowSpreadsheetCode] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(
    spreadsheetConfig?.autoSync ?? true
  );

  // Save feedback
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    setRequireSaveCode(securitySettings.requireSaveCode);
    setProtectPotensi(securitySettings.protectPotensi);
    setProtectPbb(securitySettings.protectPbb);
    setProtectRetribusi(securitySettings.protectRetribusi);
    setSaveCodeHint(securitySettings.saveCodeHint);
    setCloudflareEnabled(securitySettings.cloudflareEnabled);
    setCloudflareMode(securitySettings.cloudflareMode || 'managed');
  }, [securitySettings]);

  useEffect(() => {
    setAutoSyncEnabled(spreadsheetConfig?.autoSync ?? true);
  }, [spreadsheetConfig]);

  const { isProductionKey } = getCloudflareSiteKey();

  const generateRandomCode = (prefix: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    const randomVals = new Uint32Array(5);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomVals);
      for (let i = 0; i < 5; i++) {
        suffix += chars[randomVals[i] % chars.length];
      }
    } else {
      for (let i = 0; i < 5; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return `${prefix}-${suffix}`;
  };

  const handleSaveSecurityPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newSaveCode.trim() && newSaveCode.trim().length < 4) {
      setFeedback({
        type: 'error',
        text: 'Kode verifikasi simpan data minimal terdiri dari 4 karakter.',
      });
      return;
    }

    setIsSaving(true);
    try {
      let nextSaveCodeHash = securitySettings.saveCodeHash;
      let nextSaveCodeMasked = securitySettings.saveCodeMasked;

      if (newSaveCode.trim()) {
        nextSaveCodeHash = await hashVerificationCode(newSaveCode.trim());
        nextSaveCodeMasked = maskSecretCode(newSaveCode.trim());
      } else if (!nextSaveCodeHash) {
        nextSaveCodeHash = await hashVerificationCode(DEFAULT_SAVE_VERIFICATION_CODE);
        nextSaveCodeMasked = maskSecretCode(DEFAULT_SAVE_VERIFICATION_CODE);
      }

      const updated: AppSecuritySettings = {
        ...securitySettings,
        requireSaveCode,
        protectPotensi,
        protectPbb,
        protectRetribusi,
        saveCodeHash: nextSaveCodeHash,
        saveCodeMasked: nextSaveCodeMasked,
        saveCodeHint: saveCodeHint.trim(),
        cloudflareEnabled,
        cloudflareMode,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Administrator BP2RD HSU',
      };

      const res = await saveSecuritySettingsToFirestore(updated);
      onSettingsUpdated(updated);
      setNewSaveCode('');

      setFeedback({
        type: 'success',
        text: res.syncedToFirebase
          ? 'Pengaturan Kode Simpan Data & Cloudflare Security berhasil disimpan dan disinkronkan ke Firebase!'
          : 'Pengaturan tersimpan di perangkat ini (Login Google Admin / akun Firebase resmi untuk sinkronisasi cloud).',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Gagal menyimpan pengaturan keamanan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSpreadsheetSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newSpreadsheetCode.trim() && newSpreadsheetCode.trim().length < 4) {
      setFeedback({
        type: 'error',
        text: 'Kode Login Spreadsheet minimal terdiri dari 4 karakter.',
      });
      return;
    }

    setIsSaving(true);
    try {
      let nextSheetHash = securitySettings.spreadsheetPasscodeHash;
      let nextSheetMasked = securitySettings.spreadsheetPasscodeMasked;

      if (newSpreadsheetCode.trim()) {
        nextSheetHash = await hashVerificationCode(newSpreadsheetCode.trim());
        nextSheetMasked = maskSecretCode(newSpreadsheetCode.trim());
      } else if (!nextSheetHash) {
        const currentLocal = loadSpreadsheetPasscode() || DEFAULT_SPREADSHEET_PASSCODE;
        nextSheetHash = await hashVerificationCode(currentLocal);
        nextSheetMasked = maskSecretCode(currentLocal);
      }

      const updated: AppSecuritySettings = {
        ...securitySettings,
        spreadsheetPasscodeHash: nextSheetHash,
        spreadsheetPasscodeMasked: nextSheetMasked,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Administrator BP2RD HSU',
      };

      const res = await saveSecuritySettingsToFirestore(
        updated,
        newSpreadsheetCode.trim() || undefined
      );
      onSettingsUpdated(updated);

      if (spreadsheetConfig) {
        const nextSheetCfg: ConnectedSpreadsheetConfig = {
          ...spreadsheetConfig,
          autoSync: autoSyncEnabled,
        };
        saveSpreadsheetConfig(nextSheetCfg);
        onSpreadsheetConfigUpdated(nextSheetCfg);
      }

      setNewSpreadsheetCode('');
      setFeedback({
        type: 'success',
        text: res.syncedToFirebase
          ? 'Pengaturan Kode Login & Auto-Sync Google Spreadsheet berhasil disimpan ke Firebase!'
          : 'Pengaturan Spreadsheet tersimpan secara lokal.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Gagal menyimpan pengaturan Spreadsheet.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Settings className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pengaturan Kode Simpan Data &amp; Spreadsheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Panel khusus Administrator BP2RD HSU untuk mengatur kode verifikasi simpan data, integrasi Cloudflare Security, dan koneksi Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sinkron Firebase Firestore</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`mt-5 p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/35 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-80 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveSection('kode');
            setFeedback(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'kode'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Kode Verifikasi Simpan Data</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('cloudflare');
            setFeedback(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'cloudflare'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Cloudflare Security</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('spreadsheet');
            setFeedback(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'spreadsheet'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Pengaturan Spreadsheet</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: KODE VERIFIKASI SIMPAN DATA
         ===================================================================== */}
      {activeSection === 'kode' && (
        <form onSubmit={handleSaveSecurityPolicy} className="mt-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Pop-up Kode Verifikasi Saat Simpan Data</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Setiap kali petugas atau pengguna menekan tombol Simpan pada menu Input Potensi, PBB-P2, atau Input Retribusi, sistem akan menampilkan pop-up verifikasi kode.
                </p>
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-300">
                  {requireSaveCode ? 'Aktif' : 'Nonaktif'}
                </span>
                <input
                  type="checkbox"
                  checked={requireSaveCode}
                  onChange={(e) => setRequireSaveCode(e.target.checked)}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Module Scope Checkboxes */}
            <div>
              <p className="text-xs font-bold text-slate-300 mb-3">
                Menu yang Memerlukan Kode Verifikasi Saat Simpan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: 'Menu Input Potensi',
                    sub: 'Pendataan Potensi Pajak Daerah (PJRD)',
                    checked: protectPotensi,
                    setter: setProtectPotensi,
                  },
                  {
                    label: 'Menu PBB-P2',
                    sub: 'Input & Ketetapan SPPT PBB-P2',
                    checked: protectPbb,
                    setter: setProtectPbb,
                  },
                  {
                    label: 'Menu Input Retribusi',
                    sub: 'Pendataan Potensi Retribusi Daerah',
                    checked: protectRetribusi,
                    setter: setProtectRetribusi,
                  },
                ].map((mod) => (
                  <label
                    key={mod.label}
                    className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-colors ${
                      mod.checked
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={mod.checked}
                      onChange={(e) => mod.setter(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{mod.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{mod.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Code Status & Change Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Ubah Kode Verifikasi Simpan Data
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSaveCode(generateRandomCode('HSU'));
                      setShowNewSaveCode(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Buat Kode Acak</span>
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewSaveCode ? 'text' : 'password'}
                    value={newSaveCode}
                    onChange={(e) => setNewSaveCode(e.target.value)}
                    placeholder="Ketik kode baru (kosongkan jika tidak diubah)"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder:font-sans placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewSaveCode((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showNewSaveCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Kode aktif saat ini tersimpan terenkripsi (SHA-256):{' '}
                  <span className="font-mono font-bold text-emerald-400">
                    {securitySettings.saveCodeMasked || maskSecretCode(DEFAULT_SAVE_VERIFICATION_CODE)}
                  </span>
                  {!securitySettings.saveCodeHash && (
                    <span className="text-slate-500"> (Default awal: {DEFAULT_SAVE_VERIFICATION_CODE})</span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Pesan Petunjuk pada Pop-up Verifikasi
                </label>
                <input
                  type="text"
                  value={saveCodeHint}
                  onChange={(e) => setSaveCodeHint(e.target.value)}
                  maxLength={260}
                  placeholder="Contoh: Hubungi Admin BP2RD HSU untuk kode harian."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Terakhir diperbarui oleh <strong className="text-slate-300">{securitySettings.updatedBy}</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Kode Verifikasi'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================================
          TAB 2: INTEGRASI CLOUDFLARE SECURITY (TURNSTILE)
         ===================================================================== */}
      {activeSection === 'cloudflare' && (
        <form onSubmit={handleSaveSecurityPolicy} className="mt-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/35 text-orange-400 flex items-center justify-center shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Integrasi Cloudflare Security (Turnstile)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Melindungi proses penyimpanan data Potensi Pajak, PBB-P2, dan Retribusi Daerah dari pengiriman otomatis / bot menggunakan Cloudflare Turnstile.
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-300">
                  {cloudflareEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <input
                  type="checkbox"
                  checked={cloudflareEnabled}
                  onChange={(e) => setCloudflareEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-orange-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Policy & Environment Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-orange-400" />
                    <span>Tingkat Proteksi Cloudflare</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCloudflareMode('managed')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        cloudflareMode === 'managed'
                          ? 'bg-orange-500/15 border-orange-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold">Managed (Standar)</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Verifikasi otomatis cepat saat pop-up simpan data dibuka.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCloudflareMode('strict')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        cloudflareMode === 'strict'
                          ? 'bg-orange-500/15 border-orange-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold">Strict (Ketat)</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Reset tantangan Turnstile setiap kali terjadi kesalahan input kode.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Kunci Site Key:</span>
                    <span
                      className={`font-bold ${
                        isProductionKey ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {isProductionKey
                        ? 'Production Key Terpasang'
                        : 'Cloudflare Official Test Key (Preview)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Untuk domain produksi BP2RD HSU, tambahkan environment variable{' '}
                    <code className="text-orange-300 bg-slate-900 px-1.5 py-0.5 rounded">
                      VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
                    </code>{' '}
                    di pengaturan Secrets / Environment (kunci rahasia tetap disimpan di server).
                  </p>
                </div>
              </div>

              {/* Right: Live Cloudflare Turnstile Test Box */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-300">
                    Uji Widget Cloudflare Turnstile Secara Langsung
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCfTestVerified(false);
                      setCfTestReset((n) => n + 1);
                    }}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                  >
                    Uji Ulang
                  </button>
                </div>
                <CloudflareTurnstileWidget
                  action="admin_settings_test"
                  mode={cloudflareMode}
                  resetSignal={cfTestReset}
                  onVerify={() => setCfTestVerified(true)}
                  onExpire={() => setCfTestVerified(false)}
                />
                {cfTestVerified && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Widget Cloudflare Security berfungsi optimal.</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Cloudflare Security'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =====================================================================
          TAB 3: PENGATURAN SPREADSHEET & KODE LOGIN SPREADSHEET
         ===================================================================== */}
      {activeSection === 'spreadsheet' && (
        <form onSubmit={handleSaveSpreadsheetSettings} className="mt-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Pengaturan Google Spreadsheet &amp; Kode Akses</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kelola kode login untuk membuka panel integrasi Google Spreadsheet, aktifkan sinkronisasi otomatis, atau buka konfigurasi Apps Script (Kode.gs).
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenSpreadsheetModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Buka Panel Sinkronisasi Spreadsheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Connection Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <p className="text-slate-400 font-semibold">Status Koneksi Spreadsheet</p>
                <p className="text-sm font-extrabold text-white">
                  {spreadsheetConfig?.title || 'Belum Terhubung ke Google Spreadsheet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Mode:{' '}
                  <strong className="text-emerald-400">
                    {spreadsheetConfig?.connectionMode === 'appscript'
                      ? 'Google Apps Script (Kode.gs)'
                      : spreadsheetConfig?.spreadsheetId
                      ? 'Google Workspace OAuth'
                      : 'Belum dikonfigurasi'}
                  </strong>
                </p>
                {spreadsheetConfig?.lastSyncedAt && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Sinkron terakhir: {spreadsheetConfig.lastSyncedAt}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">Sinkronisasi Otomatis (Auto-Sync)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Otomatis kirim data ke Google Spreadsheet setiap selesai verifikasi &amp; simpan data baru.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    disabled={!spreadsheetConfig}
                    className="w-5 h-5 rounded accent-emerald-500 cursor-pointer disabled:opacity-40"
                  />
                </div>
                {!spreadsheetConfig && (
                  <p className="text-[11px] text-amber-300">
                    Hubungkan Spreadsheet terlebih dahulu melalui tombol di kanan atas.
                  </p>
                )}
              </div>
            </div>

            {/* Change Spreadsheet Login Passcode */}
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Ubah Kode Login Panel Spreadsheet
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewSpreadsheetCode(generateRandomCode('SHEET'));
                    setShowSpreadsheetCode(true);
                  }}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Buat Kode Acak</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showSpreadsheetCode ? 'text' : 'password'}
                  value={newSpreadsheetCode}
                  onChange={(e) => setNewSpreadsheetCode(e.target.value)}
                  placeholder="Ketik kode login Spreadsheet baru (min. 4 karakter)"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder:font-sans placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSpreadsheetCode((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showSpreadsheetCode ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Kode Spreadsheet aktif tersimpan terenkripsi:{' '}
                <span className="font-mono font-bold text-blue-400">
                  {securitySettings.spreadsheetPasscodeMasked ||
                    maskSecretCode(DEFAULT_SPREADSHEET_PASSCODE)}
                </span>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-950/40 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Spreadsheet'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
