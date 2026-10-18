/**
 * PBB-P2 Official Calculation Utilities
 * Kabupaten Hulu Sungai Utara (BP2RD Kab. HSU)
 * Mengacu pada UU HKPD No. 1 Tahun 2022 & Perda Kab. HSU No. 01 Tahun 2024
 */

export function getKelasBumi(njopPerM2: number): string {
  if (njopPerM2 >= 3000000) return 'A30';
  if (njopPerM2 >= 2000000) return 'A32';
  if (njopPerM2 >= 1000000) return 'A34';
  if (njopPerM2 >= 750000) return 'A35';
  if (njopPerM2 >= 500000) return 'A36';
  if (njopPerM2 >= 350000) return 'A38';
  if (njopPerM2 >= 250000) return 'A39';
  if (njopPerM2 >= 150000) return 'A40';
  if (njopPerM2 >= 100000) return 'A41';
  if (njopPerM2 >= 50000) return 'A43';
  return 'A45';
}

export function getKelasBangunan(njopPerM2: number): string {
  if (njopPerM2 >= 2500000) return 'B08';
  if (njopPerM2 >= 1800000) return 'B10';
  if (njopPerM2 >= 1200000) return 'B12';
  if (njopPerM2 >= 900000) return 'B13';
  if (njopPerM2 >= 700000) return 'B14';
  if (njopPerM2 >= 500000) return 'B15';
  return 'B18';
}

export interface PbbCalculationParams {
  luasBumi: number;
  njopBumiPerM2: number;
  luasBangunan: number;
  njopBangunanPerM2: number;
  njoptkp?: number;
  tarifPbbPersen?: number;
  stimulusPengurangan?: number;
  dendaAdministrasi?: number;
}

export interface PbbCalculationResult {
  totalNjopBumi: number;
  kelasBumi: string;
  totalNjopBangunan: number;
  kelasBangunan: string;
  njopTotal: number;
  njoptkp: number;
  njopKenaPajak: number;
  tarifPbbPersen: number;
  ketetapanPbbTerhutang: number;
  stimulusPengurangan: number;
  dendaAdministrasi: number;
  totalPbbHarusDibayar: number;
  terbilang: string;
}

export function calculatePbbDetail(params: PbbCalculationParams): PbbCalculationResult {
  const luasBumi = Math.max(0, Number(params.luasBumi) || 0);
  const njopBumiPerM2 = Math.max(0, Number(params.njopBumiPerM2) || 0);
  const luasBangunan = Math.max(0, Number(params.luasBangunan) || 0);
  const njopBangunanPerM2 = Math.max(0, Number(params.njopBangunanPerM2) || 0);

  const totalNjopBumi = Math.round(luasBumi * njopBumiPerM2);
  const totalNjopBangunan = Math.round(luasBangunan * njopBangunanPerM2);
  const njopTotal = totalNjopBumi + totalNjopBangunan;

  const njoptkp = params.njoptkp !== undefined ? Math.max(0, Number(params.njoptkp) || 0) : 10000000;
  const njopKenaPajak = Math.max(0, njopTotal - njoptkp);

  const tarifPbbPersen = params.tarifPbbPersen !== undefined ? Number(params.tarifPbbPersen) || 0.15 : 0.15;
  const ketetapanPbbTerhutang = Math.round(njopKenaPajak * (tarifPbbPersen / 100));

  const stimulusPengurangan = Math.max(0, Number(params.stimulusPengurangan) || 0);
  const dendaAdministrasi = Math.max(0, Number(params.dendaAdministrasi) || 0);
  const totalPbbHarusDibayar = Math.max(0, ketetapanPbbTerhutang - stimulusPengurangan + dendaAdministrasi);

  return {
    totalNjopBumi,
    kelasBumi: getKelasBumi(njopBumiPerM2),
    totalNjopBangunan,
    kelasBangunan: luasBangunan > 0 ? getKelasBangunan(njopBangunanPerM2) : '-',
    njopTotal,
    njoptkp,
    njopKenaPajak,
    tarifPbbPersen,
    ketetapanPbbTerhutang,
    stimulusPengurangan,
    dendaAdministrasi,
    totalPbbHarusDibayar,
    terbilang: terbilangRupiah(totalPbbHarusDibayar),
  };
}

const SATUAN = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

function konversiBilangan(nilai: number): string {
  nilai = Math.floor(nilai);
  if (nilai < 12) {
    return SATUAN[nilai];
  } else if (nilai < 20) {
    return `${konversiBilangan(nilai - 10)} Belas`;
  } else if (nilai < 100) {
    return `${konversiBilangan(Math.floor(nilai / 10))} Puluh ${konversiBilangan(nilai % 10)}`.trim();
  } else if (nilai < 200) {
    return `Seratus ${konversiBilangan(nilai - 100)}`.trim();
  } else if (nilai < 1000) {
    return `${konversiBilangan(Math.floor(nilai / 100))} Ratus ${konversiBilangan(nilai % 100)}`.trim();
  } else if (nilai < 2000) {
    return `Seribu ${konversiBilangan(nilai - 1000)}`.trim();
  } else if (nilai < 1000000) {
    return `${konversiBilangan(Math.floor(nilai / 1000))} Ribu ${konversiBilangan(nilai % 1000)}`.trim();
  } else if (nilai < 1000000000) {
    return `${konversiBilangan(Math.floor(nilai / 1000000))} Juta ${konversiBilangan(nilai % 1000000)}`.trim();
  } else if (nilai < 1000000000000) {
    return `${konversiBilangan(Math.floor(nilai / 1000000000))} Miliar ${konversiBilangan(nilai % 1000000000)}`.trim();
  } else {
    return `${konversiBilangan(Math.floor(nilai / 1000000000000))} Triliun ${konversiBilangan(nilai % 1000000000000)}`.trim();
  }
}

export function terbilangRupiah(nilai: number): string {
  if (!nilai || nilai === 0) return 'Nol Rupiah';
  const hasil = konversiBilangan(nilai);
  return `${hasil} Rupiah`;
}
