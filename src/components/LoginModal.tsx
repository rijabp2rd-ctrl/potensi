import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, LogIn, UserCheck, AlertCircle } from 'lucide-react';
import { AppUser } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (role: 'admin' | 'petugas') => {
    if (role === 'admin') {
      const adminUser: AppUser = {
        id: 'USR-ADM-01',
        email: 'admin@bp2rd.go.id',
        nama: 'Drs. H. Mulyadi, M.Si.',
        role: 'admin',
        nip: '197508141998031002',
        jabatan: 'Kepala Bidang Pendataan & Penetapan Pajak Daerah',
        unitKerja: 'Badan Pengelola Pajak dan Retribusi Daerah (BP2RD)',
      };
      onLoginSuccess(adminUser);
      onClose();
    } else {
      const petugasUser: AppUser = {
        id: 'USR-PET-02',
        email: 'petugas@bp2rd.go.id',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon isi alamat email dan password.');
      return;
    }

    if (email.includes('admin') || password === 'admin123') {
      handleQuickLogin('admin');
    } else {
      handleQuickLogin('petugas');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Login Petugas & Admin</h3>
              <p className="text-[11px] text-slate-400">Portal Akses Penggalian Potensi BP2RD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-1"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Quick Login Credentials (for instant testing) */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Akses Cepat Pengujian (1-Klik)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white text-xs font-semibold transition-all text-left flex flex-col"
            >
              <span className="font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Admin BP2RD
              </span>
              <span className="text-[10px] opacity-75 font-normal">Hak Akses Penuh & Laporan</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('petugas')}
              className="px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold transition-all text-left flex flex-col"
            >
              <span className="font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Petugas Lapangan
              </span>
              <span className="text-[10px] opacity-75 font-normal">Verifikasi & Survey</span>
            </button>
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Dinas BP2RD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="admin@bp2rd.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
};
