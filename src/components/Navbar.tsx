import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Star, 
  FolderArchive, 
  LogIn, 
  LogOut, 
  HardDrive
} from 'lucide-react';
import { AppUser, GoogleSheetsConfig } from '../types';

interface NavbarProps {
  activeTab: 'beranda' | 'potensi' | 'pbb' | 'ikm' | 'dashboard' | 'laporan' | 'library';
  setActiveTab: (tab: 'beranda' | 'potensi' | 'pbb' | 'ikm' | 'dashboard' | 'laporan' | 'library') => void;
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsHub: () => void;
  onOpenGoogleWorkspace: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  sheetsConfig,
  onOpenSheetsHub,
  onOpenGoogleWorkspace,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-xs px-4 py-1.5 border-b border-blue-800/40 flex flex-wrap items-center justify-between text-blue-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            PORTAL RESMI BP2RD
          </span>
          <span className="hidden sm:inline">Pemerintah Daerah • Badan Pengelola Pajak dan Retribusi Daerah</span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Google Workspace & Drive Button */}
          <button
            onClick={onOpenGoogleWorkspace}
            title="Kelola Google Drive & Google Sheets"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-400/40 text-blue-200 hover:bg-blue-900/80 transition-all text-[11px] font-semibold shadow-sm cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Drive &amp; Sheets</span>
          </button>

          {/* Google Sheets Live Status Indicator */}
          <button
            onClick={onOpenSheetsHub}
            title="Klik untuk membuka Pengaturan Integrasi Google Sheets"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 transition-all text-[11px] font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sheets: {sheetsConfig.isConnected ? 'Terhubung' : 'Standby'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  SIPOTENSI
                </span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40">
                  BP2RD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Penggalian Potensi Pajak & Evaluasi IKM
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('beranda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'beranda'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => setActiveTab('potensi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'potensi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Form Potensi</span>
            </button>

            <button
              onClick={() => setActiveTab('pbb')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pbb'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Form PBB-P2</span>
            </button>

            <button
              onClick={() => setActiveTab('ikm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ikm'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Survei IKM</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
              <span>Library Berkas</span>
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dashboard Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'laporan'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>Manajemen Laporan</span>
            </button>
          </nav>

          {/* User Auth & Action Buttons */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 pl-3 pr-1 py-1 rounded-xl">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {currentUser.nama}
                  </span>
                  <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">
                    {currentUser.role === 'admin' ? 'Administrator BP2RD' : 'Petugas Lapangan'}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.nama.charAt(0)}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 transition-all border border-blue-400/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Admin / Petugas</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => setActiveTab('beranda')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'beranda' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setActiveTab('potensi')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'potensi' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Form Potensi
          </button>
          <button
            onClick={() => setActiveTab('pbb')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'pbb' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Form PBB-P2
          </button>
          <button
            onClick={() => setActiveTab('ikm')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'ikm' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Survei IKM
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'library' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'laporan' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Laporan
          </button>
        </div>
      </div>
    </header>
  );
};
