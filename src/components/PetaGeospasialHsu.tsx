import React, { useState } from 'react';
import { 
  Navigation2, 
  MapPin, 
  Layers, 
  Filter, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Search, 
  Eye, 
  Building2, 
  Receipt,
  FileSpreadsheet,
  ExternalLink,
  Info
} from 'lucide-react';
import { PotensiPajakEntry, PbbP2Entry, AppUser, GpsCoordinateResult } from '../types';
import { 
  KABUPATEN_HSU, 
  KECAMATAN_HSU, 
  TITIK_PRESET_HSU, 
  isWithinHsuRegion,
  getDefaultCoordsForKecamatan 
} from '../constants/wilayahHsu';
import { capturePreciseGpsCoordinate, calculateHaversineDistance, getClosestKecamatanHsu } from '../services/gpsService';

interface PetaGeospasialHsuProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  currentUser: AppUser | null;
  onNavigateToForm?: (type: 'potensi' | 'pbb') => void;
}

export const PetaGeospasialHsu: React.FC<PetaGeospasialHsuProps> = ({
  potensiList,
  pbbList,
  currentUser,
  onNavigateToForm,
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [layerFilter, setLayerFilter] = useState<'all' | 'potensi' | 'pbb'>('all');
  const [activePin, setActivePin] = useState<{
    id: string;
    title: string;
    type: 'potensi' | 'pbb' | 'kecamatan';
    lat: number;
    lng: number;
    details: any;
  } | null>(null);

  // User current GPS state
  const [userGps, setUserGps] = useState<GpsCoordinateResult | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  // Filtered pins
  const filteredPotensi = potensiList.filter((p) => {
    const matchKec = selectedKecamatan === 'all' || p.kecamatan === selectedKecamatan;
    const matchLayer = layerFilter === 'all' || layerFilter === 'potensi';
    return matchKec && matchLayer;
  });

  const filteredPbb = pbbList.filter((p) => {
    const matchKec = selectedKecamatan === 'all' || p.kecamatan === selectedKecamatan;
    const matchLayer = layerFilter === 'all' || layerFilter === 'pbb';
    return matchKec && matchLayer;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Deteksi GPS Realtime Presisi HSU
  const handleDetectUserGps = async () => {
    setIsDetectingGps(true);
    setGpsNotification('Mengunci sinyal satelit GPS perangkat...');

    try {
      const result = await capturePreciseGpsCoordinate({
        prioritizeHsuRegion: true,
        forceHighAccuracy: true,
      });

      setUserGps(result);
      if (result.source === 'gps_device') {
        setGpsNotification(
          `GPS Terkunci Presisi: Akurasi ±${result.accuracy}m di ${result.kecamatanTerdekat || 'Wilayah HSU'}. Jarak ke Pusat Amuntai: ${result.jarakKmKePusatAmuntai} km.`
        );
      } else {
        setGpsNotification(
          `Posisi dikalibrasi ke pusat ${result.kecamatanTerdekat || 'Kab. Hulu Sungai Utara'}. Titik siap dipetakan!`
        );
      }

      // Auto pin user position
      setActivePin({
        id: 'user-current-gps',
        title: 'Posisi GPS Petugas Saat Ini',
        type: 'kecamatan',
        lat: result.latitude,
        lng: result.longitude,
        details: {
          kecamatan: result.kecamatanTerdekat || 'Kabupaten Hulu Sungai Utara',
          akurasi: result.accuracy,
          jarakAmuntai: result.jarakKmKePusatAmuntai,
          source: result.source,
        },
      });
    } catch (err: any) {
      console.error(err);
      setGpsNotification('Tidak dapat membaca GPS, menggunakan titik pusat Kabupaten HSU.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Convert real lat/lng inside HSU bounding box to percentage coordinates on visual map
  // HSU Bounds: Lat -2.62 to -2.28 (height: 0.34 deg), Lng 115.00 to 115.42 (width: 0.42 deg)
  const mapCoordsToPercent = (lat: number, lng: number) => {
    const minLat = -2.62;
    const maxLat = -2.28;
    const minLng = 115.00;
    const maxLng = 115.42;

    const x = Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Latitude decreases as you go south, so invert for top-down percentage
    const y = Math.min(95, Math.max(5, ((maxLat - lat) / (maxLat - minLat)) * 100));

    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Peta Geospasial Kabupaten Hulu Sungai Utara
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GPS Presisi HSU
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualisasi sebaran spasial titik potensi pajak daerah dan objek PBB-P2 di 10 kecamatan Kabupaten Hulu Sungai Utara.
          </p>
        </div>

        {/* Action: Ambil Titik GPS Petugas Saat Ini */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleDetectUserGps}
            disabled={isDetectingGps}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            title="Deteksi Titik GPS Saat Ini"
          >
            <Crosshair className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Merekam Satelit GPS...' : 'Ambil Titik GPS Saya Saat Ini'}</span>
          </button>
        </div>
      </div>

      {/* GPS Notification Strip */}
      {gpsNotification && (
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{gpsNotification}</span>
          </div>
          <button
            onClick={() => setGpsNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
        
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setLayerFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              layerFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Semua Objek ({potensiList.length + pbbList.length})
          </button>

          <button
            onClick={() => setLayerFilter('potensi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerFilter === 'potensi'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Potensi Pajak ({potensiList.length})</span>
          </button>

          <button
            onClick={() => setLayerFilter('pbb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              layerFilter === 'pbb'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>PBB-P2 ({pbbList.length})</span>
          </button>
        </div>

        {/* Filter Kecamatan */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Seluruh 10 Kecamatan di Kab. HSU</option>
            {KECAMATAN_HSU.map((k, idx) => (
              <option key={idx} value={k.nama}>{k.nama}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Interactive Map Canvas */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Viewport Area */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative min-h-[520px] flex flex-col justify-between overflow-hidden">
          
          {/* Simulated Satellite / Map Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
          
          {/* Waterway / Sungai Balangan & Negara (Simulated curves in Amuntai) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 350 Q 250 280, 500 320 T 1000 290" fill="none" stroke="#0284c7" strokeWidth="18" strokeLinecap="round" />
            <path d="M 300 0 Q 380 200, 500 320 T 650 600" fill="none" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" />
          </svg>

          {/* Map Top Status Bar */}
          <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span className="font-bold text-white">Geospasial Pemkab HSU</span>
              <span className="text-slate-400 font-mono text-[10px]">
                Bounds: 2.42°S, 115.24°E
              </span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <span>Potensi Pajak</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                <span>PBB-P2</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                <span>Landmark HSU</span>
              </span>
            </div>
          </div>

          {/* Interactive Map Area with Positioned Pins */}
          <div className="relative w-full h-[380px] my-4 select-none">
            
            {/* 10 Kecamatan Centers */}
            {KECAMATAN_HSU.map((kec, idx) => {
              const pos = mapCoordsToPercent(kec.lat, kec.lng);
              const isSelected = selectedKecamatan === kec.nama;

              return (
                <div
                  key={idx}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => setActivePin({
                    id: `kec-${idx}`,
                    title: kec.nama,
                    type: 'kecamatan',
                    lat: kec.lat,
                    lng: kec.lng,
                    details: {
                      deskripsi: kec.deskripsi,
                      kelurahanContoh: kec.kelurahanContoh,
                    }
                  })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20 group ${isSelected ? 'scale-125' : ''}`}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-900/90 border border-slate-600 flex items-center justify-center text-slate-300 group-hover:border-amber-400 group-hover:text-amber-400 shadow-md">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-white bg-slate-950/80 px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1 border border-slate-800">
                      {kec.nama.replace('Kecamatan ', '')}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Potensi Pajak Pins */}
            {filteredPotensi.map((p) => {
              const pos = mapCoordsToPercent(p.latitude, p.longitude);
              const isSelected = activePin?.id === p.id;

              return (
                <div
                  key={p.id}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => setActivePin({
                    id: p.id,
                    title: p.namaUsaha,
                    type: 'potensi',
                    lat: p.latitude,
                    lng: p.longitude,
                    details: p,
                  })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-130 z-30 ${isSelected ? 'scale-140' : ''}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 animate-bounce-subtle">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

            {/* PBB-P2 Pins */}
            {filteredPbb.map((p) => {
              const pos = mapCoordsToPercent(p.latitude, p.longitude);
              const isSelected = activePin?.id === p.id;

              return (
                <div
                  key={p.id}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => setActivePin({
                    id: p.id,
                    title: p.namaWajibPajak,
                    type: 'pbb',
                    lat: p.latitude,
                    lng: p.longitude,
                    details: p,
                  })}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-130 z-30 ${isSelected ? 'scale-140' : ''}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-500 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-blue-950/50 animate-bounce-subtle">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

            {/* User Real GPS Pin */}
            {userGps && (
              <div
                style={{ left: mapCoordsToPercent(userGps.latitude, userGps.longitude).x, top: mapCoordsToPercent(userGps.latitude, userGps.longitude).y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-10 h-10 rounded-full bg-amber-500/20 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-950">
                    <Navigation2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Map Bottom Scale & Coordinate Hint */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
            <span>Pusat Ibukota: Amuntai (-2.424458, 115.247231)</span>
            <span>Skala Visual: Wilayah Geospasial Kabupaten HSU</span>
          </div>

        </div>

        {/* Selected Pin Detail Drawer / Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          {activePin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  activePin.type === 'potensi'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : activePin.type === 'pbb'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {activePin.type === 'potensi' ? 'Objek Potensi Pajak' : activePin.type === 'pbb' ? 'Objek PBB-P2' : 'Wilayah Kecamatan'}
                </span>

                <button
                  onClick={() => setActivePin(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Tutup
                </button>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">
                  {activePin.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activePin.details.kecamatan || activePin.title} &bull; {activePin.details.kelurahanDesa || 'Kab. Hulu Sungai Utara'}
                </p>
              </div>

              {/* Coordinates */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="text-emerald-400 flex items-center justify-between">
                  <span>Latitude:</span>
                  <span className="font-bold">{activePin.lat.toFixed(6)}</span>
                </div>
                <div className="text-emerald-400 flex items-center justify-between">
                  <span>Longitude:</span>
                  <span className="font-bold">{activePin.lng.toFixed(6)}</span>
                </div>
                <div className="text-slate-400 text-[10px] pt-1 flex items-center justify-between border-t border-slate-900">
                  <span>Validasi HSU:</span>
                  <span className="text-emerald-300 font-sans font-bold">Dalam Wilayah HSU</span>
                </div>
              </div>

              {/* Specific Details based on type */}
              {activePin.type === 'potensi' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Jenis Pajak:</span>
                    <span className="font-bold text-white">{activePin.details.jenisPajak}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Wajib Pajak:</span>
                    <span className="font-bold text-white">{activePin.details.namaWajibPajak}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Potensi Tahunan:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatRupiah(activePin.details.potensiRupiahTahunan)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status Verifikasi:</span>
                    <span className="font-bold text-emerald-300">{activePin.details.statusVerifikasi}</span>
                  </div>
                </div>
              )}

              {activePin.type === 'pbb' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">NOP:</span>
                    <span className="font-mono font-bold text-white">{activePin.details.nop}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Luas Tanah/Bgn:</span>
                    <span className="font-bold text-white">{activePin.details.luasBumiM2} m&sup2; / {activePin.details.luasBangunanM2} m&sup2;</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">PBB Terhutang:</span>
                    <span className="font-bold text-blue-400 font-mono">
                      {formatRupiah(activePin.details.pbbTerhutang)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status Bayar:</span>
                    <span className="font-bold text-emerald-300">{activePin.details.statusPembayaran}</span>
                  </div>
                </div>
              )}

              {activePin.type === 'kecamatan' && activePin.details.deskripsi && (
                <div className="text-xs space-y-2">
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {activePin.details.deskripsi}
                  </p>
                  {activePin.details.kelurahanContoh && (
                    <div className="text-[11px] text-slate-400">
                      <strong>Kelurahan/Desa Terkait:</strong>{' '}
                      {activePin.details.kelurahanContoh.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300">Pilih Titik di Peta</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Klik salah satu pin objek potensi pajak, objek PBB-P2, atau titik kecamatan untuk memeriksa rincian geospasial.
              </p>
            </div>
          )}

          {/* Bottom Action inside Inspector */}
          {onNavigateToForm && (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onNavigateToForm('potensi')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Input Potensi di Lokasi Ini</span>
              </button>

              <button
                onClick={() => onNavigateToForm('pbb')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>Input PBB-P2 di Lokasi Ini</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
