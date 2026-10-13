import React, { useState } from 'react';
import { 
  LogIn, 
  ShieldCheck, 
  User, 
  X, 
  Building2, 
  CheckCircle2,
  Flame,
  Mail,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  firebaseLoginOfficerOrAdmin, 
  firebaseEmailPasswordLogin 
} from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  // Hanya menampilkan Google Auth dan Email / Sandi
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rolePreference, setRolePreference] = useState<'admin' | 'user'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Firebase Google Popup Login
  const handleGoogleLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { appUser } = await firebaseLoginOfficerOrAdmin(role === 'admin' ? 'admin' : 'petugas');
      onLogin(appUser);
      onClose();
    } catch (err: any) {
      console.error('Firebase Google Login Error:', err);
      setErrorMessage(err.message || 'Gagal login akun Google Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email/Password Login
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMessage('Harap isi alamat email dan kata sandi');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { appUser } = await firebaseEmailPasswordLogin(emailInput, passwordInput, rolePreference);
      onLogin(appUser);
      onClose();
    } catch (err: any) {
      console.error('Firebase Email Login Error:', err);
      setErrorMessage(err.message || 'Gagal autentikasi Firebase Email/Password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Autentikasi Firebase
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                BP2RD Hulu Sungai Utara &bull; Database Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firebase Live Indicator */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Koneksi Firestore &amp; Auth Aktif</span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Terhubung
          </span>
        </div>

        {/* Tab Switcher: HANYA Google Auth dan Email / Sandi (Sesuai Permintaan) */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('google'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'google' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google Auth</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'email' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email / Sandi</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: Google Popup Login with Firebase */}
        {authMode === 'google' && (
          <div className="py-5 space-y-3.5">
            <p className="text-xs text-slate-400 leading-relaxed">
              Masuk menggunakan Google OAuth Firebase terintegrasi cloud database BP2RD:
            </p>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleGoogleLogin('admin')}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-amber-950/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs">Login Google Administrator</span>
                  <span className="block text-[10px] text-amber-200 font-normal">rija.bp2rd@gmail.com</span>
                </div>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <LogIn className="w-4 h-4 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleGoogleLogin('user')}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-200">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xs">Login Google User / Petugas</span>
                  <span className="block text-[10px] text-emerald-200 font-normal">Aparatur Survei Lapangan HSU</span>
                </div>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <LogIn className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed mt-2">
              <strong className="text-slate-200">Hak Akses:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                <li>Menu <strong>Manajemen Laporan</strong>, <strong>Dashboard Analitik</strong>, dan <strong>Daftar Terinput</strong> hanya dapat dibuka oleh akun Admin dan User yang login.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Firebase Email & Password Form */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailPasswordSubmit} className="py-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pilih Peran Akun
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRolePreference('admin')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    rolePreference === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Admin BP2RD
                </button>
                <button
                  type="button"
                  onClick={() => setRolePreference('user')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    rolePreference === 'user'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  User / Petugas
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email Firebase
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin.bp2rd@sipotensi-hsu.go.id"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Masuk dengan Email / Sandi</span>
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Database: ai-studio-sipotensibp2rdpo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
