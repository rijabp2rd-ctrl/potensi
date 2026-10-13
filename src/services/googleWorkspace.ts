import { getAccessToken } from './firebase';
import { PotensiPajakEntry, RetribusiDaerahEntry, PbbP2Entry } from '../types';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface SpreadsheetMetadata {
  id: string;
  title: string;
  spreadsheetUrl: string;
  sheets: string[];
}

export const GoogleWorkspaceService = {
  // Extract spreadsheet ID from either a raw ID or full Google Sheets URL
  extractSpreadsheetId(urlOrId: string): string {
    const trimmed = urlOrId.trim();
    // Matches /spreadsheets/d/{id}/ or /spreadsheets/u/0/d/{id}/
    const match = trimmed.match(/\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  },

  // 1. List Files and Spreadsheets from Google Drive
  async listDriveFiles(customQuery?: string): Promise<DriveFileItem[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi. Silakan login dengan Google.');

    const q = customQuery || "mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheet' or name contains 'BP2RD' or name contains 'SIPOTENSI'";
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,modifiedTime,size)&q=${encodeURIComponent(
      `trashed = false and (${q})`
    )}&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal memuat berkas dari Google Drive');
    }

    const data = await res.json();
    return data.files || [];
  },

  // 2. Fetch Spreadsheet Metadata (Title, Sheets, URL)
  async getSpreadsheetMetadata(spreadsheetId: string): Promise<SpreadsheetMetadata> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi. Silakan login dengan Google.');

    const cleanId = this.extractSpreadsheetId(spreadsheetId);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties.title`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Tidak dapat mengakses Google Spreadsheet dengan ID ${cleanId}. Pastikan akses diizinkan.`);
    }

    const data = await res.json();
    const sheets = (data.sheets || []).map((s: any) => s.properties?.title || '');
    return {
      id: data.spreadsheetId,
      title: data.properties?.title || 'Spreadsheet BP2RD',
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
      sheets,
    };
  },

  // 3. Ensure required sheet tabs exist in spreadsheet (creates missing tabs if any)
  async ensureSheetsExist(spreadsheetId: string, requiredSheetTitles: string[]): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi.');

    const cleanId = this.extractSpreadsheetId(spreadsheetId);
    const meta = await this.getSpreadsheetMetadata(cleanId);
    const existing = new Set(meta.sheets);

    const missingSheets = requiredSheetTitles.filter(title => !existing.has(title));
    if (missingSheets.length === 0) return;

    // Add missing sheets via batchUpdate
    const requests = missingSheets.map(title => ({
      addSheet: {
        properties: {
          title,
          gridProperties: { rowCount: 200, columnCount: 22 },
        },
      },
    }));

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Notice adding sheet tabs:', err.error?.message);
    }
  },

  // 4. Create a new Google Spreadsheet in user's Drive with official BP2RD sheets
  async createSpreadsheetInDrive(customTitle?: string): Promise<{ id: string; title: string; spreadsheetUrl: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi. Silakan login dengan Google.');

    const title = customTitle || `SIPOTENSI BP2RD HSU - Database Master PAD (${new Date().toLocaleDateString('id-ID')})`;

    // Create spreadsheet with 4 master sheets
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const payload = {
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Ringkasan_PAD_HSU',
            gridProperties: { rowCount: 50, columnCount: 10 },
          },
        },
        {
          properties: {
            title: 'Data_Potensi_Pajak',
            gridProperties: { rowCount: 250, columnCount: 20 },
          },
        },
        {
          properties: {
            title: 'Data_Retribusi_Daerah',
            gridProperties: { rowCount: 250, columnCount: 22 },
          },
        },
        {
          properties: {
            title: 'Data_PBB_P2',
            gridProperties: { rowCount: 250, columnCount: 18 },
          },
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru di Google Drive.');
    }

    const data = await res.json();
    const sheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl;

    return { id: sheetId, title, spreadsheetUrl };
  },

  // 5. Clear and write range (to avoid accumulating duplicates on repeated syncs)
  async clearAndWriteSheet(spreadsheetId: string, sheetTitle: string, values: any[][]): Promise<any> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi.');

    const cleanId = this.extractSpreadsheetId(spreadsheetId);

    // 1. Clear existing values in sheet
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(`'${sheetTitle}'!A1:Z500`)}:clear`;
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }).catch(() => {});

    // 2. Put fresh values starting at A1
    const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(`'${sheetTitle}'!A1`)}?valueInputOption=USER_ENTERED`;
    const res = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetTitle}'!A1`,
        majorDimension: 'ROWS',
        values,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menulis data ke sheet ${sheetTitle}.`);
    }

    return await res.json();
  },

  // 6. Batch sync entire database to the connected Google Spreadsheet
  async syncAllToConnectedSheet(
    spreadsheetId: string, 
    data: { 
      potensi: PotensiPajakEntry[]; 
      retribusi: RetribusiDaerahEntry[]; 
      pbb: PbbP2Entry[]; 
    }
  ): Promise<{ 
    syncedCounts: { potensi: number; retribusi: number; pbb: number };
    timestamp: string;
  }> {
    const cleanId = this.extractSpreadsheetId(spreadsheetId);

    // Ensure all 4 tabs exist
    await this.ensureSheetsExist(cleanId, [
      'Ringkasan_PAD_HSU',
      'Data_Potensi_Pajak',
      'Data_Retribusi_Daerah',
      'Data_PBB_P2',
    ]);

    // 1. Data Potensi Pajak
    const potensiHeaders = [
      'No',
      'Nomor Formulir',
      'Tanggal Pendataan',
      'Nama Objek / Usaha',
      'Nama Wajib Pajak',
      'NPWPD',
      'Jenis Pajak',
      'Kecamatan',
      'Kelurahan / Desa',
      'Alamat Lengkap',
      'Koordinat GPS Lat',
      'Koordinat GPS Long',
      'Potensi Bulanan (Rp)',
      'Potensi Tahunan (Rp)',
      'Status Verifikasi',
      'Petugas Pendata',
      'Diverifikasi Oleh',
      'Catatan Petugas',
    ];

    const potensiRows = [
      potensiHeaders,
      ...data.potensi.map((p, idx) => [
        idx + 1,
        p.nomorFormulir || p.id,
        p.tanggalPendataan || '',
        p.namaUsaha || '',
        p.namaWajibPajak || '',
        p.npwpd ? `'${p.npwpd}` : '-',
        p.jenisPajak || '',
        p.kecamatan || '',
        p.kelurahanDesa || '',
        p.alamatLengkap || '',
        p.latitude || '',
        p.longitude || '',
        p.potensiRupiahBulanan || 0,
        p.potensiRupiahTahunan || 0,
        p.statusVerifikasi || 'Menunggu Verifikasi',
        p.petugasPendata || '',
        p.verifiedBy || '-',
        p.catatanPetugas || '',
      ]),
    ];
    await this.clearAndWriteSheet(cleanId, 'Data_Potensi_Pajak', potensiRows);

    // 2. Data Retribusi Daerah (UU HKPD & Perda HSU No. 01/2024)
    const retribusiHeaders = [
      'No',
      'Nomor Register',
      'Tanggal Pendataan',
      'Golongan Retribusi',
      'Sub Rekening',
      'Sub Objek Retribusi',
      'Nama Pengelola / PIC',
      'No. Kontrak / SK',
      'Tarif Satuan Dasar (Rp)',
      'Satuan Tarif',
      'Jumlah Satuan / Objek',
      'Potensi Perbulan (Rp)',
      'Potensi Pertahun (Rp)',
      'Kecamatan',
      'Kelurahan / Desa',
      'Alamat Lengkap',
      'Koordinat GPS Lat',
      'Koordinat GPS Long',
      'Status Verifikasi',
      'Petugas Pendata',
      'Diverifikasi Oleh',
      'Keterangan Objek',
    ];

    const retribusiRows = [
      retribusiHeaders,
      ...data.retribusi.map((r, idx) => [
        idx + 1,
        r.nomorRegister || r.id,
        r.tanggalPendataan || '',
        r.golonganRetribusi || '',
        r.subRekening || '',
        r.subObjekRetribusi || '',
        r.namaPengelola || '-',
        r.nomorKontrakOrSK ? `'${r.nomorKontrakOrSK}` : '-',
        r.tarifSatuan || 0,
        r.satuanTarif || 'Per Unit',
        r.jumlahSatuan || 1,
        r.potensiPerbulan || 0,
        r.potensiPertahun || 0,
        r.kecamatan || '',
        r.kelurahanDesa || '',
        r.alamatLengkap || '',
        r.latitude || '',
        r.longitude || '',
        r.statusVerifikasi || 'Menunggu Verifikasi',
        r.petugasPendata || '',
        r.verifiedBy || '-',
        r.keterangan || '',
      ]),
    ];
    await this.clearAndWriteSheet(cleanId, 'Data_Retribusi_Daerah', retribusiRows);

    // 3. Data PBB-P2
    const pbbHeaders = [
      'No',
      'Nomor NOP',
      'Status NOP',
      'Tahun Pajak',
      'Nama Wajib Pajak',
      'NIK Wajib Pajak',
      'Kecamatan',
      'Kelurahan / Desa',
      'Alamat Objek PBB',
      'Luas Bumi (m²)',
      'NJOP Bumi / m² (Rp)',
      'Luas Bangunan (m²)',
      'NJOP Bangunan / m² (Rp)',
      'NJOP Total (Rp)',
      'PBB Terhutang (Rp)',
      'Status Pembayaran',
      'Status Verifikasi',
      'Petugas Validasi',
    ];

    const pbbRows = [
      pbbHeaders,
      ...data.pbb.map((p, idx) => [
        idx + 1,
        p.nop ? `'${p.nop}` : 'TIDAK ADA NOP',
        p.statusNop || 'ada',
        p.tahunPajak || 2026,
        p.namaWajibPajak || '',
        p.nikWajibPajak ? `'${p.nikWajibPajak}` : '-',
        p.kecamatan || '',
        p.kelurahanDesa || '',
        p.alamatObjek || '',
        p.luasBumiM2 || 0,
        p.njopBumiPerM2 || 0,
        p.luasBangunanM2 || 0,
        p.njopBangunanPerM2 || 0,
        p.njopTotal || 0,
        p.pbbTerhutang || 0,
        p.statusPembayaran || 'BELUM LUNAS',
        p.statusVerifikasi || 'Menunggu Verifikasi',
        p.petugasValidasi || '',
      ]),
    ];
    await this.clearAndWriteSheet(cleanId, 'Data_PBB_P2', pbbRows);

    // 4. Ringkasan Eksekutif PAD HSU
    const totalPotensiPajakTahunan = data.potensi.reduce((acc, cur) => acc + (cur.potensiRupiahTahunan || 0), 0);
    const totalRetribusiTahunan = data.retribusi.reduce((acc, cur) => acc + (cur.potensiPertahun || 0), 0);
    const totalPbbTerhutang = data.pbb.reduce((acc, cur) => acc + (cur.pbbTerhutang || 0), 0);
    const grandTotalPAD = totalPotensiPajakTahunan + totalRetribusiTahunan + totalPbbTerhutang;
    const nowIso = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' });

    const summaryRows = [
      ['SIPOTENSI BP2RD KABUPATEN HULU SUNGAI UTARA'],
      ['REKAPITULASI SINKRONISASI DATABASE KE GOOGLE SPREADSHEET'],
      ['Waktu Sinkronisasi Terakhir', nowIso],
      [''],
      ['No', 'Sektor Pendapatan Asli Daerah (PAD)', 'Jumlah Rekaman Data', 'Total Nilai Fiskal / Potensi Tahunan (Rp)', 'Keterangan'],
      [1, 'Potensi Pajak Daerah (10 Jenis Pajak)', data.potensi.length, totalPotensiPajakTahunan, 'PBJT Restoran, Hotel, Parkir, Reklame, MBLB, dsb.'],
      [2, 'Retribusi Daerah (UU HKPD & Perda HSU 01/2024)', data.retribusi.length, totalRetribusiTahunan, 'Jasa Umum, Jasa Usaha & Perizinan Tertentu'],
      [3, 'Pajak Bumi dan Bangunan (PBB-P2)', data.pbb.length, totalPbbTerhutang, 'Ketetapan Nilai PBB Terhutang & Objek Baru'],
      [''],
      ['TOTAL ESTIMASI POTENSI KESELURUHAN', data.potensi.length + data.retribusi.length + data.pbb.length, grandTotalPAD, 'Kabupaten Hulu Sungai Utara'],
    ];
    await this.clearAndWriteSheet(cleanId, 'Ringkasan_PAD_HSU', summaryRows);

    return {
      syncedCounts: {
        potensi: data.potensi.length,
        retribusi: data.retribusi.length,
        pbb: data.pbb.length,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
