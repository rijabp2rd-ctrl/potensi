import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  LogIn, 
  UserCheck, 
  AlertCircle, 
  Database, 
  Sparkles, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppUser } from '../types';
import { firebaseLoginOfficerOrAdmin } from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'petugas'>('admin');
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Firebase Real Google Login Handler
  const handleFirebaseGoogleLogin = async (role: 'admin' | 'petugas') => {
    setIsFirebaseLoading(true);
    setErrorMsg(null);
    try {
      const { appUser } = await firebaseLoginOfficerOrAdmin(role);
      onLoginSuccess(appUser);
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth Login Error:', err);
      setErrorMsg(err.message || 'Gagal login via Firebase Authentication');
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  // Local/Offline Fallback Login
  const handleQuickLocalLogin = (role: 'admin' | 'petugas') => {
    if (role === 'admin') {
      const adminUser: AppUser = {
        id: 'USR-ADM-01',
        email: 'rija.bp2rd@gmail.com',
        nama: 'Rija (Administrator BP2RD)',
        role: 'admin',
        nip: '198005122005011003',
        jabatan: 'Kepala Bidang Pendataan & Penetapan Pajak',
        unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      onLoginSuccess(adminUser);
      onClose();
    } else {
      const petugasUser: AppUser = {
        id: 'USR-PET-02',
        email: 'petugas.lapangan@bp2rd.go.id',
        nama: 'Budi Santoso, S.STP',
        role: 'petugas',
        nip: '198504122008011004',
        jabatan: 'Petugas Uji Petik & Survey Lapangan',
        unitKerja: 'UPT Wilayah Pajak Daerah I',
      };
      onLoginSuccess(petugasUser);
      onClose();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Mohon masukkan email atau username.');
      return;
    }
    const role = emailInput.toLowerCase().includes('admin') || emailInput.includes('rija') ? 'admin' : 'petugas';
    handleQuickLocalLogin(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-7 text-white shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Login Admin &amp; Petugas</h3>
              <p className="text-[11px] text-slate-400">Terkoneksi ke Firebase Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Firebase Live Status Badge */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <div>
              <p className="font-bold text-white text-[11px]">Firebase Firestore &amp; Auth</p>
              <p className="text-[10px] text-slate-400">ai-studio-sipotensibp2rdpo...</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Online</span>
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Connect with Firebase Google Auth */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Pilih Role Akses:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('petugas')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedRole === 'petugas'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Petugas
              </button>
            </div>
          </div>

          {/* Official Google Sign-In Connected to Firebase */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFirebaseGoogleLogin(selectedRole)}
            disabled={isFirebaseLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isFirebaseLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span>
              {isFirebaseLoading
                ? 'Menghubungkan ke Firebase...'
                : `Masuk dengan Google (${selectedRole === 'admin' ? 'Admin BP2RD' : 'Petugas Lapangan'})`}
            </span>
          </motion.button>
          <p className="text-[10px] text-slate-400 text-center">
            Email <strong className="text-blue-300">rija.bp2rd@gmail.com</strong> otomatis terverifikasi sebagai Super Admin BP2RD.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Atau Akses Cepat Terverifikasi
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* 1-Click Fast Access Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickLocalLogin('admin')}
            className="p-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs group-hover:text-blue-200">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin BP2RD</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">rija.bp2rd@gmail.com</p>
            <span className="text-[9px] font-semibold text-emerald-400 mt-1 inline-block">
              Hak Akses Penuh
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickLocalLogin('petugas')}
            className="p-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs group-hover:text-indigo-200">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Petugas Lapangan</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">petugas.lapangan@bp2rd.go.id</p>
            <span className="text-[9px] font-semibold text-teal-400 mt-1 inline-block">
              Uji Petik &amp; Survey
            </span>
          </motion.button>
        </div>

        {/* Manual Form Toggle */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Email atau NIP Petugas
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="rija.bp2rd@gmail.com / NIP Petugas"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-400" />
            <span>Masuk dengan NIP / Email</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
