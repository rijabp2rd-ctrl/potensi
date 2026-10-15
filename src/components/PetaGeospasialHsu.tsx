import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
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
  Info,
  Coins,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Image as ImageIcon,
  X,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Calendar,
  Lock,
  Globe,
  Maximize2
} from 'lucide-react';
import { PotensiPajakEntry, PbbP2Entry, RetribusiDaerahEntry, AppUser, GpsCoordinateResult } from '../types';
import { 
  KABUPATEN_HSU, 
  KECAMATAN_HSU, 
  TITIK_PRESET_HSU, 
  isWithinHsuRegion,
  getDefaultCoordsForKecamatan 
} from '../constants/wilayahHsu';
import { capturePreciseGpsCoordinate, calculateHaversineDistance, getClosestKecamatanHsu } from '../services/gpsService';

// Tile Layer Configurations for Google Maps / Google Hybrid
type MapTileType = 'google_hybrid' | 'google_streets' | 'google_satellite' | 'esri_satellite';

const MAP_TILE_CONFIGS: Record<MapTileType, { name: string; url: string; options: L.TileLayerOptions }> = {
  google_hybrid: {
    name: 'Google Hybrid (Satelit + Jalan)',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Citra Satelit Hybrid HSU'
    }
  },
  google_streets: {
    name: 'Google Streets (Peta Jalan)',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Peta Jalan'
    }
  },
  google_satellite: {
    name: 'Google Satelit Murni',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; Google Maps &bull; Foto Satelit'
    }
  },
  esri_satellite: {
    name: 'Esri World Imagery HD',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: '&copy; Esri &bull; High Resolution Imagery'
    }
  }
};

interface PetaGeospasialHsuProps {
  potensiList: PotensiPajakEntry[];
  pbbList: PbbP2Entry[];
  retribusiList?: RetribusiDaerahEntry[];
  currentUser: AppUser | null;
  onNavigateToForm?: (type: 'potensi' | 'pbb' | 'retribusi') => void;
}

export const PetaGeospasialHsu: React.FC<PetaGeospasialHsuProps> = ({
  potensiList,
  pbbList,
  retribusiList = [],
  currentUser,
  onNavigateToForm,
}) => {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [layerFilter, setLayerFilter] = useState<'all' | 'retribusi' | 'potensi' | 'pbb'>('all');
  const [selectedGolonganRetribusi, setSelectedGolonganRetribusi] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTableTab, setActiveTableTab] = useState<'retribusi' | 'potensi' | 'pbb'>('retribusi');
  const [mapType, setMapType] = useState<MapTileType>('google_hybrid');
  
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{
    url: string;
    title: string;
    subtitle: string;
    coords?: string;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activePin, setActivePin] = useState<{
    id: string;
    title: string;
    type: 'potensi' | 'retribusi' | 'pbb' | 'kecamatan';
    lat: number;
    lng: number;
    details: any;
  } | null>(null);

  // User current GPS state
  const [userGps, setUserGps] = useState<GpsCoordinateResult | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  // Filtered data
  const filteredPotensi = potensiList.filter((p) => {
    const matchKec = selectedKecamatan === 'all' || p.kecamatan === selectedKecamatan;
    const matchLayer = layerFilter === 'all' || layerFilter === 'potensi';
    const matchSearch = !searchQuery.trim() || 
      p.namaUsaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jenisPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKec && matchLayer && matchSearch;
  });

  const filteredRetribusi = retribusiList.filter((r) => {
    const matchKec = selectedKecamatan === 'all' || r.kecamatan === selectedKecamatan;
    const matchLayer = layerFilter === 'all' || layerFilter === 'retribusi';
    const matchGol = selectedGolonganRetribusi === 'all' || r.golonganRetribusi === selectedGolonganRetribusi;
    const matchSearch = !searchQuery.trim() || 
      r.subObjekRetribusi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subRekening.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nomorRegister.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.namaPengelola && r.namaPengelola.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKec && matchLayer && matchGol && matchSearch;
  });

  const filteredPbb = pbbList.filter((p) => {
    const matchKec = selectedKecamatan === 'all' || p.kecamatan === selectedKecamatan;
    const matchLayer = layerFilter === 'all' || layerFilter === 'pbb';
    const matchSearch = !searchQuery.trim() || 
      p.namaWajibPajak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKec && matchLayer && matchSearch;
  });

  // Financial totals for Retribusi and other PAD sources
  const totalRetribusiRupiah = retribusiList.reduce((acc, r) => acc + (r.potensiPertahun || 0), 0);
  const totalRetribusiJasaUmum = retribusiList
    .filter(r => r.golonganRetribusi === 'Retribusi Jasa Umum')
    .reduce((acc, r) => acc + (r.potensiPertahun || 0), 0);
  const totalRetribusiJasaUsaha = retribusiList
    .filter(r => r.golonganRetribusi === 'Retribusi Jasa Usaha')
    .reduce((acc, r) => acc + (r.potensiPertahun || 0), 0);

  const totalPotensiPajakRupiah = potensiList.reduce((acc, p) => acc + (p.potensiRupiahTahunan || 0), 0);
  const totalPbbRupiah = pbbList.reduce((acc, p) => acc + (p.pbbTerhutang || 0), 0);
  const totalPadGeospasial = totalRetribusiRupiah + totalPotensiPajakRupiah + totalPbbRupiah;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapElementRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Amuntai / Kabupaten Hulu Sungai Utara
    const hsuCenter: [number, number] = [-2.424458, 115.247231];
    const map = L.map(mapElementRef.current, {
      center: hsuCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Add Tile Layer
    const tileConfig = MAP_TILE_CONFIGS[mapType];
    const initialTileLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(map);
    tileLayerRef.current = initialTileLayer;

    // Layer Group for markers
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Tile Switch (Google Hybrid, Google Streets, etc.)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileConfig = MAP_TILE_CONFIGS[mapType];
    const newLayer = L.tileLayer(tileConfig.url, tileConfig.options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapType]);

  // 3. Render Leaflet Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // A. Markers: Retribusi Daerah (Golden Amber)
    filteredRetribusi.forEach((r) => {
      const isSelected = activePin?.id === r.id;
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <span class="absolute -inset-1.5 rounded-2xl bg-amber-400/40 animate-pulse"></span>
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 ${isSelected ? 'border-white ring-4 ring-amber-400 scale-125' : 'border-slate-900'} flex items-center justify-center text-slate-950 font-black shadow-2xl transition-transform">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'retribusi-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: customIcon }).addTo(layerGroup);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px; padding: 4px;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #f59e0b; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); padding: 2px 6px; border-radius: 6px;">
            ${r.golonganRetribusi}
          </span>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">
            ${r.subObjekRetribusi}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            ${r.subRekening} &bull; ${r.kecamatan}
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; color: #64748b; display: block;">Estimasi Potensi Pertahun:</span>
            <span style="font-size: 13px; font-weight: 900; color: #b45309; font-family: monospace;">
              ${formatRupiah(r.potensiPertahun)}
            </span>
          </div>
          <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">
            Lat: ${r.latitude.toFixed(5)}, Lng: ${r.longitude.toFixed(5)}
          </span>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActivePin({
          id: r.id,
          title: r.subObjekRetribusi,
          type: 'retribusi',
          lat: r.latitude,
          lng: r.longitude,
          details: r,
        });
      });
    });

    // B. Markers: Potensi Pajak (Emerald Green)
    filteredPotensi.forEach((p) => {
      const isSelected = activePin?.id === p.id;
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-7 h-7 rounded-xl bg-emerald-500 border-2 ${isSelected ? 'border-white ring-4 ring-emerald-400 scale-125' : 'border-slate-900'} flex items-center justify-center text-white font-bold shadow-xl transition-transform">
            <svg class="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'potensi-map-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon }).addTo(layerGroup);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px; padding: 4px;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #059669; background: rgba(5,150,105,0.15); border: 1px solid rgba(5,150,105,0.3); padding: 2px 6px; border-radius: 6px;">
            ${p.jenisPajak}
          </span>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">
            ${p.namaUsaha}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            WP: ${p.namaWajibPajak} &bull; ${p.kecamatan}
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px;">
            <span style="font-size: 10px; color: #64748b; display: block;">Potensi Tahunan:</span>
            <span style="font-size: 13px; font-weight: 900; color: #047857; font-family: monospace;">
              ${formatRupiah(p.potensiRupiahTahunan)}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActivePin({
          id: p.id,
          title: p.namaUsaha,
          type: 'potensi',
          lat: p.latitude,
          lng: p.longitude,
          details: p,
        });
      });
    });

    // C. Markers: PBB-P2 (Blue)
    filteredPbb.forEach((p) => {
      const isSelected = activePin?.id === p.id;
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-7 h-7 rounded-xl bg-blue-600 border-2 ${isSelected ? 'border-white ring-4 ring-blue-400 scale-125' : 'border-slate-900'} flex items-center justify-center text-white font-bold shadow-xl transition-transform">
            <svg class="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'pbb-map-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon }).addTo(layerGroup);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px; padding: 4px;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #2563eb; background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); padding: 2px 6px; border-radius: 6px;">
            PBB-P2 &bull; ${p.statusPembayaran}
          </span>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 6px 0 2px 0;">
            ${p.namaWajibPajak}
          </h4>
          <p style="font-size: 11px; color: #64748b; font-family: monospace; margin: 0 0 6px 0;">
            NOP: ${p.nop}
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px;">
            <span style="font-size: 10px; color: #64748b; display: block;">PBB Terhutang:</span>
            <span style="font-size: 13px; font-weight: 900; color: #1d4ed8; font-family: monospace;">
              ${formatRupiah(p.pbbTerhutang)}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActivePin({
          id: p.id,
          title: p.namaWajibPajak,
          type: 'pbb',
          lat: p.latitude,
          lng: p.longitude,
          details: p,
        });
      });
    });

    // D. Markers: 10 Kecamatan Centers
    KECAMATAN_HSU.forEach((kec, idx) => {
      const isSelected = selectedKecamatan === kec.nama;
      const iconHtml = `
        <div class="flex flex-col items-center cursor-pointer group">
          <div class="w-5 h-5 rounded-full bg-slate-900/90 border border-slate-600 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-125 transition-transform">
            <svg class="w-3 h-3 stroke-current fill-none stroke-2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <span class="text-[9px] font-bold text-white bg-slate-950/85 px-1.5 py-0.5 rounded shadow mt-0.5 border border-slate-800 whitespace-nowrap">
            ${kec.nama.replace('Kecamatan ', '')}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'kec-map-pin',
        iconSize: [60, 36],
        iconAnchor: [30, 18]
      });

      const marker = L.marker([kec.lat, kec.lng], { icon: customIcon }).addTo(layerGroup);
      marker.on('click', () => {
        setActivePin({
          id: `kec-${idx}`,
          title: kec.nama,
          type: 'kecamatan',
          lat: kec.lat,
          lng: kec.lng,
          details: {
            deskripsi: kec.deskripsi,
            kelurahanContoh: kec.kelurahanContoh,
          }
        });
      });
    });

    // E. User GPS Marker
    if (userGps) {
      const iconHtml = `
        <div class="relative flex items-center justify-center">
          <span class="w-8 h-8 rounded-full bg-emerald-400/40 animate-ping absolute"></span>
          <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-2xl">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          </div>
        </div>
      `;
      const gpsIcon = L.divIcon({
        html: iconHtml,
        className: 'user-gps-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([userGps.latitude, userGps.longitude], { icon: gpsIcon }).addTo(layerGroup);
    }
  }, [filteredRetribusi, filteredPotensi, filteredPbb, selectedKecamatan, activePin, userGps]);

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

      // Fly map to user position
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([result.latitude, result.longitude], 15, { animate: true, duration: 1.2 });
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

  // Focus a specific item on map and scroll up smoothly
  const handleFocusOnMap = (item: any, type: 'retribusi' | 'potensi' | 'pbb') => {
    if (type === 'retribusi') {
      setActivePin({
        id: item.id,
        title: item.subObjekRetribusi,
        type: 'retribusi',
        lat: item.latitude,
        lng: item.longitude,
        details: item,
      });
    } else if (type === 'potensi') {
      setActivePin({
        id: item.id,
        title: item.namaUsaha,
        type: 'potensi',
        lat: item.latitude,
        lng: item.longitude,
        details: item,
      });
    } else {
      setActivePin({
        id: item.id,
        title: item.namaWajibPajak,
        type: 'pbb',
        lat: item.latitude,
        lng: item.longitude,
        details: item,
      });
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.latitude, item.longitude], 16, { animate: true, duration: 1.2 });
    }

    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleResetMapCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-2.424458, 115.247231], 12, { animate: true, duration: 1 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Peta Geospasial Kabupaten Hulu Sungai Utara
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Potensi Retribusi Daerah</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Google Maps &amp; Hybrid</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
            Visualisasi citra satelit dan geospasial presisi titik <strong>Potensi Retribusi Daerah</strong>, potensi pajak daerah, dan objek PBB-P2 di 10 kecamatan Kabupaten Hulu Sungai Utara.
          </p>
        </div>

        {/* Action: Ambil Titik GPS Petugas Saat Ini & Input Cepat */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleDetectUserGps}
            disabled={isDetectingGps}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            title="Deteksi Titik GPS Saat Ini"
          >
            <Crosshair className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Merekam Satelit GPS...' : 'Ambil Titik GPS Saya'}</span>
          </button>

          {onNavigateToForm && (
            <button
              onClick={() => onNavigateToForm('retribusi')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
            >
              <Coins className="w-4 h-4 text-slate-950" />
              <span>+ Input Retribusi</span>
            </button>
          )}
        </div>
      </div>

      {/* GPS Notification Strip */}
      {gpsNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{gpsNotification}</span>
          </div>
          <button
            onClick={() => setGpsNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: POTENSI RETRIBUSI DAERAH */}
        <div 
          onClick={() => {
            setLayerFilter('retribusi');
            setActiveTableTab('retribusi');
          }}
          className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden shadow-xl ${
            layerFilter === 'retribusi' 
              ? 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-500 ring-2 ring-amber-500/30' 
              : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400/60'
          }`}
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>Potensi Retribusi Daerah</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {retribusiList.length} Titik Objek
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
              {formatRupiah(totalRetribusiRupiah)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Estimasi per tahun di HSU</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Jasa Umum: <strong className="text-amber-200">{formatRupiah(totalRetribusiJasaUmum)}</strong></span>
            <span>Jasa Usaha: <strong className="text-amber-200">{formatRupiah(totalRetribusiJasaUsaha)}</strong></span>
          </div>
        </div>

        {/* Card 2: POTENSI PAJAK DAERAH */}
        <div 
          onClick={() => {
            setLayerFilter('potensi');
            setActiveTableTab('potensi');
          }}
          className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden shadow-xl ${
            layerFilter === 'potensi' 
              ? 'bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/30' 
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Potensi Pajak Daerah</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {potensiList.length} Objek Usaha
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formatRupiah(totalPotensiPajakRupiah)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">PBJT, Reklame, MBLB, Air Tanah</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Status Verifikasi:</span>
            <span className="text-emerald-400 font-bold">Terdata Realtime</span>
          </div>
        </div>

        {/* Card 3: PBB-P2 */}
        <div 
          onClick={() => {
            setLayerFilter('pbb');
            setActiveTableTab('pbb');
          }}
          className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden shadow-xl ${
            layerFilter === 'pbb' 
              ? 'bg-gradient-to-b from-blue-950/50 to-slate-900 border-blue-500 ring-2 ring-blue-500/30' 
              : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-blue-400 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Objek PBB-P2</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {pbbList.length} NOP Terdata
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formatRupiah(totalPbbRupiah)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Ketetapan Pokok PBB-P2</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Wilayah Pemetaan:</span>
            <span className="text-blue-400 font-bold">10 Kecamatan HSU</span>
          </div>
        </div>

        {/* Card 4: AKUMULASI POTENSI PAD HSU */}
        <div 
          onClick={() => setLayerFilter('all')}
          className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-700/80 shadow-xl cursor-pointer hover:border-amber-400/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Akumulasi PAD Geospasial</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {retribusiList.length + potensiList.length + pbbList.length} Titik Total
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-300 font-mono tracking-tight">
              {formatRupiah(totalPadGeospasial)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Total Potensi Fiskal Daerah HSU</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Basis Data:</span>
            <span className="text-amber-300 font-bold">BP2RD Kab. HSU 2026</span>
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        
        {/* Top Controls: Layers & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Layer Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLayerFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                layerFilter === 'all'
                  ? 'bg-slate-100 text-slate-950 shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Semua Objek ({potensiList.length + pbbList.length + retribusiList.length})
            </button>

            <button
              onClick={() => {
                setLayerFilter('retribusi');
                setActiveTableTab('retribusi');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layerFilter === 'retribusi'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/30'
                  : 'bg-slate-950/70 text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/40'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Potensi Retribusi ({retribusiList.length})</span>
            </button>

            <button
              onClick={() => {
                setLayerFilter('potensi');
                setActiveTableTab('potensi');
              }}
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
              onClick={() => {
                setLayerFilter('pbb');
                setActiveTableTab('pbb');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layerFilter === 'pbb'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>PBB-P2 ({pbbList.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari objek retribusi, pasar, usaha..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                &times;
              </button>
            )}
          </div>

        </div>

        {/* Secondary Filter Row: Kecamatan & Golongan Retribusi */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* Sub Golongan Retribusi Filter (Saat Retribusi aktif atau Semua) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Golongan Retribusi:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedGolonganRetribusi('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGolonganRetribusi === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semua Golongan
              </button>
              <button
                onClick={() => setSelectedGolonganRetribusi('Retribusi Jasa Umum')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGolonganRetribusi === 'Retribusi Jasa Umum'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Jasa Umum (Pasar/Puskesmas)
              </button>
              <button
                onClick={() => setSelectedGolonganRetribusi('Retribusi Jasa Usaha')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGolonganRetribusi === 'Retribusi Jasa Usaha'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Jasa Usaha (Terminal/Dermaga/Sewa)
              </button>
              <button
                onClick={() => setSelectedGolonganRetribusi('Retribusi Perizinan Tertentu')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedGolonganRetribusi === 'Retribusi Perizinan Tertentu'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Perizinan Tertentu (PBG)
              </button>
            </div>
          </div>

          {/* Filter Kecamatan */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-bold text-xs">Kecamatan:</span>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Seluruh 10 Kecamatan di Kab. HSU</option>
              {KECAMATAN_HSU.map((k, idx) => (
                <option key={idx} value={k.nama}>{k.nama}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Main Interactive Map & Inspector Section */}
      <div ref={mapContainerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real Interactive Google Maps / Google Hybrid Viewport */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden">
          
          {/* Top Control Bar with Tile Layer Switcher */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 font-bold text-amber-400 flex items-center gap-1.5 shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                <span>Peta Satelit HSU</span>
              </span>
              
              {/* Layer Switcher Buttons: Google Hybrid, Google Streets, etc. */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMapType('google_hybrid')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mapType === 'google_hybrid'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Google Hybrid: Citra Satelit + Nama Jalan, Desa, & Batas Wilayah HSU"
                >
                  🛰️ Google Hybrid
                </button>

                <button
                  type="button"
                  onClick={() => setMapType('google_streets')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mapType === 'google_streets'
                      ? 'bg-blue-600 text-white font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Google Streets: Peta Jalan Standar Google"
                >
                  🗺️ Google Jalan
                </button>

                <button
                  type="button"
                  onClick={() => setMapType('google_satellite')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mapType === 'google_satellite'
                      ? 'bg-emerald-600 text-white font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Google Satelit Murni"
                >
                  🌍 Satelit Murni
                </button>

                <button
                  type="button"
                  onClick={() => setMapType('esri_satellite')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer hidden sm:inline-block ${
                    mapType === 'esri_satellite'
                      ? 'bg-teal-600 text-white font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Esri World Imagery HD"
                >
                  🛰️ Esri HD
                </button>
              </div>
            </div>

            {/* Quick Actions: Reset View & Indicators */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetMapCenter}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Pusatkan ke Amuntai"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Pusat HSU</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span className="text-amber-300 font-bold">{filteredRetribusi.length} Retribusi</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                  <span className="text-emerald-300 font-bold">{filteredPotensi.length} Pajak</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" />
                  <span className="text-blue-300 font-bold">{filteredPbb.length} PBB</span>
                </span>
              </div>
            </div>
          </div>

          {/* Leaflet Map Interactive Canvas Container */}
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner bg-slate-900">
            <div 
              ref={mapElementRef} 
              id="hsu-interactive-map" 
              className="w-full h-full z-0" 
            />

            {/* Floating Map Navigation Help / Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[400] pointer-events-none">
              <div className="bg-slate-950/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl shadow-xl text-[10px] text-slate-300 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold text-amber-300">Retribusi Daerah</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Potensi Pajak</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>PBB-P2</span>
                </span>
              </div>
            </div>
          </div>

          {/* Map Bottom Scale & Coordinate Hint */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-900 text-[11px] text-slate-400 font-mono">
            <span>Pusat Ibukota: Amuntai (-2.424458, 115.247231)</span>
            <span className="text-amber-400 font-sans font-bold">● Klik titik pin di peta untuk melihat kalkulasi &amp; foto lapangan</span>
            <span>Tampilan: {MAP_TILE_CONFIGS[mapType].name}</span>
          </div>

        </div>

        {/* Selected Pin Detail Drawer / Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          {activePin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  activePin.type === 'retribusi'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : activePin.type === 'potensi'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : activePin.type === 'pbb'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {activePin.type === 'retribusi' 
                    ? 'Objek Retribusi Daerah' 
                    : activePin.type === 'potensi' 
                    ? 'Objek Potensi Pajak' 
                    : activePin.type === 'pbb' 
                    ? 'Objek PBB-P2' 
                    : 'Wilayah Kecamatan'}
                </span>

                <button
                  onClick={() => setActivePin(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  Tutup &times;
                </button>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">
                  {activePin.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activePin.details.kecamatan || activePin.title} &bull; {activePin.details.kelurahanDesa || 'Kabupaten HSU'}
                </p>
                {activePin.details.alamatLengkap && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {activePin.details.alamatLengkap}
                  </p>
                )}
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
                  <span className="text-emerald-300 font-sans font-bold">Google Maps Geospasial HSU</span>
                </div>
              </div>

              {/* RETRIBUSI DETAILS IN INSPECTOR */}
              {activePin.type === 'retribusi' && (
                <div className="space-y-2 text-xs">
                  
                  {/* Foto Fisik Objek Retribusi jika ada */}
                  {activePin.details.fotoObjekRetribusiUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                      <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Foto Fisik Objek Retribusi</span>
                        </span>
                        <button
                          onClick={() => setPreviewPhotoModal({
                            url: activePin.details.fotoObjekRetribusiUrl,
                            title: activePin.details.subObjekRetribusi,
                            subtitle: `${activePin.details.nomorRegister} • ${activePin.details.kecamatan}`,
                            coords: `${activePin.lat.toFixed(6)}, ${activePin.lng.toFixed(6)}`
                          })}
                          className="text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lihat Penuh</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                      <img 
                        src={activePin.details.fotoObjekRetribusiUrl} 
                        alt={activePin.details.subObjekRetribusi}
                        className="w-full h-28 object-cover rounded-lg border border-slate-800 cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewPhotoModal({
                          url: activePin.details.fotoObjekRetribusiUrl,
                          title: activePin.details.subObjekRetribusi,
                          subtitle: `${activePin.details.nomorRegister} • ${activePin.details.kecamatan}`,
                          coords: `${activePin.lat.toFixed(6)}, ${activePin.lng.toFixed(6)}`
                        })}
                      />
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Golongan:</span>
                    <span className="font-bold text-amber-300 text-right">{activePin.details.golonganRetribusi}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Sub Rekening:</span>
                    <span className="font-bold text-white text-right">{activePin.details.subRekening}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">No. Register:</span>
                    <span className="font-mono text-slate-300">{activePin.details.nomorRegister}</span>
                  </div>
                  {activePin.details.tahun && (
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Tahun Anggaran:</span>
                      <span className="font-bold text-amber-400 font-mono">{activePin.details.tahun}</span>
                    </div>
                  )}
                  {activePin.details.namaPengelola && (
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Pengelola/SK:</span>
                      <span className="font-bold text-white text-right">{activePin.details.namaPengelola}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Tarif / Volume:</span>
                    <span className="text-white text-right font-mono">
                      {formatRupiah(activePin.details.tarifSatuan)} &times; {activePin.details.jumlahSatuan} ({activePin.details.satuanTarif})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Potensi Perbulan:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatRupiah(activePin.details.potensiPerbulan)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-amber-950/20 px-2 rounded-xl border border-amber-800/40">
                    <span className="text-amber-400 font-bold">Potensi Tahunan:</span>
                    <span className="font-black text-amber-300 font-mono text-sm">
                      {formatRupiah(activePin.details.potensiPertahun)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status Verifikasi:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      activePin.details.statusVerifikasi === 'Setuju'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : activePin.details.statusVerifikasi === 'Verifikasi'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {activePin.details.statusVerifikasi}
                    </span>
                  </div>
                </div>
              )}

              {/* POTENSI PAJAK DETAILS */}
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
                  {activePin.details.tahun && (
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Tahun Pajak:</span>
                      <span className="font-bold text-emerald-400 font-mono">{activePin.details.tahun}</span>
                    </div>
                  )}
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

              {/* PBB DETAILS */}
              {activePin.type === 'pbb' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">NOP:</span>
                    <span className="font-mono font-bold text-white">{activePin.details.nop}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Tahun Pajak:</span>
                    <span className="font-mono font-bold text-blue-400">{activePin.details.tahunPajak || 2026}</span>
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

              {/* KECAMATAN DETAILS */}
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
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Pilih Titik di Peta Google</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Klik salah satu pin <strong className="text-amber-400">Objek Retribusi Daerah</strong>, potensi pajak, atau objek PBB-P2 pada peta untuk memeriksa rincian kalkulasi fiskal dan koordinat satelit.
              </p>
            </div>
          )}

          {/* Bottom Actions inside Inspector */}
          {onNavigateToForm && (
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2 mt-4">
              <button
                onClick={() => onNavigateToForm('retribusi')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4 text-slate-950" />
                <span>Input Retribusi di Lokasi Ini</span>
              </button>

              <button
                onClick={() => onNavigateToForm('potensi')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Input Potensi Pajak di Lokasi Ini</span>
              </button>

              <button
                onClick={() => onNavigateToForm('pbb')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-blue-400" />
                <span>Input PBB-P2 di Lokasi Ini</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* SECTION DAFTAR TITIK SEBARAN GEOSPASIAL DI BAWAH PETA */}
      {/* SESUAI PERMINTAAN PENGGUNA: DAFTAR TITIK POTENSI TERPETAKAN HANYA BISA TAMPIL DI ADMIN */}
      {currentUser?.role === 'admin' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>Daftar Titik Potensi Terpetakan di Kabupaten HSU</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Akses Khusus Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rincian data lapangan yang terhubung dengan koordinat satelit geospasial di 10 kecamatan Kabupaten Hulu Sungai Utara.
              </p>
            </div>

            {/* Switch Tab Antara Retribusi, Pajak, dan PBB */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveTableTab('retribusi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTableTab === 'retribusi'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Retribusi Daerah ({filteredRetribusi.length})</span>
              </button>

              <button
                onClick={() => setActiveTableTab('potensi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTableTab === 'potensi'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Potensi Pajak ({filteredPotensi.length})</span>
              </button>

              <button
                onClick={() => setActiveTableTab('pbb')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTableTab === 'pbb'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>PBB-P2 ({filteredPbb.length})</span>
              </button>
            </div>
          </div>

          {/* TABEL / KARTU OBJEK RETRIBUSI DAERAH */}
          {activeTableTab === 'retribusi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Menampilkan <strong>{filteredRetribusi.length}</strong> objek retribusi daerah</span>
                <span className="font-mono text-amber-300 font-bold">
                  Total Nilai: {formatRupiah(filteredRetribusi.reduce((acc, r) => acc + (r.potensiPertahun || 0), 0))} / tahun
                </span>
              </div>

              {filteredRetribusi.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">Tidak ada objek retribusi yang sesuai dengan filter.</p>
                  <p className="text-xs text-slate-500 mt-1">Coba ubah filter kecamatan atau ketik kata kunci lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRetribusi.map((ret) => (
                    <div
                      key={ret.id}
                      className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-amber-400/60 shadow-lg ${
                        activePin?.id === ret.id ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {ret.golonganRetribusi}
                              </span>
                              {ret.tahun && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                                  {ret.tahun}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-extrabold text-white mt-1.5 leading-snug">
                              {ret.subObjekRetribusi}
                            </h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            ret.statusVerifikasi === 'Setuju'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ret.statusVerifikasi === 'Verifikasi'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {ret.statusVerifikasi}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ret.subRekening}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{ret.kecamatan} &bull; {ret.kelurahanDesa}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 flex items-center justify-between">
                            <span>Register: {ret.nomorRegister}</span>
                            <span className="text-emerald-400">{ret.latitude.toFixed(5)}, {ret.longitude.toFixed(5)}</span>
                          </div>
                        </div>

                        {/* Foto thumbnail jika tersedia */}
                        {ret.fotoObjekRetribusiUrl && (
                          <div 
                            onClick={() => setPreviewPhotoModal({
                              url: ret.fotoObjekRetribusiUrl!,
                              title: ret.subObjekRetribusi,
                              subtitle: `${ret.nomorRegister} • ${ret.kecamatan}`,
                              coords: `${ret.latitude.toFixed(6)}, ${ret.longitude.toFixed(6)}`
                            })}
                            className="relative h-24 rounded-xl overflow-hidden border border-slate-800 cursor-pointer group"
                          >
                            <img 
                              src={ret.fotoObjekRetribusiUrl} 
                              alt={ret.subObjekRetribusi} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat Foto Objek</span>
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 block">Estimasi Potensi Pertahun:</span>
                          <span className="text-base font-black text-amber-300 font-mono">
                            {formatRupiah(ret.potensiPertahun)}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {formatRupiah(ret.tarifSatuan)} &times; {ret.jumlahSatuan} {ret.satuanTarif}
                          </span>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="mt-3 pt-3 border-t border-slate-900 flex items-center gap-2">
                        <button
                          onClick={() => handleFocusOnMap(ret, 'retribusi')}
                          className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Fokus di Peta Google</span>
                        </button>

                        {ret.fotoObjekRetribusiUrl && (
                          <button
                            onClick={() => setPreviewPhotoModal({
                              url: ret.fotoObjekRetribusiUrl!,
                              title: ret.subObjekRetribusi,
                              subtitle: `${ret.nomorRegister} • ${ret.kecamatan}`,
                              coords: `${ret.latitude.toFixed(6)}, ${ret.longitude.toFixed(6)}`
                            })}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs cursor-pointer"
                            title="Lihat Foto Fisik"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TABEL OBJEK POTENSI PAJAK DAERAH */}
          {activeTableTab === 'potensi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Menampilkan <strong>{filteredPotensi.length}</strong> objek potensi pajak</span>
                <span className="font-mono text-emerald-400 font-bold">
                  Total: {formatRupiah(filteredPotensi.reduce((acc, p) => acc + (p.potensiRupiahTahunan || 0), 0))} / tahun
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPotensi.map((pot) => (
                  <div
                    key={pot.id}
                    className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-emerald-500/50 shadow-lg ${
                      activePin?.id === pot.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              {pot.jenisPajak}
                            </span>
                            {pot.tahun && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                                {pot.tahun}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-white leading-snug mt-1.5">
                            {pot.namaUsaha}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        WP: <strong>{pot.namaWajibPajak}</strong> &bull; {pot.kecamatan}
                      </p>

                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono">
                        <span className="text-[10px] text-slate-400 block">Potensi Tahunan:</span>
                        <span className="text-base font-black text-emerald-400">
                          {formatRupiah(pot.potensiRupiahTahunan)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-900">
                      <button
                        onClick={() => handleFocusOnMap(pot, 'potensi')}
                        className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Fokus di Peta Google</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABEL OBJEK PBB-P2 */}
          {activeTableTab === 'pbb' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Menampilkan <strong>{filteredPbb.length}</strong> data objek PBB-P2</span>
                <span className="font-mono text-blue-400 font-bold">
                  Total Terhutang: {formatRupiah(filteredPbb.reduce((acc, p) => acc + (p.pbbTerhutang || 0), 0))}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPbb.map((pbb) => (
                  <div
                    key={pbb.id}
                    className={`bg-slate-950/80 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-blue-500/50 shadow-lg ${
                      activePin?.id === pbb.id ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-white leading-snug">
                          {pbb.namaWajibPajak}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                          {pbb.statusPembayaran}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-mono">
                        NOP: {pbb.nop} {pbb.tahunPajak ? `(${pbb.tahunPajak})` : ''}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {pbb.kecamatan} &bull; {pbb.kelurahanDesa}
                      </p>

                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono">
                        <span className="text-[10px] text-slate-400 block">PBB Terhutang:</span>
                        <span className="text-base font-black text-blue-400">
                          {formatRupiah(pbb.pbbTerhutang)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-900">
                      <button
                        onClick={() => handleFocusOnMap(pbb, 'pbb')}
                        className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Fokus di Peta Google</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* KARTU RESTRIKSI JIKA BUKAN ADMIN */
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Daftar Titik Potensi Terpetakan (Khusus Administrator BP2RD)
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Daftar lengkap tabel titik potensi retribusi daerah, potensi pajak, dan PBB-P2 terpetakan di 10 kecamatan Kabupaten HSU hanya dapat diakses oleh akun <strong>Administrator BP2RD</strong>.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Status Sesi: {currentUser ? `Login sebagai ${currentUser.role.toUpperCase()} (${currentUser.name})` : 'Mode Tamu / Publik'}
            </span>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO FISIK OBJEK RETRIBUSI */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setPreviewPhotoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Dokumentasi Lapangan Retribusi HSU
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              {previewPhotoModal.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              {previewPhotoModal.subtitle}
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[440px] bg-slate-950 flex items-center justify-center">
              <img 
                src={previewPhotoModal.url} 
                alt={previewPhotoModal.title}
                className="w-full h-full object-contain max-h-[440px]"
              />
            </div>

            {previewPhotoModal.coords && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Koordinat Geospasial Satelit:</span>
                <span className="text-emerald-400 font-bold">{previewPhotoModal.coords}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
