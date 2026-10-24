import React from 'react';
import { 
  Building2, 
  MapPin, 
  FileSpreadsheet, 
  Receipt, 
  FolderArchive, 
  BarChart3, 
  PieChart,
  LogIn, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Navigation2,
  Coins,
  HeartHandshake,
  Lock
} from 'lucide-react';
import { AppUser } from '../types';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  potensiCount: number;
  pbbCount: number;
  retribusiCount?: number;
  ikmCount?: number;
  onOpenSpreadsheetModal?: () => void;
  isSpreadsheetConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  onLogout,
  potensiCount,
  pbbCount,
  retribusiCount = 0,
  ikmCount = 0,
  onOpenSpreadsheetModal,
  isSpreadsheetConnected = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Pemkab HSU & BP2RD */}
          <div 
            onClick={() => onSelectTab('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  SIPOTENSI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  BP2RD HSU
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Kabupaten Hulu Sungai Utara &bull; Amuntai
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => onSelectTab('beranda')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'beranda'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Beranda</span>
            </button>

            <button
              onClick={() => onSelectTab('peta')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'peta'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Navigation2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Peta Geospasial HSU</span>
            </button>

            <button
              onClick={() => onSelectTab('potensi')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'potensi'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Input Potensi</span>
              {potensiCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {potensiCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('pbb')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'pbb'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>PBB-P2</span>
              {pbbCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {pbbCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('retribusi')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'retribusi'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Input Retribusi</span>
              {retribusiCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {retribusiCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('library')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'library'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Library Berkas</span>
            </button>

            {/* Menu Indeks Kepuasan Masyarakat (IKM) */}
            <button
              onClick={() => onSelectTab('ikm')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'ikm'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-teal-300" />
              <span>Indeks Kepuasan Masyarakat</span>
              {ikmCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  {ikmCount}
                </span>
              )}
            </button>

            {/* Menu Manajemen Laporan & Dashboard Analitik HANYA TAMPIL pada Login Admin dan User */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'user') && (
              <>
                <button
                  onClick={() => onSelectTab('laporan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'laporan'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Manajemen Laporan</span>
                </button>

                <button
                  onClick={() => onSelectTab('analitik')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'analitik'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dashboard Analitik</span>
                </button>
              </>
            )}
          </nav>

          {/* Spreadsheet & User Auth Section */}
          <div className="flex items-center gap-2.5">
            {onOpenSpreadsheetModal && (
              <button
                type="button"
                onClick={onOpenSpreadsheetModal}
                title="Koneksi Database ke Google Spreadsheet (Dilindungi Kode Login)"
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                  isSpreadsheetConnected
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950/40'
                    : 'bg-slate-800/80 border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Spreadsheet</span>
                <Lock className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                {isSpreadsheetConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Terhubung" />
                )}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/80 pl-3 pr-2 py-1.5 rounded-2xl border border-slate-700/80">
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-bold text-slate-200 max-w-[140px] truncate">
                      {currentUser.name}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      currentUser.role === 'admin' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                    {currentUser.jabatan || 'Aparatur BP2RD'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout Akun"
                  className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Petugas / Admin</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto gap-2 no-scrollbar text-[11px]">
          <button 
            onClick={() => onSelectTab('beranda')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'beranda' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
          >
            Beranda
          </button>
          <button 
            onClick={() => onSelectTab('peta')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'peta' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
          >
            Peta HSU
          </button>
          <button 
            onClick={() => onSelectTab('potensi')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'potensi' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
          >
            Input Potensi
          </button>
          <button 
            onClick={() => onSelectTab('pbb')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'pbb' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
          >
            PBB-P2
          </button>
          <button 
            onClick={() => onSelectTab('retribusi')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'retribusi' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Retribusi
          </button>
          <button 
            onClick={() => onSelectTab('library')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'library' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
          >
            Library Berkas
          </button>
          <button 
            onClick={() => onSelectTab('ikm')} 
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'ikm' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'}`}
          >
            IKM Survei
          </button>
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'user') && (
            <>
              <button 
                onClick={() => onSelectTab('laporan')} 
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'laporan' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
              >
                Laporan
              </button>
              <button 
                onClick={() => onSelectTab('analitik')} 
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'analitik' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
              >
                Analitik
              </button>
            </>
          )}
          {onOpenSpreadsheetModal && (
            <button
              onClick={onOpenSpreadsheetModal}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 font-bold ${
                isSpreadsheetConnected
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>Spreadsheet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
