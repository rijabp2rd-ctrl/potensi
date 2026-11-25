import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { AppSecuritySettings, verifySaveCode } from '../services/securitySettings';
import { CloudflareTurnstileWidget } from './CloudflareTurnstileWidget';

export type ProtectedSaveModule = 'potensi' | 'pbb' | 'retribusi';

interface SaveVerificationModalProps {
  isOpen: boolean;
  moduleType: ProtectedSaveModule;
  summaryTitle: string;
  summarySubtitle?: string;
  securitySettings: AppSecuritySettings;
  onVerified: (meta: { cloudflareToken?: string; verifiedAt: string }) => void;
  onCancel: () => void;
}

const MODULE_LABELS: Record<ProtectedSaveModule, { badge: string; accent: string }> = {
  potensi: { badge: 'Input Potensi Pajak Daerah', accent: 'text-emerald-400' },
  pbb: { badge: 'Layanan SPPT PBB-P2', accent: 'text-blue-400' },
  retribusi: { badge: 'Input Potensi Retribusi Daerah', accent: 'text-amber-400' },
};

export const SaveVerificationModal: React.FC<SaveVerificationModalProps> = ({
  isOpen,
  moduleType,
  summaryTitle,
  summarySubtitle,
  securitySettings,
  onVerified,
  onCancel,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntilTs, setLockUntilTs] = useState<number>(0);
  const [remainingLockSec, setRemainingLockSec] = useState<number>(0);

  // Cloudflare Turnstile state
  const [cloudflareToken, setCloudflareToken] = useState<string | null>(null);
  const [cfResetCounter, setCfResetCounter] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCodeInput('');
      setShowCode(false);
      setErrorMsg(null);
      setIsChecking(false);
      setCloudflareToken(null);
      setCfResetCounter((c) => c + 1);
    }
  }, [isOpen, moduleType, summaryTitle]);

  useEffect(() => {
    if (!lockUntilTs) {
      setRemainingLockSec(0);
      return;
    }
    const timer = window.setInterval(() => {
      const diff = Math.ceil((lockUntilTs - Date.now()) / 1000);
      if (diff <= 0) {
        setLockUntilTs(0);
        setRemainingLockSec(0);
        setFailedAttempts(0);
        window.clearInterval(timer);
      } else {
        setRemainingLockSec(diff);
      }
    }, 300);
    return () => window.clearInterval(timer);
  }, [lockUntilTs]);

  if (!isOpen) return null;

  const moduleMeta = MODULE_LABELS[moduleType];
  const needsCode = securitySettings.requireSaveCode;
  const needsCloudflare = securitySettings.cloudflareEnabled;
  const isLockedOut = remainingLockSec > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setErrorMsg(null);

    if (needsCloudflare && !cloudflareToken) {
      setErrorMsg('Selesaikan verifikasi Cloudflare Security (Turnstile) terlebih dahulu.');
      return;
    }

    if (needsCode) {
      if (!codeInput.trim()) {
        setErrorMsg('Masukkan Kode Verifikasi Simpan Data yang ditetapkan oleh Admin.');
        return;
      }

      setIsChecking(true);
      try {
        const isValid = await verifySaveCode(codeInput, securitySettings);
        if (!isValid) {
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          if (nextAttempts >= 5) {
            setLockUntilTs(Date.now() + 15_000);
            setErrorMsg('Terlalu banyak percobaan salah. Tunggu 15 detik sebelum mencoba kembali.');
          } else {
            setErrorMsg(`Kode Verifikasi tidak sesuai (${nextAttempts}/5). Pastikan kode sesuai pengaturan Admin.`);
          }
          if (securitySettings.cloudflareMode === 'strict') {
            setCloudflareToken(null);
            setCfResetCounter((c) => c + 1);
          }
          return;
        }
      } finally {
        setIsChecking(false);
      }
    }

    onVerified({
      cloudflareToken: cloudflareToken || undefined,
      verifiedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[11px] font-bold ${moduleMeta.accent}`}>
                {moduleMeta.badge}
              </p>
              <h2 className="text-base font-extrabold text-white mt-0.5">
                Verifikasi Simpan Data
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pending Data Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">Data yang akan disimpan ke Firebase:</p>
              <p className="text-xs font-bold text-white truncate mt-0.5">{summaryTitle}</p>
              {summarySubtitle && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{summarySubtitle}</p>
              )}
            </div>
          </div>

          {/* Step 1: Cloudflare Security Widget */}
          {needsCloudflare && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>1. Pemeriksaan Cloudflare Security</span>
                {cloudflareToken && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Siap</span>
                  </span>
                )}
              </label>
              <CloudflareTurnstileWidget
                action={`save_${moduleType}`}
                mode={securitySettings.cloudflareMode}
                resetSignal={cfResetCounter}
                onVerify={(token) => {
                  setCloudflareToken(token);
                  setErrorMsg(null);
                }}
                onExpire={() => setCloudflareToken(null)}
              />
            </div>
          )}

          {/* Step 2: Admin Verification Code */}
          {needsCode && (
            <div className="space-y-2">
              <label
                htmlFor="save-verification-code-input"
                className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {needsCloudflare ? '2. ' : ''}Kode Verifikasi Simpan Data (Diatur Admin)
                </span>
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="save-verification-code-input"
                  type={showCode ? 'text' : 'password'}
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  disabled={isLockedOut || isChecking}
                  autoFocus
                  autoComplete="off"
                  placeholder="Masukkan kode verifikasi dari Admin..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-11 py-3 text-sm font-mono font-bold tracking-wider text-white placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCode((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                  title={showCode ? 'Sembunyikan kode' : 'Tampilkan kode'}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {securitySettings.saveCodeHint && (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {securitySettings.saveCodeHint}
                </p>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/35 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cooldown Notice */}
          {isLockedOut && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-300 text-xs font-mono text-center">
              Tunggu {remainingLockSec} detik sebelum mencoba kembali...
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={isChecking}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                isChecking ||
                isLockedOut ||
                (needsCloudflare && !cloudflareToken) ||
                (needsCode && !codeInput.trim())
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi &amp; Simpan Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
