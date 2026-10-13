// Master Data Wilayah & Koordinat Geospasial Kabupaten Hulu Sungai Utara (HSU), Kalimantan Selatan

export interface KecamatanHsuInfo {
  nama: string;
  lat: number;
  lng: number;
  deskripsi: string;
  kelurahanContoh: string[];
}

export const KABUPATEN_HSU = {
  nama: 'Kabupaten Hulu Sungai Utara',
  singkatan: 'HSU',
  provinsi: 'Kalimantan Selatan',
  ibukota: 'Amuntai',
  pusatLat: -2.424458,
  pusatLng: 115.247231,
  // Bounding box wilayah Kabupaten Hulu Sungai Utara
  bounds: {
    minLat: -2.62,
    maxLat: -2.28,
    minLng: 115.00,
    maxLng: 115.42,
  },
};

export const KECAMATAN_HSU: KecamatanHsuInfo[] = [
  {
    nama: 'Kecamatan Amuntai Tengah',
    lat: -2.424458,
    lng: 115.247231,
    deskripsi: 'Pusat Kota Amuntai, Kantor Bupati & Kantor BP2RD HSU, Sentra Perdagangan & Jasa',
    kelurahanContoh: ['Murung Sari', 'Antasari', 'Kebun Sari', 'Sungai Malang', 'Paliwara', 'Danau Cermin', 'Tigarun'],
  },
  {
    nama: 'Kecamatan Amuntai Utara',
    lat: -2.378912,
    lng: 115.263445,
    deskripsi: 'Kawasan Usaha & Agribisnis Wilayah Utara HSU',
    kelurahanContoh: ['Pakacangan', 'Muara Baruh', 'Teluk Daun', 'Sungai Turak', 'Tabalong Mati', 'Paringin'],
  },
  {
    nama: 'Kecamatan Amuntai Selatan',
    lat: -2.463124,
    lng: 115.234567,
    deskripsi: 'Kawasan Pemukiman & Sentra Kerajinan Purun HSU',
    kelurahanContoh: ['Telaga Silaba', 'Jarang Kuantan', 'Kayakah', 'Bajawit', 'Kota Radja', 'Mamar'],
  },
  {
    nama: 'Kecamatan Sungai Pandan (Alabio)',
    lat: -2.482345,
    lng: 115.187654,
    deskripsi: 'Pusat Perdagangan Alabio, Sentra Kerajinan & Pasar Unggas/Bebek Alabio',
    kelurahanContoh: ['Alabio Pasar', 'Pandulangan', 'Teluk Betung', 'Sungai Pandan Hilir', 'Rantau Karau'],
  },
  {
    nama: 'Kecamatan Danau Panggang',
    lat: -2.498765,
    lng: 115.098432,
    deskripsi: 'Kawasan Wisata Kerbau Rawa, Perikanan Air Tawar & Transportasi Sungai',
    kelurahanContoh: ['Danau Panggang', 'Bitin', 'Rawa Sri', 'Pandamaan', 'Sarang Burung', 'Telaga Mas'],
  },
  {
    nama: 'Kecamatan Babirik',
    lat: -2.545678,
    lng: 115.176543,
    deskripsi: 'Kawasan Pertanian Rawa Lebak & Usaha Perikanan',
    kelurahanContoh: ['Babirik Hulu', 'Babirik Hilir', 'Sungai Papuyu', 'Parupukan', 'Teluk Limbung'],
  },
  {
    nama: 'Kecamatan Haur Gading',
    lat: -2.389234,
    lng: 115.201234,
    deskripsi: 'Sentra Kerajinan Anyaman Purun & Pertanian Padi',
    kelurahanContoh: ['Sungai Teras', 'Waringin', 'Haur Gading', 'Palimbangan', 'Tambalang'],
  },
  {
    nama: 'Kecamatan Banjang',
    lat: -2.410543,
    lng: 115.312345,
    deskripsi: 'Sentra Pertanian Tanaman Pangan & Usaha Peternakan',
    kelurahanContoh: ['Banjang', 'Kaludan Kecil', 'Kaludan Besar', 'Teluk Buluh', 'Pandan Sari'],
  },
  {
    nama: 'Kecamatan Paminggir',
    lat: -2.451234,
    lng: 115.045678,
    deskripsi: 'Wilayah Perairan Rawa Monoton, Wisata Rawa & Perikanan Darat',
    kelurahanContoh: ['Paminggir', 'Bararawa', 'Sapala', 'Tampakang', 'Palbatu'],
  },
  {
    nama: 'Kecamatan Sungai Tabukan',
    lat: -2.356789,
    lng: 115.289123,
    deskripsi: 'Kawasan Agrikultur & Sentra Perikanan Sungai',
    kelurahanContoh: ['Teluk Cempedak', 'Nelayan', 'Pematang Benteng', 'Pasar Sabtu', 'Rantau Bujur'],
  },
];

export const KECAMATAN_HSU_OPTIONS = KECAMATAN_HSU.map((k) => k.nama);

export const TITIK_PRESET_HSU = [
  {
    label: 'Kantor BP2RD / BAPENDA HSU (Pusat Amuntai)',
    kecamatan: 'Kecamatan Amuntai Tengah',
    lat: -2.424458,
    lng: 115.247231,
  },
  {
    label: 'Bundaran Kota Amuntai (Patung Itik HSU)',
    kecamatan: 'Kecamatan Amuntai Tengah',
    lat: -2.421500,
    lng: 115.249200,
  },
  {
    label: 'Pasar Sentra Alabio (Sungai Pandan)',
    kecamatan: 'Kecamatan Sungai Pandan (Alabio)',
    lat: -2.482345,
    lng: 115.187654,
  },
  {
    label: 'Dermaga Danau Panggang (Wisata Rawa)',
    kecamatan: 'Kecamatan Danau Panggang',
    lat: -2.498765,
    lng: 115.098432,
  },
  {
    label: 'Sentra Babirik (Wilayah Selatan HSU)',
    kecamatan: 'Kecamatan Babirik',
    lat: -2.545678,
    lng: 115.176543,
  },
  {
    label: 'Kawasan Banjang (Wilayah Timur HSU)',
    kecamatan: 'Kecamatan Banjang',
    lat: -2.410543,
    lng: 115.312345,
  },
];

// Helper untuk mengecek apakah titik koordinat berada di dalam/sekitar Kabupaten Hulu Sungai Utara
export function isWithinHsuRegion(lat: number, lng: number): boolean {
  return (
    lat >= KABUPATEN_HSU.bounds.minLat &&
    lat <= KABUPATEN_HSU.bounds.maxLat &&
    lng >= KABUPATEN_HSU.bounds.minLng &&
    lng <= KABUPATEN_HSU.bounds.maxLng
  );
}

// Helper untuk mendapatkan koordinat default berdasarkan kecamatan HSU
export function getDefaultCoordsForKecamatan(kecamatanNama: string): { lat: number; lng: number } {
  const found = KECAMATAN_HSU.find((k) => k.nama.toLowerCase() === kecamatanNama.toLowerCase());
  if (found) {
    return { lat: found.lat, lng: found.lng };
  }
  return { lat: KABUPATEN_HSU.pusatLat, lng: KABUPATEN_HSU.pusatLng };
}
