import { getAccessToken } from './firebase';

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

export const GoogleWorkspaceService = {
  // 1. List Files and Spreadsheets from Google Drive
  async listDriveFiles(customQuery?: string): Promise<DriveFileItem[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi. Silakan login dengan Google.');

    const q = customQuery || "mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheet' or name contains 'BP2RD' or name contains 'Pajak'";
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

  // 2. Create a new Google Spreadsheet in user's Drive with official BP2RD sheets
  async createSpreadsheetInDrive(title: string): Promise<{ id: string; spreadsheetUrl: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi. Silakan login dengan Google.');

    // Create spreadsheet with 3 sheets: Data_Potensi_Pajak, Data_PBB_P2, Survei_IKM
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const payload = {
      properties: {
        title: title || `SIPOTENSI BP2RD Database Master - ${new Date().toISOString().split('T')[0]}`,
      },
      sheets: [
        {
          properties: {
            title: 'Data_Potensi_Pajak',
            gridProperties: { rowCount: 100, columnCount: 16 },
          },
        },
        {
          properties: {
            title: 'Data_PBB_P2',
            gridProperties: { rowCount: 100, columnCount: 14 },
          },
        },
        {
          properties: {
            title: 'Survei_IKM',
            gridProperties: { rowCount: 100, columnCount: 14 },
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
      throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru.');
    }

    const data = await res.json();
    const sheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl;

    // Populate Headers for the 3 tabs
    await this.appendValuesToSheet(
      sheetId,
      'Data_Potensi_Pajak!A1:N1',
      [
        [
          'ID Tiket',
          'Tanggal',
          'Nama Objek',
          'Kategori Pajak',
          'Nama Wajib Pajak',
          'Alamat',
          'Kecamatan',
          'Kelurahan',
          'No WhatsApp',
          'Estimasi Potensi (Rp)',
          'Koordinat Lat',
          'Koordinat Lng',
          'Skor Kelayakan (%)',
          'Status Validasi',
        ],
      ]
    );

    await this.appendValuesToSheet(
      sheetId,
      'Data_PBB_P2!A1:L1',
      [
        [
          'ID PBB',
          'Tanggal',
          'Nama Wajib Pajak',
          'NIK',
          'Status NOP',
          'Nomor NOP',
          'Lokasi Objek',
          'RT/RW',
          'Kelurahan/Desa',
          'Kecamatan',
          'Tahun Pajak',
          'Nominal Setor (Rp)',
        ],
      ]
    );

    await this.appendValuesToSheet(
      sheetId,
      'Survei_IKM!A1:K1',
      [
        [
          'ID IKM',
          'Tanggal',
          'Nama Responden',
          'Alamat',
          'Kemudahan (1-5)',
          'Kecepatan (1-5)',
          'Kesopanan (1-5)',
          'Transparansi (1-5)',
          'Sarana (1-5)',
          'Nilai IKM',
          'Kategori Mutu',
        ],
      ]
    );

    return { id: sheetId, spreadsheetUrl };
  },

  // 3. Append Values directly to Google Sheets
  async appendValuesToSheet(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const token = await getAccessToken();
    if (!token) throw new Error('Akses Google Workspace belum diautentikasi.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gagal menambahkan baris ke Google Sheets.');
    }

    return await res.json();
  },

  // 4. Batch sync entire data to a connected Google Sheet
  async syncAllToConnectedSheet(spreadsheetId: string, data: { potensi: any[]; pbb: any[]; ikm: any[] }) {
    // 1. Potensi Rows
    if (data.potensi.length > 0) {
      const potensiRows = data.potensi.map((p) => [
        p.id,
        p.tanggal,
        p.namaObjek,
        p.kategoriObjek,
        p.namaWajibPajak,
        p.alamat,
        p.kecamatan,
        p.kelurahan,
        p.noWhatsapp,
        p.estimasiPotensiTahunan || 0,
        p.koordinatLat || '',
        p.koordinatLng || '',
        `${p.skorKelayakan}%`,
        p.statusAdmin,
      ]);
      await this.appendValuesToSheet(spreadsheetId, 'Data_Potensi_Pajak!A2', potensiRows);
    }

    // 2. PBB Rows
    if (data.pbb.length > 0) {
      const pbbRows = data.pbb.map((p) => [
        p.id,
        p.tanggal,
        p.namaWajibPajak,
        `'${p.nik}`,
        p.statusNop,
        `'${p.nop || '-'}`,
        p.lokasiObjek,
        p.rtRw || '',
        p.kelurahanDesa,
        p.kecamatan,
        p.tahunPajak,
        p.nominalBayar || 0,
      ]);
      await this.appendValuesToSheet(spreadsheetId, 'Data_PBB_P2!A2', pbbRows);
    }

    // 3. IKM Rows
    if (data.ikm.length > 0) {
      const ikmRows = data.ikm.map((i) => [
        i.id,
        i.tanggal,
        i.namaWajibPajak,
        i.alamat,
        i.skorKemudahan,
        i.skorKecepatan,
        i.skorKesopanan,
        i.skorTransparansi,
        i.skorSarana,
        i.nilaiKonversi,
        i.kategoriMutu,
      ]);
      await this.appendValuesToSheet(spreadsheetId, 'Survei_IKM!A2', ikmRows);
    }

    return true;
  },
};
