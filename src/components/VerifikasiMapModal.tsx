import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  X, 
  MapPin, 
  Layers, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  FileCheck, 
  Clock, 
  Building2, 
  Coins, 
  Receipt, 
  Navigation,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { VerificationStatus } from '../types';
import { getDefaultCoordsForKecamatan } from '../constants/wilayahHsu';

export interface VerifikasiMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'potensi' | 'pbb' | 'retribusi';
  id: string;
  name: string;
  nomor: string;
  kecamatan: string;
  kelurahanDesa: string;
  alamat: string;
  latitude: number;
  longitude: number;
  statusVerifikasi: VerificationStatus;
  nilaiFiskalLabel: string;
  nilaiFiskalRp: string;
  fotoUrl?: string;
  fotoName?: string;
  petugas?: string;
  onUpdateStatus?: (id: string, newStatus: VerificationStatus, note?: string) => void;
  onOpenFullMap?: () => void;
}

type MapTileType = 'google_hybrid' | 'google_streets' | 'google_satellite' | 'esri_satellite';

const MAP_TILES: Record<MapTileType, { name: string; url: string; options: L.TileLayerOptions }> = {
  google_hybrid: {
    name: 'Google Hybrid',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Hybrid Satelit + Jalan HSU'
    }
  },
  google_streets: {
    name: 'Google Streets',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Peta Jalan HSU'
    }
  },
  google_satellite: {
    name: 'Google Satelit',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Citra Satelit'
    }
  },
  esri_satellite: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: '&copy; Esri &bull; High Resolution Imagery'
    }
  }
};

export const VerifikasiMapModal: React.FC<VerifikasiMapModalProps> = ({
  isOpen,
  onClose,
  itemType,
  id,
  name,
  nomor,
  kecamatan,
  kelurahanDesa,
  alamat,
  latitude,
  longitude,
  statusVerifikasi,
  nilaiFiskalLabel,
  nilaiFiskalRp,
  fotoUrl,
  fotoName,
  petugas,
  onUpdateStatus,
  onOpenFullMap,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [mapType, setMapType] = useState<MapTileType>('google_hybrid');
  const [internalStatus, setInternalStatus] = useState<VerificationStatus>(statusVerifikasi);

  useEffect(() => {
    setInternalStatus(statusVerifikasi);
  }, [statusVerifikasi]);

  // Determine effective coordinates
  const hasValidCoords = latitude !== 0 && longitude !== 0 && !isNaN(latitude) && !isNaN(longitude);
  const effectiveCoords: [number, number] = hasValidCoords
    ? [latitude, longitude]
    : (() => {
        const fallback = getDefaultCoordsForKecamatan(kecamatan);
        return [fallback.lat, fallback.lng];
      })();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapElementRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapElementRef.current, {
        center: effectiveCoords,
        zoom: hasValidCoords ? 17 : 14,
        zoomControl: true,
        attributionControl: false
      });

      const tileConfig = MAP_TILES[mapType];
      const tileLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(map);
      tileLayerRef.current = tileLayer;

      // Color based on type
      const markerColor = itemType === 'potensi' ? '#10b981' : itemType === 'retribusi' ? '#f59e0b' : '#3b82f6';
      const badgeLabel = itemType === 'potensi' ? 'POTENSI PAJAK' : itemType === 'retribusi' ? 'RETRIBUSI DAERAH' : 'PBB-P2';

      const customHtmlIcon = L.divIcon({
        className: 'custom-verif-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            background: radial-gradient(circle, ${markerColor} 0%, #0f172a 100%);
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            transform: translate(-50%, -50%);
          ">
            <span style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%; display: block;"></span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker(effectiveCoords, { icon: customHtmlIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11px; color: #0f172a; min-width: 200px;">
          <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${markerColor}; margin-bottom: 2px;">
            ${badgeLabel} &bull; ${nomor}
          </div>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 3px;">
            ${name}
          </div>
          <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">
            <strong>Kelurahan/Desa:</strong> ${kelurahanDesa || '-'}<br/>
            <strong>Alamat:</strong> ${alamat || '-'}<br/>
            <strong>Kecamatan:</strong> ${kecamatan}
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #64748b; background: #f1f5f9; padding: 3px 6px; border-radius: 4px;">
            GPS: ${effectiveCoords[0].toFixed(6)}, ${effectiveCoords[1].toFixed(6)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml).openPopup();
      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Invalidate size to ensure clean tile rendering
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, latitude, longitude, kecamatan]);

  // Handle layer switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = MAP_TILES[mapType];
    const newLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapType]);

  if (!isOpen) return null;

  const handleSetStatus = (newStatus: VerificationStatus) => {
    setInternalStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(id, newStatus);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${effectiveCoords[0]},${effectiveCoords[1]}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              itemType === 'potensi'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : itemType === 'retribusi'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Verifikasi Geospasial &amp; Lihat Map
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  itemType === 'potensi'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : itemType === 'retribusi'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {itemType === 'potensi' ? 'Potensi Pajak' : itemType === 'retribusi' ? 'Retribusi Daerah' : 'PBB-P2'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfirmasi akurasi titik koordinat GPS dan lokasi fisik persil objek di Kabupaten Hulu Sungai Utara
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Info & Quick Address Box */}
        <div className="my-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wajib Pajak / Objek</span>
            <strong className="text-white block truncate text-xs">{name}</strong>
            <span className="text-[10px] text-slate-400 font-mono">{nomor}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kelurahan / Desa &amp; Kec.</span>
            <strong className="text-emerald-400 block truncate text-xs">
              {kelurahanDesa || '-'}
            </strong>
            <span className="text-[10px] text-slate-300">{kecamatan}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alamat Lengkap</span>
            <p className="text-slate-200 text-xs line-clamp-2" title={alamat}>
              {alamat || 'Alamat tidak terisi spesifik'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Koordinat Geospasial</span>
              <span className="text-xs font-mono font-bold text-amber-300 block">
                {effectiveCoords[0].toFixed(6)}, {effectiveCoords[1].toFixed(6)}
              </span>
            </div>
            {!hasValidCoords && (
              <span className="text-[9px] text-amber-400/90 italic">
                *Menggunakan koordinat pusat {kecamatan}
              </span>
            )}
          </div>
        </div>

        {/* Map View & Layer Selector */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex-1 min-h-[340px] sm:min-h-[400px]">
          
          {/* Layer switcher overlay */}
          <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-1 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-teal-400 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setMapType('google_hybrid')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                mapType === 'google_hybrid'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Google Hybrid
            </button>
            <button
              type="button"
              onClick={() => setMapType('google_streets')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                mapType === 'google_streets'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Google Streets
            </button>
            <button
              type="button"
              onClick={() => setMapType('esri_satellite')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                mapType === 'esri_satellite'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Esri HD
            </button>
          </div>

          {/* Leaflet container */}
          <div ref={mapElementRef} className="w-full h-full min-h-[340px] sm:min-h-[400px]" />

          {/* Bottom map overlay with External Google Maps link */}
          <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Buka di Google Maps Eksternal</span>
            </a>

            {onOpenFullMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white text-[11px] font-bold border border-teal-500 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Buka di Peta Geospasial HSU Penuh</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions: Status Verification */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 font-semibold">Status Saat Ini:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1.5 border ${
              internalStatus === 'Setuju'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : internalStatus === 'Verifikasi'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {internalStatus === 'Setuju' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {internalStatus === 'Verifikasi' && <FileCheck className="w-3.5 h-3.5 text-blue-400" />}
              {internalStatus === 'Menunggu Verifikasi' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{internalStatus}</span>
            </span>
          </div>

          {/* Quick status change buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-slate-500 text-[11px] hidden md:inline mr-1">Aksi Verifikasi Lokasi:</span>

            {internalStatus !== 'Menunggu Verifikasi' && (
              <button
                type="button"
                onClick={() => handleSetStatus('Menunggu Verifikasi')}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Tunda
              </button>
            )}

            {internalStatus !== 'Verifikasi' && (
              <button
                type="button"
                onClick={() => handleSetStatus('Verifikasi')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all cursor-pointer active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>Verifikasi Data</span>
              </button>
            )}

            {internalStatus !== 'Setuju' && (
              <button
                type="button"
                onClick={() => handleSetStatus('Setuju')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setuju &amp; Valid</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
